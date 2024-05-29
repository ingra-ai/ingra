import { APP_LANDING_PAGE_URL, APP_LEGAL_COOKPOL_URL, APP_LEGAL_PRIVACY_POLICY_URL, APP_LEGAL_TOS_URL, APP_NAME } from '@lib/constants';
import Image from 'next/image';
import { MagicLoginForm } from './MagicLoginForm';
import { getAuthSession } from '@/app/auth/session';
import { redirect, RedirectType } from 'next/navigation';
import IntroductionScreen from './IntroductionScreen';
import { Code, Cpu, Cloud, Rocket, Shield, Users } from 'lucide-react';
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
            <Image className="mx-auto h-12 w-12 xl:w-20 xl:h-20" src="/static/brand/bakabit-white-logo-only.svg" alt={ APP_NAME } width={96} height={96} />
          </div>
          <h1 className="text-xl font-bold my-4">Welcome to { APP_NAME }</h1>
          <MagicLoginForm />
          <div className="flex flex-col items-center space-y-4">
            <div className="text-xs text-center max-w-screen-md leading-6 text-muted-foreground">
              <a href={ APP_LEGAL_PRIVACY_POLICY_URL } className="underline">Privacy Policy</a> | <a href={ APP_LEGAL_TOS_URL } className="underline">Terms of Service</a> | <a href={ APP_LEGAL_COOKPOL_URL } className="underline">Cookie Policy</a>
            </div>
            <p className="text-xs text-center max-w-screen-md leading-6 text-muted-foreground">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center space-y-8 p-8 xl:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-8">
          <FeatureCard
            icon={<Code className="w-8 h-8 text-blue-500" />}
            title="Function Marketplace"
            description="Subscribe to a variety of pre-built functions or create your own to suit your needs."
          />
          <FeatureCard
            icon={<Cpu className="w-8 h-8 text-green-500" />}
            title="Personalized API Endpoints"
            description="Each user has their own API endpoint to call and manage their functions."
          />
          <FeatureCard
            icon={<Cloud className="w-8 h-8 text-yellow-500" />}
            title="Self-Generating Functions"
            description="Leverage built-in functions to create new automations, enhanced by AI."
          />
          <FeatureCard
            icon={<Rocket className="w-8 h-8 text-red-500" />}
            title="Customizable & Scalable"
            description="Fork and customize functions to your needs, with the ability to scale effortlessly."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-purple-500" />}
            title="Enhanced Security"
            description="Experience top-tier security protocols ensuring your data and automations are safe and private."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-teal-500" />}
            title="Community Support"
            description="Join a growing community of users and developers for support, ideas, and collaboration."
          />
        </div>
        <p className="text-xs text-center max-w-screen-md leading-6 text-muted-foreground">
          { APP_NAME } is attempting to be next-generation platform for curating and integrating custom automations. Imagine that you can have your own AI assistant, Let&apos;s funcs the world.
        </p>
      </div>
    </div>
  );
}
