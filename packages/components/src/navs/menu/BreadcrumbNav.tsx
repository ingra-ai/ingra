import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import type { BreadcrumbNavItem } from '../types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from "next/link";

type BreadcrumbNavProps = React.ComponentPropsWithoutRef<typeof Breadcrumb> & {
  items: BreadcrumbNavItem[];
  authSession?: AuthSessionResponse;
}

export function BreadcrumbNav(props: BreadcrumbNavProps) {
  const { authSession, items, ...breadcrumbProps } = props;

  if (!Array.isArray(items) || !items?.length) {
    return null;
  }

  return (
    <Breadcrumb {...breadcrumbProps}>
      <BreadcrumbList>
        {items.map((elem, index) => {
          if (elem.type === 'link') {
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbLink href={elem.href} className="hover:text-gray-500">{elem.title}</BreadcrumbLink>
              </BreadcrumbItem>
            );
          } else if (elem.type === 'separator') {
            return (
              <BreadcrumbSeparator key={index}>
                <ChevronRightIcon />
              </BreadcrumbSeparator>
            );
          } else if (elem.type === 'dropdown') {
            return (
              <BreadcrumbItem className="hover:text-gray-500" key={index}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    {elem.title}
                    <ChevronDownIcon className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {elem.items.map((dropdownItem, dropdownIndex) => (
                      <DropdownMenuItem className="p-0" key={dropdownIndex}>
                        {
                          dropdownItem.href ? (
                            <Link href={dropdownItem.href} className="block w-full p-2 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700">
                              { dropdownItem.title }
                            </Link>
                          ) : dropdownItem.title
                        }
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            );
          } else if (elem.type === 'page') {
            return (
              <BreadcrumbItem key={index}>
                <BreadcrumbPage>{elem.title}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return null;
        })}
      </BreadcrumbList>
    </Breadcrumb>

  );

}