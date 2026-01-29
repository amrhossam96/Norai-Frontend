'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventType } from '@/lib/api-client';

interface EventTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: EventType[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onRegisterNew: () => void;
}

export default function EventTypeSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled = false,
  onRegisterNew,
}: EventTypeSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0, maxHeight: 240 });
  const selectRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position for portal
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownMaxHeight = 240; // max-h-60 = 240px
        const spaceBelow = viewportHeight - rect.bottom - 8; // 8px for gap
        const spaceAbove = rect.top - 8; // 8px for gap
        const openAbove = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;
        
        // Calculate available height
        const availableHeight = openAbove ? spaceAbove : spaceBelow;
        const maxHeight = Math.min(dropdownMaxHeight, availableHeight);
        
        setPosition({
          top: openAbove ? rect.top - maxHeight - 8 : rect.bottom + 8,
          left: rect.left,
          width: rect.width,
          maxHeight,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = React.useMemo(() => {
    if (!value) return undefined;
    const found = options.find(opt => String(opt.id) === String(value));
    return found;
  }, [options, value]);

  const dropdownContent = isOpen && typeof window !== 'undefined' ? (
    <>
      <div
        className="fixed inset-0 z-[10001] animate-in fade-in duration-200"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsOpen(false);
        }}
      />
      {createPortal(
        <div
          className="fixed bg-black border border-white/10 rounded-lg shadow-xl z-[10002] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: `${position.maxHeight}px`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(option.id);
                  setTimeout(() => {
                    setIsOpen(false);
                  }, 0);
                }}
                className={cn(
                  'w-full px-4 py-2 rounded-lg text-left transition-all cursor-pointer',
                  String(value) === String(option.id)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {option.event_name}
              </button>
            ))}
            
            {/* Register New Option */}
            <div className="border-t border-white/10 mt-1 pt-1">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  onRegisterNew();
                }}
                className="w-full px-4 py-2 rounded-lg text-left transition-all cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Register new event type
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  ) : null;

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white',
          'focus:outline-none focus:border-white/20 focus:bg-white/10',
          'transition-all cursor-pointer flex items-center justify-between',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <span 
          key={`select-value-${value || 'empty'}`}
          className={selectedOption ? 'text-white' : 'text-gray-500'}
        >
          {selectedOption?.event_name || placeholder || 'Select event type...'}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {dropdownContent}
    </div>
  );
}
