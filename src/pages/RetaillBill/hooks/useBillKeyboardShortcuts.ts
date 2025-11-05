import { useEffect } from 'react';
import { message } from 'antd';

interface KeyboardShortcutsConfig {
  onF1AddItem: () => void;
  onF2SaveDraft: () => void;
  onF3CompleteBill: () => void;
  onF4Clear: () => void;
  onF5ProductSelection: () => void;
  onF6BillList: () => void;
  onF7StockSelection: () => void;
  onF8Print: () => void;
  onEndCustomer: () => void;
  onCtrlU: () => void;
  onCtrlS: () => void;
  onCtrlN: () => void;
  onCtrlP: () => void;
  onCtrlR: () => void;
}

/**
 * Hook to manage keyboard shortcuts for the bill
 * Ultra-fast billing with keyboard-first interface
 */
export const useBillKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Function keys
      if (e.key === 'F1') {
        e.preventDefault();
        config.onF1AddItem();
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        config.onF2SaveDraft();
        return;
      }

      if (e.key === 'F3') {
        e.preventDefault();
        config.onF3CompleteBill();
        return;
      }

      if (e.key === 'F4') {
        e.preventDefault();
        config.onF4Clear();
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        config.onF5ProductSelection();
        return;
      }

      if (e.key === 'F6') {
        e.preventDefault();
        config.onF6BillList();
        return;
      }

      if (e.key === 'F7') {
        e.preventDefault();
        config.onF7StockSelection();
        return;
      }

      if (e.key === 'F8') {
        e.preventDefault();
        config.onF8Print();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        config.onEndCustomer();
        return;
      }

      // Ctrl key combinations
      if (e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            config.onCtrlS();
            break;
          case 'n':
            e.preventDefault();
            config.onCtrlN();
            break;
          case 'p':
            e.preventDefault();
            config.onCtrlP();
            break;
          case 'r':
            e.preventDefault();
            config.onCtrlR();
            break;
          case 'u':
            e.preventDefault();
            config.onCtrlU();
            break;
        }
      }

      // Quick quantity entry (Ctrl + 0-9)
      if (e.ctrlKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.closest('td[data-column-key="qty"]')) {
          const input = activeElement.querySelector('input') as HTMLInputElement;
          if (input) {
            input.value = e.key;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);

  // Return keyboard shortcut info
  return {
    shortcuts: [
      { key: 'F1', description: 'Add Item' },
      { key: 'F2', description: 'Save Draft' },
      { key: 'F3', description: 'Complete Bill' },
      { key: 'F4', description: 'Clear Form' },
      { key: 'F5', description: 'Select Product' },
      { key: 'F6', description: 'Bill List' },
      { key: 'F7', description: 'Select Stock' },
      { key: 'F8', description: 'Print' },
      { key: 'End', description: 'Select Customer' },
      { key: 'Ctrl+U', description: 'Select User' },
      { key: 'Ctrl+S', description: 'Save' },
      { key: 'Ctrl+N', description: 'Add Item' },
      { key: 'Ctrl+R', description: 'Reset' },
      { key: 'Tab', description: 'Navigate' },
      { key: 'Enter', description: 'Edit' },
      { key: 'Esc', description: 'Cancel' },
    ],
  };
};

