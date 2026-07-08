'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReelsShowcase } from 'studio';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-bangla-dark via-black to-bangla-dark">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bangla-green to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold text-white">BDai Studio</h1>
          </div>
          <Link
            href="/studio"
            className="px-6 py-2 rounded-lg bg-bangla-green hover:bg-bangla-green/90 text-white font-medium transition-all hover:shadow-glow"
          >
            Create Now
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold text-white text-balance">
                  Generate AI Content
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-bangla-green via-teal-400 to-blue-500">
                    in Bangla
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-md leading-relaxed">
                  Create stunning images, videos, and animations powered by cutting-edge AI models. Completely free and open-source.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/studio"
                  className="px-8 py-4 rounded-lg bg-bangla-green hover:bg-bangla-green/90 text-white font-semibold transition-all hover:shadow-glow text-center"
                >
                  Start Creating
                </Link>
                <a
                  href="https://github.com/digitalplatoon/BDai-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-lg border border-white/20 hover:border-bangla-green/50 text-white font-semibold transition-all text-center"
                >
                  View on GitHub
                </a>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                {[
                  { icon: '🎨', label: 'Image Generation', desc: 'T2I & I2I' },
                  { icon: '🎬', label: 'Video Creation', desc: 'T2V & I2V' },
                  { icon: '👄', label: 'Lip Sync', desc: 'Audio Sync' },
                  { icon: '🎞️', label: 'Cinema', desc: 'Pro Videos' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <p className="font-semibold text-white text-sm">{feature.label}</p>
                    <p className="text-white/50 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 lg:h-[28rem] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-bangla-green/20 border border-bangla-green/40">
                    <svg
                      className="w-12 h-12 text-bangla-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">Your creations will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-bangla-green/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Reels Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="space-y-4">
            <h3 className="text-3xl lg:text-4xl font-bold text-white">Recent Creations</h3>
            <p className="text-white/60 max-w-2xl">
              Explore the latest images and videos created by our community using BDai Studio.
            </p>
          </div>

          {/* Reels Grid */}
          <div className="min-h-96">
            <ReelsShowcase />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-2xl border border-bangla-green/30 bg-gradient-to-r from-bangla-green/5 to-teal-500/5 overflow-hidden p-12 lg:p-16">
          <div className="relative z-10 text-center space-y-6">
            <h3 className="text-3xl lg:text-4xl font-bold text-white text-balance">
              Ready to create something amazing?
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Use our advanced tools to generate stunning AI content. Start for free today.
            </p>
            <div>
              <Link
                href="/studio"
                className="inline-block px-8 py-4 rounded-lg bg-bangla-green hover:bg-bangla-green/90 text-white font-semibold transition-all hover:shadow-glow"
              >
                Launch Studio
              </Link>
            </div>
          </div>

          {/* Gradient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-bangla-green/10 rounded-full blur-3xl -z-0" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">BDai Studio</h4>
              <p className="text-white/60 text-sm">Free, open-source AI content generation</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="/studio" className="hover:text-bangla-green transition">Image Generation</a></li>
                <li><a href="/studio" className="hover:text-bangla-green transition">Video Creation</a></li>
                <li><a href="/studio" className="hover:text-bangla-green transition">Lip Sync</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="https://github.com/digitalplatoon/BDai-studio" target="_blank" rel="noopener noreferrer" className="hover:text-bangla-green transition">GitHub</a></li>
                <li><a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="hover:text-bangla-green transition">Discord</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-bangla-green transition">Privacy</a></li>
                <li><a href="#" className="hover:text-bangla-green transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
            <p>© 2024 BDai Studio. Open-source AI for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
