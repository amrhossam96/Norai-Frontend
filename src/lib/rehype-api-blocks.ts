import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Node, Parent } from 'unist';
import h from 'hastscript';

interface CodeNode extends Parent {
  lang?: string;
  meta?: string;
  value: string;
}

export const rehypeApiBlocks: Plugin = () => {
  return (tree) => {
    visit(tree, 'code', (node: CodeNode, index, parent: Parent) => {
      if (node.lang !== 'api') return;

      const content = node.value;
      const lines = content.trim().split('\n');

      // Parse the API method and endpoint from the first line
      const firstLine = lines[0];
      const methodMatch = firstLine.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/);

      if (!methodMatch) return;

      const method = methodMatch[1];
      const endpoint = methodMatch[2];

      // Parse the language blocks
      const snippets: Record<string, string> = {};
      let currentLang: string | null = null;
      let currentSnippet: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (/^(curl|nodejs|python|php|ruby|java|go)$/.test(line.trim())) {
          // Start a new language block
          if (currentLang) {
            snippets[currentLang] = currentSnippet.join('\n');
          }

          currentLang = line.trim();
          currentSnippet = [];
        } else if (currentLang) {
          currentSnippet.push(line);
        }
      }

      // Add the last snippet
      if (currentLang && currentSnippet.length > 0) {
        snippets[currentLang] = currentSnippet.join('\n');
      }

      // Map language identifiers to expected keys
      const langMap: Record<string, string> = {
        'curl': 'cURL',
        'nodejs': 'Node.js',
        'python': 'Python',
        'php': 'PHP',
        'ruby': 'Ruby',
        'java': 'Java',
        'go': 'Go',
      };

      // Format snippets for the ApiCodeBlock component
      const formattedSnippets = Object.entries(snippets).reduce(
        (acc, [lang, code]) => {
          acc[langMap[lang] || lang] = code;
          return acc;
        },
        {} as Record<string, string>
      );

      // Create a JSX element in hastscript syntax
      const apiCodeBlock = h('ApiCodeBlock', {
        method,
        endpoint,
        snippets: JSON.stringify(formattedSnippets),
      });

      // Replace the original node
      parent.children.splice(index ?? 0, 1, apiCodeBlock as unknown as Node);
    });
  };
}; 