import * as XLSX from 'xlsx';

export const exportToExcel = (rows, fileName, sheetName = 'Dữ liệu') => {
  if (!rows || rows.length === 0) {
    throw new Error('Không có dữ liệu để xuất');
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
