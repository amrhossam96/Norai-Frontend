'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
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
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = React.useMemo(() => {
    if (!value) return undefined;
    const found = options.find(opt => String(opt.value) === String(value));
    return found;
  }, [options, value]);

  const dropdownContent = isOpen && typeof window !== 'undefined' ? (
    <>
      <div
        className="fixed inset-0 z-[10001]"
        onMouseDown={(e) => {
          // Use onMouseDown instead of onClick to prevent race condition
          e.preventDefault();
          setIsOpen(false);
        }}
      />
      {createPortal(
        <div
          className="fixed bg-black border border-white/10 rounded-lg shadow-xl z-[10002] max-h-60 overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
          onMouseDown={(e) => {
            // Prevent backdrop from closing when clicking inside dropdown
            e.stopPropagation();
          }}
        >
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => {
                  // Use onMouseDown to ensure it fires before backdrop
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(option.value);
                  // Use setTimeout to ensure state update happens before closing
                  setTimeout(() => {
                    setIsOpen(false);
                  }, 0);
                }}
                className={cn(
                  'w-full px-4 py-2 rounded-lg text-left transition-all cursor-pointer',
                  String(value) === String(option.value)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {option.label}
              </button>
            ))}
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
          {selectedOption?.label || placeholder || 'Select...'}
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

