import './globals.css';

export const metadata = {
  title: 'Bangla AI Studio - Open Generative AI',
  description: 'Bangla AI Image & Video Generation Studio - Uncensored, Open Source',
  applicationName: 'Bangla AI Studio',
};

export const viewport = {
  themeColor: '#0a0f0d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className="bg-bangla-dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
