import fs from 'fs';
import * as XLSX from 'xlsx';

export function convertXlsToCsv(bufferFile, outputFile, encoding = 'utf-8') {
	const workbook = XLSX.read(bufferFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
	fs.writeFileSync(outputFile, csvData, encoding);
}