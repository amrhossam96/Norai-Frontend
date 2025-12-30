'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  max?: string;
  min?: string;
  label?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  disabled = false,
  max,
  min,
  label,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const datePickerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Parse the value or use current date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 280),
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    
    // Check min/max constraints
    if (min && dateString < min) return;
    if (max && dateString > max) return;
    
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const calendarContent = isOpen && typeof window !== 'undefined' ? (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      {createPortal(
        <div
          ref={datePickerRef}
          className="fixed bg-black border border-white/10 rounded-lg shadow-xl z-[9999] p-4"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="text-white font-semibold">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const date = new Date(year, month, day);
              const dateString = date.toISOString().split('T')[0];
              const isSelected = value === dateString;
              const isToday = dateString === todayString;
              const isDisabled = (min && dateString < min) || (max && dateString > max);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleDateSelect(day)}
                  disabled={isDisabled}
                  className={cn(
                    'aspect-square rounded-lg text-sm transition-all cursor-pointer',
                    'hover:bg-white/10',
                    isSelected && 'bg-white text-black font-semibold',
                    !isSelected && !isDisabled && 'text-white hover:bg-white/10',
                    isToday && !isSelected && 'border border-white/30',
                    isDisabled && 'opacity-30 cursor-not-allowed text-gray-500'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  ) : null;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg',
          'focus:outline-none focus:border-white/20 focus:bg-white/10',
          'transition-all cursor-pointer flex items-center gap-3',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'border-white/20 bg-white/10'
        )}
      >
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={value ? 'text-white' : 'text-gray-500 flex-1 text-left'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
      </button>

      {calendarContent}
    </div>
  );
}
