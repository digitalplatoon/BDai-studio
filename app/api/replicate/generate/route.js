import { NextResponse } from 'next/server';

// Handle Replicate API requests
export async function POST(request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { message: 'API key is required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { model_url, prompt, image_url, video_url, audio_url, duration, aspect_ratio, resolution, negative_prompt } = body;

    if (!model_url) {
      return NextResponse.json(
        { message: 'Model URL/ID is required' },
        { status: 400 }
      );
    }

    // Handle both model URLs (e.g., https://replicate.com/user/model) and version IDs
    let modelIdentifier = model_url;
    
    // If it's a web URL, convert to API format (user/model-name)
    if (model_url.includes('replicate.com/')) {
      try {
        const url = new URL(model_url);
        modelIdentifier = url.pathname.replace(/^\/?/, '').replace(/\/$/, '');
      } catch (e) {
        // Use as-is if URL parsing fails
      }
    }

    // Call Replicate API
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelIdentifier,
        input: {
          ...(prompt && { prompt }),
          ...(image_url && { image: image_url }),
          ...(video_url && { video: video_url }),
          ...(audio_url && { audio: audio_url }),
          ...(duration && { duration }),
          ...(aspect_ratio && { aspect_ratio }),
          ...(resolution && { resolution }),
          ...(negative_prompt && { negative_prompt }),
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.json();
      console.error('[Replicate API Error]', error);
      
      if (replicateResponse.status === 401) {
        return NextResponse.json(
          { message: 'Invalid API key for Replicate' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { message: error.detail || error.message || 'Generation failed' },
        { status: replicateResponse.status }
      );
    }

    const prediction = await replicateResponse.json();

    // Poll for completion (with timeout)
    let completed = false;
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 120; // 4 minutes with 2-second intervals

    while (!completed && attempts < maxAttempts) {
      if (result.status === 'succeeded') {
        completed = true;
        return NextResponse.json({
          url: result.output || result.output?.[0],
          status: 'completed',
        });
      }

      if (result.status === 'failed') {
        return NextResponse.json(
          { message: result.error || 'Generation failed' },
          { status: 400 }
        );
      }

      if (result.status === 'canceled') {
        return NextResponse.json(
          { message: 'Generation was canceled' },
          { status: 400 }
        );
      }

      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      if (pollResponse.ok) {
        result = await pollResponse.json();
      }

      attempts++;
    }

    if (!completed) {
      return NextResponse.json(
        { message: 'Generation timeout: took too long' },
        { status: 504 }
      );
    }

    return NextResponse.json({
      url: result.output || result.output?.[0],
      status: 'completed',
    });
  } catch (error) {
    console.error('[Replicate Route Error]', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
