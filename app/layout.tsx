import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tactical Ghost',
  description: 'Converta jogadas de futebol descritas em texto ou voz em animações táticas interativas, com IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
