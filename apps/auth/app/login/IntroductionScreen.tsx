import { APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { Code, Cpu, Cloud, Rocket, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { FeatureCard } from './FeatureCard';

type IntroductionScreenProps = {
  className?: string;
};

const IntroductionScreen: React.FC<IntroductionScreenProps> = (props) => {
  const { className } = props;
  const classes = cn('flex flex-col items-center justify-center min-h-screen bg-gray-900 space-y-8 p-8 xl:p-12', className);
  return (
    <div className={classes}>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image className="mx-auto h-12 w-12 xl:w-20 xl:h-20" src="/static/brand/ingra.svg" alt={APP_NAME} width={96} height={96} />
      </div>
      <h1 className="text-xl font-bold my-4">Welcome to {APP_NAME}</h1>
      <p className="text-center max-w-screen-md leading-6 text-base">
        Your next-generation platform for creating and integrating custom automations. Imagine a world where you can have your own AI assistant, helping you automate and streamline your tasks effortlessly.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
        <FeatureCard icon={<Code className="w-8 h-8 text-blue-500" />} title="Function Marketplace" description="Subscribe to a variety of pre-built functions or create your own to suit your needs." />
        <FeatureCard icon={<Cpu className="w-8 h-8 text-green-500" />} title="Personalized API Endpoints" description="Each user has their own API endpoint to call and manage their functions." />
        <FeatureCard icon={<Cloud className="w-8 h-8 text-yellow-500" />} title="Self-Generating Functions" description="Leverage built-in functions to create new automations, enhanced by AI." />
        <FeatureCard icon={<Rocket className="w-8 h-8 text-red-500" />} title="Customizable & Scalable" description="Fork and customize functions to your needs, with the ability to scale effortlessly." />
        <FeatureCard icon={<Shield className="w-8 h-8 text-purple-500" />} title="Enhanced Security" description="Experience top-tier security protocols ensuring your data and automations are safe and private." />
        <FeatureCard icon={<Users className="w-8 h-8 text-teal-500" />} title="Community Support" description="Join a growing community of users and developers for support, ideas, and collaboration." />
      </div>
    </div>
  );
};

export default IntroductionScreen;
