"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Copy, Maximize, Minimize } from "lucide-react"
import { toast } from "sonner"
import { CodeHighlighter } from "./code-highlighter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Language = "cURL" | "Ruby" | "Python" | "PHP" | "Java" | "Node.js" | "Go"

interface ApiCodeBlockProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  snippets: Record<Language, string>
  defaultLanguage?: Language
  customStyle?: React.CSSProperties
}

export function ApiCodeBlock({ method, endpoint, snippets, defaultLanguage = "cURL", customStyle }: ApiCodeBlockProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(true)
  
  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isFullscreen && event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Prevent scrolling on body when fullscreen
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Animation completion handler
  useEffect(() => {
    if (isFullscreen) {
      setAnimationComplete(false);
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 600); // Slightly longer than our longest animation
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[language])
    setCopied(true)

    toast.success(`${endpoint} API code copied to clipboard`)

    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const methodColors = {
    GET: "text-blue-500 dark:text-blue-400",
    POST: "text-green-500 dark:text-green-400",
    PUT: "text-amber-500 dark:text-amber-400",
    DELETE: "text-red-500 dark:text-red-400",
    PATCH: "text-purple-500 dark:text-purple-400",
  }

  const languages: Language[] = ["cURL", "Ruby", "Python", "PHP", "Java", "Node.js", "Go"]

  return (
    <>
      {/* Overlay backdrop with fade-in effect */}
      {isFullscreen && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-500 ${animationComplete ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsFullscreen(false)}
        />
      )}
      
      <div
        className={`
          overflow-hidden backdrop-blur-xl
          border border-amber-500/20 dark:border-amber-500/10 shadow-lg shadow-amber-500/5 dark:shadow-black/30
          transition-all duration-500 ease-in-out
          ${isFullscreen 
            ? "fixed inset-0 z-[100] rounded-none scale-100 bg-white/10 dark:bg-black/80" 
            : "relative rounded-[24px] bg-white/30 dark:bg-black/30 hover:shadow-xl hover:-translate-y-0.5"
          }
        `}
      >
        {/* Glass highlight effect */}
        <div className={`absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent dark:from-amber-500/5 dark:via-transparent dark:to-transparent pointer-events-none h-10 
        transition-all duration-500
        ${isFullscreen ? "opacity-50" : "opacity-100 rounded-t-[24px]"}`} />
      
        <div className={`
          flex items-center justify-between px-4 py-2 border-b border-amber-500/20 dark:border-amber-500/10
          transition-all duration-500 ease-in-out
          ${isFullscreen 
            ? "bg-white/5 dark:bg-white/[0.01]" 
            : "bg-white/40 dark:bg-white/[0.02]"
          }
        `}>
          <div className={`
            flex items-center space-x-2
            transition-all duration-300 delay-100
            ${isFullscreen ? "translate-y-0 opacity-100" : ""}
          `}>
            <span className={methodColors[method]}>{method}</span>
            <span className="text-gray-700 dark:text-[#e5e7eb]">{endpoint}</span>
          </div>
          <div className={`
            flex items-center space-x-2
            transition-all duration-300 delay-150
            ${isFullscreen ? "translate-y-0 opacity-100" : ""}
          `}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-white/30 dark:hover:bg-white/10 transition-colors duration-200">
                  <span className="text-gray-700 dark:text-gray-300">{language}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-amber-500/20 dark:border-amber-500/10 max-h-[200px] overflow-y-auto z-[110]"
                align="start"
              >
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="text-gray-700 dark:text-gray-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 cursor-pointer"
                  >
                    {lang}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button 
              onClick={handleCopy} 
              className="p-1 rounded hover:bg-white/30 dark:hover:bg-white/10 transition-colors duration-200" 
              aria-label="Copy code"
            >
              {copied ? 
                <Check className="h-4 w-4 text-green-500 dark:text-green-400" /> : 
                <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              }
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/30 dark:hover:bg-white/10 transition-colors duration-200 transform"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? 
                <Minimize className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
                <Maximize className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              }
            </button>
          </div>
        </div>
        <div className={`
          relative overflow-auto
          transition-all duration-500 ease-in-out
          ${isFullscreen 
            ? "h-[calc(100vh-3rem)] opacity-100 transform-none" 
            : "max-h-[500px] rounded-b-[24px]"
          }
        `}>
          <div className={`
            transition-all duration-500 delay-200
            ${isFullscreen ? "opacity-100 translate-y-0" : ""}
          `}>
            <CodeHighlighter 
              code={snippets[language]} 
              language={language === "cURL" ? "bash" : language === "Node.js" ? "javascript" : language.toLowerCase()} 
              customStyle={{ 
                backgroundColor: "transparent",
                ...customStyle
              }} 
            />
          </div>
        </div>
      </div>
    </>
  )
}

