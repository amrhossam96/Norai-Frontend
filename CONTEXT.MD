<think>
I need to analyze the codebase provided in the CONTEXT.MD file. The codebase seems to be a documentation website for an API called "Oblien Domains API". Let me go through the files and understand the structure and purpose of this project:

1. Framework: This is a Next.js application that uses Fumadocs (a documentation framework) for creating API documentation.

2. Key technologies:
   - Next.js (version 15.2.2)
   - Fumadocs (for documentation)
   - Tailwind CSS (for styling)
   - React 19
   - MDX for content
   - Swagger UI for API reference

3. Structure:
   - `content/docs/`: Contains MDX files for documentation
   - `src/`: Contains the application source code
     - `app/`: Next.js app directory
     - `components/`: React components
     - `lib/`: Utility functions

4. Main features:
   - Documentation for Domains API
   - Interactive API examples
   - Code snippets in multiple languages
   - Syntax highlighting
   - Dark/light mode
   - API reference with Swagger UI

The project seems to be a developer portal for a domain management API called Oblien, which provides domain registration, DNS management, and other domain-related services.

I'll create a comprehensive markdown description of this project.
</think>

# Oblien Developer Portal

## Project Overview

The Oblien Developer Portal is a comprehensive documentation website built for the Oblien Domains API. It serves as the central hub for developers looking to integrate with Oblien's domain management services, providing detailed API documentation, interactive examples, and implementation guides.

## Technology Stack

- **Framework**: Next.js 15.2.2
- **Documentation**: Fumadocs (MDX-based documentation framework)
- **Styling**: Tailwind CSS 4.0
- **Frontend**: React 19
- **Code Highlighting**: react-syntax-highlighter
- **API Reference**: Swagger UI
- **UI Components**: Custom components with responsive design
- **Notifications**: Sonner for toast notifications

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── (home)/           # Home page routes
│   ├── docs/             # Documentation routes
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── home/             # Homepage-specific components
│   ├── api-code-block.tsx# API code block component
│   ├── mdx-components.tsx# MDX rendering components
│   └── syntax-highlighter.tsx # Code highlighting
├── content/              # Documentation content
│   ├── docs/             # MDX documentation files
│   └── openapi.yaml      # OpenAPI specification
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Key Features

### 1. Interactive Documentation

The portal uses Fumadocs to create a seamless documentation experience with:

- Hierarchical navigation
- Table of contents
- Interactive code examples
- Smart search functionality

### 2. API Reference

The API reference section uses Swagger UI to provide interactive documentation:

```typescript
// src/components/SwaggerUI.tsx
import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const SwaggerUIDoc: React.FC = () => {
    const specPath = path.join(process.cwd(), 'content/openapi.yaml');
    const specYaml = fs.readFileSync(specPath, 'utf8');
    const specObject: string | object | undefined = yaml.load(specYaml) as string | object | undefined;

    return <SwaggerUI spec={specObject} />;
};
```

### 3. Code Examples in Multiple Languages

The portal provides code examples for API endpoints in multiple programming languages:

- JavaScript/Node.js
- Python
- cURL
- PHP
- Java
- Ruby
- Go

Each example is highlighted with proper syntax highlighting:

```typescript
// src/components/syntax-highlighter.tsx
export function CodeHighlighter({ code, language, showLineNumbers = true, customStyle }: CodeHighlighterProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={atomDark}
      showLineNumbers={showLineNumbers}
      customStyle={{
        margin: 0,
        padding: "1rem",
        borderRadius: 0,
        ...customStyle,
      }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
```

### 4. Modern UI with Responsive Design

The portal features a modern UI with animations and responsive design for all device sizes:

- Animated hero section with typing code effect
- Dark mode support
- Mobile-friendly navigation
- Custom glass-morphism UI components

### 5. Custom MDX Components

The portal extends MDX with custom components for API documentation:

```typescript
// src/components/mdx-components.tsx
export function useMDXComponentsOblien(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, ...props }) => {
      // Try to get the raw content directly
      // @ts-ignore - accessing internal props
      let content = children?.props?.children || '';
      
      if (typeof content === 'string') {
        // Try to parse as API block
        const apiBlockData = parseApiBlock(content);
        
        if (apiBlockData) {
          console.log("Rendering ApiCodeBlock with:", apiBlockData.method, apiBlockData.endpoint);
          return (
            <ApiCodeBlock
              method={apiBlockData.method}
              endpoint={apiBlockData.endpoint}
              snippets={apiBlockData.snippets}
              {...props}
            />
          );
        } else {
          console.log("Not an API block, rendering normal pre");
        }
      } else {
        console.log("Content is not a string:", typeof content);
      }
      
      // Default to regular code block for non-API blocks
      return <pre>{children}</pre>;
    },
    // Other component overrides...
  };
}
```

## Documentation Content

The documentation covers several key areas of the Oblien Domains API:

1. **Authentication** - API key management and security best practices
2. **Domain Management** - Registration, transfers, renewals
3. **DNS Management** - Creating and managing DNS records
4. **WHOIS Operations** - Querying and updating WHOIS information
5. **TLD Information** - Pricing and availability for different TLDs
6. **Error Handling** - Common errors and troubleshooting

## Homepage Sections

The homepage is designed to attract developers with:

1. **Hero Section** - Animated code example showing the API in action
2. **Features Section** - Highlighting key API capabilities
3. **API Example Section** - Interactive example of API usage
4. **Pricing Section** - Subscription plans with feature comparison
5. **CTA Section** - Call to action to get started with documentation

## Configuration

The project uses several configuration files:

- `next.config.mjs` - Next.js configuration with MDX plugin
- `tailwind.config.ts` - Tailwind CSS configuration
- `source.config.ts` - Fumadocs content source configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - UI component configuration

## Licensing

The project is licensed under the GNU Affero General Public License (AGPL) v3, as indicated in the LICENSE file and OpenAPI specification.

## Getting Started

Developers can start using the documentation by:

1. Navigating to the documentation at `/docs`
2. Creating a developer account
3. Generating API credentials
4. Making their first API request

## Deployment

The application is built for deployment on Vercel, as indicated by the Next.js configuration and dependencies.
