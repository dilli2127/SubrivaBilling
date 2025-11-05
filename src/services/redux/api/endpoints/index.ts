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

// Add your custom endpoints here:
// export * from './custom.endpoints';

