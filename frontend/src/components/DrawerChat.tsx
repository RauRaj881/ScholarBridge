import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { XIcon } from 'lucide-react';

interface DrawerChatProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DrawerChat({ isOpen, onClose, children }: DrawerChatProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  // Handle mounting and animation sequence states
  useEffect(() => {
    if (isOpen) {
      // Small timeout ensures the DOM renders before transition starts
      const timer = setTimeout(() => setAnimate(true), 10);
      document.body.style.overflow = 'hidden'; // Stop background scrolling
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus safely when open
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement;
    const focusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    // Timeout gives animation a moment to slide before focus shifts
    const focusTimer = setTimeout(() => focusable?.focus(), 150);
    
    return () => {
      clearTimeout(focusTimer);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Overlay with smooth fade-in */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-label="Close chat drawer"
      />

      {/* Drawer Body Panel with fixed slide animation */}
      <div
        ref={drawerRef}
        className={`relative ml-auto w-full max-w-md h-full bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl transition-transform duration-300 ease-out ${
          animate ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Ribbon for visual structure */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-sm text-slate-300 tracking-wide uppercase">ScholarBridge AI</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Inner Content Slot wrapper */}
        <div className="h-[calc(100%-57px)] overflow-y-auto p-4 bg-slate-950/20">
          {children}
        </div>
      </div>
    </div>
  );
}
