import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { rehypeApiBlocks } from '@/lib/rehype-api-blocks';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
  rehypePlugins: [
    // ... other plugins
    rehypeApiBlocks,
  ],
});
