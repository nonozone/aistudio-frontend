
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meow Squared | 喵的二次方 - Artistic Souls Materialized',
  description: 'Bespoke AI-crafted masterpieces for your feline friends. Transforming everyday captures into museum-grade physical textures.',
  openGraph: {
    title: 'Meow Squared - Pet Portraits Redefined',
    description: 'Transform your pet into art.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&family=Noto+Sans+SC:wght@300;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
