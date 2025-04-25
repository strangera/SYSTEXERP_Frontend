// excel-worker.worker.ts
import * as XLSX from 'xlsx';

onmessage = (e) => {
  const { dataToExport, exportFilename } = e.data;
  try {
    const ws = XLSX.utils.json_to_sheet(dataToExport);  // 转换数据为 Excel 工作表
    const wb = XLSX.utils.book_new();  // 创建工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');  // 添加工作表

    // 创建 Blob 并传回主线程
    const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    postMessage({ success: true, file: excelFile, exportFilename });
  } catch (error) {
    postMessage({ success: false, error });
  }
};
