
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, FunctionDeclaration, Type, Tool } from '@google/genai';
import { ThemeMode, TranscriptionItem, AgentInfo } from './types';
import { THEME_CONFIGS, SYSTEM_MODEL, AGENTS as INITIAL_AGENTS, KONARK_KNOWLEDGE } from './constants';
import { decode, decodeAudioData, createBlob, blobToBase64 } from './services/audioUtils';
import Hologram from './components/Hologram';
import AgentDashboard from './components/AgentDashboard';
import DiagnosticOverlay from './components/DiagnosticOverlay';
import { 
  Settings, 
  Mic, 
  MicOff, 
  Zap, 
  ChevronDown,
  Trash2,
  Cpu,
  Globe,
  ExternalLink,
  Monitor,
  Eye,
  EyeOff,
  LocateFixed,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Compass
} from 'lucide-react';

const FRAME_RATE = 1; 
const JPEG_QUALITY = 0.6;

const controlSystemTool: FunctionDeclaration = {
  name: 'control_system',
  description: 'Execute high-level system commands to modify the interface, manage sub-agents, or perform deep hardware diagnostics.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: 'The operational command: "switch_theme", "activate_agent", "run_diagnostics", "agent_feedback"',
      },
      target: {
        type: Type.STRING,
        description: 'Target parameter. For "switch_theme": "jarvis", "friday", "ultron". For agents: "nav", "web", "info_reader", "code", "vision", etc.',
      },
      status: {
        type: Type.STRING,
        description: 'Status of the task for "agent_feedback": "success", "failure", "warning".',
      },
      message: {
        type: Type.STRING,
        description: 'Detailed execution report, error message, or result data for self-correction and performance optimization.',
      }
    },
    required: ['action']
  }
};

const tools: Tool[] = [
  { functionDeclarations: [controlSystemTool] },
  { googleSearch: {} },
  { googleMaps: {} }
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.JARVIS);
  const [selectedVoice, setSelectedVoice] = useState<string>(THEME_CONFIGS[ThemeMode.JARVIS].voice);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [currentAgentId, setCurrentAgentId] = useState<string>('orch');
  const [systemLogs, setSystemLogs] = useState<string[]>(['Neural link standby.', 'Awaiting authorization...']);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [searchSources, setSearchSources] = useState<{ uri: string; title: string }[]>([]);
  
  const [isMuted, setIsMuted] = useState(false);
  const [inputGain, setInputGain] = useState(1.0);
  const [showAudioControls, setShowAudioControls] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'standby' | 'searching' | 'locked'>('standby');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputGainNodeRef = useRef<GainNode | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef({ theme, currentAgentId, agents, isMuted, inputGain, userLocation, isScreenSharing });
  useEffect(() => {
    stateRef.current = { theme, currentAgentId, agents, isMuted, inputGain, userLocation, isScreenSharing };
    if (inputGainNodeRef.current) {
      inputGainNodeRef.current.gain.setTargetAtTime(isMuted ? 0 : inputGain, inputAudioContextRef.current?.currentTime || 0, 0.05);
    }
  }, [theme, currentAgentId, agents, isMuted, inputGain, userLocation, isScreenSharing]);

  useEffect(() => {
    setSelectedVoice(THEME_CONFIGS[theme].voice);
  }, [theme]);

  const addLog = (msg: string) => {
    setSystemLogs(prev => {
      const updated = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      return updated.slice(-50);
    });
  };

  const clearLogs = () => {
    setSystemLogs([`[${new Date().toLocaleTimeString()}] System log cache cleared.`]);
  };

  const updateAgentStatus = (id: string, status: AgentInfo['status']) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const fetchLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      addLog("TELEMETRY: Initializing GPS hardware sync...");
      setGpsStatus('searching');
      if (!navigator.geolocation) {
        addLog("NOTICE: GPS hardware missing from mainframe.");
        setGpsStatus('standby');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLocation(loc);
          setGpsStatus('locked');
          addLog(`GPS: Signal locked. Precision triangulation confirmed.`);
          resolve(loc);
        },
        (err) => {
          addLog(`NOTICE: GPS link failed: ${err.message}.`);
          setGpsStatus('standby');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      updateAgentStatus('vision', 'working');
      addLog("OPTIC: Screen link active.");

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      screenIntervalRef.current = window.setInterval(() => {
        if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx && video.videoWidth > 0) {
          const targetWidth = 640;
          const targetHeight = (video.videoHeight / video.videoWidth) * targetWidth;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(async (blob) => {
            if (blob && sessionPromiseRef.current) {
              try {
                const base64Data = await blobToBase64(blob);
                sessionPromiseRef.current?.then(session => {
                  session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                });
              } catch (err) {
                console.error("Frame processing failed", err);
              }
            }
          }, 'image/jpeg', JPEG_QUALITY);
        }
      }, 1000 / FRAME_RATE);
      
      stream.getTracks()[0].onended = () => stopScreenShare();
    } catch (err) {
      addLog("FAILURE: Optic link rejected.");
      updateAgentStatus('vision', 'idle');
    }
  };

  const stopScreenShare = () => {
    if (screenIntervalRef.current) clearInterval(screenIntervalRef.current);
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
    setIsScreenSharing(false);
    updateAgentStatus('vision', 'idle');
    addLog("OPTIC: Visual feed terminated.");
  };

  const startVoiceSession = async () => {
    if (isSessionActive) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      addLog("Sensory calibration...");
      const loc = await fetchLocation();
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const config = THEME_CONFIGS[theme];

      addLog(`Initializing ${config.systemName} OS...`);
      setSearchSources([]);

      const sessionPromise = ai.live.connect({
        model: SYSTEM_MODEL,
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            addLog("Uplink secured. System ONLINE.");
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const gainNode = inputAudioContextRef.current!.createGain();
            gainNode.gain.value = stateRef.current.isMuted ? 0 : stateRef.current.inputGain;
            inputGainNodeRef.current = gainNode;
            const processor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const blob = createBlob(input);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: blob });
              });
            };
            source.connect(gainNode);
            gainNode.connect(processor);
            processor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.groundingMetadata?.groundingChunks) {
              const chunks = message.serverContent.groundingMetadata.groundingChunks;
              const webSources = chunks.map(c => c.web).filter(Boolean) as any[];
              const mapSources = chunks.map(c => c.maps).filter(Boolean) as any[];
              const allSources = [...webSources, ...mapSources];
              if (allSources.length > 0) {
                setSearchSources(prev => [...prev, ...allSources]);
                addLog(`UPLINK: Data index updated.`);
                updateAgentStatus(mapSources.length > 0 ? 'nav' : 'web', 'ready');
              }
            }
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'control_system') {
                  const { action, target, status, message: feedbackMsg } = fc.args as { action: string; target?: string; status?: string; message?: string };
                  let resultStr = 'Operation Failed';
                  if (action === 'switch_theme') {
                    const t = target?.toLowerCase();
                    if (t === 'friday') setTheme(ThemeMode.FRIDAY);
                    else if (t === 'ultron') setTheme(ThemeMode.ULTRON);
                    else setTheme(ThemeMode.JARVIS);
                    resultStr = `Success: Migrated to ${target}.`;
                    addLog(`THEME: Recalibrated.`);
                  } 
                  else if (action === 'activate_agent') {
                    if (stateRef.current.agents.some(a => a.id === target)) {
                      setCurrentAgentId(target!);
                      updateAgentStatus(target!, 'working');
                      resultStr = `Success: Agent ${target} engaged.`;
                      addLog(`ROUTING: ${target.toUpperCase()} engaged.`);
                    } else {
                      resultStr = `Error: Agent "${target}" unknown.`;
                    }
                  }
                  else if (action === 'agent_feedback') {
                    if (target && feedbackMsg) {
                      updateAgentStatus(target, 'ready');
                      const statusTag = status ? `[${status.toUpperCase()}]` : '';
                      addLog(`FEEDBACK ${statusTag} [${target.toUpperCase()}]: ${feedbackMsg}`);
                      resultStr = `Self-correction synchronized.`;
                    }
                  }
                  else if (action === 'run_diagnostics') {
                    setIsDiagnosticRunning(true);
                    addLog("DIAGNOSTIC: Sensory sweep...");
                    await new Promise(r => setTimeout(r, 2000));
                    resultStr = `Status: Nominal. GPS: ${stateRef.current.userLocation ? 'Locked' : 'Standby'}. Optic: ${stateRef.current.isScreenSharing ? 'Streaming' : 'Offline'}.`;
                    addLog("DIAGNOSTIC: Nominal.");
                    setTimeout(() => setIsDiagnosticRunning(false), 3000);
                  }
                  sessionPromiseRef.current?.then((session) => {
                    session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: resultStr } } });
                  });
                }
              }
            }
            if (message.serverContent?.outputTranscription) setTranscriptions(prev => [...prev, { type: 'ai', text: message.serverContent!.outputTranscription!.text, timestamp: Date.now() }]);
            if (message.serverContent?.inputTranscription) setTranscriptions(prev => [...prev, { type: 'user', text: message.serverContent!.inputTranscription!.text, timestamp: Date.now() }]);
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
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
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
              addLog("NOTICE: Sequence aborted.");
            }
          },
          onerror: (e) => { addLog("CRITICAL: Link failure."); stopVoiceSession(); },
          onclose: () => { setIsSessionActive(false); addLog("Standby."); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `
            ${config.instructions}
            ${KONARK_KNOWLEDGE}
            
            VISION & SENSORY INPUT:
            - You have real-time Vision access when 'Optic' is active.
            - Vision Agent is engaged during screen sharing.
            - Use location data to answer geo-specific queries.
            - Task agents via 'activate_agent'.
            - Always call 'agent_feedback' to report status and findings.
            
            CURRENT COORDS: Lat: ${loc?.latitude ?? 'N/A'}, Lon: ${loc?.longitude ?? 'N/A'}.
          `,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice as any } } },
          tools: tools,
          toolConfig: loc ? { retrievalConfig: { latLng: { latitude: loc.latitude, longitude: loc.longitude } } } : undefined,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      addLog("FAILURE: Authorization denied.");
    }
  };

  const stopVoiceSession = () => {
    stopScreenShare();
    setIsSessionActive(false);
    setIsSpeaking(false);
    setCurrentAgentId('orch');
    addLog("System hibernation...");
    setTimeout(() => window.location.reload(), 500); 
  };

  const toggleThemeManually = () => {
    const modes = [ThemeMode.JARVIS, ThemeMode.FRIDAY, ThemeMode.ULTRON];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
    addLog(`MANUAL: Interfaced shifted to ${THEME_CONFIGS[next].label}.`);
  };

  const handlers = useRef({ startVoiceSession, stopVoiceSession, isSessionActive });
  useEffect(() => { handlers.current = { startVoiceSession, stopVoiceSession, isSessionActive }; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        const { startVoiceSession, stopVoiceSession, isSessionActive } = handlers.current;
        isSessionActive ? stopVoiceSession() : startVoiceSession();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const config = THEME_CONFIGS[theme];

  return (
    <div className={`fixed inset-0 overflow-hidden flex flex-col transition-colors duration-1000 ${theme}`}>
      <Hologram themeColor={config.primary} isSpeaking={isSpeaking} />
      {isDiagnosticRunning && <DiagnosticOverlay themeColor={config.primary} />}

      <header className="relative z-30 flex items-center justify-between px-10 py-8 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="flex items-center space-x-5">
          <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--theme-color)] rounded-full animate-pulse shadow-[0_0_15px_var(--glow-color)]">
            <Zap size={24} className="text-[var(--theme-color)]" />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-black tracking-widest text-[var(--theme-color)] uppercase">{config.systemName}</h1>
            <p className="text-[10px] text-white/40 tracking-[0.4em] font-bold">CORE v4.9.9 // GPS ARRAY ENABLED</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button onClick={toggleScreenShare} className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border transition-all ${isScreenSharing ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
            {isScreenSharing ? <Eye size={18} className="animate-pulse" /> : <EyeOff size={18} />}
            <div className="text-left hidden md:block">
              <p className="text-[8px] font-orbitron uppercase leading-none mb-1">Optic</p>
              <p className="text-sm font-bold leading-none">{isScreenSharing ? 'LIVE' : 'IDLE'}</p>
            </div>
          </button>
          <div className="relative">
            <button onClick={() => setShowAudioControls(!showAudioControls)} className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:bg-white/10 transition-all">
              {isMuted ? <MicOff size={18} className="text-red-400" /> : <Mic size={18} className="text-[var(--theme-color)]" />}
              <div className="text-left hidden md:block">
                <p className="text-[8px] text-white/40 font-orbitron uppercase leading-none mb-1">Gain</p>
                <p className="text-sm font-bold text-white/90 leading-none">{Math.round(inputGain * 100)}%</p>
              </div>
              <ChevronDown size={14} className={`text-white/30 ml-2 transition-transform ${showAudioControls ? 'rotate-180' : ''}`} />
            </button>
            {showAudioControls && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-black/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-2xl z-50">
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-white/40 uppercase">
                    <span>Calibration</span>
                    <button onClick={() => setInputGain(1.0)} className="p-1 hover:bg-white/10 rounded text-[var(--theme-color)]"><RotateCcw size={12} /></button>
                  </div>
                  <input type="range" min="0" max="2" step="0.01" value={inputGain} onChange={(e) => setInputGain(parseFloat(e.target.value))} className="w-full accent-[var(--theme-color)]" />
                  <button onClick={() => setIsMuted(!isMuted)} className={`w-full p-2 rounded-lg transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isMuted ? 'UNMUTE MIC' : 'MUTE MIC'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button onClick={toggleThemeManually} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"><Settings size={22} className="text-white/70" /></button>
        </div>
      </header>

      <main className="flex-1 relative z-20 flex flex-col justify-between p-10">
        <div className="flex justify-between items-start">
          <div className="w-80 space-y-6">
            {/* GPS Telemetry Block */}
            <div className="p-5 bg-black/50 border-l-4 border-white/10 backdrop-blur-xl rounded-xl shadow-lg relative overflow-hidden">
               {gpsStatus === 'searching' && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
               <div className="flex items-center justify-between mb-3">
                 <h3 className="text-[11px] font-orbitron text-white/60 flex items-center uppercase tracking-wider">
                   <LocateFixed size={14} className={`mr-3 ${gpsStatus === 'locked' ? 'text-emerald-400' : 'text-amber-400 animate-spin-slow'}`} /> 
                   Telemetry
                 </h3>
                 <button 
                   onClick={fetchLocation} 
                   className={`p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors ${gpsStatus === 'searching' ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={gpsStatus === 'searching'}
                 >
                   <RotateCcw size={10} className={gpsStatus === 'searching' ? 'animate-spin' : ''} />
                 </button>
               </div>
               
               <div className="space-y-3">
                 <div className="flex items-center justify-between text-[10px]">
                   <span className="text-white/40 font-orbitron">SIGNAL_STATE</span>
                   <span className={`font-bold tracking-widest ${gpsStatus === 'locked' ? 'text-emerald-400' : gpsStatus === 'searching' ? 'text-amber-400 animate-pulse' : 'text-red-400'}`}>
                     {gpsStatus.toUpperCase()}
                   </span>
                 </div>
                 
                 {userLocation ? (
                   <div className="space-y-1.5">
                     <div className="flex items-center justify-between text-[9px] font-mono text-white/80">
                       <span className="opacity-40">LAT:</span>
                       <span>{userLocation.latitude.toFixed(6)}</span>
                     </div>
                     <div className="flex items-center justify-between text-[9px] font-mono text-white/80">
                       <span className="opacity-40">LON:</span>
                       <span>{userLocation.longitude.toFixed(6)}</span>
                     </div>
                   </div>
                 ) : (
                   <p className="text-[9px] text-white/20 italic">Awaiting satellite lock...</p>
                 )}
                 
                 <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                   <div 
                    className={`h-full transition-all duration-1000 ${
                      gpsStatus === 'locked' ? 'bg-emerald-400 w-full shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 
                      gpsStatus === 'searching' ? 'bg-amber-400 w-2/3 animate-pulse' : 'bg-red-500 w-0'
                    }`} 
                   />
                 </div>
               </div>
            </div>

            <div className="p-5 bg-black/50 border-l-4 border-[var(--theme-color)] backdrop-blur-xl rounded-xl shadow-lg">
              <h3 className="text-[11px] font-orbitron text-white/60 mb-3 flex items-center uppercase tracking-wider"><Globe size={14} className="mr-3 text-[var(--theme-color)]" /> Spatial Data</h3>
              <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-hide">
                {searchSources.length === 0 ? <p className="text-[10px] text-white/20 italic">No spatial events...</p> : searchSources.slice(-3).map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="block p-2 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-all truncate text-[10px] flex items-center">
                    <MapPin size={10} className="mr-2 opacity-40" />
                    {source.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="p-5 bg-black/50 border-l-4 border-white/10 backdrop-blur-xl rounded-xl shadow-lg">
              <h3 className="text-[11px] font-orbitron text-white/60 mb-3 flex items-center uppercase tracking-wider"><Monitor size={14} className="mr-3 text-[var(--theme-color)]" /> Log Stream</h3>
              <div className="max-h-32 overflow-y-auto space-y-3 pr-3 scrollbar-hide text-[11px] font-mono">
                {transcriptions.slice(-4).map((t, i) => <div key={i} className={t.type === 'user' ? 'text-white/60' : 'text-[var(--theme-color)]'}><span className="opacity-40 mr-2">{t.type === 'user' ? '>>' : '##'}</span>{t.text}</div>)}
              </div>
            </div>
          </div>
          
          <div className="w-80">
            <div className="p-5 bg-black/50 border-r-4 border-white/10 backdrop-blur-xl rounded-xl text-right min-h-[220px] flex flex-col shadow-2xl">
              <h3 className="text-[11px] font-orbitron text-white/60 mb-4 flex items-center justify-end uppercase tracking-wider">Kernel Feedback <button onClick={clearLogs} className="ml-3 p-1 hover:bg-white/10 rounded"><Trash2 size={10} className="text-white/40" /></button></h3>
              <div className="space-y-2 overflow-y-auto max-h-80 scrollbar-hide flex-1">
                {systemLogs.map((log, i) => {
                  const isSuccess = log.includes('locked') || log.includes('Success');
                  return (
                    <div key={i} className={`text-[10px] font-mono leading-tight ${isSuccess ? 'text-emerald-400' : 'text-white/30'}`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-12 flex-1">
          {isSpeaking && <div className="flex items-center space-x-2 h-16">{[...Array(16)].map((_, i) => <div key={i} className="w-1.5 bg-[var(--theme-color)] rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%` }} />)}</div>}
          <button onClick={isSessionActive ? stopVoiceSession : startVoiceSession} className={`group relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 transform hover:scale-110 ${isSessionActive ? 'shadow-[0_0_70px_var(--glow-color)] bg-[var(--theme-color)]' : 'bg-white/5 border-2 border-white/10'}`}>{isSessionActive ? <Mic size={48} className="text-black" /> : <MicOff size={48} className="text-white/30" />}</button>
          <div className="text-center space-y-2">
            <span className="font-orbitron text-xs tracking-[0.5em] uppercase text-white/50 block">{isSessionActive ? "UPLINK SECURE" : "AWAITING SYNC"}</span>
            <div className="text-[10px] text-white/20 font-mono flex items-center justify-center space-x-3 uppercase">
              <div className="flex items-center"><Cpu size={12} className="mr-1.5" /><span>v4.9.9</span></div>
              <div className="flex items-center"><Compass size={12} className={`mr-1.5 ${gpsStatus === 'searching' ? 'animate-spin' : ''}`} /><span>{gpsStatus}</span></div>
            </div>
          </div>
        </div>
      </main>
      <footer className="relative z-40"><AgentDashboard theme={theme} activeAgentId={currentAgentId} onAgentSelect={(id) => { setCurrentAgentId(id); updateAgentStatus(id, 'working'); addLog(`OVERRIDE: ${id.toUpperCase()} tasked.`); }} agents={agents} /></footer>
    </div>
  );
};

export default App;
