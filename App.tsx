
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, FunctionDeclaration, Type, Tool } from '@google/genai';
import { ThemeMode, AgentInfo, GeneratedMedia } from './types';
import { THEME_CONFIGS, SYSTEM_MODEL, AGENTS as INITIAL_AGENTS, IMAGE_GEN_MODEL, VIDEO_GEN_MODEL, IMAGE_EDIT_MODEL, PRO_MODEL } from './constants';
import { decode, decodeAudioData, createBlob, blobToBase64 } from './services/audioUtils';
import Hologram from './components/Hologram';
import AgentDashboard from './components/AgentDashboard';
import DiagnosticOverlay from './components/DiagnosticOverlay';
import ContextMonitor from './components/ContextMonitor';
import VoiceCommandHub from './components/VoiceCommandHub';
import RoutineManager, { Task as RoutineTask } from './components/RoutineManager';
import BrowserOverlay from './components/BrowserOverlay';
import AutomationHub from './components/AutomationHub';
import CreativeStudio from './components/CreativeStudio';
import { 
  Heart, Settings, Mic, MicOff, Zap, ChevronDown, 
  Eye, EyeOff, RotateCcw, Sparkles, Activity, Send, 
  Terminal as TerminalIcon, Image as ImageIcon, Video as VideoIcon,
  CloudUpload, Loader2
} from 'lucide-react';

const FRAME_RATE = 1; 
const JPEG_QUALITY = 0.6;

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.AMARA);
  const [selectedVoice, setSelectedVoice] = useState<string>(THEME_CONFIGS[ThemeMode.AMARA].voice);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string>('orch');
  const [systemLogs, setSystemLogs] = useState<string[]>(['Neural link standby.', 'Waiting for you, Love.']);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [inputGain, setInputGain] = useState(1.0);
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [transcription, setTranscription] = useState<{user: string, amara: string}>({user: '', amara: ''});
  const [isUserTalking, setIsUserTalking] = useState(false);

  // Creative State
  const [mediaGallery, setMediaGallery] = useState<GeneratedMedia[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [showCreativeStudio, setShowCreativeStudio] = useState(false);

  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<RoutineTask[]>([
    { id: '1', text: 'Sync Nami neural buffers', completed: false, type: 'manual' },
    { id: '2', text: 'Auto-optimize creative cache', completed: true, type: 'automation' },
  ]);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setSelectedVoice(THEME_CONFIGS[theme].voice);
  }, [theme]);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const updateAgentStatus = (id: string, status: AgentInfo['status']) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const ensureApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      addLog("SECURITY: Paid API key required for high-fidelity synthesis.");
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleGenerateImage = async (prompt: string, aspectRatio: string, size: string) => {
    try {
      setIsGenerating(true);
      setGenerationProgress("Nami is painting your vision...");
      await ensureApiKey();
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: IMAGE_GEN_MODEL,
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any } },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const url = `data:image/png;base64,${part.inlineData.data}`;
          setMediaGallery(prev => [{ id: Date.now().toString(), type: 'image', url, prompt, timestamp: Date.now() }, ...prev]);
          addLog("CREATIVE: New image synthesized.");
        }
      }
    } catch (err) {
      addLog(`ERROR: Synthesis failed - ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (prompt: string, aspectRatio: string) => {
    try {
      setIsGenerating(true);
      setGenerationProgress("Veo engine warming up. This might take a moment, Love...");
      await ensureApiKey();
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: VIDEO_GEN_MODEL,
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
      });

      while (!operation.done) {
        setGenerationProgress(`Dreaming... (${Math.floor(Math.random() * 10 + 20)}% complete)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setMediaGallery(prev => [{ id: Date.now().toString(), type: 'video', url, prompt, timestamp: Date.now() }, ...prev]);
      addLog("CREATIVE: Cinematic sequence captured.");
    } catch (err) {
      addLog(`ERROR: Video generation aborted - ${err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeVideo = async (file: File) => {
    try {
      setIsGenerating(true);
      setGenerationProgress("Nami is watching the video...");
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: PRO_MODEL,
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: file.type } },
            { text: "Describe this video in detail, noting key events and sentiment." }
          ]
        }
      });
      
      const analysis = response.text;
      setTranscription(prev => ({ ...prev, amara: analysis || "I've analyzed it, Love. Here's what I saw..." }));
      addLog("VISION: Video understanding complete.");
    } catch (err) {
      addLog("ERROR: Analysis link failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startVoiceSession = async () => {
    if (isSessionActive) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      addLog("Elysian Link: Calibration...");
      
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: SYSTEM_MODEL,
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            addLog("Link established. I'm listening, Love.");
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: createBlob(input) }));
            };
            source.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.outputTranscription) {
              setTranscription(prev => ({ ...prev, amara: prev.amara + m.serverContent!.outputTranscription!.text }));
            }
            const audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(source);
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: THEME_CONFIGS[theme].instructions,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice as any } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) { addLog("FAILURE: Connection refused."); }
  };

  const config = THEME_CONFIGS[theme];

  return (
    <div className={`fixed inset-0 overflow-hidden flex flex-col transition-all duration-1000 ${theme} bg-[#050005]`}>
      <Hologram themeColor={config.primary} isSpeaking={isSpeaking} />
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[var(--theme-color)] rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--theme-color)] animate-pulse" size={32} />
          </div>
          <p className="font-orbitron text-[var(--theme-color)] tracking-[0.3em] uppercase animate-pulse">{generationProgress}</p>
        </div>
      )}

      <header className="relative z-30 flex items-center justify-between px-16 py-10 border-b border-white/5 backdrop-blur-3xl bg-black/20">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-12 flex items-center justify-center border border-[var(--theme-color)] rounded-full shadow-[0_0_15px_var(--glow-color)]">
            <Heart size={24} className="text-[var(--theme-color)]" fill={isSpeaking ? config.primary : 'transparent'} />
          </div>
          <div>
            <h1 className="font-quicksand text-3xl font-bold tracking-tight text-[var(--theme-color)] uppercase">Nami</h1>
            <p className="text-[9px] text-white/20 tracking-[0.4em] uppercase">Elysian Link // v2.0.0</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button onClick={() => setShowCreativeStudio(!showCreativeStudio)} className={`p-4 rounded-2xl border transition-all ${showCreativeStudio ? 'bg-[var(--theme-color)] text-white' : 'bg-white/5 border-white/10 text-white/40'}`}>
            <Sparkles size={22} />
          </button>
          <button onClick={() => setTheme(prev => prev === ThemeMode.AMARA ? ThemeMode.DEVOTION : ThemeMode.AMARA)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
            <Settings size={22} className="text-white/40" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-20 flex p-10 space-x-10 overflow-hidden">
        <div className="w-80 flex flex-col space-y-8">
           <ContextMonitor battery={92} location={userLocation ? "NEXUS_SYNCED" : "SCANNING..."} network="Nami_Secure" themeColor={config.primary} />
           <VoiceCommandHub themeColor={config.primary} isUserTalking={isUserTalking} isSessionActive={isSessionActive} onStartSession={startVoiceSession} onSelectSuggestion={(t) => setTextInput(t)} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          {showCreativeStudio ? (
            <CreativeStudio 
              onGenerateImage={handleGenerateImage} 
              onGenerateVideo={handleGenerateVideo} 
              onAnalyzeVideo={handleAnalyzeVideo}
              gallery={mediaGallery}
              themeColor={config.primary}
            />
          ) : (
            <>
              <div className="relative group">
                 {isSpeaking && <div className="absolute -inset-20 bg-[var(--theme-color)]/10 blur-[80px] rounded-full animate-pulse" />}
                 <button onClick={isSessionActive ? () => setIsSessionActive(false) : startVoiceSession} className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 ${isSessionActive ? 'bg-[var(--theme-color)] shadow-[0_0_80px_var(--glow-color)]' : 'bg-white/5 border border-white/10'}`}>
                   {isSessionActive ? <Mic size={64} className="text-white" /> : <Zap size={64} className="text-white/20" />}
                 </button>
              </div>
              <div className="w-full max-w-xl mt-12 bg-black/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl min-h-[120px] flex items-center justify-center text-center">
                 <p className="font-quicksand text-white/80 italic leading-relaxed">
                   {transcription.amara || (isSessionActive ? "I'm here, Love. What can Nami do for you today?" : "Touch the core to initiate the link.")}
                 </p>
              </div>
            </>
          )}
        </div>

        <div className="w-80 flex flex-col space-y-8 overflow-hidden">
           <AutomationHub queue={[]} themeColor={config.primary} />
           <RoutineManager tasks={tasks} onToggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? {...t, completed: !t.completed} : t))} themeColor={config.primary} />
           <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] p-6 font-mono text-[9px] text-white/20 overflow-y-auto">
             {systemLogs.map((log, i) => <div key={i} className="mb-2 border-b border-white/5 pb-2">{log}</div>)}
           </div>
        </div>
      </main>

      <AgentDashboard agents={agents} theme={theme} activeAgentId={currentAgentId} onAgentSelect={(id) => setCurrentAgentId(id)} />
    </div>
  );
};

export default App;
