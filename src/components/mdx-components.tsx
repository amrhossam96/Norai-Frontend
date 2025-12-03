"use client"

import { MDXComponents } from 'mdx/types'
import { ApiCodeBlock } from './api-code-block'
import { CodeHighlighter } from './code-highlighter'

// Parse API block with multiple language examples
function parseApiBlock(content: string) {
  // Check if this starts with a method and endpoint
  const firstLine = content.trim().split('\n')[0];
  const methodMatch = firstLine.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(\S+)/);
  
  if (!methodMatch) return null;
  
  const method = methodMatch[1] as "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  const endpoint = methodMatch[2];
  
  // Split the rest of the content by language blocks
  const rest = content.substring(firstLine.length).trim();
  const languageBlocks = rest.split(/\n(?=[a-z]+\n)/);
  
  const snippets: Record<string, string> = {};
  
  for (const block of languageBlocks) {
    if (!block.trim()) continue;
    
    // First line is the language, rest is code
    const [langLine, ...codeLines] = block.trim().split('\n');
    const lang = langLine.trim();
    const code = codeLines.join('\n');
    
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
    
    const langKey = langMap[lang] || lang;
    snippets[langKey] = code;
  }
  
  return { method, endpoint, snippets };
}

export function useMDXComponentsOblien(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, ...props }) => {
      // Try to get the raw content and language
      // @ts-ignore - accessing children props
      const className = children?.props?.className || '';
      // @ts-ignore - accessing children props
      const content = children?.props?.children || '';
      
      // Check for special api code block
      if (className === 'language-api' && typeof content === 'string') {
        const apiBlockData = parseApiBlock(content);
        
        if (apiBlockData) {
          return (
            <ApiCodeBlock
              method={apiBlockData.method}
              endpoint={apiBlockData.endpoint}
              snippets={apiBlockData.snippets}
              {...props}
            />
          );
        }
      }
      
      // Check for existing API block format (if you have one)
      if (typeof content === 'string') {
        // Try to parse as existing API block format
        const existingApiBlockData = parseExistingApiBlock(content);
        
        if (existingApiBlockData) {
          return (
            <ApiCodeBlock
              method={existingApiBlockData.method}
              endpoint={existingApiBlockData.endpoint}
              snippets={existingApiBlockData.snippets}
              {...props}
            />
          );
        }
      }
      
      // Default to regular code block
      return components.pre?.({ children, ...props }) || <pre {...props}>{children}</pre>;
    },
    code: ({ className, children, ...props }) => {
      const language = className ? className.replace('language-', '') : 'text';
      
      // Only render regular code blocks if not inside a pre
      if (props['data-rehype-pretty'] !== 'false') {
        return (
          <CodeHighlighter
            code={String(children)}
            language={language}
            showLineNumbers={false}
          />
        );
      }
      
      return <code className={className} {...props}>{children}</code>;
    }
  };
}

// Keep any existing API parsing function you might already have
function parseExistingApiBlock(content: string) {
  // Your existing parsing logic for any other API block format
  // Return null if not an API block
  return null;
} 