import type { FC } from 'react';
import { cn } from '@repo/shared/lib/utils';
import { PropsWithChildren } from 'react';
import { APP_NAME } from '@repo/shared/lib/constants';

export async function generateMetadata({ params }: { params: { userName: string; collectionSlug: string } }) {
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
