import React, { useState, useEffect, useCallback } from 'react';
import { t } from '../bangla';
import { generateImage } from '../muapi';

const CAMERAS = [
  "Modular 8K Digital",
  "Full-Frame Cine Digital", 
  "Grand Format 70mm Film",
  "Studio Digital S35",
  "Classic 16mm Film",
  "Premium Large Format Digital"
];

const LENSES = [
  "Creative Tilt",
  "Compact Anamorphic",
  "Extreme Macro",
  "70s Cinema Prime",
  "Classic Anamorphic",
  "Premium Modern Prime",
  "Warm Cinema Prime",
  "Swirl Bokeh Portrait",
  "Vintage Prime",
  "Halation Diffusion",
  "Clinical Sharp Prime"
];

const FOCALS = ["8mm", "14mm", "24mm", "35mm", "50mm", "85mm"];
const APERTURES = ["f/1.4", "f/4", "f/11"];

export default function CinemaStudio({ apiKey, onGenerationComplete, historyItems }) {
  const PERSIST_KEY = "bangla_cinema_studio";

  const [settings, setSettings] = useState({
    prompt: "",
    aspect_ratio: "16:9",
    camera: CAMERAS[0],
    lens: LENSES[0],
    focal: "35mm",
    aperture: "f/1.4",
  });
  const [resolution, setResolution] = useState("2K");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);
  const [localHistory, setLocalHistory] = useState([]);
  const history = historyItems ?? localHistory;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.settings) setSettings(data.settings);
        if (data.resolution) setResolution(data.resolution);
        if (data.localHistory) setLocalHistory(data.localHistory);
      }
    } catch (err) { console.warn("Load failed:", err); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({ settings, resolution, localHistory }));
      } catch (err) { console.warn("Save failed:", err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [settings, resolution, localHistory]);

  const buildPrompt = (basePrompt, camera, lens, focal, aperture) => {
    return `${basePrompt}, shot on ${camera} with ${lens} lens at ${focal} ${aperture}, cinematic lighting, film grain, professional color grading`;
  };

  const addToHistory = useCallback((entry) => {
    if (!historyItems) setLocalHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, [historyItems]);

  const handleGenerate = async () => {
    if (!settings.prompt.trim() || generating) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const finalPrompt = buildPrompt(
        settings.prompt.trim(),
        settings.camera,
        settings.lens,
        settings.focal,
        settings.aperture
      );

      const res = await generateImage(apiKey, {
        model: "nano-banana-pro",
        prompt: finalPrompt,
        aspect_ratio: settings.aspect_ratio,
        resolution: resolution.toLowerCase(),
        negative_prompt: "blurry, low quality, distortion, bad composition",
      });

      if (res && res.url) {
        const entry = {
          url: res.url,
          timestamp: Date.now(),
          settings: { ...settings, resolution },
        };
        addToHistory(entry);
        onGenerationComplete?.({ url: res.url, model: "nano-banana-pro", prompt: settings.prompt, type: "cinema" });
      } else {
        throw new Error(t('No image URL returned'));
      }
    } catch (e) {
      console.error(e);
      setGenerateError(e.message);
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
              <div key={idx} onClick={() => setFullscreenUrl(entry.url)} className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
                <div className="aspect-video relative">
                  <img src={entry.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-white/80 text-sm line-clamp-2">{entry.settings?.prompt || t('No prompt')}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <span>{entry.settings?.camera}</span>
                    <span>{entry.settings?.lens}</span>
                    <span>{entry.settings?.focal}</span>
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
            <p className="text-lg font-medium">{t('What would you shoot with infinite budget?')}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-bangla-border bg-bangla-dark/95 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          {/* Camera Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <select 
              value={settings.camera}
              onChange={(e) => setSettings(prev => ({ ...prev, camera: e.target.value }))}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {CAMERAS.map(c => <option key={c} value={c} className="bg-bangla-card">{c}</option>)}
            </select>
            <select 
              value={settings.lens}
              onChange={(e) => setSettings(prev => ({ ...prev, lens: e.target.value }))}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {LENSES.map(l => <option key={l} value={l} className="bg-bangla-card">{l}</option>)}
            </select>
            <select 
              value={settings.focal}
              onChange={(e) => setSettings(prev => ({ ...prev, focal: e.target.value }))}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {FOCALS.map(f => <option key={f} value={f} className="bg-bangla-card">{f}</option>)}
            </select>
            <select 
              value={settings.aperture}
              onChange={(e) => setSettings(prev => ({ ...prev, aperture: e.target.value }))}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-bangla-green"
            >
              {APERTURES.map(a => <option key={a} value={a} className="bg-bangla-card">{a}</option>)}
            </select>
          </div>

          {/* Prompt */}
          <div className="flex gap-3">
            <textarea 
              value={settings.prompt} 
              onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder={t('Describe the cinematic scene')}
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
          <img src={fullscreenUrl} alt="" className="max-w-full max-h-full rounded-lg" />
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setFullscreenUrl(null)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
