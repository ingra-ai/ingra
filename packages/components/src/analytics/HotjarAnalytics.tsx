'use client';
import { FC } from 'react';
import { HOTJAR_ID, IS_PROD } from '@repo/shared/lib/constants';
import Script from 'next/script';

type HotjarAnalyticsProps = {};

export const HotjarAnalytics: FC<HotjarAnalyticsProps> = (props) => {
  if (!HOTJAR_ID || !IS_PROD) return null;

  return (
    <Script
      id="hotjar-analytics"
      strategy="afterInteractive"
      data-testid="hotjar-analytics"
      dangerouslySetInnerHTML={{
        __html: `
        (function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `,
      }}
    />
  );
};
