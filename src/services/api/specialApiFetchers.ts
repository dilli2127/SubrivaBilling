import { createFetcher } from './useApiActions';
import { DashboardAction, StockAction, RevertStockAction } from './apiEntities';
import { useDispatch } from 'react-redux';

export const useSpecialApiFetchers = () => {
  const dispatch = useDispatch();

  return {
    DashBoard: createFetcher<DashboardAction>("DashBoard")(dispatch),
    StockAvailable: createFetcher<StockAction>("StockAvailable")(dispatch),
    StockRevertFromBranch: createFetcher<RevertStockAction>("StockRevertFromBranch")(dispatch),
    // Add more special entities here as needed
  };
}; 