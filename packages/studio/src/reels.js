// packages/studio/src/reels.js - Reels Management System
// Stores and manages generated images/videos with metadata (prompts, timestamps)

const REELS_STORAGE_KEY = 'bangla_reels';
const MAX_REELS = 50; // Store max 50 recent reels

/**
 * Reel Object Structure
 * @typedef {Object} Reel
 * @property {string} id - Unique identifier
 * @property {'image' | 'video'} type - Type of content
 * @property {string} url - Image or video URL
 * @property {string} prompt - Original prompt used
 * @property {number} timestamp - When it was created (Date.now())
 * @property {'muapi' | 'replicate'} provider - Which provider generated it
 * @property {string} [model] - Model name or URL used
 */

/**
 * Get all stored reels (sorted by newest first)
 */
export function getReels() {
  try {
    const stored = localStorage.getItem(REELS_STORAGE_KEY);
    if (!stored) return [];
    const reels = JSON.parse(stored);
    return Array.isArray(reels) ? reels.sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch (err) {
    console.error('[Reels] Failed to parse stored reels:', err);
    return [];
  }
}

/**
 * Add a new reel to storage
 */
export function addReel(reel) {
  try {
    const reels = getReels();
    
    // Validate required fields
    if (!reel.url || !reel.prompt || !reel.type) {
      throw new Error('Reel must have url, prompt, and type');
    }
    
    // Create reel with metadata
    const newReel = {
      id: `reel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...reel,
    };
    
    // Add to front and maintain max length
    const updated = [newReel, ...reels].slice(0, MAX_REELS);
    localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updated));
    
    // Notify subscribers
    notifySubscribers(updated);
    
    return newReel;
  } catch (err) {
    console.error('[Reels] Failed to add reel:', err);
    throw err;
  }
}

/**
 * Remove a reel by ID
 */
export function removeReel(reelId) {
  try {
    const reels = getReels();
    const updated = reels.filter(r => r.id !== reelId);
    localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(updated));
    notifySubscribers(updated);
  } catch (err) {
    console.error('[Reels] Failed to remove reel:', err);
    throw err;
  }
}

/**
 * Clear all reels
 */
export function clearAllReels() {
  try {
    localStorage.removeItem(REELS_STORAGE_KEY);
    notifySubscribers([]);
  } catch (err) {
    console.error('[Reels] Failed to clear reels:', err);
    throw err;
  }
}

/**
 * Get reels of a specific type
 */
export function getReelsByType(type) {
  return getReels().filter(r => r.type === type);
}

/**
 * Format timestamp to readable format
 */
export function formatReelTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Subscriber pattern for real-time updates
const subscribers = [];

export function subscribeToReels(callback) {
  subscribers.push(callback);
  // Call immediately with current reels
  callback(getReels());
  // Return unsubscribe function
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

function notifySubscribers(reels) {
  subscribers.forEach(cb => {
    try {
      cb(reels);
    } catch (err) {
      console.error('[Reels] Subscriber error:', err);
    }
  });
}
