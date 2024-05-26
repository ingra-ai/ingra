import React from 'react';

type NavItemBase = {
  name: string;
  description?: string;
};

export type NavItemChild = NavItemBase & {
  href: string;
  icon: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
};

export type NavItemParent = NavItemBase & {
  children: NavItemChild[];
};

export type NavItem = NavItemParent | NavItemChild;