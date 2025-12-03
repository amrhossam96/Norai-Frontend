"use client";

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Star, Globe, Check, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typedText, setTypedText] = useState<string[]>([]);
  const codeLines = [
    '// Track user events',
    'Norai.shared.trackEvent(',
    '    name: "product_tapped",',
    '    properties: [',
    '"product_id": "prod_123",',
    '"category": "electronics",',
    '"price": 299.99,',
    '"brand": "Apple"',
    '    ]',
    ')',
    '',
    '// Identify user',
    'Norai.shared.identify(',
    '    userId: "user_123"',
    ')'
  ];

  // Animation effect when component mounts
  useEffect(() => {
    // Small delay before animations to ensure they work on initial page load/refresh
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Live code typing effect - character by character for more realistic effect
    let currentLine = 0;
    let currentChar = 0;
    let currentLineText = '';

    const typingInterval = setInterval(() => {
      if (currentLine < codeLines.length) {
        const fullLine = codeLines[currentLine];

        if (currentChar < fullLine.length) {
          // Add one character at a time
          currentChar++;
          currentLineText = fullLine.substring(0, currentChar);
          setTypedText(prev => {
            const newText = [...prev];
            newText[currentLine] = currentLineText;
            return newText;
          });
        } else {
          // Move to next line
          currentLine++;
          currentChar = 0;
          currentLineText = '';

          if (currentLine < codeLines.length) {
            setTypedText(prev => {
              const newText = [...prev];
              newText[currentLine] = '';
              return newText;
            });
          }
        }
      } else {
        clearInterval(typingInterval);
      }
    }, 10);

    return () => {
      clearTimeout(timer);
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <section className="relative pt-35 pb-24 overflow-hidden bg-black text-white">
      {/* Subtle background elements */}
      <div className="absolute inset-0 z-0">
        {/* Dark geometric patterns */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-[#111] rounded-full opacity-40 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-40' : 'opacity-0'}`} />

        {/* Subtle grid pattern */}
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column - text content with staggered animations */}
          <div className="max-w-xl">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm font-medium text-white/90">
                iOS SDK Available Now - Android & React Native Coming Soon
              </span>
            </div>

            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="relative inline-block">
                Understand Your Users.
              </span>
              <span className="text-gray-400"> Deliver Personalized Experiences.</span>
            </h1>

            <p className={`text-base sm:text-lg text-gray-400 mb-8 leading-relaxed transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Behavioral analysis and recommendation engine. Track events, analyze patterns, generate intelligent recommendations.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Link
                href="/docs"
                className="group px-8 py-3.5 bg-white text-black rounded-[15px] font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-200 shadow-lg shadow-white/5 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3.5 bg-transparent text-white border border-white/20 rounded-[15px] font-medium hover:bg-white/5 hover:border-white/30 transition-all hover:-translate-y-0.5"
              >
                View Documentation
              </Link>
            </div>

            <div className={`mt-12 flex items-center gap-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex -space-x-3">
                {[
                  { id: 1, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces' },
                  { id: 2, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces' },
                  { id: 3, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces' },
                  { id: 4, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces' }
                ].map((person) => (
                  <div
                    key={person.id}
                    className="w-10 h-10 rounded-full ring-2 ring-black bg-black overflow-hidden flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  >
                    <img
                      src={person.image}
                      alt={`Developer ${person.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <span className="font-bold text-white mr-1.5">1,000+</span> developers building with Norai
                <div className="flex items-center ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 text-white fill-white" />
                  ))}
                </div>
              </div>
            </div>

            {/* Features with elegant checkmarks */}
            <div className={`mt-12 grid grid-cols-2 gap-3 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {[
                'Simple SDK Integration',
                'ML-Powered Recommendations',
                'Real-time Analytics',
                'Auto-Scaling Infrastructure'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - sleek dark code editor */}
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative rounded-md border border-white/10 shadow-2xl shadow-white/5 overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              {/* Terminal header */}
              <div className="bg-[#111] border-b border-white/10 flex items-center justify-between p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full flex items-center justify-center bg-[#ff5f57] group cursor-pointer hover:bg-[#ff5f57]/80">
                    <X className="w-2 h-2 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c841] hover:bg-[#28c841]/80"></div>
                </div>
                <div className="text-xs font-medium text-gray-400">track-event.swift</div>
                <div className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-400">Swift</div>
              </div>

              {/* Code editor with sleek dark theme */}
              <div className="bg-[#0d0d0d] p-6 relative font-mono text-sm overflow-hidden min-h-[350px]">
                {/* Line numbers */}
                <div className="absolute left-3 top-6 text-gray-600 select-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="h-6">{i + 1}</div>
                  ))}
                </div>

                {/* Code content with live typing effect */}
                <div className="pl-7 space-y-0 font-mono relative z-10">
                  {codeLines.map((fullLine, lineIndex) => {
                    // Get current text for this line
                    const currentText = typedText[lineIndex] || '';
                    const displayText = currentText;

                    return (
                      <div key={lineIndex} className="h-6 whitespace-pre font-mono transition-all">
                        {lineIndex === 0 && displayText ? (
                          <span className="text-gray-500">{displayText}</span>
                        ) : lineIndex === 1 && displayText ? (
                          <>
                            <span className="text-blue-300">{displayText.includes('Norai') ? 'Norai' : ''}</span><span className="text-teal-300">{displayText.includes('.shared') ? '.shared' : ''}</span><span className="text-teal-300">{displayText.includes('.trackEvent') ? '.trackEvent' : ''}</span>{displayText.includes('(') ? '(' : ''}
                          </>
                        ) : lineIndex === 2 && displayText ? (
                          <>
                            {'    '}<span className="text-purple-300">{displayText.includes('name') ? 'name' : ''}</span>{displayText.includes(':') ? ': ' : ''}<span className="text-amber-300/80">{displayText.includes('"') ? displayText.substring(displayText.indexOf('"')) : ''}</span>
                          </>
                        ) : lineIndex === 3 && displayText ? (
                          <>
                            {'    '}<span className="text-purple-300">{displayText.includes('properties') ? 'properties' : ''}</span>{displayText.includes(':') ? ': ' : ''}{displayText.includes('[') ? '[' : ''}
                          </>
                        ) : lineIndex === 4 && displayText ? (
                          <>
                            {'        '}<span className="text-amber-300/80">{displayText.includes('"product_id"') ? displayText : ''}</span>
                          </>
                        ) : lineIndex === 5 && displayText ? (
                          <>
                            {'        '}<span className="text-amber-300/80">{displayText.includes('"category"') ? displayText : ''}</span>
                          </>
                        ) : lineIndex === 6 && displayText ? (
                          <>
                            {'        '}<span className="text-amber-300/80">{displayText.includes('"price"') ? '"price"' : ''}</span>{displayText.includes(':') ? ': ' : ''}<span className="text-blue-200">{displayText.includes('299.99') ? '299.99' : ''}</span>{displayText.includes(',') ? ',' : ''}
                          </>
                        ) : lineIndex === 7 && displayText ? (
                          <>
                            {'        '}<span className="text-amber-300/80">{displayText.includes('"brand"') ? displayText : ''}</span>
                          </>
                        ) : lineIndex === 8 && displayText ? (
                          <>
                            {'    '}<span className="text-gray-300">{displayText.includes(']') ? ']' : ''}</span>
                          </>
                        ) : lineIndex === 9 && displayText ? (
                          <span className="text-gray-300">{displayText}</span>
                        ) : lineIndex === 10 ? (
                          <span>{displayText}</span>
                        ) : lineIndex === 11 && displayText ? (
                          <span className="text-gray-500">{displayText}</span>
                        ) : lineIndex === 12 && displayText ? (
                          <>
                            <span className="text-blue-300">{displayText.includes('Norai') ? 'Norai' : ''}</span><span className="text-teal-300">{displayText.includes('.shared') ? '.shared' : ''}</span><span className="text-teal-300">{displayText.includes('.identify') ? '.identify' : ''}</span>{displayText.includes('(') ? '(' : ''}
                          </>
                        ) : lineIndex === 13 && displayText ? (
                          <>
                            {'    '}<span className="text-purple-300">{displayText.includes('userId') ? 'userId' : ''}</span>{displayText.includes(':') ? ': ' : ''}<span className="text-amber-300/80">{displayText.includes('"') ? displayText.substring(displayText.indexOf('"')) : ''}</span>
                          </>
                        ) : lineIndex === 14 && displayText ? (
                          <span className="text-gray-300">{displayText}</span>
                        ) : (
                          <span className="text-gray-400">{displayText}</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Blinking cursor */}
                  <div className="absolute h-6 left-7" style={{
                    top: `${Math.min(typedText.length, codeLines.length) * 1.5}rem`,
                    opacity: typedText.length >= codeLines.length ? 0 : 1
                  }}>
                    <div className="h-5 w-2.5 bg-white animate-blink ml-0.5"></div>
                  </div>
                </div>

                {/* Terminal scrollbar */}
                <div className="absolute right-2 top-6 bottom-6 w-1.5 rounded-full bg-white/5 opacity-50">
                  <div className="w-1.5 h-20 rounded-full bg-white/20"></div>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#111] text-white text-xs font-medium border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span>Connected to Norai SDK</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Event Tracked</span>
                  <span className="text-gray-400">Success</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1.2s step-start infinite;
        }
      `}</style>
    </section>
  );
} 