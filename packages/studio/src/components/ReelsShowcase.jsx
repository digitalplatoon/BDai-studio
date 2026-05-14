import React, { useState, useEffect } from 'react';
import { t } from '../bangla';
import { subscribeToReels, formatReelTime, removeReel } from '../reels';

export default function ReelsShowcase() {
  const [reels, setReels] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video'

  useEffect(() => {
    const unsubscribe = subscribeToReels((newReels) => {
      setReels(newReels);
    });
    return unsubscribe;
  }, []);

  const filteredReels = filter === 'all' ? reels : reels.filter(r => r.type === filter);

  if (reels.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16m0 0H3m4 0h10m0 0l-4-4m4 4l4-4" />
        </svg>
        <h3 className="text-white/60 text-lg font-medium mb-2">{t('No reels yet')}</h3>
        <p className="text-white/40 text-sm">{t('Generate content in the studios to see your creations here')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['all', 'image', 'video'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-bangla-green text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {t(tab === 'all' ? 'All' : tab === 'image' ? 'Images' : 'Videos')}
          </button>
        ))}
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  );
}

function ReelCard({ reel }) {
  const [isHovering, setIsHovering] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(t('Delete this reel?'))) {
      removeReel(reel.id);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = reel.url;
    a.download = `reel_${reel.id}.${reel.type === 'image' ? 'jpg' : 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-bangla-green/50 transition-all hover:shadow-glow cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-black overflow-hidden">
        {reel.type === 'image' ? (
          <img src={reel.url} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <video src={reel.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
              <svg className="w-12 h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </>
        )}

        {/* Overlay on Hover */}
        <div
          className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 transition-all ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-bangla-green hover:bg-bangla-green/80 text-white transition-all"
            title={t('Download')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-all"
            title={t('Delete')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-bangla-green/80 text-white text-xs font-semibold uppercase">
          {reel.type === 'image' ? '🖼️' : '🎬'} {reel.type}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 space-y-2">
        <p className="text-white/80 text-sm font-medium line-clamp-2 break-words">{reel.prompt}</p>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{reel.provider}</span>
          <span>{formatReelTime(reel.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
