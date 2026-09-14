const CSV_COLUMNS = [
  'orderId',
  'productOrderId',
  'orderDate',
  'paymentDate',
  'ordererName',
  'productName',
  'quantity',
  'unitPrice',
  'totalProductAmount',
  'productDiscountAmount',
  'deliveryFeeAmount',
  'totalPaymentAmount',
  'paymentCommission',
  'knowledgeShoppingSellingInterlockCommission',
  'expectedSettlementAmount',
  'productOrderStatus',
  'deliveryStatus',
  'deliveredDate',
];

// 네이버 API 원본 필드명을 그대로 사용 (가공/반올림 없이 원본 수치 그대로)
function mapOrdersToRows(apiResponseData) {
  const items = apiResponseData?.data || [];
  return items.map(({ order, productOrder, delivery }) => ({
    orderId: order.orderId,
    productOrderId: productOrder.productOrderId,
    orderDate: order.orderDate,
    paymentDate: order.paymentDate,
    ordererName: order.ordererName,
    productName: productOrder.productName,
    quantity: productOrder.quantity,
    unitPrice: productOrder.unitPrice,
    totalProductAmount: productOrder.totalProductAmount,
    productDiscountAmount: productOrder.productDiscountAmount,
    deliveryFeeAmount: productOrder.deliveryFeeAmount,
    totalPaymentAmount: productOrder.totalPaymentAmount,
    paymentCommission: productOrder.paymentCommission,
    knowledgeShoppingSellingInterlockCommission:
      productOrder.knowledgeShoppingSellingInterlockCommission,
    expectedSettlementAmount: productOrder.expectedSettlementAmount,
    productOrderStatus: productOrder.productOrderStatus,
    deliveryStatus: delivery?.deliveryStatus ?? '',
    deliveredDate: delivery?.deliveredDate ?? '',
  }));
}

module.exports = { mapOrdersToRows, CSV_COLUMNS };
