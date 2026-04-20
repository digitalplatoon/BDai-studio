// packages/studio/src/models.js - AI Models Configuration

export const ASPECT_RATIOS = [
  "1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"
];

export const RESOLUTIONS = ["480p", "720p", "1080p", "2K", "4K"];

export const DURATIONS = ["5s", "10s", "15s"];

// Text to Image Models
export const t2iModels = [
  { id: "flux-dev", name: "Flux Dev", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "flux-schnell", name: "Flux Schnell", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "flux-pro", name: "Flux Pro", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "nano-banana-2", name: "Nano Banana 2", inputs: { aspect_ratio: { default: "1:1" }, resolution: { default: "2K" } } },
  { id: "nano-banana-pro", name: "Nano Banana Pro", inputs: { aspect_ratio: { default: "1:1" }, resolution: { default: "2K" } } },
  { id: "seedream-5.0", name: "Seedream 5.0", inputs: { aspect_ratio: { default: "1:1" }, quality: { default: "high" } } },
  { id: "ideogram-v3", name: "Ideogram v3", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "midjourney-v7", name: "Midjourney v7", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "gpt-4o-image", name: "GPT-4o Image", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "sdxl", name: "Stable Diffusion XL", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "sd-3.5", name: "Stable Diffusion 3.5", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "dall-e-3", name: "DALL-E 3", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "recraft-v3", name: "Recraft v3", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "playground-v2.5", name: "Playground v2.5", inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "kandinsky-3", name: "Kandinsky 3", inputs: { aspect_ratio: { default: "1:1" } } },
];

// Image to Image Models
export const i2iModels = [
  { id: "nano-banana-2-edit", name: "Nano Banana 2 Edit", maxImages: 14, inputs: { aspect_ratio: { default: "1:1" }, resolution: { default: "2K" } } },
  { id: "flux-kontext-dev", name: "Flux Kontext Dev", maxImages: 10, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "flux-kontext-pro", name: "Flux Kontext Pro", maxImages: 2, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "gpt-4o-edit", name: "GPT-4o Edit", maxImages: 10, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "seedream-5.0-edit", name: "Seedream 5.0 Edit", maxImages: 10, inputs: { aspect_ratio: { default: "1:1" }, quality: { default: "high" } } },
  { id: "seededit-v3", name: "Seededit v3", maxImages: 1, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "flux-2-flex-edit", name: "Flux 2 Flex Edit", maxImages: 8, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "upscaler", name: "AI Upscaler", maxImages: 1, inputs: { aspect_ratio: { default: "1:1" } } },
  { id: "background-remover", name: "Background Remover", maxImages: 1, inputs: { aspect_ratio: { default: "1:1" } } },
];

// Text to Video Models
export const t2vModels = [
  { id: "kling-v3", name: "Kling v3", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "sora-2", name: "Sora 2", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "veo-3", name: "Veo 3", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "wan-2.6", name: "Wan 2.6", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "seedance-2.0", name: "Seedance 2.0", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" }, quality: { default: "high" } } },
  { id: "seedance-pro", name: "Seedance Pro", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "hailuo-2.3", name: "Hailuo 2.3", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "runway-gen-3", name: "Runway Gen-3", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "luma-dream-machine", name: "Luma Dream Machine", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "pika-2.0", name: "Pika 2.0", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "grok-imagine-t2v", name: "Grok Imagine", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "6s" } } },
];

// Image to Video Models
export const i2vModels = [
  { id: "kling-v2.1-i2v", name: "Kling v2.1 I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "veo-3-i2v", name: "Veo 3 I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "runway-i2v", name: "Runway I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "seedance-2.0-i2v", name: "Seedance 2.0 I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" }, quality: { default: "high" } } },
  { id: "midjourney-v7-i2v", name: "Midjourney v7 I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "hunyuan-i2v", name: "Hunyuan I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "wan-2.2-i2v", name: "Wan 2.2 I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "5s" } } },
  { id: "grok-imagine-i2v", name: "Grok Imagine I2V", inputs: { aspect_ratio: { default: "16:9" }, duration: { default: "6s" } } },
];

// Lip Sync Models
export const lipSyncModels = [
  { id: "infinitetalk-image-to-video", name: "Infinite Talk", type: "image", resolutions: ["480p", "720p"] },
  { id: "wan-2.2-speech-to-video", name: "Wan 2.2 Speech", type: "image", resolutions: ["480p", "720p"] },
  { id: "ltx-2.3-lipsync", name: "LTX 2.3 Lipsync", type: "image", resolutions: ["480p", "720p", "1080p"] },
  { id: "ltx-2-19b-lipsync", name: "LTX 2 19B", type: "image", resolutions: ["480p", "720p", "1080p"] },
  { id: "sync-lipsync", name: "Sync Lipsync", type: "video", resolutions: [] },
  { id: "latentsync-video", name: "LatentSync", type: "video", resolutions: [] },
  { id: "creatify-lipsync", name: "Creatify", type: "video", resolutions: [] },
  { id: "veed-lipsync", name: "Veed", type: "video", resolutions: [] },
  { id: "infinitetalk-video-to-video", name: "Infinite Talk V2V", type: "video", resolutions: ["480p", "720p"] },
];

// Helper functions
export function getAspectRatiosForModel(modelId) {
  const model = [...t2iModels, ...i2iModels].find(m => m.id === modelId);
  return model?.inputs?.aspect_ratio ? ASPECT_RATIOS : ["1:1"];
}

export function getAspectRatiosForI2IModel(modelId) {
  const model = i2iModels.find(m => m.id === modelId);
  return model?.inputs?.aspect_ratio ? ASPECT_RATIOS : ["1:1"];
}

export function getResolutionsForModel(modelId) {
  const model = t2iModels.find(m => m.id === modelId);
  if (model?.inputs?.resolution) return RESOLUTIONS;
  if (model?.inputs?.quality) return ["basic", "high"];
  return [];
}

export function getResolutionsForI2IModel(modelId) {
  const model = i2iModels.find(m => m.id === modelId);
  if (model?.inputs?.resolution) return RESOLUTIONS;
  if (model?.inputs?.quality) return ["basic", "high"];
  return [];
}

export function getQualityFieldForModel(modelId) {
  const model = t2iModels.find(m => m.id === modelId);
  if (model?.inputs?.resolution) return "resolution";
  if (model?.inputs?.quality) return "quality";
  return null;
}

export function getQualityFieldForI2IModel(modelId) {
  const model = i2iModels.find(m => m.id === modelId);
  if (model?.inputs?.resolution) return "resolution";
  if (model?.inputs?.quality) return "quality";
  return null;
}

export function getMaxImagesForI2IModel(modelId) {
  const model = i2iModels.find(m => m.id === modelId);
  return model?.maxImages || 1;
}

export function getDurationsForModel(modelId) {
  const model = [...t2vModels, ...i2vModels].find(m => m.id === modelId);
  return model?.inputs?.duration ? DURATIONS : ["5s"];
}

export function getResolutionsForVideoModel(modelId) {
  const model = [...t2vModels, ...i2vModels].find(m => m.id === modelId);
  return model?.inputs?.resolution ? RESOLUTIONS : [];
}
