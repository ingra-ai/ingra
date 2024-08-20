'use client';
import React from 'react';
import { NavItemChild } from '@components/navs/types';
import TopSubNav from '@components/navs/TopSubNav';
import { SquareFunctionIcon, SquareLibraryIcon } from 'lucide-react';

type RepoTopNavProps = {
  ownerUsername: string;
};

const RepoTopNav: React.FC<RepoTopNavProps> = ( props ) => {
  const { ownerUsername } = props;
  const navRoutes: NavItemChild[] = [
    {
      name: 'Collections',
      href: `/repo/${ownerUsername}/collections`,
      icon: SquareLibraryIcon
    },
    {
      name: 'Functions',
      href: `/repo/${ownerUsername}/functions`,
      icon: SquareFunctionIcon
    }
  ];

  return (
    <TopSubNav navItems={navRoutes} />
  );
};

export default RepoTopNav;