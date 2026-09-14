require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { getChangedProductOrderIds, getProductOrderDetails } = require('../src/naver/orders');

function toKstIso(date) {
  // Date는 내부적으로 UTC 기준이라, KST 벽시계 값을 만들기 위해 9시간을 더한 뒤
  // UTC getter로 읽어내는 방식으로 변환한다 (그냥 'Z'를 '+09:00'으로 바꾸면 9시간 오차 발생).
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const yyyy = kst.getUTCFullYear();
  const MM = pad(kst.getUTCMonth() + 1);
  const dd = pad(kst.getUTCDate());
  const HH = pad(kst.getUTCHours());
  const mm = pad(kst.getUTCMinutes());
  const ss = pad(kst.getUTCSeconds());
  const SSS = pad(kst.getUTCMilliseconds(), 3);
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}+09:00`;
}

async function main() {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

  console.log(`조회 범위: ${from.toISOString()} ~ ${to.toISOString()}`);

  const changed = await getChangedProductOrderIds({
    from: toKstIso(from),
    to: toKstIso(to),
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
