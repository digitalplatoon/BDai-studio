# Multi-Provider API System

BDai Studio now supports multiple AI API providers, allowing you to switch between different services as needed. This provides flexibility and redundancy if your primary provider is down or rate-limited.

## Supported Providers

### 1. Muapi.ai (Default)
- **URL**: https://muapi.ai
- **Features**: Image generation (T2I/I2I), Video generation (T2V/I2V), Lip Sync
- **Configuration**: API key only
- **Status**: Primary provider

### 2. Replicate (Backup/Alternative)
- **URL**: https://replicate.com
- **Models**: Any Replicate model (seedance-2.0, DALL-E 3, etc.)
- **Configuration**: API key + Model URL
- **Status**: Supported as backup

## Architecture

### Provider Abstraction Layer (`src/providers.js`)

The provider system uses an abstraction layer that delegates API calls to the active provider:

```javascript
import {
  getProvider,
  setProvider,
  getProviderConfig,
  updateProviderConfig,
  uploadFile,
  generateImage,
  generateI2I,
  generateVideo,
  generateI2V,
  generateLipSync,
  extendVideo,
} from 'studio';

// Switch provider
setProvider('replicate');

// Get current config
const config = getProviderConfig();
console.log(config.apiKey, config.modelUrl); // for Replicate
```

### Provider Modules

- **`src/providers/muapi.js`**: Muapi.ai API client
- **`src/providers/replicate.js`**: Replicate API client
- Each module exports the same function signatures for consistency

### Backend Routes

- **`/api/upload`**: Proxies file uploads to Muapi.ai
- **`/api/replicate/upload`**: Saves files locally for Replicate use
- **`/api/replicate/generate`**: Proxies generation requests to Replicate API

## Usage

### Switching Providers in UI

1. Click the **Settings** button (⚙) in the top right
2. Select your API Provider: **Muapi.ai** or **Replicate**
3. Enter your API key
4. If using Replicate, enter the Model URL (e.g., `https://replicate.com/bytedance/seedance-2.0`)
5. Click **Save**

### Programmatic Usage

```javascript
import { setProvider, updateProviderConfig } from 'studio';

// Switch to Replicate
setProvider('replicate');

// Configure credentials
updateProviderConfig('replicate', {
  apiKey: 'your-replicate-api-key',
  modelUrl: 'https://replicate.com/bytedance/seedance-2.0',
});

// All generation functions now use Replicate
```

### Subscribe to Provider Changes

```javascript
import { subscribeToProviderChanges } from 'studio';

const unsubscribe = subscribeToProviderChanges(() => {
  console.log('Provider changed, re-render UI');
});
```

## Configuration Storage

Provider configurations are stored in `localStorage`:

- `bangla_provider`: Current active provider ('muapi' or 'replicate')
- `bangla_muapi_key`: Muapi.ai API key
- `bangla_replicate_key`: Replicate API key
- `bangla_replicate_model_url`: Replicate model URL

Each provider's settings are stored independently, so switching is seamless.

## Example: Using seedance-2.0 on Replicate

1. Get your Replicate API key from https://replicate.com/api
2. In Settings, select "Replicate"
3. Enter API key
4. Enter Model URL: `https://replicate.com/bytedance/seedance-2.0`
5. Click Save
6. Use Image Studio normally—it will use seedance-2.0 instead of Muapi

## Error Handling

Each provider has custom error messages:

### Muapi.ai Errors
- 401: Invalid or expired API key
- 403: API key lacks upload permission
- 429: Rate limit exceeded
- 413: File too large

### Replicate Errors
- 401: Invalid Replicate API key
- Timeout: Model took too long to run
- Custom model errors propagate directly

## Adding New Providers

To add a new provider:

1. Create `src/providers/newprovider.js` with functions:
   - `uploadFile(apiKey, file)`
   - `generateImage(apiKey, params)`
   - `generateI2I(apiKey, params)`
   - `generateVideo(apiKey, params)`
   - `generateI2V(apiKey, params)`
   - `generateLipSync(apiKey, params)`
   - `extendVideo(apiKey, params)`

2. Update `src/providers.js`:
   - Add to `PROVIDERS` object
   - Add import statement
   - Update `getProviderModule()` function

3. Add backend routes as needed in `/api/[provider]/`

4. Add translations for new provider name

## Performance Notes

- Replicate models may be slower (30s-2m depending on model)
- Muapi.ai typically returns results in 5-30 seconds
- Both providers support async polling
- File uploads use local storage for Replicate (public/uploads/)

## Troubleshooting

**"Model URL cannot be empty"**
- Ensure you've entered a valid Replicate model URL when using Replicate provider

**"Invalid API key"**
- Verify your API key is correct for the selected provider
- Check provider account for key revocation/expiration

**Generation timeout**
- Some Replicate models are slow; increase timeout if needed
- Switch to faster model on same provider if available

**Uploads failing**
- Replicate uses local file storage; ensure server has write permission to `/public/uploads/`
- Muapi.ai uploads go through `/api/upload` proxy
