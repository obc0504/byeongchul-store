const { naverRequest, sleep } = require('./client');

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

// productOrderIds가 300건을 넘으면 300건 단위로 나눠 호출한 뒤 결과를 하나로 합침
async function getProductOrderDetailsBatched(productOrderIds) {
  const BATCH_SIZE = 300;
  const allItems = [];
  for (let i = 0; i < productOrderIds.length; i += BATCH_SIZE) {
    const batch = productOrderIds.slice(i, i + BATCH_SIZE);
    const result = await getProductOrderDetails(batch);
    allItems.push(...(result.data || []));
    if (i + BATCH_SIZE < productOrderIds.length) {
      await sleep(300);
    }
  }
  return { data: allItems };
}

module.exports = {
  getChangedProductOrderIds,
  getProductOrderDetails,
  getProductOrderDetailsBatched,
};
