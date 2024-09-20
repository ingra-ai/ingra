export type Navlink = {
  title: string;
  href: string;
  external?: boolean;
};

export type NavbarProps = {
  navlinks?: Navlink[];
  sheetChildren?: React.ReactNode;
};

export type NavMenuProps = {
  navlinks: Navlink[];
  isSheet?: boolean;
};

export type LeftbarProps = {};

export type SheetLeftbarProps = {
  navlinks: Navlink[];
};
