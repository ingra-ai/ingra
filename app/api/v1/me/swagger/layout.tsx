import type { FC } from 'react';
import { cn } from '@lib/utils';
import { PropsWithChildren } from 'react';

const SwaggerLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const layoutClasses = cn('swagger-docs-layout');

  return <div className={layoutClasses}>{children}</div>;
};

export default SwaggerLayout;
