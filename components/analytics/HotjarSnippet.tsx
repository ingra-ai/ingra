"use client"
import { FC } from "react";
import { HOTJAR_ID, IS_PROD } from "@lib/constants";
import Script from "next/script";

type HotjarSnippetProps = {};

export const HotjarSnippet: FC<HotjarSnippetProps> = (props) => {
  if ( HOTJAR_ID || !IS_PROD ) return null;

  return (
    <div data-testid="hotjar-snippet">
      <Script id="hotjar-snippet">
        {`
          (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
    </div>
  );
};