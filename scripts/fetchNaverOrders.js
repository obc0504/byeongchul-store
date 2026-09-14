require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {
  getChangedProductOrderIds,
  getProductOrderDetailsBatched,
} = require('../src/naver/orders');
const { mapOrdersToRows, CSV_COLUMNS } = require('../src/naver/mapOrdersToRows');
const { writeCsv } = require('../src/lib/csv');
const {
  toKstIso,
  parseKstDateStart,
  parseKstDateEnd,
  splitInto24hChunks,
} = require('../src/lib/dateRange');

// 사용법:
//   node scripts/fetchNaverOrders.js                        -> 최근 24시간
//   node scripts/fetchNaverOrders.js 2026-09-01 2026-09-14   -> 해당 기간 전체 (자동으로 24시간 단위 분할 조회)
function resolveDateRange(argv) {
  const [, , fromArg, toArg] = argv;
  if (!fromArg) {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    return { from, to };
  }
  const from = parseKstDateStart(fromArg);
  const to = toArg ? parseKstDateEnd(toArg) : parseKstDateEnd(fromArg);
  return { from, to };
}

async function main() {
  const { from, to } = resolveDateRange(process.argv);
  console.log(`조회 범위(KST): ${toKstIso(from)} ~ ${toKstIso(to)}`);

  const chunks = splitInto24hChunks(from, to);
  console.log(`24시간 단위로 ${chunks.length}회 분할 조회합니다.`);

  const productOrderIdSet = new Set();
  for (const [chunkFrom, chunkTo] of chunks) {
    const changed = await getChangedProductOrderIds({
      from: toKstIso(chunkFrom),
      to: toKstIso(chunkTo),
    });
    (changed.data?.lastChangeStatuses || []).forEach((item) =>
      productOrderIdSet.add(item.productOrderId)
    );
  }

  const productOrderIds = [...productOrderIdSet];
  console.log(`변경된 상품주문 건수(중복 제거): ${productOrderIds.length}`);

  if (productOrderIds.length === 0) {
    console.log('변경된 주문이 없습니다.');
    return;
  }

  const details = await getProductOrderDetailsBatched(productOrderIds);

  const outDir = path.join(__dirname, '..', 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const rangeLabel = `${toKstIso(from).slice(0, 10)}_${toKstIso(to).slice(0, 10)}`;

  const rawPath = path.join(outDir, `naver-orders-raw-${rangeLabel}-${Date.now()}.json`);
  fs.writeFileSync(rawPath, JSON.stringify(details, null, 2), 'utf-8');
  console.log(`원본 응답 저장 완료: ${rawPath}`);

  const rows = mapOrdersToRows(details);
  const csvPath = path.join(outDir, `naver-orders-${rangeLabel}-${Date.now()}.csv`);
  writeCsv(csvPath, rows, CSV_COLUMNS);
  console.log(`CSV 저장 완료: ${csvPath} (${rows.length}건)`);
}

main().catch((err) => {
  console.error('실행 중 오류:', err.response?.data || err.message);
  process.exit(1);
});
