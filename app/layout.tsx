export const metadata = { title: 'YouDo Admin Demo', description: 'Admin panel prototype' };
import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
