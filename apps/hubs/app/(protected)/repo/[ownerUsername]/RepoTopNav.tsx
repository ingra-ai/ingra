'use client';
import React from 'react';
import { NavItemChild } from '@/components/navs/types';
import TopSubNav from '@/components/navs/TopSubNav';
import { SquareFunctionIcon, SquareLibraryIcon } from 'lucide-react';
import { getUserRepoCollectionsUri, getUserRepoFunctionsUri } from '@repo/shared/lib/constants/repo';

type RepoTopNavProps = {
  ownerUsername: string;
};

const RepoTopNav: React.FC<RepoTopNavProps> = (props) => {
  const { ownerUsername } = props;
  const navRoutes: NavItemChild[] = [
    {
      name: 'Collections',
      href: getUserRepoCollectionsUri(ownerUsername),
      icon: SquareLibraryIcon,
    },
    {
      name: 'Functions',
      href: getUserRepoFunctionsUri(ownerUsername),
      icon: SquareFunctionIcon,
    },
  ];

  return <TopSubNav navItems={navRoutes} />;
};

export default RepoTopNav;
