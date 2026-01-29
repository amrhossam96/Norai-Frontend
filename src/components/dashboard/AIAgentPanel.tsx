'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAgentPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        "I'm your Norai Agent. Ask me about your funnels, users, journeys, or how to integrate the SDK. (Responses are dummy for now.)",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Dummy agent response for now
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          "This is a placeholder response. In the real Norai Agent, I would inspect your project's data and call analytics APIs to answer this.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-white text-black shadow-lg hover:bg-gray-100 transition-all cursor-pointer border border-white/60"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Ask Norai (Beta)</span>
      </button>

      {/* Slide-in panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="hidden sm:block flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="w-full sm:w-[420px] h-full bg-black/90 border-l border-white/10 backdrop-blur-xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Norai Agent</div>
                  <div className="text-xs text-gray-400">Experimental • dummy responses only</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-300" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === 'user'
                      ? 'flex justify-end animate-in fade-in slide-in-from-right duration-200'
                      : 'flex justify-start animate-in fade-in slide-in-from-left duration-200'
                  }
                >
                  <div
                    className={
                      'max-w-[80%] rounded-2xl px-3 py-2 text-sm ' +
                      (m.role === 'user'
                        ? 'bg-white text-black rounded-br-sm'
                        : 'bg-white/5 text-gray-100 border border-white/10 rounded-bl-sm')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white/5 text-gray-300 border border-white/10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-4 py-3 bg-black/80">
              <div className="text-[11px] text-gray-500 mb-1">
                Norai Agent is not connected to your data yet. Responses are static examples.
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Norai anything about your data or funnels…"
                  className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 min-h-[40px] max-h-[120px] break-words"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

