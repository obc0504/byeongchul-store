require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { getChangedProductOrderIds, getProductOrderDetails } = require('../src/naver/orders');

function isoNoMillis(date) {
  return date.toISOString().split('.')[0] + '+09:00';
}

async function main() {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

  console.log(`조회 범위: ${from.toISOString()} ~ ${to.toISOString()}`);

  const changed = await getChangedProductOrderIds({
    from: isoNoMillis(from),
    to: isoNoMillis(to),
  });

  const productOrderIds = (changed.data?.lastChangeStatuses || []).map(
    (item) => item.productOrderId
  );

  console.log(`변경된 상품주문 건수: ${productOrderIds.length}`);

  if (productOrderIds.length === 0) {
    console.log('변경된 주문이 없습니다.');
    return;
  }

  const details = await getProductOrderDetails(productOrderIds);

  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const rawPath = path.join(outDir, `naver-orders-raw-${Date.now()}.json`);
  fs.writeFileSync(rawPath, JSON.stringify(details, null, 2), 'utf-8');

  console.log(`원본 응답 저장 완료: ${rawPath}`);
  console.log('이 JSON의 실제 필드 구조를 확인한 뒤 CSV 변환 로직을 다음 단계로 추가합니다.');
}

main().catch((err) => {
  console.error('실행 중 오류:', err.response?.data || err.message);
  process.exit(1);
});
