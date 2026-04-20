import React, { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '../bangla';
import { generateVideo, generateI2V, uploadFile } from '../muapi';
import { t2vModels, i2vModels, getDurationsForModel } from '../models';

export default function VideoStudio({ apiKey, onGenerationComplete, historyItems }) {
  const PERSIST_KEY = "bangla_video_studio";
  const UPLOAD_STATE = { IDLE: 'idle', UPLOADING: 'uploading', DONE: 'done', ERROR: 'error' };

  const [videoMode, setVideoMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(t2vModels[0].id);
  const [selectedModelName, setSelectedModelName] = useState(t2vModels[0].name);
  const [selectedAr, setSelectedAr] = useState("16:9");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [localHistory, setLocalHistory] = useState([]);
  const history = historyItems ?? localHistory;

  // Persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.videoMode !== undefined) setVideoMode(data.videoMode);
        if (data.selectedModelId) {
          setSelectedModelId(data.selectedModelId);
          const model = [...t2vModels, ...i2vModels].find(m => m.id === data.selectedModelId);
          if (model) setSelectedModelName(model.name);
        }
        if (data.selectedAr) setSelectedAr(data.selectedAr);
        if (data.selectedDuration) setSelectedDuration(data.selectedDuration);
        if (data.prompt) setPrompt(data.prompt);
        if (data.localHistory) setLocalHistory(data.localHistory);
      }
    } catch (err) { console.warn("Load failed:", err); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
          videoMode, selectedModelId, selectedModelName, selectedAr, selectedDuration, prompt, localHistory
        }));
      } catch (err) { console.warn("Save failed:", err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [videoMode, selectedModelId, selectedModelName, selectedAr, selectedDuration, prompt, localHistory]);

  const currentModels = videoMode ? i2vModels : t2vModels;
  const currentAspectRatios = ["16:9", "9:16", "4:3", "3:4", "1:1"];
  const currentDurations = getDurationsForModel(selectedModelId);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !apiKey) return;
    try {
      const url = await uploadFile(apiKey, file);
      setImageUrl(url);
      if (!videoMode) {
        setVideoMode(true);
        const firstI2V = i2vModels[0];
        setSelectedModelId(firstI2V.id);
        setSelectedModelName(firstI2V.name);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }
  };

  const handleModelSelect = (m) => {
    setSelectedModelId(m.id);
    setSelectedModelName(m.name);
    setSelectedAr("16:9");
    setSelectedDuration(getDurationsForModel(m.id)[0] || "5s");
  };

  const addToHistory = useCallback((entry) => {
    if (!historyItems) setLocalHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, [historyItems]);

  const handleGenerate = async () => {
    if (generating) return;
    if (videoMode && !imageUrl) { alert(t('Please upload a reference image')); return; }
    if (!videoMode && !prompt.trim()) { alert(t('Please enter a prompt')); return; }

    setGenerating(true);
    setGenerateError(null);

    try {
      let res;
      if (videoMode) {
        res = await generateI2V(apiKey, {
          model: selectedModelId,
          image_url: imageUrl,
          prompt: prompt.trim(),
          aspect_ratio: selectedAr,
          duration: selectedDuration,
        });
      } else {
        res = await generateVideo(apiKey, {
          model: selectedModelId,
          prompt: prompt.trim(),
          aspect_ratio: selectedAr,
          duration: selectedDuration,
        });
      }

      if (res && res.url) {
        const entry = {
          id: res.id || Date.now().toString(),
          url: res.url,
          prompt: prompt.trim(),
          model: selectedModelId,
          aspect_ratio: selectedAr,
          duration: selectedDuration,
          timestamp: new Date().toISOString(),
        };
        addToHistory(entry);
        onGenerationComplete?.({ url: res.url, model: selectedModelId, prompt: prompt.trim(), type: "video" });
      } else {
        throw new Error(t('No video URL returned'));
      }
    } catch (e) {
      console.error("[VideoStudio] Generation failed:", e);
      setGenerateError(e.message.slice(0, 80));
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

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
                  <p className="text-white/80 text-sm line-clamp-2">{entry.prompt || t('No prompt')}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <span className="px-2 py-0.5 bg-bangla-green/20 rounded text-bangla-green">{entry.model}</span>
                    <span>{entry.aspect_ratio}</span>
                    <span>{entry.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <div className="w-24 h-24 rounded-full bg-bangla-green/10 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-bangla-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium">{t('Describe the video you want to create')}</p>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-bangla-border bg-bangla-dark/95 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          {/* Controls */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Image Upload */}
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="video-image-upload" />
              <label htmlFor="video-image-upload" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                imageUrl ? 'bg-bangla-green/20 border-bangla-green text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">{imageUrl ? t('Reference image') : t('Add images')}</span>
              </label>
            </div>

            {videoMode && imageUrl && (
              <button onClick={() => { setImageUrl(null); setVideoMode(false); setSelectedModelId(t2vModels[0].id); setSelectedModelName(t2vModels[0].name); }} className="text-white/40 hover:text-white text-sm">✕</button>
            )}

            {/* Model Selector */}
            <select 
              value={selectedModelId}
              onChange={(e) => {
                const model = currentModels.find(m => m.id === e.target.value);
                if (model) handleModelSelect(model);
              }}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {currentModels.map(m => (
                <option key={m.id} value={m.id} className="bg-bangla-card">{m.name}</option>
              ))}
            </select>

            {/* Aspect Ratio */}
            <select 
              value={selectedAr}
              onChange={(e) => setSelectedAr(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {currentAspectRatios.map(ar => (
                <option key={ar} value={ar} className="bg-bangla-card">{ar}</option>
              ))}
            </select>

            {/* Duration */}
            <select 
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {currentDurations.map(d => (
                <option key={d} value={d} className="bg-bangla-card">{d}</option>
              ))}
            </select>
          </div>

          {/* Prompt */}
          <div className="flex gap-3">
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              placeholder={videoMode ? t('Describe how to animate this image') : t('Describe the video you want to create')}
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
