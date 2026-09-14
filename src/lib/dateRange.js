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

// 'YYYY-MM-DD' 문자열을 KST 자정(00:00:00.000) 기준 Date로 해석
function parseKstDateStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  // KST 자정 = UTC 기준 전날 15:00 이므로, UTC로 만든 뒤 -9시간
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - 9 * 60 * 60 * 1000;
  return new Date(utcMs);
}

// 'YYYY-MM-DD' 문자열을 KST 그 날 23:59:59.999 기준 Date로 해석
function parseKstDateEnd(dateStr) {
  const start = parseKstDateStart(dateStr);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

// 네이버 API 제약(최대 24시간 범위)에 맞춰 [from, to] 구간을 24시간 단위로 분할
function splitInto24hChunks(from, to) {
  const MAX_MS = 24 * 60 * 60 * 1000;
  const chunks = [];
  let chunkStart = from;
  while (chunkStart < to) {
    const chunkEnd = new Date(Math.min(chunkStart.getTime() + MAX_MS, to.getTime()));
    chunks.push([chunkStart, chunkEnd]);
    chunkStart = chunkEnd;
  }
  return chunks;
}

module.exports = { toKstIso, parseKstDateStart, parseKstDateEnd, splitInto24hChunks };
