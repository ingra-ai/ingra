
import { HotjarAnalytics } from '@repo/components/analytics/HotjarAnalytics';
import { Toaster } from '@repo/components/ui/toaster';
import { APP_DESCRIPTION, APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import Head from 'next/head';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

import '@css/globals.scss';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `Secure your access to ${APP_NAME}, the open-source personalized AI assistant platform. Experience seamless sign-in with advanced authentication features designed for developers building custom LLM functions and tool integrations.`,
  robots: 'noindex, nofollow',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const bodyClasses = cn(fontSans.className);

  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <HotjarAnalytics />
      </Head>
      <body className={bodyClasses} data-testid="layout-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
