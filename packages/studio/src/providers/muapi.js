// packages/studio/src/muapi.js - Muapi.ai API Client
const API_BASE = 'https://api.muapi.ai';

// Helper for API calls
async function apiCall(endpoint, apiKey, body = null, method = 'POST') {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Poll for result
async function pollResult(apiKey, requestId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await apiCall(
      `/api/v1/predictions/${requestId}/result`,
      apiKey,
      null,
      'GET'
    );

    if (result.status === 'completed' && result.url) {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed');
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Timeout: Generation took too long');
}

// Upload file to Muapi
export async function uploadFile(apiKey, file) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required');
  }

  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  // Check file size (limit to 100MB)
  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    // Use local API route to avoid CORS issues
    const response = await fetch(`/api/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Upload failed (${response.status})`;
      
      if (response.status === 401) {
        errorMsg = 'Invalid or expired API key';
      } else if (response.status === 403) {
        errorMsg = 'API key does not have permission to upload';
      } else if (response.status === 429) {
        errorMsg = 'Rate limit exceeded. Please wait before retrying.';
      } else if (response.status === 413) {
        errorMsg = 'File is too large';
      }
      
      try {
        const error = await response.json();
        if (error.message) errorMsg = error.message;
      } catch (e) {
        // Fallback to status-based message
      }
      
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No URL returned from server');
    }

    return data.url;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach upload server');
    }
    throw err;
  }
}

// Generate Image (Text to Image)
export async function generateImage(apiKey, params) {
  const { model, prompt, aspect_ratio, resolution, negative_prompt } = params;

  const body = {
    model,
    prompt,
    aspect_ratio,
  };

  if (resolution) body.resolution = resolution;
  if (negative_prompt) body.negative_prompt = negative_prompt;

  const response = await apiCall('/api/v1/generate-image', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}

// Generate Image to Image
export async function generateI2I(apiKey, params) {
  const { model, image_url, images_list, prompt, aspect_ratio, quality } = params;

  const body = {
    model,
    image_url,
    aspect_ratio,
  };

  if (images_list) body.images_list = images_list;
  if (prompt) body.prompt = prompt;
  if (quality) body.quality = quality;

  const response = await apiCall('/api/v1/generate-image', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}

// Generate Video (Text to Video)
export async function generateVideo(apiKey, params) {
  const { model, prompt, aspect_ratio, duration, resolution } = params;

  const body = {
    model,
    prompt,
    aspect_ratio,
  };

  if (duration) body.duration = duration;
  if (resolution) body.resolution = resolution;

  const response = await apiCall('/api/v1/generate-video', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}

// Generate Image to Video
export async function generateI2V(apiKey, params) {
  const { model, image_url, prompt, aspect_ratio, duration, resolution } = params;

  const body = {
    model,
    image_url,
    aspect_ratio,
  };

  if (prompt) body.prompt = prompt;
  if (duration) body.duration = duration;
  if (resolution) body.resolution = resolution;

  const response = await apiCall('/api/v1/generate-video', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}

// Lip Sync Generation
export async function generateLipSync(apiKey, params) {
  const { model, image_url, video_url, audio_url, resolution, prompt } = params;

  const body = {
    model,
    audio_url,
  };

  if (image_url) body.image_url = image_url;
  if (video_url) body.video_url = video_url;
  if (resolution) body.resolution = resolution;
  if (prompt) body.prompt = prompt;

  const response = await apiCall('/api/v1/lipsync', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}

// Extend Video
export async function extendVideo(apiKey, params) {
  const { model, video_url, prompt, duration } = params;

  const body = {
    model,
    video_url,
    duration,
  };

  if (prompt) body.prompt = prompt;

  const response = await apiCall('/api/v1/extend-video', apiKey, body);

  if (response.request_id) {
    return pollResult(apiKey, response.request_id);
  }

  return response;
}
