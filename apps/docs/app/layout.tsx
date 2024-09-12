import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { DOCS_APP_URL, APP_NAME } from '@repo/shared/lib/constants';
import './globals.scss';

export const metadata: Metadata = {
  title: `Docs | ${APP_NAME}`,
  metadataBase: new URL(DOCS_APP_URL),
  description: `Welcome to ${APP_NAME} documentation.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-regular`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="sm:container mx-auto w-[88vw] h-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
