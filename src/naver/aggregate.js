// 원본 수치 그대로 합산 (반올림/추정 없음). 모든 productOrderStatus를 포함하며
// 취소/반품 여부는 별도 상태별 집계표로 확인할 수 있게 한다.
function summarizeByDate(rows) {
  const map = new Map();
  for (const row of rows) {
    const date = String(row.orderDate).slice(0, 10);
    if (!map.has(date)) {
      map.set(date, {
        date,
        orderCount: 0,
        totalQuantity: 0,
        totalProductAmount: 0,
        totalPaymentAmount: 0,
        totalExpectedSettlementAmount: 0,
      });
    }
    const bucket = map.get(date);
    bucket.orderCount += 1;
    bucket.totalQuantity += row.quantity;
    bucket.totalProductAmount += row.totalProductAmount;
    bucket.totalPaymentAmount += row.totalPaymentAmount;
    bucket.totalExpectedSettlementAmount += row.expectedSettlementAmount;
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function summarizeByProduct(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.productName;
    if (!map.has(key)) {
      map.set(key, {
        productName: key,
        orderCount: 0,
        totalQuantity: 0,
        totalProductAmount: 0,
        totalPaymentAmount: 0,
        totalExpectedSettlementAmount: 0,
      });
    }
    const bucket = map.get(key);
    bucket.orderCount += 1;
    bucket.totalQuantity += row.quantity;
    bucket.totalProductAmount += row.totalProductAmount;
    bucket.totalPaymentAmount += row.totalPaymentAmount;
    bucket.totalExpectedSettlementAmount += row.expectedSettlementAmount;
  }
  return [...map.values()].sort((a, b) => b.totalPaymentAmount - a.totalPaymentAmount);
}

function summarizeByStatus(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.productOrderStatus;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([productOrderStatus, orderCount]) => ({ productOrderStatus, orderCount }))
    .sort((a, b) => b.orderCount - a.orderCount);
}

function grandTotal(rows, field) {
  return rows.reduce((sum, row) => sum + row[field], 0);
}

module.exports = { summarizeByDate, summarizeByProduct, summarizeByStatus, grandTotal };
