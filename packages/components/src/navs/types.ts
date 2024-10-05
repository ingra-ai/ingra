/**
 * Top Nav Menu
 * 1. Supports hubs header layout.
 * 2. Supports docs header layout.
 */

export type Navlink = {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type NavbarProps = {
  navlinks?: Navlink[];
  sheetChildren?: React.ReactNode;
  authChildren?: React.ReactNode;
};

export type NavMenuProps = {
  navlinks: Navlink[];
  isSheet?: boolean;
};

export type LeftbarProps = {};

export type SheetLeftbarProps = {
  navlinks: Navlink[];
};

/**
 * Breadcrumb
 * 1. Supports hubs LayoutWithNav
 */

type BreadcrumbNavItemBase = {
  title: React.ReactNode;
};

type BreadcrumbNavItemSeparator = {
  type: 'separator';
}

type BreadcrumbNavItemLink = BreadcrumbNavItemBase & {
  type: 'link';
  href: string;
}

type BreadcrumbNavItemPage = BreadcrumbNavItemBase & {
  type: 'page';
}

type BreadcrumbNavItemDropdown = BreadcrumbNavItemBase & {
  type: 'dropdown';
  items: Partial<BreadcrumbNavItemLink>[];
}

export type BreadcrumbNavItem = BreadcrumbNavItemDropdown | BreadcrumbNavItemSeparator | BreadcrumbNavItemLink | BreadcrumbNavItemPage;