const fs = require('fs');
const path = require('path');

function escapeCsvValue(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows, columns) {
  const header = columns.join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(','));
  return [header, ...lines].join('\n');
}

function writeCsv(filePath, rows, columns) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  // 엑셀이 UTF-8 CSV를 한글 깨짐 없이 열려면 BOM이 필요함
  fs.writeFileSync(filePath, '﻿' + toCsv(rows, columns), 'utf-8');
}

module.exports = { toCsv, writeCsv };
