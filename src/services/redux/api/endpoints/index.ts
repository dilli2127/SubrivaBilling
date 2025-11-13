/**
 * API Endpoints Index
 * 
 * This file exports all API endpoints and their hooks.
 * Add new endpoint modules here to make them available throughout the app.
 * 
 * Usage in components:
 * import { useGetSalesReportQuery, useLoginMutation } from '@/services/redux/api/endpoints';
 */

// Export all endpoint modules
export * from './auth.endpoints';
export * from './dashboard.endpoints';
export * from './reports.endpoints';
export * from './stock.endpoints';
export * from './subscription.endpoints';
export * from './purchaseOrder.endpoints';
export * from './salesReturn.endpoints';
export * from './points.endpoints';

// Add your custom endpoints here:
// export * from './custom.endpoints';

