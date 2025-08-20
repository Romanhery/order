import type { Metadata } from 'next';
import './globals.css';
import CartProviderWrapper from './CartProviderWrapper';
import dynamic from 'next/dynamic';
import ClientLayout from './ClientLayout'

// TopNav is client, import dynamically to keep layout as server

export const metadata: Metadata = {
  title: 'Food Order',
  description: 'Demo ordering app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProviderWrapper>
          <main className="max-w-4xl mx-auto p-4">{children}</main>
        </CartProviderWrapper>
      </body>
    </html>
  );
}
