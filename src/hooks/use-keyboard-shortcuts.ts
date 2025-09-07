import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  action: () => void;
  ctrlKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[], enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !shortcut.metaKey;
        
        return keyMatch && ctrlMatch && metaMatch;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

// Global keyboard shortcuts hook
export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'u',
      action: () => navigate('/upload'),
    },
    {
      key: 'd', 
      action: () => navigate('/dashboard'),
    },
    {
      key: 'h',
      action: () => navigate('/'),
    },
    {
      key: 'p',
      action: () => navigate('/profile'),
    },
    {
      key: '/',
      action: () => {
        // Focus search input if it exists
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
};

// Copy shortcut for summary pages
export const useCopyShortcut = (copyFn: () => void) => {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'c',
      action: copyFn,
    },
  ];

  useKeyboardShortcuts(shortcuts);
};

// Download shortcut for summary pages  
export const useDownloadShortcut = (downloadFn: () => void) => {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      ctrlKey: true,
      action: downloadFn,
    },
  ];

  useKeyboardShortcuts(shortcuts);
};

// Escape shortcut for modals/overlays
export const useEscapeShortcut = (escapeFn: () => void) => {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'Escape',
      action: escapeFn,
    },
  ];

  useKeyboardShortcuts(shortcuts);
};
