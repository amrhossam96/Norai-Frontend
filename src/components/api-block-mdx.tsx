"use client"

import { useState } from 'react'
import { ApiCodeBlock } from './api-code-block'

interface ApiBlockProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  curl: string
  nodejs?: string
  python?: string
  php?: string
  ruby?: string
  java?: string
  go?: string
}

export function ApiBlock({ method, endpoint, ...languages }: ApiBlockProps) {
  // Transform the languages object into the snippets format
  const snippets: Record<string, string> = {};
  
  if (languages.curl) snippets['cURL'] = languages.curl;
  if (languages.nodejs) snippets['Node.js'] = languages.nodejs;
  if (languages.python) snippets['Python'] = languages.python;
  if (languages.php) snippets['PHP'] = languages.php;
  if (languages.ruby) snippets['Ruby'] = languages.ruby;
  if (languages.java) snippets['Java'] = languages.java;
  if (languages.go) snippets['Go'] = languages.go;
  
  return (
    <ApiCodeBlock
      method={method}
      endpoint={endpoint}
      snippets={snippets}
    />
  );
} 