import { useMemo } from 'react';
import { getCurrentUser } from '../../../helpers/auth';
import { useGenericCrudRTK } from '../../../hooks/useGenericCrudRTK';
import { apiSlice } from '../../../services/redux/api/apiSlice';

/**
 * Hook to manage all data fetching for the bill
 * Centralizes all RTK Query hooks and data extraction
 */
export const useBillData = (billdata?: any) => {
  const user = getCurrentUser();
  const branchId = user?.branch_id;
  const organisationId = user?.organisation_id || user?.organisationItems?._id;

  // RTK Query API hooks
  const ProductsApi = useGenericCrudRTK('Product');
  const CustomerApi = useGenericCrudRTK('Customer');
  const VendorApi = useGenericCrudRTK('Vendor');
  const BillingUsersApi = useGenericCrudRTK('BillingUsers');
  const SalesRecord = useGenericCrudRTK('SalesRecord');
  const InvoiceNumberApi = useGenericCrudRTK('InvoiceNumber');

  // Fetch all data
  const {
    data: productListData,
    isLoading: productLoading,
    refetch: refetchProducts,
  } = ProductsApi.useGetAll();

  const {
    data: customerListData,
    isLoading: customerLoading,
    refetch: refetchCustomers,
  } = CustomerApi.useGetAll();

  const {
    data: vendorListData,
    isLoading: vendorLoading,
    refetch: refetchVendors,
  } = VendorApi.useGetAll();

  const {
    data: userListData,
    isLoading: userLoading,
    refetch: refetchUsers,
  } = BillingUsersApi.useGetAll();

  // Stock APIs - conditional based on branch
  const {
    data: stockAuditListData,
    isLoading: stockLoading,
    refetch: refetchStockAudit,
  } = apiSlice.useGetStockAuditQuery({}, { skip: !billdata || !!branchId });

  const {
    data: branchStockListData,
    isLoading: branchStockLoading,
    refetch: refetchBranchStock,
  } = apiSlice.useGetBranchStockQuery({}, { skip: !billdata || !branchId });

  const { data: invoiceNoData, refetch: refetchInvoiceNo } =
    InvoiceNumberApi.useGetAll();

  // Fetch organization data
  const { data: organisationsData } = apiSlice.useGetOrganisationsQuery(
    { organisation_id: organisationId },
    { skip: !organisationId }
  );

  // Fetch settings
  const { data: settingsData } = apiSlice.useGetSettingsQuery(
    { organisation_id: organisationId, page: 1, limit: 1 },
    { skip: !organisationId, refetchOnMountOrArgChange: false }
  );

  // Extract results from API responses
  const productListResult = useMemo(
    () => (Array.isArray(productListData?.result) ? productListData.result : []),
    [productListData]
  );

  const customerListResult = useMemo(
    () => (Array.isArray(customerListData?.result) ? customerListData.result : []),
    [customerListData]
  );

  const vendorListResult = useMemo(
    () => (Array.isArray(vendorListData?.result) ? vendorListData.result : []),
    [vendorListData]
  );

  const userListResult = useMemo(
    () => (Array.isArray(userListData?.result) ? userListData.result : []),
    [userListData]
  );

  const stockAuditListResult = useMemo(
    () => (Array.isArray((stockAuditListData as any)?.result) ? (stockAuditListData as any).result : []),
    [stockAuditListData]
  );

  const branchStockListResult = useMemo(
    () => (Array.isArray((branchStockListData as any)?.result) ? (branchStockListData as any).result : []),
    [branchStockListData]
  );

  const organisationDetails = useMemo(() => {
    const result = (organisationsData as any)?.result;
    if (Array.isArray(result)) return result[0];
    return result || user?.organisationItems || {};
  }, [organisationsData, user]);

  const branchDetails = useMemo(() => user?.branchItems || {}, [user]);

  const settings = useMemo(() => {
    const settingsResult = (settingsData as any)?.result || settingsData || {};
    return Array.isArray(settingsResult) ? settingsResult[0] : settingsResult;
  }, [settingsData]);

  // Mutations
  const { create: createSalesRecord, isLoading: saleCreateLoading } =
    SalesRecord.useCreate();
  const { update: updateSalesRecord, isLoading: saleUpdateLoading } =
    SalesRecord.useUpdate();
  const { create: createInvoiceNumber, isLoading: invoice_no_create_loading } =
    InvoiceNumberApi.useCreate();

  // Refetch all data
  const refetchAllData = () => {
    refetchProducts();
    refetchCustomers();
    refetchVendors();
    refetchUsers();
    if (branchId) {
      refetchBranchStock();
    } else {
      refetchStockAudit();
    }
  };

  return {
    // User & Organization
    user,
    branchId,
    organisationId,
    organisationDetails,
    branchDetails,
    settings,

    // Lists
    productListResult,
    customerListResult,
    vendorListResult,
    userListResult,
    stockAuditListResult,
    branchStockListResult,

    // Loading states
    productLoading,
    customerLoading,
    vendorLoading,
    userLoading,
    stockLoading,
    branchStockLoading,
    saleCreateLoading,
    saleUpdateLoading,
    invoice_no_create_loading,

    // Mutations
    createSalesRecord,
    updateSalesRecord,
    createInvoiceNumber,

    // Refetch functions
    refetchProducts,
    refetchCustomers,
    refetchVendors,
    refetchUsers,
    refetchStockAudit,
    refetchBranchStock,
    refetchInvoiceNo,
    refetchAllData,

    // Invoice number
    invoiceNoData,
  };
};

