import { createFetcher } from './useApiActions';
import type { DashboardAction, StockAction, RevertStockAction, BranchStockAction } from './apiEntities';
import { useDispatch } from 'react-redux';

export const useSpecialApiFetchers = () => {
  const dispatch = useDispatch();

  return {
    DashBoard: createFetcher<DashboardAction>("DashBoard")(dispatch),
    StockAvailable: createFetcher<StockAction>("StockAvailable")(dispatch),
    StockRevertFromBranch: createFetcher<RevertStockAction>("StockRevertFromBranch")(dispatch),
    BranchStockAvailable:  createFetcher<BranchStockAction>("BranchStockAvailable")(dispatch),
    // Add more special entities here as needed
  };
}; 