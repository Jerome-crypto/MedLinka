import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
}

export default function BottomSheet({ isOpen, onClose, title, children, showHandle = true }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return createPortal(
    <>
      <div
        className={`bottom-sheet-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={`bottom-sheet${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {showHandle && <div className="bottom-sheet__handle" />}
        {title && <div className="bottom-sheet__title">{title}</div>}
        {children}
      </div>
    </>,
    document.body
  );
}
