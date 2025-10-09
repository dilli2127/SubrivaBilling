import { createFetcher } from './useApiActions';
import { DashboardAction, StockAction, RevertStockAction, BranchStockAction, ReportsAction } from './apiEntities';
import { useDispatch } from 'react-redux';

export const useSpecialApiFetchers = () => {
  const dispatch = useDispatch();

  return {
    DashBoard: createFetcher<DashboardAction>("DashBoard")(dispatch),
    StockAvailable: createFetcher<StockAction>("StockAvailable")(dispatch),
    StockRevertFromBranch: createFetcher<RevertStockAction>("StockRevertFromBranch")(dispatch),
    BranchStockAvailable:  createFetcher<BranchStockAction>("BranchStockAvailable")(dispatch),
    Reports: createFetcher<ReportsAction>("Reports")(dispatch),
    // Add more special entities here as needed
  };
}; 