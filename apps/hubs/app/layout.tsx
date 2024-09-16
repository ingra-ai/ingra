import { type PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME, HUBS_APP_URL } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { Toaster } from '@repo/components/ui/toaster';
import { HotjarAnalytics } from '@repo/components/analytics/HotjarAnalytics';
import { ThemeProvider } from '@repo/components/theme/theme-provider';
import '@css/globals.scss';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: APP_NAME,
  metadataBase: new URL(HUBS_APP_URL),
  description: APP_DESCRIPTION,
  robots: 'noindex, nofollow',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <HotjarAnalytics />
      </head>
      <body className={fontSans.className} data-testid="layout-body">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
