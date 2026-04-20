# 🇧🇩 Bangla AI Studio

**Bangla AI Studio** is a fully localized, open-source AI image and video generation platform built for Bengali users. It's a customized fork of Open Generative AI with Bangla (বাংলা) language support and Bangladesh-themed UI.

## ✨ Features

- 🎨 **Image Studio** - Generate images from text (50+ models) or edit existing images (55+ models)
- 🎬 **Video Studio** - Create videos from text (40+ models) or animate images (60+ models)
- 🎙️ **Lip Sync Studio** - Animate portraits or sync lips to audio (9 models)
- 🎥 **Cinema Studio** - Professional camera controls for cinematic shots
- 🌐 **Full Bangla Interface** - Complete Bengali language support
- 🎨 **Bangladesh Theme** - Green and red color scheme inspired by the Bangladesh flag

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Muapi.ai API key ([Get one here](https://muapi.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bangla-ai-studio.git
cd bangla-ai-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bangla-ai-studio)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔑 API Key Setup

1. Visit [Muapi.ai](https://muapi.ai) and create an account
2. Generate an API key from your dashboard
3. Enter the API key in the Bangla AI Studio settings

## 🛠️ Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Muapi.ai** - AI model API gateway (200+ models)
- **Noto Sans Bengali** - Bengali font

## 📁 Project Structure

```
bangla-ai-studio/
├── app/                    # Next.js app router
│   ├── layout.js          # Root layout
│   ├── page.js            # Redirect to studio
│   ├── studio/page.js     # Main studio page
│   └── globals.css        # Global styles
├── components/
│   └── StandaloneShell.js # Main app shell
├── packages/studio/
│   └── src/
│       ├── bangla.js      # Bangla translations
│       ├── muapi.js       # API client
│       ├── models.js      # Model definitions
│       └── components/    # Studio components
│           ├── ImageStudio.jsx
│           ├── VideoStudio.jsx
│           ├── LipSyncStudio.jsx
│           └── CinemaStudio.jsx
└── tailwind.config.js     # Theme configuration
```

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'bangla-green': '#006A4E',  // Change this
  'bangla-red': '#F42A41',    // Change this
}
```

### Adding Translations
Edit `packages/studio/src/bangla.js`:
```javascript
export const bn = {
  "Your Text": "আপনার টেক্সট",
  // Add more translations
};
```

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Credits

- Original project: [Open Generative AI](https://github.com/Anil-matcha/Open-Generative-AI) by Anil-matcha
- Powered by [Muapi.ai](https://muapi.ai)
- Built for the Bengali AI community

---

**Made with ❤️ for Bangladesh**
