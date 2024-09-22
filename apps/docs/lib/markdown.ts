import { compileMDX } from 'next-mdx-remote/rsc';
import path from 'path';
import { promises as fs } from 'fs';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeCodeTitles from 'rehype-code-titles';
import { DOCS_PAGE_ROUTES } from './routes-config';
import { visit } from 'unist-util-visit';
import * as constants from '@repo/shared/lib/constants';

// custom components imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/components/ui/tabs';
import Pre from '@/components/pre';
import Note from '@/components/note';
import { Mermaid } from '@/components/mermaid';
import { Stepper, StepperItem } from '@repo/components/ui/stepper';

// shared regex
const CONST_SHORTCODE_REGEX = /{CONST\.([A-Z_]+)}/g;

// add custom components
const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  Note,
  Stepper,
  StepperItem,
  Mermaid,
};

// can be used for other pages like blogs, Guides etc
async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: replaceConstants(rawMdx),
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [preProcess, rehypeCodeTitles, rehypePrism, rehypeSlug, rehypeAutolinkHeadings, postProcess],
        remarkPlugins: [remarkGfm],
      },
      scope: {},
    },
    components,
  });
}

// logic for docs
type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export async function getDocsForSlug(slug: string) {
  try {
    const contentPath = getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, 'utf-8');
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.log(err);
  }
}

export async function getDocsTocs(slug: string) {
  const contentPath = getDocsContentPath(slug);
  let rawMdx = await fs.readFile(contentPath, 'utf-8');
  rawMdx = replaceConstants(rawMdx);
  // captures between ## - #### can modify accordingly
  const headingsRegex = /(#{2,4})\s([^\r\n]+)$/gm;

  let match;
  const extractedHeadings = [];

  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2]
      .trim()
      .replace(/''/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    const slug = sluggify(headingText);

    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${slug}`,
    });
  }

  return extractedHeadings;
}

export function getPreviousNext(path: string) {
  const index = DOCS_PAGE_ROUTES.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: DOCS_PAGE_ROUTES[index - 1],
    next: DOCS_PAGE_ROUTES[index + 1],
  };
}

function replaceConstants(rawMdx: string) {
  return rawMdx.replace(CONST_SHORTCODE_REGEX, (match, p1) => {
    return (constants as any)?.[p1] || match;
  });
}

function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, '-');
  return slug.replace(/[^a-z0-9-]/g, '');
}

function getDocsContentPath(slug: string) {
  return path.join(process.cwd(), '/contents/docs/', `${slug}/index.mdx`);
}

// for copying the code
const preProcess = () => (tree: any) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      const [codeEl] = node.children;
      if (codeEl.tagName !== 'code') return;
      node.raw = codeEl.children?.[0].value;
    }
  });
};

const postProcess = () => (tree: any) => {
  visit(tree, 'element', (node) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      node.properties['raw'] = node.raw;
      // console.log(node);
    }
  });
};

export type Author = {
  avatar?: string;
  handle: string;
  username: string;
  handleUrl: string;
};

export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
  date: string;
  authors: Author[];
};

export async function getAllBlogStaticPaths() {
  try {
    const blogFolder = path.join(process.cwd(), '/contents/blogs/');
    const res = await fs.readdir(blogFolder);
    return res.map((file) => file.split('.')[0]);
  } catch (err) {
    console.log(err);
  }
}

export async function getAllBlogs() {
  const blogFolder = path.join(process.cwd(), '/contents/blogs/');
  const files = await fs.readdir(blogFolder);
  return await Promise.all(
    files.map(async (file) => {
      const filepath = path.join(process.cwd(), `/contents/blogs/${file}`);
      const rawMdx = await fs.readFile(filepath, 'utf-8');
      return {
        ...(await parseMdx<BlogMdxFrontmatter>(rawMdx)),
        slug: file.split('.')[0],
      };
    })
  );
}

export async function getBlogForSlug(slug: string) {
  const blogs = await getAllBlogs();
  return blogs.find((it) => it.slug == slug);
}
