'use client';

import { Button } from '@repo/components/ui/button';
import { cn } from '@repo/shared/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SideNavItemProps {
  item: {
    href: string;
    name: string;
  };
}

export default function SideNavItem({ item }: SideNavItemProps) {
  const pathname = usePathname(),
    isActive = pathname.includes(item.href);

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 px-2",
        isActive
          ? "bg-secondary text-secondary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        isActive && "font-semibold"
      )}
      asChild
    >
      <Link href={item.href}>
        {item.name}
      </Link>
    </Button>
  )
}