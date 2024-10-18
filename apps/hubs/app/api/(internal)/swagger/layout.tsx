import { APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { PropsWithChildren } from 'react';

import type { Metadata } from 'next';
import type { FC } from 'react';


export const metadata: Metadata = {
  title: ['Swagger', APP_NAME].join(' | '),
};

const SwaggerLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const layoutClasses = cn('swagger-docs-layout');

  return <div className={layoutClasses}>{children}</div>;
};

export default SwaggerLayout;
