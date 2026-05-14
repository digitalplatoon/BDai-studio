# Replicate Default Provider & Live Reels Showcase

Complete implementation guide for the multi-provider system with Replicate as default and live reels gallery.

## What's Changed

### 1. Replicate as Default Provider

**File:** `packages/studio/src/providers.js`

The provider system now defaults to Replicate instead of Muapi.ai:

```javascript
let currentProvider = 'replicate'; // Was 'muapi'

// First load defaults to Replicate
if (!savedProvider) {
  localStorage.setItem('bangla_provider', 'replicate');
}
```

Users can still switch to Muapi.ai in Settings, but new users get Replicate with seedance-2.0 model by default.

**Replicate Model Configuration:**
- Default model: `https://replicate.com/bytedance/seedance-2.0`
- Supports: T2I, I2I, T2V, I2V, Lip Sync
- Stored in localStorage as `bangla_replicate_model_url`

### 2. Reels Management System

**File:** `packages/studio/src/reels.js`

Complete reel storage and management system with localStorage persistence:

```javascript
// Get all reels (sorted newest first)
const reels = getReels();

// Add a new reel after generation
addReel({
  type: 'image' | 'video',
  url: '...',
  prompt: 'user prompt',
  provider: 'replicate' | 'muapi',
  model: 'model-id',
});

// Subscribe to real-time updates
const unsubscribe = subscribeToReels((reels) => {
  // Update UI when reels change
});
```

**Features:**
- Stores max 50 recent reels (older ones auto-deleted)
- Subscriber pattern for real-time updates
- Timestamps and provider metadata
- Graceful error handling

### 3. ReelsShowcase Component

**File:** `packages/studio/src/components/ReelsShowcase.jsx`

Beautiful gallery display for generated content:

```jsx
import { ReelsShowcase } from 'studio';

export default function Home() {
  return <ReelsShowcase />;
}
```

**Features:**
- Grid layout with responsive columns
- Filter by content type (All/Images/Videos)
- Download button on hover
- Delete with confirmation
- Empty state with helpful message
- Real-time updates when new reels are added

### 4. Redesigned Home Page

**File:** `app/page.js`

New landing page with hero + reels showcase:

**Sections:**
1. **Navigation Header** - Logo, branding, "Create Now" button
2. **Hero Section** - Eye-catching headline, CTA buttons, feature grid
3. **Reels Gallery** - Live showcase of recent community creations
4. **CTA Section** - Call-to-action for starting creation
5. **Footer** - Links, branding, copyright

The page is now a proper landing page instead of a redirect to `/studio`.

### 5. Studio Auto-Save to Reels

All studio components now auto-save generated content:

**ImageStudio & CinemaStudio (images):**
```javascript
addReel({
  type: 'image',
  url: res.url,
  prompt: prompt.trim(),
  provider: getProvider(),
  model: selectedModelId,
});
```

**VideoStudio (videos):**
```javascript
addReel({
  type: 'video',
  url: res.url,
  prompt: prompt.trim(),
  provider: getProvider(),
  model: selectedModelId,
});
```

**LipSyncStudio (videos):**
```javascript
addReel({
  type: 'video',
  url: res.url,
  prompt: prompt.trim() || `Lip sync with ${selectedModelName}`,
  provider: getProvider(),
  model: selectedModelId,
});
```

Error handling ensures failed reel saves don't break generation.

## How It Works

### User Flow

1. **First Visit**
   - User sees new home page with hero + reels gallery
   - Reels gallery is empty initially
   - "Create Now" button takes user to `/studio`

2. **Creating Content**
   - User opens ImageStudio/VideoStudio/etc
   - Settings default to Replicate provider
   - After successful generation, reel is auto-saved
   - User can see their creation in home page gallery

3. **Viewing Reels**
   - Home page gallery updates in real-time
   - Each reel shows prompt, type, provider, timestamp
   - Users can download or delete reels
   - Filter by Images/Videos

4. **Switching Providers**
   - User can switch to Muapi.ai in Settings
   - Existing reels still show provider info
   - New generations use selected provider

### Data Flow

```
Generation Complete
        ↓
addReel({type, url, prompt, provider, model})
        ↓
localStorage['bangla_reels'] ← updated
        ↓
subscribeToReels() callbacks triggered
        ↓
ReelsShowcase UI updates
        ↓
Home page reflects new creation
```

## Translations

All new UI strings are translated to Bangla:

**Key Translations Added:**
- "No reels yet" → "এখনও কোনো রিল নেই"
- "All", "Images", "Videos" → "সব", "ছবি", "ভিডিও"
- "Recent Creations" → "সাম্প্রতিক সৃষ্টি"
- "Download", "Delete" → "ডাউনলোড", "মুছুন"
- Home page copy fully Bangla-translated

See `packages/studio/src/bangla.js` for complete list.

## Technical Implementation

### Provider System Architecture

```
providers.js (abstraction layer)
  ├─ getProvider() → current provider ID
  ├─ setProvider(id) → switch provider
  ├─ subscribeToProviderChanges() → observe changes
  └─ Delegates to:
      ├─ providers/muapi.js
      └─ providers/replicate.js
```

### Video Handling

Both providers return same output format for compatibility:

```javascript
{
  id: string,
  url: string, // Video URL (Muapi.ai or Replicate)
  status: 'processing' | 'success' | 'failed',
}
```

Replicate uses polling to wait for async job completion; Muapi.ai returns synchronously.

### Reels Storage

localStorage structure:

```javascript
localStorage['bangla_reels'] = [
  {
    id: 'reel_1234567890_abc123',
    type: 'image',
    url: 'https://...',
    prompt: 'A beautiful sunset',
    timestamp: 1715000000000,
    provider: 'replicate',
    model: 'nano-banana-pro',
  },
  // ... more reels
]
```

Max 50 reels; older ones auto-deleted when limit reached.

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage required (no fallback)
- Responsive design for mobile/tablet/desktop
- CSS Grid + Flexbox for layouts

## Performance Notes

- Reels gallery lazy-loads images/videos
- Max 50 reels in memory = ~50KB JSON
- Real-time updates via subscribers (no polling)
- No API calls for reel management (all localStorage)

## Future Enhancements

Possible additions:

1. **Cloud Sync** - Save reels to Supabase for persistence across devices
2. **Sharing** - Create shareable links for reels
3. **Favorites** - Star/heart favorite reels
4. **Search** - Full-text search on prompts
5. **Analytics** - Track popular prompts/models
6. **Pagination** - Load more reels in gallery

## Troubleshooting

**Reels not showing:**
- Check browser localStorage quota
- Clear cache and reload
- Verify generation actually completed (check console)

**Provider not switching:**
- Clear localStorage['bangla_provider']
- Refresh page
- Check API key is set for new provider

**Home page not loading:**
- Verify all studio components export correctly
- Check ReelsShowcase component renders
- Review console for errors

## API Endpoints

Replicate operations use these backend routes:

- `/api/replicate/generate` - Handle model generation
- `/api/replicate/upload` - Handle file uploads

Both routes proxy to Replicate API using x-api-key header.
