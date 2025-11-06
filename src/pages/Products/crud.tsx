import React, { useCallback, useState, useMemo } from 'react';
import BarcodeScanner from '../../components/common/BarcodeScanner';
import { PermissionAwareCrudPage } from '../../components/common/PermissionAwareCrudPage';
import { Product } from '../../types/entities';
import { getCurrentUserRole } from '../../helpers/auth';
import { RESOURCES } from '../../helpers/permissionHelper';
import { productsColumns } from './columns';
import { productsFormItems } from './formItems';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { useInfiniteDropdown } from '../../hooks/useInfiniteDropdown';

const ProductCrud: React.FC = () => {
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  // Use infinite scroll dropdowns
  const categoryDropdown = useInfiniteDropdown({
    queryHook: apiSlice.useGetCategoryQuery,
    limit: 20,
  });

  const variantDropdown = useInfiniteDropdown({
    queryHook: apiSlice.useGetVariantQuery,
    limit: 20,
  });

  const [scannerVisible, setScannerVisible] = useState(false);
  const [currentForm, setCurrentForm] = useState<any>(null);

  const createMap = useCallback((items: any[], labelKey: string) =>
    items.reduce((acc: Record<string, string>, item) => {
      acc[item._id] = item[labelKey];
      return acc;
    }, {}), []);

  const variantMap = useMemo(() => 
    createMap(variantDropdown.items, 'variant_name'), 
    [variantDropdown.items, createMap]
  );

  // Memoize callback functions to prevent recreation
  const handleScanClick = useCallback(() => setScannerVisible(true), []);
  const handleBarcodeInputFocus = useCallback(() => setCurrentForm('barcode'), []);
  
  const canEdit = useCallback((record: Product) => {
    // Global products can only be edited by superadmin
    if (record.global_product) {
      return isSuperAdmin;
    }
    return true;
  }, [isSuperAdmin]);
  
  const canDelete = useCallback((record: Product) => {
    // Global products can only be deleted by superadmin
    if (record.global_product) {
      return isSuperAdmin;
    }
    return true;
  }, [isSuperAdmin]);

  const productConfig = useMemo(() => ({
    title: 'Products',
    columns: productsColumns({ variantMap, isSuperAdmin }),
    formItems: productsFormItems({
      categoryDropdown,
      variantDropdown,
      isSuperAdmin,
      onScanClick: handleScanClick,
      onBarcodeInputFocus: handleBarcodeInputFocus,
    }),
    entityName: 'Product',
    formColumns: 2,
    // Custom business logic for global products
    // Note: PermissionAwareCrudPage will combine these with user permissions
    canEdit,
    canDelete,
  }), [variantMap, categoryDropdown, variantDropdown, isSuperAdmin, handleScanClick, handleBarcodeInputFocus, canEdit, canDelete]);

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    setScannerVisible(false);
    if (currentForm === 'barcode') {
      // Find the barcode input field and set its value
      const barcodeInput = document.querySelector('input[name="barcode"]') as HTMLInputElement;
      if (barcodeInput) {
        barcodeInput.value = barcode;
        barcodeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <>
      <PermissionAwareCrudPage
        resource={RESOURCES.PRODUCT}
        config={productConfig}
        enableDynamicFields={true}
        entityName="products"
      />
      
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
        description="Scan barcode to add to product"
      />
    </>
  );
};

export default ProductCrud;
