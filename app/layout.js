import './globals.css';

export const metadata = {
  title: 'Bangla AI Studio - Open Generative AI',
  description: 'Bangla AI Image & Video Generation Studio - Uncensored, Open Source',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
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
