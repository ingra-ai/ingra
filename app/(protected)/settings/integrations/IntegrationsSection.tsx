'use server';
import type { FC } from 'react';
import { AuthSessionResponse } from "@data/auth/session/types";
import { OAuthToken } from '@prisma/client';
import db from '@lib/db';
import OAuthList from '@protected/settings/integrations/OAuthList';

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
