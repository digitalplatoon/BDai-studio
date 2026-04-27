'use client';

import React, { useState, useEffect } from 'react';
import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio, t, useLanguage, PROVIDERS, getProvider, setProvider, getProviderConfig, updateProviderConfig } from 'studio';

const TAB_DEFS = [
  { id: 'image', labelKey: 'Image Studio', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'video', labelKey: 'Video Studio', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'lipsync', labelKey: 'Lip Sync', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { id: 'cinema', labelKey: 'Cinema', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
];

export default function StandaloneShell() {
  const [activeTab, setActiveTab] = useState('image');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  // Provider state
  const [provider, setProviderState] = useState('muapi');
  const [replicateModelUrl, setReplicateModelUrl] = useState('');
  const [tempReplicateModelUrl, setTempReplicateModelUrl] = useState('');
  
  // Subscribe to language changes
  const [lang, setLang] = useLanguage();

  // Load API key and provider settings from localStorage
  useEffect(() => {
    try {
      const currentProvider = getProvider();
      setProviderState(currentProvider);
      
      const config = getProviderConfig(currentProvider);
      if (config.apiKey) {
        setApiKey(config.apiKey);
        setTempApiKey(config.apiKey);
      }
      
      if (currentProvider === 'replicate' && config.modelUrl) {
        setReplicateModelUrl(config.modelUrl);
        setTempReplicateModelUrl(config.modelUrl);
      }
    } catch (e) { 
      console.warn('Settings load failed', e); 
    }
  }, []);

  const saveApiKey = () => {
    if (!tempApiKey.trim()) {
      alert(t('API key cannot be empty'));
      return;
    }

    if (provider === 'replicate' && !tempReplicateModelUrl.trim()) {
      alert(t('Model URL cannot be empty'));
      return;
    }

    // Save to provider system
    updateProviderConfig(provider, { apiKey: tempApiKey.trim() });
    if (provider === 'replicate') {
      updateProviderConfig(provider, { modelUrl: tempReplicateModelUrl.trim() });
    }

    setApiKey(tempApiKey.trim());
    setReplicateModelUrl(tempReplicateModelUrl.trim());
    setShowSettings(false);
  };

  const clearApiKey = () => {
    updateProviderConfig(provider, { apiKey: '' });
    setApiKey('');
    setTempApiKey('');
    setShowSettings(false);
  };

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setProviderState(newProvider);
    
    // Load config for new provider
    const config = getProviderConfig(newProvider);
    if (config.apiKey) {
      setApiKey(config.apiKey);
      setTempApiKey(config.apiKey);
    } else {
      setApiKey('');
      setTempApiKey('');
    }
    
    if (newProvider === 'replicate' && config.modelUrl) {
      setReplicateModelUrl(config.modelUrl);
      setTempReplicateModelUrl(config.modelUrl);
    }
  };

  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

  // Build TABS inside render so labels re-translate on language switch
  const tabs = TAB_DEFS.map((tab) => ({ ...tab, label: t(tab.labelKey) }));

  const hasApiKey = apiKey && (provider !== 'replicate' || replicateModelUrl);

  return (
    <div className="flex flex-col h-screen bangla-pattern">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bangla-green to-bangla-green/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-white font-bold">{t('Bangla AI Studio')}</h1>
              <p className="text-white/40 text-xs">{t('Uncensored AI Image & Video Generation')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLang}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
            >
              {lang === 'en' ? 'বাংলা' : 'EN'}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              aria-label={t('Settings')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto px-4 pb-2 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-bangla-green text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!hasApiKey ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30 p-4">
            <div className="w-20 h-20 rounded-full bg-bangla-green/10 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-bangla-green/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t('API Key Required')}</h2>
            <p className="text-center max-w-md mb-6">
              {provider === 'replicate' 
                ? 'Enter your Replicate API key and model URL to start generating'
                : t('Enter your Muapi.ai API key to start generating AI images and videos')}
            </p>
            <button 
              onClick={() => setShowSettings(true)}
              className="btn-primary"
            >
              {t('Enter your API key')}
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'image' && <ImageStudio apiKey={apiKey} />}
            {activeTab === 'video' && <VideoStudio apiKey={apiKey} />}
            {activeTab === 'lipsync' && <LipSyncStudio apiKey={apiKey} />}
            {activeTab === 'cinema' && <CinemaStudio apiKey={apiKey} />}
          </>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('Settings')}</h2>
              <button onClick={() => setShowSettings(false)} aria-label={t('Close')} className="text-white/40 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Language selector */}
              <div>
                <label className="block text-white/60 text-sm mb-2">{t('Language')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-bangla-green text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('bn')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'bn' ? 'bg-bangla-green text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {/* API Provider selector */}
              <div>
                <label className="block text-white/60 text-sm mb-2">API Provider</label>
                <div className="flex gap-2">
                  {Object.entries(PROVIDERS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleProviderChange(key)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        provider === key 
                          ? 'bg-bangla-green text-white' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key input */}
              <div>
                <label className="block text-white/60 text-sm mb-2">{t('API Key')}</label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={t('Enter your API key')}
                  className="input-bangla"
                />
                <p className="text-white/30 text-xs mt-2">
                  {provider === 'replicate' 
                    ? 'Get your API key from '
                    : t('Get your API key from')} 
                  <a 
                    href={provider === 'replicate' ? 'https://replicate.com/api' : 'https://muapi.ai'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-bangla-green hover:underline"
                  >
                    {provider === 'replicate' ? 'replicate.com/api' : 'muapi.ai'}
                  </a>
                </p>
              </div>

              {/* Replicate Model URL input */}
              {provider === 'replicate' && (
                <div>
                  <label className="block text-white/60 text-sm mb-2">Model URL</label>
                  <input
                    type="text"
                    value={tempReplicateModelUrl}
                    onChange={(e) => setTempReplicateModelUrl(e.target.value)}
                    placeholder="https://replicate.com/bytedance/seedance-2.0"
                    className="input-bangla text-xs"
                  />
                  <p className="text-white/30 text-xs mt-2">Enter the full Replicate model URL (e.g., bytedance/seedance-2.0 or openai/whisper)</p>
                </div>
              )}

              {/* Save/Clear buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={saveApiKey} className="btn-primary flex-1">{t('Save')}</button>
                {apiKey && (
                  <button onClick={clearApiKey} className="btn-secondary">{t('Clear')}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
