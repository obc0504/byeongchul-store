const { naverRequest } = require('./client');

// 네이버 API 제약: lastChangedFrom ~ lastChangedTo 범위는 최대 24시간까지만 조회 가능
async function getChangedProductOrderIds({ from, to, lastChangedType }) {
  const response = await naverRequest({
    method: 'GET',
    path: '/v1/pay-order/seller/product-orders/last-changed-statuses',
    params: {
      lastChangedFrom: from,
      lastChangedTo: to,
      lastChangedType,
    },
  });
  return response.data;
}

// 한 번에 최대 300건까지 조회 가능
async function getProductOrderDetails(productOrderIds) {
  const response = await naverRequest({
    method: 'POST',
    path: '/v1/pay-order/seller/product-orders/query',
    data: { productOrderIds },
  });
  return response.data;
}

module.exports = { getChangedProductOrderIds, getProductOrderDetails };
