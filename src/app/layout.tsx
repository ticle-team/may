import { ReactNode, Suspense } from 'react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import classNames from 'classnames';
import TRPCProvider from '@/app/_trpc/Provider';
import Layout from '@/app/_components/Layout';
import PageLoading from '@/app/_components/PageLoading';
import { RouterProvider } from '@/app/_hooks/router';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

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
          poppins.className,
          'flex flex-row justify-center h-full w-full',
        )}
      >
        <Suspense fallback={<PageLoading />}>
          <TRPCProvider>
            <RouterProvider>
              <Layout>{children}</Layout>
            </RouterProvider>
          </TRPCProvider>
        </Suspense>
      </body>
    </html>
  );
}
