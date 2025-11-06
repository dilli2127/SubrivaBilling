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
  const SalesRecord = useGenericCrudRTK('SalesRecord');
  const InvoiceNumberApi = useGenericCrudRTK('InvoiceNumber');

  // Skip products - will load when modal opens (like Customer/Vendor/User)
  // Selected product data will be stored in bill items for calculations
  const {
    data: productListData,
    isLoading: productLoading,
    refetch: refetchProducts,
  } = apiSlice.useGetProductQuery({}, { skip: true });

  const {
    data: customerListData,
    isLoading: customerLoading,
    refetch: refetchCustomers,
  } = apiSlice.useGetCustomerQuery({}, { skip: true });

  const {
    data: vendorListData,
    isLoading: vendorLoading,
    refetch: refetchVendors,
  } = apiSlice.useGetVendorQuery({}, { skip: true });

  const {
    data: userListData,
    isLoading: userLoading,
    refetch: refetchUsers,
  } = apiSlice.useGetBillingUsersQuery({}, { skip: true });

  // Stock APIs - conditional based on branch
  const {
    data: stockAuditListData,
    isLoading: stockLoading,
    refetch: refetchStockAudit,
  } = apiSlice.useGetStockAuditQuery({}, { skip: !!branchId });

  const {
    data: branchStockListData,
    isLoading: branchStockLoading,
    refetch: refetchBranchStock,
  } = apiSlice.useGetBranchStockQuery({}, { skip: !branchId });

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
    () => (Array.isArray((productListData as any)?.result) ? (productListData as any).result : []),
    [productListData]
  );

  const customerListResult = useMemo(
    () => (Array.isArray((customerListData as any)?.result) ? (customerListData as any).result : []),
    [customerListData]
  );

  const vendorListResult = useMemo(
    () => (Array.isArray((vendorListData as any)?.result) ? (vendorListData as any).result : []),
    [vendorListData]
  );

  const userListResult = useMemo(
    () => (Array.isArray((userListData as any)?.result) ? (userListData as any).result : []),
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

