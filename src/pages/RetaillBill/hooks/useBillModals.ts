import { useState, useCallback } from 'react';

/**
 * Hook to manage all modal states
 * Centralizes modal visibility and related state
 */
export const useBillModals = () => {
  const [stockModalRowIndex, setStockModalRowIndex] = useState<number | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false);
  const [billListDrawerVisible, setBillListDrawerVisible] = useState(false);
  const [productDetailsModalVisible, setProductDetailsModalVisible] = useState(false);
  const [productSelectionModalVisible, setProductSelectionModalVisible] = useState(false);
  const [productSelectionRowIndex, setProductSelectionRowIndex] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [lastInteractedRowIndex, setLastInteractedRowIndex] = useState<number>(0);
  const [externalEditingCell, setExternalEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Open stock modal for specific row
  const openStockModal = useCallback((rowIndex: number) => {
    setStockModalRowIndex(rowIndex);
  }, []);

  // Close stock modal
  const closeStockModal = useCallback(() => {
    setStockModalRowIndex(null);
  }, []);

  // Open customer modal
  const openCustomerModal = useCallback(() => {
    setCustomerModalVisible(true);
  }, []);

  // Close customer modal
  const closeCustomerModal = useCallback(() => {
    setCustomerModalVisible(false);
  }, []);

  // Open user modal
  const openUserModal = useCallback(() => {
    setUserModalVisible(true);
  }, []);

  // Close user modal
  const closeUserModal = useCallback(() => {
    setUserModalVisible(false);
  }, []);

  // Open product selection modal
  const openProductSelectionModal = useCallback((rowIndex: number) => {
    setProductSelectionRowIndex(rowIndex);
    setProductSelectionModalVisible(true);
    setLastInteractedRowIndex(rowIndex);
  }, []);

  // Close product selection modal
  const closeProductSelectionModal = useCallback(() => {
    setProductSelectionModalVisible(false);
    setProductSelectionRowIndex(null);
  }, []);

  // Open bill list drawer
  const openBillListDrawer = useCallback(() => {
    setBillListDrawerVisible(true);
  }, []);

  // Close bill list drawer
  const closeBillListDrawer = useCallback(() => {
    setBillListDrawerVisible(false);
  }, []);

  // Open save confirmation
  const openSaveConfirmation = useCallback(() => {
    setSaveConfirmationVisible(true);
  }, []);

  // Close save confirmation
  const closeSaveConfirmation = useCallback(() => {
    setSaveConfirmationVisible(false);
  }, []);

  // Open product details modal
  const openProductDetailsModal = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setProductDetailsModalVisible(true);
  }, []);

  // Close product details modal
  const closeProductDetailsModal = useCallback(() => {
    setProductDetailsModalVisible(false);
    setSelectedProductId('');
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setStockModalRowIndex(null);
    setCustomerModalVisible(false);
    setUserModalVisible(false);
    setSaveConfirmationVisible(false);
    setBillListDrawerVisible(false);
    setProductDetailsModalVisible(false);
    setProductSelectionModalVisible(false);
    setProductSelectionRowIndex(null);
    setSelectedProductId('');
    setExternalEditingCell(null);
  }, []);

  return {
    // States
    stockModalRowIndex,
    customerModalVisible,
    userModalVisible,
    saveConfirmationVisible,
    billListDrawerVisible,
    productDetailsModalVisible,
    productSelectionModalVisible,
    productSelectionRowIndex,
    selectedProductId,
    lastInteractedRowIndex,
    externalEditingCell,

    // Setters
    setStockModalRowIndex,
    setCustomerModalVisible,
    setUserModalVisible,
    setSaveConfirmationVisible,
    setBillListDrawerVisible,
    setProductDetailsModalVisible,
    setProductSelectionModalVisible,
    setProductSelectionRowIndex,
    setSelectedProductId,
    setLastInteractedRowIndex,
    setExternalEditingCell,

    // Actions
    openStockModal,
    closeStockModal,
    openCustomerModal,
    closeCustomerModal,
    openUserModal,
    closeUserModal,
    openProductSelectionModal,
    closeProductSelectionModal,
    openBillListDrawer,
    closeBillListDrawer,
    openSaveConfirmation,
    closeSaveConfirmation,
    openProductDetailsModal,
    closeProductDetailsModal,
    closeAllModals,
  };
};

