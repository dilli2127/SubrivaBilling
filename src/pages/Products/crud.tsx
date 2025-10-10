import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { createApiRouteGetter } from '../../helpers/Common_functions';
import { dynamic_request, useDynamicSelector } from '../../services/redux';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import BarcodeScanner from '../../components/common/BarcodeScanner';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { Product } from '../../types/entities';
import { getEntityApiRoutes } from '../../helpers/CrudFactory';
import { getCurrentUserRole } from '../../helpers/auth';
import { productsColumns } from './columns';
import { productsFormItems } from './formItems';

const ProductCrud: React.FC = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole?.toLowerCase() === 'superadmin';

  const getApiRouteVariant = createApiRouteGetter('Variant');
  const getApiRouteCategory = createApiRouteGetter('Category');

  const variantRoute = getApiRouteVariant('Get');
  const categoryRoute = getApiRouteCategory('Get');

  const { loading: variantLoading, items: variantItems } = useDynamicSelector(
    variantRoute.identifier
  );
  const { loading: categoryLoading, items: categoryItems } = useDynamicSelector(
    categoryRoute.identifier
  );

  const [scannerVisible, setScannerVisible] = useState(false);
  const [currentForm, setCurrentForm] = useState<any>(null);

  const [variantMap, setVariantMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    [variantRoute, categoryRoute].forEach(route => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [dispatch, variantRoute, categoryRoute]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createMap = (items: any[], labelKey: string) =>
    items.reduce((acc: Record<string, string>, item) => {
      acc[item._id] = item[labelKey];
      return acc;
    }, {});

  useEffect(() => {
    setVariantMap(createMap(variantItems?.result || [], 'variant_name'));
  }, [variantItems]);

  const productConfig = useMemo(() => ({
    title: 'Products',
    columns: productsColumns({ variantMap, isSuperAdmin }),
    formItems: productsFormItems({
      categoryItems,
      variantItems,
      categoryLoading,
      variantLoading,
      isSuperAdmin,
      onScanClick: () => setScannerVisible(true),
      onBarcodeInputFocus: () => setCurrentForm('barcode'),
    }),
    apiRoutes: getEntityApiRoutes('Product'),
    formColumns: 2,
    canEdit: (record: Product) => {
      // If global_product is true, only superadmin can edit
      if (record.global_product) {
        return isSuperAdmin;
      }
      // Otherwise, all users can edit
      return true;
    },
    canDelete: (record: Product) => {
      // If global_product is true, only superadmin can delete
      if (record.global_product) {
        return isSuperAdmin;
      }
      // Otherwise, all users can delete
      return true;
    },
  }), [variantMap, variantItems, categoryItems, variantLoading, categoryLoading, isSuperAdmin]);

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
      <GenericCrudPage
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
