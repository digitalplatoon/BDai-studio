// Next.js API route for file uploads (proxies to Muapi to avoid CORS issues)

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse the incoming FormData
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create FormData for Muapi
    const muapiFormData = new FormData();
    muapiFormData.append('file', file);

    // Forward to Muapi
    const muapiResponse = await fetch('https://api.muapi.ai/api/v1/upload_file', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: muapiFormData,
    });

    if (!muapiResponse.ok) {
      let errorMsg = `Upload failed (${muapiResponse.status})`;
      
      if (muapiResponse.status === 401) {
        errorMsg = 'Invalid or expired API key';
      } else if (muapiResponse.status === 403) {
        errorMsg = 'API key does not have permission to upload';
      } else if (muapiResponse.status === 429) {
        errorMsg = 'Rate limit exceeded. Please wait before retrying.';
      } else if (muapiResponse.status === 413) {
        errorMsg = 'File is too large';
      }

      try {
        const error = await muapiResponse.json();
        if (error.message) errorMsg = error.message;
      } catch (e) {
        // Fallback to status-based message
      }

      return new Response(JSON.stringify({ error: errorMsg }), {
        status: muapiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await muapiResponse.json();

    if (!data.url) {
      return new Response(JSON.stringify({ error: 'No URL returned from server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
