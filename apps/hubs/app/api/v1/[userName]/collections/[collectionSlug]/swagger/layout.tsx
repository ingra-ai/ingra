import { APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { PropsWithChildren } from 'react';

import type { FC } from 'react';

export async function generateMetadata(props: { params: Promise<{ userName: string; collectionSlug: string }> }) {
  const params = await props.params;
  const { userName, collectionSlug } = params;
  return {
    title: [`${userName}'s ${collectionSlug} Collection | Swagger`, APP_NAME].join(' | '),
  };
}

const SwaggerLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const layoutClasses = cn('swagger-docs-layout');

  return <div className={layoutClasses}>{children}</div>;
};

export default SwaggerLayout;
