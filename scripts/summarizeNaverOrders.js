const path = require('path');
const fs = require('fs');
const { mapOrdersToRows } = require('../src/naver/mapOrdersToRows');
const { writeCsv } = require('../src/lib/csv');
const {
  summarizeByDate,
  summarizeByProduct,
  summarizeByStatus,
  grandTotal,
} = require('../src/naver/aggregate');

// 사용법:
//   node scripts/summarizeNaverOrders.js                     -> output 폴더의 가장 최근 원본 JSON 사용
//   node scripts/summarizeNaverOrders.js path/to/raw.json     -> 특정 파일 지정

function findLatestRawJson(outDir) {
  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.startsWith('naver-orders-raw-') && f.endsWith('.json'))
    .map((f) => ({ f, mtime: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) {
    throw new Error(`${outDir}에 naver-orders-raw-*.json 파일이 없습니다. 먼저 fetchNaverOrders.js를 실행하세요.`);
  }
  return path.join(outDir, files[0].f);
}

function main() {
  const outDir = path.join(__dirname, '..', 'output');
  const inputPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : findLatestRawJson(outDir);

  console.log(`입력 파일: ${inputPath}`);

  const raw = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const rows = mapOrdersToRows(raw);

  console.log(`총 주문건수: ${rows.length}`);

  const byDate = summarizeByDate(rows);
  const byProduct = summarizeByProduct(rows);
  const byStatus = summarizeByStatus(rows);

  // 검산: 일별 합계와 원본 전체 합계가 일치하는지 확인
  const rawTotalPayment = grandTotal(rows, 'totalPaymentAmount');
  const dateSumPayment = byDate.reduce((s, d) => s + d.totalPaymentAmount, 0);
  const productSumPayment = byProduct.reduce((s, d) => s + d.totalPaymentAmount, 0);

  console.log('--- 검산 ---');
  console.log(`원본 합계(totalPaymentAmount): ${rawTotalPayment}`);
  console.log(`일별 요약 합계: ${dateSumPayment} (${dateSumPayment === rawTotalPayment ? '일치' : '불일치!'})`);
  console.log(`상품별 요약 합계: ${productSumPayment} (${productSumPayment === rawTotalPayment ? '일치' : '불일치!'})`);

  const dateColumns = [
    'date',
    'orderCount',
    'totalQuantity',
    'totalProductAmount',
    'totalPaymentAmount',
    'totalExpectedSettlementAmount',
  ];
  const productColumns = [
    'productName',
    'orderCount',
    'totalQuantity',
    'totalProductAmount',
    'totalPaymentAmount',
    'totalExpectedSettlementAmount',
  ];
  const statusColumns = ['productOrderStatus', 'orderCount'];

  const base = path.basename(inputPath).replace('naver-orders-raw-', '').replace('.json', '');

  const dailyPath = path.join(outDir, `summary-daily-${base}.csv`);
  const productPath = path.join(outDir, `summary-product-${base}.csv`);
  const statusPath = path.join(outDir, `summary-status-${base}.csv`);

  writeCsv(dailyPath, byDate, dateColumns);
  writeCsv(productPath, byProduct, productColumns);
  writeCsv(statusPath, byStatus, statusColumns);

  console.log(`일별 요약 저장: ${dailyPath}`);
  console.log(`상품별 요약 저장: ${productPath}`);
  console.log(`상태별 건수 저장: ${statusPath}`);
}

main();
