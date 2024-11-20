

import { HotjarAnalytics } from '@repo/components/analytics/HotjarAnalytics';
import { ThemeProvider } from '@repo/components/theme/theme-provider';
import { Toaster } from '@repo/components/ui/toaster';
import '@css/globals.scss';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL, APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import Head from 'next/head';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { LayoutWithNav } from '@/components/layouts/LayoutWithNav';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} Chat, unlimited function tool calling AI assistant.`,
  robots: 'noindex, nofollow',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const bodyClasses = cn(fontSans.className);
  const authSession = await getAuthSession();
  const headersList = await headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <HotjarAnalytics />
      </Head>
      <body className={bodyClasses} data-testid="layout-body">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LayoutWithNav authSession={authSession}>
            {children}
          </LayoutWithNav>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
