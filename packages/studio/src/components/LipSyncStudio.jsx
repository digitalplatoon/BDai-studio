import React, { useState, useEffect, useCallback } from 'react';
import { t } from '../bangla';
import { generateLipSync, uploadFile } from '../muapi';
import { lipSyncModels } from '../models';

export default function LipSyncStudio({ apiKey, onGenerationComplete, historyItems }) {
  const PERSIST_KEY = "bangla_lipsync_studio";

  const [inputMode, setInputMode] = useState('image'); // 'image' or 'video'
  const [selectedModelId, setSelectedModelId] = useState(lipSyncModels[0].id);
  const [selectedModelName, setSelectedModelName] = useState(lipSyncModels[0].name);
  const [selectedResolution, setSelectedResolution] = useState('720p');
  const [prompt, setPrompt] = useState("");

  const [imageUrl, setImageUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  const [localHistory, setLocalHistory] = useState([]);
  const history = historyItems ?? localHistory;

  // Filter models by type
  const currentModels = lipSyncModels.filter(m => m.type === inputMode);

  // Ensure selected model matches current input mode
  useEffect(() => {
    const modelMatchesMode = lipSyncModels.find(
      m => m.id === selectedModelId && m.type === inputMode
    );
    if (!modelMatchesMode && currentModels.length > 0) {
      const first = currentModels[0];
      setSelectedModelId(first.id);
      setSelectedModelName(first.name);
      if (first.resolutions.length > 0) {
        setSelectedResolution(first.resolutions[first.resolutions.length - 1]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.inputMode) setInputMode(data.inputMode);
        if (data.selectedModelId) {
          setSelectedModelId(data.selectedModelId);
          const model = lipSyncModels.find(m => m.id === data.selectedModelId);
          if (model) setSelectedModelName(model.name);
        }
        if (data.selectedResolution) setSelectedResolution(data.selectedResolution);
        if (data.prompt) setPrompt(data.prompt);
        if (data.localHistory) setLocalHistory(data.localHistory);
      }
    } catch (err) { console.warn("Load failed:", err); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
          inputMode, selectedModelId, selectedModelName, selectedResolution, prompt, localHistory
        }));
      } catch (err) { console.warn("Save failed:", err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputMode, selectedModelId, selectedModelName, selectedResolution, prompt, localHistory]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !apiKey) return;
    try {
      const url = await uploadFile(apiKey, file);
      if (type === 'image') setImageUrl(url);
      if (type === 'video') setVideoUrl(url);
      if (type === 'audio') setAudioUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert(t('Upload failed'));
    }
  };

  const handleModelSelect = (e) => {
    const model = currentModels.find(m => m.id === e.target.value);
    if (model) {
      setSelectedModelId(model.id);
      setSelectedModelName(model.name);
      if (model.resolutions.length > 0) setSelectedResolution(model.resolutions[model.resolutions.length - 1]);
    }
  };

  const addToHistory = useCallback((entry) => {
    if (!historyItems) setLocalHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, [historyItems]);

  const handleGenerate = async () => {
    if (generating) return;
    if (inputMode === 'image' && !imageUrl) { alert(t('Please upload a portrait image')); return; }
    if (inputMode === 'video' && !videoUrl) { alert(t('Please upload a video')); return; }
    if (!audioUrl) { alert(t('Please upload an audio file')); return; }

    setGenerating(true);
    setGenerateError(null);

    try {
      const res = await generateLipSync(apiKey, {
        model: selectedModelId,
        image_url: inputMode === 'image' ? imageUrl : undefined,
        video_url: inputMode === 'video' ? videoUrl : undefined,
        audio_url: audioUrl,
        resolution: selectedResolution,
        prompt: prompt.trim() || undefined,
      });

      if (res && res.url) {
        const entry = {
          id: res.id || Date.now().toString(),
          url: res.url,
          model: selectedModelId,
          resolution: selectedResolution,
          timestamp: new Date().toISOString(),
        };
        addToHistory(entry);
        onGenerationComplete?.({ url: res.url, model: selectedModelId, type: "lipsync" });
      } else {
        throw new Error(t('No video URL returned'));
      }
    } catch (e) {
      console.error("[LipSyncStudio] Generation failed:", e);
      setGenerateError(e.message.slice(0, 80));
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const currentModel = currentModels.find(m => m.id === selectedModelId);
  const availableResolutions = currentModel?.resolutions || [];

  return (
    <div className="flex flex-col h-full">
      {/* Gallery */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((entry, idx) => (
              <div key={entry.id || idx} onClick={() => setFullscreenUrl(entry.url)} className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
                <div className="aspect-video relative">
                  <video src={entry.url} className="w-full h-full object-cover" muted loop playsInline />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="px-2 py-0.5 bg-bangla-green/20 rounded text-bangla-green">{entry.model}</span>
                    <span>{entry.resolution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <div className="w-24 h-24 rounded-full bg-bangla-green/10 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-bangla-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-lg font-medium">{t('Animate portraits or sync lips to audio with AI')}</p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-bangla-border bg-bangla-dark/95 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button 
              onClick={() => { if (inputMode !== 'image') { setInputMode('image'); setImageUrl(null); setVideoUrl(null); } }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'image' ? 'bg-bangla-green text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              {t('Portrait Image')}
            </button>
            <button 
              onClick={() => { if (inputMode !== 'video') { setInputMode('video'); setImageUrl(null); setVideoUrl(null); } }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'video' ? 'bg-bangla-green text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              {t('Video')}
            </button>
          </div>

          {/* Uploads */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {inputMode === 'image' ? (
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" id="lipsync-image" />
                <label htmlFor="lipsync-image" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  imageUrl ? 'bg-bangla-green/20 border-bangla-green text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm">{imageUrl ? t('Portrait Image') : t('Upload portrait')}</span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" id="lipsync-video" />
                <label htmlFor="lipsync-video" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                  videoUrl ? 'bg-bangla-green/20 border-bangla-green text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="text-sm">{videoUrl ? t('Video') : t('Upload video')}</span>
                </label>
              </div>
            )}

            {/* Audio Upload */}
            <div className="relative">
              <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} className="hidden" id="lipsync-audio" />
              <label htmlFor="lipsync-audio" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                audioUrl ? 'bg-bangla-green/20 border-bangla-green text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <span className="text-sm">{audioUrl ? t('Audio') : t('Upload audio')}</span>
              </label>
            </div>

            {/* Model Selector */}
            <select 
              value={selectedModelId}
              onChange={handleModelSelect}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {currentModels.map(m => (
                <option key={m.id} value={m.id} className="bg-bangla-card">{m.name}</option>
              ))}
            </select>

            {/* Resolution */}
            {availableResolutions.length > 0 && (
              <select 
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
              >
                {availableResolutions.map(r => (
                  <option key={r} value={r} className="bg-bangla-card">{r}</option>
                ))}
              </select>
            )}
          </div>

          {/* Prompt */}
          <div className="flex gap-3">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={t('Describe how to transform this image')}
              className="input-bangla flex-1 resize-none min-h-[52px] max-h-[150px]" 
              rows={1} 
            />
            <button 
              onClick={handleGenerate} 
              disabled={generating} 
              className={`btn-primary px-6 flex items-center gap-2 ${generating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {generating ? (
                <>
                  <div className="loading-spinner w-5 h-5 border-2" />
                  <span>{t('Generating')}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{t('Generate')}</span>
                </>
              )}
            </button>
          </div>

          {generateError && <div className="mt-2 text-bangla-red text-sm">{generateError}</div>}
        </div>
      </div>

      {fullscreenUrl && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setFullscreenUrl(null)}>
          <video src={fullscreenUrl} controls autoPlay className="max-w-full max-h-full rounded-lg" />
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setFullscreenUrl(null)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
