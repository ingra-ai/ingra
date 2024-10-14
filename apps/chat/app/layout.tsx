import { type PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { APP_DESCRIPTION, APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { Toaster } from '@repo/components/ui/toaster';
import { HotjarAnalytics } from '@repo/components/analytics/HotjarAnalytics';
import { ThemeProvider } from '@repo/components/theme/theme-provider';
import '@css/globals.scss';
import { getAuthSession } from '@repo/shared/data/auth/session';
import LayoutWithNav from '@/components/layouts/LayoutWithNav';

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

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <HotjarAnalytics />
      </head>
      <body className={bodyClasses} data-testid="layout-body">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LayoutWithNav authSession={authSession || undefined}>{children}</LayoutWithNav>;
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
