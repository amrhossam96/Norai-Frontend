import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { useState } from 'react';

type LanguageTab = {
  label: string;
  language: string;
  code: string;
};

type DynamicCodeSnippetProps = {
  tabs: LanguageTab[];
  defaultLanguage?: string;
};

export function DynamicCodeSnippet({ tabs, defaultLanguage }: DynamicCodeSnippetProps) {
  const defaultTab = tabs.find(tab => tab.language === defaultLanguage) || tabs[0];
  const [activeTab, setActiveTab] = useState<LanguageTab>(defaultTab);

  return (
    <div className="rounded-lg overflow-hidden border border-amber-500/20 dark:border-amber-500/10">
      <div className="flex border-b border-amber-500/20 dark:border-amber-500/10 bg-white/40 dark:bg-white/[0.02]">
        {tabs.map((tab) => (
          <button
            key={tab.language}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm ${
              activeTab.language === tab.language 
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <DynamicCodeBlock 
        lang={activeTab.language}
        code={activeTab.code}
        options={{
          theme: 'github-dark', // or any other theme you prefer
        }}
      />
    </div>
  );
} 