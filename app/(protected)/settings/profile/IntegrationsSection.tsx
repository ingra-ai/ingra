'use server';
import { AuthSessionResponse } from "@app/auth/session/types";
import { OAuthToken } from '@prisma/client';
import db from '@lib/db';
import { GoogleIntegrationButton } from '@components/GoogleIntegrationButton';
import OAuthList from '@protected/settings/profile/OAuthList';

type IntegrationsSectionProps = {
  authSession: AuthSessionResponse;
};

export const IntegrationsSection: React.FC<IntegrationsSectionProps> = async (props) => {
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
      {
        oAuthTokens.length ? (
          <OAuthList oAuthTokens={oAuthTokens} />
        ) : (
          <GoogleIntegrationButton type="redirect" text="Connect with your Google Account" />
        )
      }
    </section>
  );
};
