import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'FreshMart – Fresh Groceries Delivered', template: '%s | FreshMart' },
  description: 'Order fresh groceries, fruits, vegetables, dairy, snacks and daily essentials online. Fast delivery to your doorstep.',
  keywords: ['groceries', 'fresh fruits', 'vegetables', 'online grocery', 'delivery', 'FreshMart'],
  openGraph: {
    type: 'website',
    siteName: 'FreshMart',
    title: 'FreshMart – Fresh Groceries Delivered',
    description: 'Order fresh groceries and daily essentials online.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #fff)',
              color: 'var(--toast-color, #111)',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
