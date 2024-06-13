import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import classNames from 'classnames';
import TRPCProvider from '@/app/_trpc/Provider';
import Layout from '@/app/_components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Software developer AI Agent',
  description: 'Make your backend easier to build, deploy, manage, and scale.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={classNames(
          inter.className,
          'flex flex-row justify-center h-full w-full',
        )}
      >
        <TRPCProvider>
          <Layout>{children}</Layout>
        </TRPCProvider>
      </body>
    </html>
  );
}
