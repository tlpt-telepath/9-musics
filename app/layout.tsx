import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '#MyBest9Songs',
  description: 'iTunes Search APIで9曲を選んで3x3グリッドを作る静的Webアプリ'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
