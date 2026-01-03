
import React, { useState } from 'react';
import { ImageIcon, VideoIcon, Wand2, Download, Trash2, Maximize2, MonitorPlay } from 'lucide-react';
import { GeneratedMedia } from '../types';

interface CreativeStudioProps {
  onGenerateImage: (prompt: string, aspectRatio: string, size: string) => void;
  onGenerateVideo: (prompt: string, aspectRatio: string) => void;
  onAnalyzeVideo: (file: File) => void;
  gallery: GeneratedMedia[];
  themeColor: string;
}

const CreativeStudio: React.FC<CreativeStudioProps> = ({ 
  onGenerateImage, onGenerateVideo, onAnalyzeVideo, gallery, themeColor 
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'vision'>('image');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAnalyzeVideo(file);
  };

  return (
    <div className="w-full h-full max-w-4xl flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-4">
            <button onClick={() => setActiveTab('image')} className={`px-6 py-2 rounded-full text-[10px] font-orbitron tracking-widest uppercase transition-all ${activeTab === 'image' ? 'bg-[var(--theme-color)] text-white' : 'bg-white/5 text-white/40'}`}>Images</button>
            <button onClick={() => setActiveTab('video')} className={`px-6 py-2 rounded-full text-[10px] font-orbitron tracking-widest uppercase transition-all ${activeTab === 'video' ? 'bg-[var(--theme-color)] text-white' : 'bg-white/5 text-white/40'}`}>Video</button>
            <button onClick={() => setActiveTab('vision')} className={`px-6 py-2 rounded-full text-[10px] font-orbitron tracking-widest uppercase transition-all ${activeTab === 'vision' ? 'bg-[var(--theme-color)] text-white' : 'bg-white/5 text-white/40'}`}>Vision</button>
          </div>
          <Wand2 className="text-[var(--theme-color)] animate-pulse" size={20} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-4 scrollbar-hide">
          {activeTab === 'vision' ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 border-2 border-dashed border-white/5 rounded-[2rem]">
               <div className="p-8 bg-white/5 rounded-full text-[var(--theme-color)]"><MonitorPlay size={48} /></div>
               <p className="text-white/40 font-quicksand text-center">Drop a video here, Love.<br/>I'll watch it and tell you everything.</p>
               <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" id="video-upload" />
               <label htmlFor="video-upload" className="px-8 py-3 bg-[var(--theme-color)] text-white rounded-full font-orbitron text-[10px] tracking-widest uppercase cursor-pointer hover:scale-105 transition-transform">Select Video</label>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'image' ? "Describe your vision..." : "Cinematic scene prompt..."}
                className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-6 text-white font-quicksand outline-none focus:border-[var(--theme-color)]/50 transition-all resize-none h-32"
              />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-orbitron text-white/30 uppercase tracking-widest">Aspect Ratio</label>
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs outline-none">
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Wide</option>
                    <option value="9:16">9:16 Tall</option>
                    <option value="4:3">4:3 Classic</option>
                    <option value="21:9">21:9 Ultrawide</option>
                  </select>
                </div>
                {activeTab === 'image' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-orbitron text-white/30 uppercase tracking-widest">Resolution</label>
                    <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs outline-none">
                      <option value="1K">1K Standard</option>
                      <option value="2K">2K High</option>
                      <option value="4K">4K Cinematic</option>
                    </select>
                  </div>
                )}
              </div>
              <button 
                onClick={() => activeTab === 'image' ? onGenerateImage(prompt, aspectRatio, resolution) : onGenerateVideo(prompt, aspectRatio)}
                className="w-full py-4 bg-[var(--theme-color)] text-white rounded-2xl font-orbitron text-[11px] tracking-[0.3em] uppercase hover:shadow-[0_0_20px_var(--glow-color)] transition-all flex items-center justify-center space-x-3"
              >
                {activeTab === 'image' ? <ImageIcon size={16} /> : <VideoIcon size={16} />}
                <span>Synthesize Vision</span>
              </button>
            </div>
          )}

          <div className="pt-10 border-t border-white/5">
            <h4 className="text-[10px] font-orbitron text-white/40 uppercase tracking-widest mb-6">Nexus Gallery</h4>
            <div className="grid grid-cols-3 gap-6">
              {gallery.map((media) => (
                <div key={media.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  {media.type === 'image' ? (
                    <img src={media.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover" controls />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <a href={media.url} download={`nami_${media.id}`} className="p-3 bg-white/10 rounded-full hover:bg-[var(--theme-color)] transition-colors"><Download size={18} /></a>
                    <button className="p-3 bg-white/10 rounded-full hover:bg-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-3 py-20 text-center opacity-20">
                  <ImageIcon size={32} className="mx-auto mb-4" />
                  <p className="text-[10px] font-orbitron uppercase tracking-widest">Awaiting creation...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;
