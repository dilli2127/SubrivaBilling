import { useMemo } from 'react';
import { calculateBillTotals } from '../../../helpers/amount_calculations';
import { BillItem } from '../../../types/entities';

interface BillSettings {
  isGstIncluded: boolean;
  discount: number;
  discountType: 'percentage' | 'amount';
}

export const useBillCalculations = (
  items: BillItem[],
  productList: any[],
  billSettings: BillSettings
) => {
  const billCalculations = useMemo(() => {
    if (!items.length)
      return {
        sub_total: 0,
        value_of_goods: 0,
        total_gst: 0,
        cgst: 0,
        sgst: 0,
        total_amount: 0,
        discountValue: 0,
      };

    return calculateBillTotals({
      items,
      productList,
      isGstIncluded: billSettings.isGstIncluded,
      discount: billSettings.discount,
      discountType: billSettings.discountType,
    });
  }, [items, productList, billSettings]);

  return billCalculations;
};

