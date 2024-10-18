import Link from 'next/link';

import type { FC, ForwardRefExoticComponent, SVGProps } from 'react';

interface Stat {
  name: string;
  stat: string;
  href: string;
  linkText?: string;
}

interface StatCardProps {
  id: string;
  name: string;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, 'ref'>>;
  stats: Stat[];
}

export const StatCard: FC<StatCardProps> = (props) => {
  return (
    <div key={props.id} className="relative overflow-hidden rounded-lg bg-secondary text-secondary-foreground p-4 border border-gray-500 sm:px-6 sm:pt-6">
      <dt>
        <div className="absolute rounded-md bg-indigo-500 p-3">
          <props.icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium mb-2">{props.name}</p>
      </dt>
      <dd className="ml-16 flex space-x-8 pb-6 sm:pb-7">
        {props.stats.map((stat, index) => (
          <div key={index} className="flex-1">
            <p className="text-2xl font-semibold">{stat.stat}</p>
            <p className="text-sm font-medium">{stat.name}</p>
            <div className="mt-2">
              <Link href={stat.href} prefetch={true} className="font-medium text-indigo-500 hover:text-indigo-400 text-sm">
                {stat.linkText || 'View all'} <span className="sr-only">{stat.name}</span>
              </Link>
            </div>
          </div>
        ))}
      </dd>
    </div>
  );
};
