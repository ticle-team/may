import './globals.css';
import { ReactNode, Suspense } from 'react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import classNames from 'classnames';
import dynamic from 'next/dynamic';

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
  const Layout = dynamic(() => import('@/app/_components/Layout'), {
    ssr: false,
  });

  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={classNames(
          poppins.className,
          'flex flex-row justify-center h-full w-full',
        )}
      >
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
