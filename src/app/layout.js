import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'SIKEJA - Sistem Informasi Keuangan Santri',
  description: 'Sistem Informasi Keuangan Santri Pondok Pesantren - Pencatatan Syahriah, Uang Makan, Tagihan Bulanan & Laporan Keuangan',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#0b2239',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${plusJakartaSans.className} antialiased text-slate-100 bg-[#0b2239]`}>
        {children}
      </body>
    </html>
  );
}
