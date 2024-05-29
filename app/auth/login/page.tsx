import { APP_LANDING_PAGE_URL, APP_LEGAL_COOKPOL_URL, APP_LEGAL_PRIVACY_POLICY_URL, APP_LEGAL_TOS_URL, APP_NAME } from '@lib/constants';
import Image from 'next/image';
import { MagicLoginForm } from './MagicLoginForm';
import { getAuthSession } from '@/app/auth/session';
import { redirect, RedirectType } from 'next/navigation';
import { Code, Cpu, Cloud, Rocket, Link, Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export default async function AuthLogin() {
  const authSession = await getAuthSession();

  if (authSession) {
    redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-svh" data-testid='login-page'>
      <div className="col-span-1 lg:col-span-6">
        <div className={'flex flex-col items-center justify-center lg:min-h-screen lg:bg-gray-900 space-y-8 p-8 xl:p-12'}>
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Image className="mx-auto h-12 w-12 xl:w-20 xl:h-20" src="/static/brand/bakabit-white-logo-only.svg" alt={APP_NAME} width={96} height={96} />
          </div>
          <h1 className="text-xl font-bold my-4">Welcome to {APP_NAME}</h1>
          <MagicLoginForm />
          <div className="flex flex-col items-center space-y-4">
            <div className="text-xs text-center max-w-screen-md leading-6 text-muted-foreground">
              <a href={APP_LEGAL_PRIVACY_POLICY_URL} className="underline">Privacy Policy</a> | <a href={APP_LEGAL_TOS_URL} className="underline">Terms of Service</a> | <a href={APP_LEGAL_COOKPOL_URL} className="underline">Cookie Policy</a>
            </div>
            <p className="text-xs text-center max-w-screen-md leading-6 text-muted-foreground">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center space-y-8 p-8 xl:p-12">
        <p className="text-xs text-center max-w-[440px] leading-5 text-muted-foreground lg:order-2 mt-0 lg:mt-12">
          {APP_NAME} is next-generation platform for curating and integrating custom automations. Imagine that you can have your own AI assistant in your pocket ready to do it for you. Let&apos;s automate stuffs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8 lg:order-1">
          <FeatureCard
            icon={<Code className="w-8 h-8 text-blue-500" />}
            title="Automation Marketplace"
            description="Subscribe to a variety of pre-built functions for automation or create your own to suit your needs."
          />
          <FeatureCard
            icon={<Cpu className="w-8 h-8 text-green-500" />}
            title="Personalized API Endpoints"
            description="Each user has their own API endpoint to call and manage their functions."
          />
          <FeatureCard
            icon={<Cloud className="w-8 h-8 text-yellow-500" />}
            title="Self-Generating Functions"
            description="Leverage functions to create new automations, or using built-in functions to create even more functions or to improve itself, enhanced by AI."
          />
          <FeatureCard
            icon={<Rocket className="w-8 h-8 text-red-500" />}
            title="Customizable & Scalable"
            description="Fork and customize functions to your needs, with the ability to scale effortlessly."
          />
          <FeatureCard
            icon={<Link className="w-8 h-8 text-orange-500" />}
            title="Integration Flexibility"
            description="Easily connect with a wide range of third-party services and APIs by utilizing environment variables, webhooks, or custom integrations."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-teal-500" />}
            title="Community Support"
            description="Join a growing community of users and developers for support, ideas, and collaboration."
          />
        </div>
      </div>
    </div>
  );
}
