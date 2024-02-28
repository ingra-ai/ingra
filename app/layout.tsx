import { type PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME } from "@lib/constants";
import { cn } from "@lib/utils";
import "@css/globals.scss";
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

type RootLayoutProps = {
  noop?: any;
}

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

const RootLayout: React.FC<PropsWithChildren<RootLayoutProps>> = async ( props ) => {
  const { children } = props;
  const bodyClasses = cn( 'dark', fontSans.className );

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
        <body className={ bodyClasses }>
          { children }
          <Toaster />
        </body>
    </html>
  );
}

export default RootLayout;