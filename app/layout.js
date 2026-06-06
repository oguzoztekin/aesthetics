import './globals.css';

export const metadata = {
  title: 'Aesthetic AI',
  description: 'AI-powered aesthetic visualization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-neutral-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
