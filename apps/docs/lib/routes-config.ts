// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true;
  items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
  {
    title: 'Getting Started',
    href: '/getting-started',
    noLink: true,
    items: [
      { title: 'Introduction', href: '/introduction' },
      { 
        title: 'Quick Start Guide',
        href: '/quick-start-guide',
        items: [
          { title: 'Account Setup', href: '/account-setup' },
          { title: 'ChatGPT Setup', href: '/chatgpt-setup' },
          // { title: 'LangChain Setup', href: '/langchain-setup' },
        ],
      }
    ],
  },
  // {
  //   title: 'Curating Functions',
  //   href: '/curating-functions',
  //   noLink: true,
  //   items: [
  //     { title: 'via Web UI', href: '/via-web-ui' },
  //     { title: 'via ChatGPT', href: '/via-chatgpt' },
  //   ],
  // },
  {
    title: 'Features',
    href: '/features',
    noLink: true,
    items: [
      { title: 'Core Features', href: '/core-features' },
      { title: 'Built-in Functions', href: '/builtin-functions' },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const DOCS_PAGE_ROUTES = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
