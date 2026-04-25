import React, { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '../bangla';
import { 
  generateImage, 
  generateI2I, 
  uploadFile 
} from '../muapi';
import { 
  t2iModels, 
  i2iModels,
  getAspectRatiosForModel,
  getAspectRatiosForI2IModel,
  getResolutionsForModel,
  getResolutionsForI2IModel,
  getQualityFieldForModel,
  getQualityFieldForI2IModel,
  getMaxImagesForI2IModel
} from '../models';

// Upload Picker Component
function UploadPicker({ apiKey, onSelect, onClear, maxImages = 1, selectedUrls = [] }) {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const fileInputRef = useRef(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bangla_upload_history');
      if (stored) setUploadHistory(JSON.parse(stored));
    } catch (e) { console.warn('History load failed', e); }
  }, []);

  // Save history
  const saveHistory = (history) => {
    localStorage.setItem('bangla_upload_history', JSON.stringify(history.slice(0, 50)));
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !apiKey) return;

    const newEntries = files.map(file => ({
      url: null,
      file,
      progress: 0,
      timestamp: Date.now(),
      error: null,
    }));

    setUploadHistory(prev => [...newEntries, ...prev]);
    setPanelOpen(true);

    // Upload files sequentially with proper index tracking
    for (let i = 0; i < newEntries.length; i++) {
      try {
        const url = await uploadFile(apiKey, newEntries[i].file);
        setUploadHistory(prev => {
          // Find and update the specific entry by timestamp to avoid index mismatches
          const updated = [...prev];
          const entryIdx = updated.findIndex(e => e.timestamp === newEntries[i].timestamp);
          if (entryIdx !== -1) {
            updated[entryIdx] = { ...updated[entryIdx], url, progress: 100, error: null };
            saveHistory(updated);
          }
          return updated;
        });
      } catch (err) {
        console.error('Upload failed:', err);
        const errMsg = err.message || 'Upload failed';
        setUploadHistory(prev => {
          const updated = [...prev];
          const entryIdx = updated.findIndex(e => e.timestamp === newEntries[i].timestamp);
          if (entryIdx !== -1) {
            updated[entryIdx] = { ...updated[entryIdx], error: errMsg, progress: 0 };
            saveHistory(updated);
          }
          return updated;
        });
        alert(`${t('Upload failed')}: ${errMsg}`);
      }
    }
  };

  const handleCellClick = (entry) => {
    if (!entry.url) return; // Can't select failed/pending uploads
    if (maxImages > 1) {
      // Multi-select mode
      const exists = selectedEntries.find(e => e.timestamp === entry.timestamp);
      if (exists) {
        setSelectedEntries(prev => prev.filter(e => e.timestamp !== entry.timestamp));
      } else if (selectedEntries.length < maxImages) {
        setSelectedEntries(prev => [...prev, entry]);
      }
    } else {
      // Single select
      onSelect({ url: entry.url });
      setPanelOpen(false);
    }
  };

  const handleUseSelected = () => {
    if (maxImages > 1) {
      onSelect({ urls: selectedEntries.map(e => e.url) });
    } else if (selectedEntries.length > 0) {
      onSelect({ url: selectedEntries[0].url });
    }
    setPanelOpen(false);
  };

  const handleRemove = (e, entry) => {
    e.stopPropagation();
    setUploadHistory(prev => {
      // Remove by timestamp to handle failed uploads without URLs
      const updated = prev.filter(item => item.timestamp !== entry.timestamp);
      saveHistory(updated);
      return updated;
    });
    // Remove from selections if it was selected
    setSelectedEntries(prev => prev.filter(item => item.timestamp !== entry.timestamp));
  };

  const isMulti = maxImages > 1;
  const hasSelection = selectedEntries.length > 0;
  const count = selectedEntries.length;

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={isMulti}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
          hasSelection 
            ? 'bg-bangla-green/20 border-bangla-green text-white' 
            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium">
          {hasSelection 
            ? (isMulti 
              ? `${count} ${t('of')} ${maxImages} ${t('images')} ${t('selected')}` 
              : t('Reference image'))
            : (isMulti ? `${t('Add images')} (max ${maxImages})` : t('Reference image'))
          }
        </span>
      </button>

      {panelOpen && (
        <div className="absolute z-50 bottom-full mb-2 left-0 bg-bangla-card border border-bangla-border rounded-xl p-4 shadow-2xl w-96">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">{t('Upload History')}</h3>
            {isMulti && hasSelection && (
              <button
                onClick={handleUseSelected}
                className="btn-primary text-xs py-1.5 px-3"
              >
                {t('Use Selected')}
              </button>
            )}
          </div>

          {uploadHistory.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p className="text-sm">{t('Upload files')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {uploadHistory.map((entry, idx) => {
                const selIdx = selectedEntries.findIndex(e => e.timestamp === entry.timestamp);
                const isSelected = selIdx !== -1;
                const atMax = isMulti && !isSelected && selectedEntries.length >= maxImages;

                return (
                  <div
                    key={idx}
                    onClick={() => !atMax && entry.url && handleCellClick(entry)}
                    className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer aspect-square transition-all ${
                      isSelected 
                        ? 'border-bangla-green shadow-glow' 
                        : entry.error
                        ? 'border-red-500/50 hover:border-red-500'
                        : 'border-white/10 hover:border-white/30'
                    } ${atMax && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {entry.error ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/10">
                        <svg className="w-6 h-6 text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-red-400 font-semibold text-center px-1">{t('Error')}</span>
                      </div>
                    ) : entry.url ? (
                      <img src={entry.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5">
                        <div className="loading-spinner mb-2" />
                        <span className="text-xs text-white/40">{Math.round(entry.progress)}%</span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-bangla-green rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {isMulti ? selIdx + 1 : '✓'}
                      </div>
                    )}

                    <button
                      onClick={(e) => handleRemove(e, entry)}
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      title={entry.error ? "Remove failed upload" : "Remove"}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-3 py-2 border border-dashed border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
          >
            + {t('Upload files')}
          </button>
        </div>
      )}
    </div>
  );
}

// Model Dropdown
function ModelDropdown({ models, selectedModel, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = models.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute z-50 bottom-full mb-2 right-0 bg-bangla-card border border-bangla-border rounded-xl p-3 shadow-2xl w-80">
      <input
        type="text"
        placeholder={t('Search models')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-bangla mb-3 text-sm"
        autoFocus
      />
      <div className="text-xs text-white/40 mb-2">{t('Available models')}</div>
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => { onSelect(m); onClose(); }}
            className={`flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-all ${
              selectedModel === m.id ? 'bg-white/5 border border-white/10' : 'border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bangla-green to-bangla-dark flex items-center justify-center text-white text-sm font-bold">
                {m.name.charAt(0)}
              </div>
              <span className="text-white text-sm">{m.name}</span>
            </div>
            {selectedModel === m.id && (
              <svg className="w-5 h-5 text-bangla-green" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple Dropdown
function SimpleDropdown({ title, options, selected, onSelect, onClose }) {
  return (
    <div className="absolute z-50 bottom-full mb-2 bg-bangla-card border border-bangla-border rounded-xl p-3 shadow-2xl min-w-[150px]">
      <div className="text-xs text-white/40 mb-2">{title}</div>
      {options.map((opt) => (
        <div
          key={opt}
          onClick={() => { onSelect(opt); onClose(); }}
          className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
        >
          <span className="text-white text-sm">{opt}</span>
          {selected === opt && (
            <svg className="w-4 h-4 text-bangla-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// Main Image Studio Component
export default function ImageStudio({ apiKey, onGenerationComplete, historyItems }) {
  const PERSIST_KEY = "bangla_image_studio";

  const [imageMode, setImageMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(t2iModels[0].id);
  const [selectedModelName, setSelectedModelName] = useState(t2iModels[0].name);
  const [selectedAr, setSelectedAr] = useState("1:1");
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [maxImages, setMaxImages] = useState(1);

  const [prompt, setPrompt] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [fullscreenUrl, setFullscreenUrl] = useState(null);

  const [localHistory, setLocalHistory] = useState([]);

  const history = historyItems ?? localHistory;
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [dropdownOpen]);

  // Persistence
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PERSIST_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.imageMode !== undefined) setImageMode(data.imageMode);
        if (data.selectedModelId) {
          setSelectedModelId(data.selectedModelId);
          const model = [...t2iModels, ...i2iModels].find(m => m.id === data.selectedModelId);
          if (model) setSelectedModelName(model.name);
        }
        if (data.selectedAr) setSelectedAr(data.selectedAr);
        if (data.selectedQuality) setSelectedQuality(data.selectedQuality);
        if (data.maxImages) setMaxImages(data.maxImages);
        if (data.prompt) setPrompt(data.prompt);
        if (data.uploadedImageUrls) setUploadedImageUrls(data.uploadedImageUrls);
        if (data.localHistory) setLocalHistory(data.localHistory);
      }
    } catch (err) { console.warn("Load failed:", err); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PERSIST_KEY, JSON.stringify({
          imageMode, selectedModelId, selectedModelName, selectedAr,
          selectedQuality, maxImages, prompt, uploadedImageUrls, localHistory
        }));
      } catch (err) { console.warn("Save failed:", err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [imageMode, selectedModelId, selectedModelName, selectedAr, selectedQuality, maxImages, prompt, uploadedImageUrls, localHistory]);

  // Reset model and state when toggling between T2I and I2I
  useEffect(() => {
    if (imageMode) {
      // Switching to I2I mode: ensure a valid i2i model is selected
      const modelExists = i2iModels.find(m => m.id === selectedModelId);
      if (!modelExists && i2iModels.length > 0) {
        const firstI2I = i2iModels[0];
        setSelectedModelId(firstI2I.id);
        setSelectedModelName(firstI2I.name);
        setSelectedAr(getAspectRatiosForI2IModel(firstI2I.id)[0] || "1:1");
        setSelectedQuality(getResolutionsForI2IModel(firstI2I.id)[0] || null);
      }
    } else {
      // Switching to T2I mode: ensure a valid t2i model is selected
      const modelExists = t2iModels.find(m => m.id === selectedModelId);
      if (!modelExists && t2iModels.length > 0) {
        const firstT2I = t2iModels[0];
        setSelectedModelId(firstT2I.id);
        setSelectedModelName(firstT2I.name);
        setSelectedAr(getAspectRatiosForModel(firstT2I.id)[0] || "1:1");
        setSelectedQuality(getResolutionsForModel(firstT2I.id)[0] || null);
      }
      // Clear uploaded images when exiting I2I mode
      setUploadedImageUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageMode]);

  // Derived values
  const currentModels = imageMode ? i2iModels : t2iModels;
  const currentAspectRatios = imageMode 
    ? getAspectRatiosForI2IModel(selectedModelId) 
    : getAspectRatiosForModel(selectedModelId);
  const currentResolutions = imageMode
    ? getResolutionsForI2IModel(selectedModelId)
    : getResolutionsForModel(selectedModelId);
  const currentQualityField = imageMode
    ? getQualityFieldForI2IModel(selectedModelId)
    : getQualityFieldForModel(selectedModelId);
  const showQualityBtn = currentResolutions.length > 0;

  const handleTextareaInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = window.innerWidth < 768 ? 150 : 250;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  };

  const handleUploadSelect = useCallback(({ url, urls }) => {
    const newUrls = urls || [url];
    setUploadedImageUrls(newUrls);

    if (!imageMode) {
      const firstI2I = i2iModels[0];
      setImageMode(true);
      setSelectedModelId(firstI2I.id);
      setSelectedModelName(firstI2I.name);
      setSelectedAr(getAspectRatiosForI2IModel(firstI2I.id)[0] || "1:1");
      setSelectedQuality(getResolutionsForI2IModel(firstI2I.id)[0] || null);
      setMaxImages(getMaxImagesForI2IModel(firstI2I.id));
    }
  }, [imageMode]);

  const handleUploadClear = useCallback(() => {
    setUploadedImageUrls([]);
    setImageMode(false);
    const firstT2I = t2iModels[0];
    setSelectedModelId(firstT2I.id);
    setSelectedModelName(firstT2I.name);
    setSelectedAr(getAspectRatiosForModel(firstT2I.id)[0] || "1:1");
    setSelectedQuality(getResolutionsForModel(firstT2I.id)[0] || null);
    setMaxImages(1);
  }, []);

  const handleModelSelect = (m) => {
    const ars = imageMode ? getAspectRatiosForI2IModel(m.id) : getAspectRatiosForModel(m.id);
    const resolutions = imageMode ? getResolutionsForI2IModel(m.id) : getResolutionsForModel(m.id);
    setSelectedModelId(m.id);
    setSelectedModelName(m.name);
    setSelectedAr(ars[0] || "1:1");
    setSelectedQuality(resolutions[0] || null);
    if (imageMode) setMaxImages(getMaxImagesForI2IModel(m.id));
  };

  const addToHistory = useCallback((entry) => {
    if (!historyItems) {
      setLocalHistory(prev => [entry, ...prev.slice(0, 49)]);
    }
  }, [historyItems]);

  const handleGenerate = async () => {
    if (generating) return;

    if (imageMode && uploadedImageUrls.length === 0) {
      alert(t('Please upload a reference image'));
      return;
    }
    if (!imageMode && !prompt.trim()) {
      alert(t('Please enter a prompt'));
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      let res;
      if (imageMode) {
        const genParams = {
          model: selectedModelId,
          images_list: uploadedImageUrls,
          image_url: uploadedImageUrls[0],
          aspect_ratio: selectedAr,
        };
        if (prompt.trim()) genParams.prompt = prompt.trim();
        if (currentQualityField && selectedQuality) {
          genParams[currentQualityField] = selectedQuality;
        }
        res = await generateI2I(apiKey, genParams);
      } else {
        const genParams = {
          model: selectedModelId,
          prompt: prompt.trim(),
          aspect_ratio: selectedAr,
        };
        if (currentQualityField && selectedQuality) {
          genParams[currentQualityField] = selectedQuality;
        }
        res = await generateImage(apiKey, genParams);
      }

      if (res && res.url) {
        const entry = {
          id: res.id || Date.now().toString(),
          url: res.url,
          prompt: prompt.trim(),
          model: selectedModelId,
          aspect_ratio: selectedAr,
          timestamp: new Date().toISOString(),
        };
        addToHistory(entry);
        onGenerationComplete?.({
          url: res.url, model: selectedModelId, prompt: prompt.trim(), type: "image"
        });
      } else {
        throw new Error(t('No image URL returned'));
      }
    } catch (e) {
      console.error("[ImageStudio] Generation failed:", e);
      setGenerateError(e.message.slice(0, 80));
      setTimeout(() => setGenerateError(null), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const placeholderText = uploadedImageUrls.length > 1
    ? `${uploadedImageUrls.length} ${t('images')} ${t('selected')} — ${t('Describe how to transform this image')}`
    : imageMode 
      ? t('Describe how to transform this image') 
      : t('Describe the image you want to create');

  return (
    <div className="flex flex-col h-full">
      {/* Gallery Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((entry, idx) => (
              <div 
                key={entry.id || idx} 
                onClick={() => setFullscreenUrl(entry.url)}
                className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform"
              >
                <div className="aspect-square relative">
                  <img src={entry.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white/80 text-sm line-clamp-2">{entry.prompt || t('No prompt')}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                    <span className="px-2 py-0.5 bg-bangla-green/20 rounded text-bangla-green">{entry.model}</span>
                    <span>{entry.aspect_ratio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <div className="w-24 h-24 rounded-full bg-bangla-green/10 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-bangla-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium">{t('Describe the image you want to create')}</p>
          </div>
        )}
      </div>

      {/* Bottom Prompt Bar */}
      <div className="border-t border-bangla-border bg-bangla-dark/95 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          {/* Controls Row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap" ref={dropdownRef}>
            <UploadPicker 
              apiKey={apiKey} 
              onSelect={handleUploadSelect} 
              onClear={handleUploadClear}
              maxImages={maxImages}
              selectedUrls={uploadedImageUrls}
            />

            {uploadedImageUrls.length > 0 && (
              <button onClick={handleUploadClear} className="text-white/40 hover:text-white text-sm">
                ✕
              </button>
            )}

            {/* Model Selector */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === 'model' ? null : 'model'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
              >
                <span>{selectedModelName}</span>
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen === 'model' && (
                <ModelDropdown 
                  models={currentModels} 
                  selectedModel={selectedModelId} 
                  onSelect={handleModelSelect} 
                  onClose={() => setDropdownOpen(null)} 
                />
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === 'ar' ? null : 'ar'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
              >
                <span>{selectedAr}</span>
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen === 'ar' && (
                <SimpleDropdown 
                  title={t('Aspect Ratio')} 
                  options={currentAspectRatios} 
                  selected={selectedAr} 
                  onSelect={setSelectedAr} 
                  onClose={() => setDropdownOpen(null)} 
                />
              )}
            </div>

            {/* Quality/Resolution */}
            {showQualityBtn && (
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setDropdownOpen(dropdownOpen === 'quality' ? null : 'quality'); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
                >
                  <span>{selectedQuality || t('Quality')}</span>
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen === 'quality' && (
                  <SimpleDropdown 
                    title={t('Quality')} 
                    options={currentResolutions} 
                    selected={selectedQuality} 
                    onSelect={setSelectedQuality} 
                    onClose={() => setDropdownOpen(null)} 
                  />
                )}
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={handleTextareaInput}
              placeholder={placeholderText}
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

          {generateError && (
            <div className="mt-2 text-bangla-red text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {generateError}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenUrl(null)}
        >
          <img src={fullscreenUrl} alt="" className="max-w-full max-h-full rounded-lg" />
          <button 
            className="absolute top-4 right-4 text-white/60 hover:text-white"
            onClick={() => setFullscreenUrl(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
