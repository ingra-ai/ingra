'use client';
import { BreadcrumbNavItem } from "@repo/components/navs/types";
import type { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import { HomeIcon } from '@heroicons/react/24/outline';
import { SquareFunctionIcon, SquareLibraryIcon } from 'lucide-react';

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateBreadcrumbItems = (pathname: string, authSession?: AuthSessionResponse): BreadcrumbNavItem[] => {
  const segments = pathname.split('/').filter(seg => seg !== '');
  const items: BreadcrumbNavItem[] = [
    {
      type: 'link',
      href: '/',
      title: (
        <HomeIcon className="w-5 h-5" />
      )
    }
  ];

  // Helper function to add separator
  const addSeparator = () => {
    items.push({ type: 'separator' });
  };

  const collectionNavTitle = (
    <div className="flex">
      <SquareLibraryIcon className="w-5 h-5 mr-2" />
      Collections
    </div>
  );

  const functionNavTitle = (
    <div className="flex">
      <SquareFunctionIcon className="w-5 h-5 mr-2" />
      Functions
    </div>
  );

  if (segments.length === 0) {
    return items;
  }

  const firstSegment = segments[0];

  switch (firstSegment) {
    case 'marketplace':
      if (segments.length > 1) {
        addSeparator();
        const secondSegment = segments[1];

        if (secondSegment === 'collections') {
          items.push({
            type: 'dropdown',
            title: collectionNavTitle,
            items: [
              { 
                title: functionNavTitle,
                href: '/marketplace/functions'
              }
            ]
          });
        }
        else if (secondSegment === 'functions') {
          items.push({
            type: 'dropdown',
            title: functionNavTitle,
            items: [
              { 
                title: collectionNavTitle,
                href: '/marketplace/collections'
              }
            ]
          });
        }
      }
      else {
        addSeparator();
        items.push({
          type: 'dropdown',
          title: 'Marketplace',
          items: [
            { title: collectionNavTitle, href: '/marketplace/collections' },
            { title: functionNavTitle, href: '/marketplace/functions' }
          ]
        });
      }
      break;

    case 'overview':
      addSeparator();
      items.push({
        type: 'link',
        href: '/overview',
        title: 'Overview'
      });
      if (segments.length > 1) {
        addSeparator();
        const secondSegment = segments[1];
        items.push({
          type: 'page',
          title: capitalizeFirstLetter(secondSegment)
        });
      }
      break;

    case 'repo':

      if (segments.length > 1) {
        const userName = segments[1];

        if (segments.length > 2) {
          const repoSection = segments[2];
          addSeparator();

          // Dropdown for Collections and Functions within a repo
          if (repoSection === 'collections') {
            items.push({
              type: 'dropdown',
              title: `${userName}'s ` + capitalizeFirstLetter(repoSection),
              items: [
                {
                  href: `/repo/${userName}/functions`,
                  title: functionNavTitle
                }
              ]
            });
          }
          else if (repoSection === 'functions') {
            items.push({
              type: 'dropdown',
              title: `${userName}'s ` + capitalizeFirstLetter(repoSection),
              items: [
                {
                  href: `/repo/${userName}/collections`,
                  title: collectionNavTitle
                }
              ]
            });
          }
          else {
            addSeparator();

            // Handle unexpected segments
            items.push({
              type: 'page',
              title: capitalizeFirstLetter(repoSection)
            });
          }

          if (segments.length > 3) {
            addSeparator();
            const itemSlug = segments[3];
            items.push({
              type: 'page',
              title: repoSection === 'collections' ? (
                <div className="flex">
                  <SquareLibraryIcon className="w-5 h-5 mr-2" />
                  { itemSlug }
                </div>
              ) : (
                <div className="flex">
                  <SquareFunctionIcon className="w-5 h-5 mr-2" />
                  { itemSlug }
                </div>
              )
            });
          }
        }
      }
      else {
        addSeparator();
        items.push({
          type: 'link',
          href: '/repo',
          title: 'Repo'
        });
      }
      break;

    default:
      // Handle other paths, e.g., unknown sections
      addSeparator();
      items.push({
        type: 'page',
        title: capitalizeFirstLetter(firstSegment)
      });
      break;
  }

  return items;
};
