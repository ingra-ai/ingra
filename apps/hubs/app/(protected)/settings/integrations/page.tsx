import { getAuthSession } from "@repo/shared/data/auth/session";
import { notFound } from "next/navigation";
import { IntegrationsSection } from "./IntegrationsSection";
import { APP_NAME } from "@repo/shared/lib/constants";
import type { Metadata } from "next";
import { GoogleIntegrationButton } from "@repo/components/GoogleIntegrationButton";

export const metadata: Metadata = {
  title: ["Integrations", APP_NAME].join(" | "),
};

/**
 * Profile Page
 * @see https://tailwindui.com/components/application-ui/forms/form-layouts
 */

export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-white">
            Integrations
          </h2>
          <p className="text-sm mt-2 leading-6 text-gray-400">
            Connect your account with trusted third-party applications such as
            Google to enhance your experience. Integration allows seamless
            access to additional features and services while ensuring your data
            is securely managed and protected.
          </p>

          <hr className="my-5" />
          <div className="space-y-5">
            <GoogleIntegrationButton
              type="redirect"
              text="Connect with your Google Account"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <IntegrationsSection authSession={authSession} />
        </div>
      </div>
    </div>
  );
}
