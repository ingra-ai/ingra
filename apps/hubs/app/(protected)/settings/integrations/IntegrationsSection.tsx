'use server';
import db from '@repo/db/client';
import { OAuthToken } from '@repo/db/prisma';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

import OAuthList from '@protected/settings/integrations/OAuthList';

import type { FC } from 'react';

type IntegrationsSectionProps = {
  authSession: AuthSessionResponse;
};

export const IntegrationsSection: FC<IntegrationsSectionProps> = async (props) => {
  const { authSession } = props;

  const oAuthTokens: OAuthToken[] = authSession
    ? await db.oAuthToken.findMany({
        where: {
          userId: authSession.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : [];

  return (
    <section className="block" data-testid="integrations-section">
      <OAuthList oAuthTokens={oAuthTokens} />
    </section>
  );
};
