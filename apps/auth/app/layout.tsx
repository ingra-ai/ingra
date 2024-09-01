import { type PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import '@css/globals.scss';
import { Toaster } from '@repo/components/ui/toaster';
import { HotjarAnalytics } from '@repo/components/analytics/HotjarAnalytics';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `Secure your access to ${APP_NAME}, the open-source personalized AI assistant platform. Experience seamless sign-in with advanced authentication features designed for developers building custom LLM functions and tool integrations.`,
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const bodyClasses = cn('dark', fontSans.className);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="robots" content="noindex, nofollow" />
        <HotjarAnalytics />
      </head>
      <body className={bodyClasses} data-testid="layout-body">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
