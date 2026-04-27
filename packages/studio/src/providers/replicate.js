// packages/studio/src/providers/replicate.js - Replicate API Client
// Supports running Replicate models for image and video generation

// Upload file to Replicate (uses local API route)
export async function uploadFile(apiKey, file) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required');
  }

  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 100MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`/api/replicate/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Upload failed (${response.status})`;
      
      if (response.status === 401) {
        errorMsg = 'Invalid or expired API key';
      } else if (response.status === 429) {
        errorMsg = 'Rate limit exceeded. Please wait before retrying.';
      }
      
      try {
        const error = await response.json();
        if (error.message) errorMsg = error.message;
      } catch (e) {
        // Use status-based message
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

// Generate Image using Replicate model
export async function generateImage(apiKey, params) {
  const { modelUrl, prompt, aspect_ratio, resolution, negative_prompt } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    prompt,
  };

  if (aspect_ratio) body.aspect_ratio = aspect_ratio;
  if (resolution) body.resolution = resolution;
  if (negative_prompt) body.negative_prompt = negative_prompt;

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}

// Generate Image to Image using Replicate
export async function generateI2I(apiKey, params) {
  const { modelUrl, image_url, prompt, aspect_ratio } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    image_url,
  };

  if (prompt) body.prompt = prompt;
  if (aspect_ratio) body.aspect_ratio = aspect_ratio;

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}

// Generate Video using Replicate
export async function generateVideo(apiKey, params) {
  const { modelUrl, prompt, duration } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    prompt,
  };

  if (duration) body.duration = duration;

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}

// Generate Image to Video using Replicate
export async function generateI2V(apiKey, params) {
  const { modelUrl, image_url, prompt, duration } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    image_url,
  };

  if (prompt) body.prompt = prompt;
  if (duration) body.duration = duration;

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}

// Lip Sync with Replicate (if model supports it)
export async function generateLipSync(apiKey, params) {
  const { modelUrl, image_url, audio_url } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    image_url,
    audio_url,
  };

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}

// Extend Video with Replicate
export async function extendVideo(apiKey, params) {
  const { modelUrl, video_url, prompt, duration } = params;

  if (!modelUrl) {
    throw new Error('Model URL is required for Replicate provider');
  }

  const body = {
    model_url: modelUrl,
    video_url,
  };

  if (prompt) body.prompt = prompt;
  if (duration) body.duration = duration;

  try {
    const response = await fetch('/api/replicate/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-provider': 'replicate',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Generation failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error('Network error: Unable to reach Replicate API');
    }
    throw err;
  }
}
