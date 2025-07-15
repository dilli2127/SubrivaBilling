/**
 * Centralized bill calculation utility
 * @param items - array of bill items
 * @param productList - product list (for tax/category lookup)
 * @param isGstIncluded - whether GST is included in price
 * @param discount - discount value
 * @param discountType - 'percentage' or 'amount'
 * @returns { totalAmount, totalGST, valueOfGoods, subtotal, itemsWithTax }
 */
export function calculateBillTotals({
  items,
  productList,
  isGstIncluded,
  discount,
  discountType,
}: {
  items: any[];
  productList: any[];
  isGstIncluded: boolean;
  discount: number;
  discountType: "percentage" | "amount";
}) {
  // Calculate item base amounts
  const itemsWithTax = items.map((item) => {
    const product = productList?.find((p: any) => p._id === item.product);
    const taxPercentage = product?.CategoryItem?.tax_percentage || 0;
    const amount =
      Number(item.qty || 0) * Number(item.price || 0) +
      Number(item.loose_qty || 0) *
        (Number(item.price || 0) / (product?.VariantItem?.pack_size || 1) || 0);
    const baseAmount =
      Number(item.qty || 0) * Number(item.price || 0) +
      Number(item.loose_qty || 0) *
        (Number(item.price || 0) / (product?.VariantItem?.pack_size || 1) || 0);
    return {
      ...item,
      tax_percentage: taxPercentage,
      baseAmount,
      amount,
    };
  });

  // sub_total: sum of all item.amount values (table total before discount/GST)
  const sub_total = itemsWithTax.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  // base_sub_total: sum of all item base amounts (before GST and discount)
  const base_sub_total = itemsWithTax.reduce(
    (sum, item) => sum + Number(item.baseAmount),
    0
  );

  // Discount
  let discountValue = 0;
  if (discount > 0) {
    if (discountType === "percentage") {
      discountValue = base_sub_total * (discount / 100);
    } else {
      discountValue = discount;
    }
  }

  // Discounted value of goods

  let total_gst = 0;
  let value_of_goods = 0;
  let total_amount = 0;
  const itemsWithFinalTax = itemsWithTax.map(item => {
    let discountedBase = item.baseAmount;
    if (discount > 0) {
      if (discountType === "percentage") {
        discountedBase = item.baseAmount - (item.baseAmount * (discount / 100));
      } else {
        discountedBase = item.baseAmount - ((discount/base_sub_total)*item.baseAmount);
      }
    }
    let gstAmount = 0;
    if (!isGstIncluded) {
      // GST Excluded: GST is added on top
      gstAmount = discountedBase * (item.tax_percentage / 100);
      value_of_goods += discountedBase;
      total_gst += gstAmount;
      total_amount += discountedBase + gstAmount;
    } else {
      // GST Included: GST is part of the price, extract it
      gstAmount = discountedBase * (item.tax_percentage / (100));
      value_of_goods += discountedBase - gstAmount;
      total_gst += gstAmount;
      total_amount += discountedBase;
    }
    return {
      ...item,
      discountedBase,
      gstAmount,
    };
  });

  return {
    sub_total,
    value_of_goods,
    total_gst,
    total_amount,
    itemsWithTax: itemsWithFinalTax,
    discountValue,
  };
}
