import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BarcodeScanner from './BarcodeScanner';

interface BarcodeShortcutContextType {
  openScanner: (onScan?: (barcode: string) => void) => void;
  closeScanner: () => void;
  isOpen: boolean;
}

const BarcodeShortcutContext = createContext<BarcodeShortcutContextType | undefined>(undefined);

export const useBarcodeShortcut = () => {
  const context = useContext(BarcodeShortcutContext);
  if (!context) {
    throw new Error('useBarcodeShortcut must be used within a BarcodeShortcutProvider');
  }
  return context;
};

interface BarcodeShortcutProviderProps {
  children: React.ReactNode;
}

export const BarcodeShortcutProvider: React.FC<BarcodeShortcutProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onScanCallback, setOnScanCallback] = useState<((barcode: string) => void) | undefined>();

  const openScanner = useCallback((onScan?: (barcode: string) => void) => {
    setOnScanCallback(() => onScan);
    setIsOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
    setOnScanCallback(undefined);
  }, []);

  const handleScan = useCallback((barcode: string) => {
    if (onScanCallback) {
      onScanCallback(barcode);
    }
    closeScanner();
  }, [onScanCallback, closeScanner]);

  // Global keyboard shortcut for barcode scanner (Ctrl + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl + B is pressed
      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        openScanner();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openScanner]);

  const value: BarcodeShortcutContextType = {
    openScanner,
    closeScanner,
    isOpen,
  };

  return (
    <BarcodeShortcutContext.Provider value={value}>
      {children}
      
      {/* Global Barcode Scanner Modal */}
      <BarcodeScanner
        visible={isOpen}
        onClose={closeScanner}
        onScan={handleScan}
        title="Global Barcode Scanner"
        description="Use camera or enter barcode manually. Press Ctrl+B anytime to open."
      />
    </BarcodeShortcutContext.Provider>
  );
};
