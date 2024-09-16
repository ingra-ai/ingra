import type { Metadata } from 'next';
import { ThemeProvider } from '@repo/components/theme/theme-provider';
import { Navbar } from '@repo/components/navs/navbar';
import { DOCS_APP_URL, APP_NAME, HUBS_APP_URL } from '@repo/shared/lib/constants';
import { Inter as FontSans } from 'next/font/google';
import { DOCS_PAGE_ROUTES } from '@/lib/routes-config';
import DocsMenu from '@/components/docs-menu';
import Search from '@/components/search';
import './globals.scss';

export const metadata: Metadata = {
  title: `Docs | ${APP_NAME}`,
  metadataBase: new URL(DOCS_APP_URL),
  description: `Welcome to ${APP_NAME} documentation.`,
  robots: 'index, follow',
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const NAVLINKS = [
  {
    title: 'Documentation',
    href: `/docs${DOCS_PAGE_ROUTES[0].href}`,
  },
  {
    title: 'Blog',
    href: `/blog`,
  },
  {
    title: 'Hubs',
    href: HUBS_APP_URL + '/marketplace',
    external: true,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar 
            navlinks={ NAVLINKS }
            sheetChildren={ <DocsMenu /> }
          >
            <Search />
          </Navbar>
          <main className="sm:container mx-auto w-[88vw] h-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
