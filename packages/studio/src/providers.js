// packages/studio/src/providers.js - Provider abstraction layer
// Allows switching between different API providers (Muapi, Replicate, etc.)

import * as muapi from './providers/muapi.js';
import * as replicate from './providers/replicate.js';

// Provider configuration
export const PROVIDERS = {
  muapi: {
    name: 'Muapi.ai',
    id: 'muapi',
    requiresModelUrl: false,
    requiresApiKey: true,
  },
  replicate: {
    name: 'Replicate',
    id: 'replicate',
    requiresModelUrl: true,
    requiresApiKey: true,
  },
};

// Provider state (stored in localStorage)
let currentProvider = 'muapi';
let providerConfig = {
  muapi: {
    apiKey: localStorage.getItem('bangla_muapi_key') || '',
  },
  replicate: {
    apiKey: localStorage.getItem('bangla_replicate_key') || '',
    modelUrl: localStorage.getItem('bangla_replicate_model_url') || 'https://replicate.com/bytedance/seedance-2.0',
  },
};

// Initialize from localStorage
const savedProvider = localStorage.getItem('bangla_provider');
if (savedProvider && PROVIDERS[savedProvider]) {
  currentProvider = savedProvider;
}

// Subscribers for provider changes
const subscribers = [];

export function subscribeToProviderChanges(callback) {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

function notifySubscribers() {
  subscribers.forEach(cb => cb());
}

// Get current provider
export function getProvider() {
  return currentProvider;
}

// Set current provider
export function setProvider(providerId) {
  if (!PROVIDERS[providerId]) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  currentProvider = providerId;
  localStorage.setItem('bangla_provider', providerId);
  notifySubscribers();
}

// Get provider configuration
export function getProviderConfig(providerId = currentProvider) {
  return providerConfig[providerId] || {};
}

// Update provider configuration
export function updateProviderConfig(providerId, config) {
  if (!providerConfig[providerId]) {
    providerConfig[providerId] = {};
  }

  Object.entries(config).forEach(([key, value]) => {
    providerConfig[providerId][key] = value;
    // Persist to localStorage
    const lsKey = `bangla_${providerId}_${key}`;
    localStorage.setItem(lsKey, value);
  });

  notifySubscribers();
}

// Get the module for the current provider
function getProviderModule(providerId = currentProvider) {
  if (providerId === 'replicate') {
    return replicate;
  }
  return muapi; // Default to muapi
}

// Wrapper functions that delegate to the active provider
export async function uploadFile(file) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  return module.uploadFile(config.apiKey, file);
}

export async function generateImage(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.generateImage(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.generateImage(config.apiKey, params);
}

export async function generateI2I(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.generateI2I(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.generateI2I(config.apiKey, params);
}

export async function generateVideo(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.generateVideo(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.generateVideo(config.apiKey, params);
}

export async function generateI2V(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.generateI2V(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.generateI2V(config.apiKey, params);
}

export async function generateLipSync(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.generateLipSync(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.generateLipSync(config.apiKey, params);
}

export async function extendVideo(params) {
  const module = getProviderModule();
  const config = getProviderConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured for current provider');
  }

  // For Replicate, add modelUrl to params
  if (currentProvider === 'replicate') {
    return module.extendVideo(config.apiKey, {
      ...params,
      modelUrl: config.modelUrl,
    });
  }

  return module.extendVideo(config.apiKey, params);
}
