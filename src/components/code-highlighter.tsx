"use client"

import { useEffect, useState } from "react"
import { createHighlighter } from "shiki"

interface CodeHighlighterProps {
  code: string
  language: string
  showLineNumbers?: boolean
  customStyle?: React.CSSProperties
}

export function CodeHighlighter({ code, language, showLineNumbers = true, customStyle }: CodeHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function highlight() {
      try {
        // Create a highlighter with the themes we need
        const highlighter = await createHighlighter({
          themes: ['github-light', 'github-dark'],
          langs: [language || 'javascript'],
        })
        
        // Get highlighted HTML
        const html = highlighter.codeToHtml(code, { 
          lang: language || 'javascript',
          theme: 'github-dark',
          cssVariablePrefix: 'shiki',
        })
        
        setHighlightedCode(html)
      } catch (error) {
        console.error("Error highlighting code:", error)
        // Fallback to plain text
        setHighlightedCode(`<pre><code>${code}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }

    highlight()
  }, [code, language])

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 h-32 rounded-lg"></div>
  }

  // Use customStyle padding if provided, otherwise default to 0.75rem
  const defaultPadding = customStyle?.padding !== undefined ? undefined : "0.75rem";
  
  return (
    <div 
      style={{
        margin: 0,
        padding: defaultPadding,
        borderRadius: "0.375rem",
        overflow: "auto",
        fontSize: "inherit",
        ...customStyle,
      }}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      className="syntax-highlighter [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!bg-transparent [&_code]:text-[inherit] [&_code]:!text-[11px]"
    />
  )
}

