/// <reference lib="webworker" />
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

addEventListener('message', ({ data }) => {
  const { columns, data: tableData, reportHead } = data;
  // 創建 PDF 文件
  const doc = new jsPDF('l', 'pt', [1000, 1500]); // 'l' 代表橫向頁面
  doc.addFont('assets/font/NotoSerifTC-VariableFont_wght.ttf', 'Noto Serif TC', 'normal');
  doc.setFont('Noto Serif TC');

  // 設置每列的最大寬度
  const columnStyles: any = {};
  columns.forEach((col: any) => {
    if (col.field === 'someField') {
      columnStyles[col.field] = { cellWidth: 'auto' }; // 根據實際情況設置最大寬度
    }
  });
  // 使用 jsPDF 的 autotable 插件生成表格
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: 75,
    theme: 'striped', // 增加條紋背景使得表格內容更清晰
    tableWidth: 'auto',
    pageBreak: 'auto',
    rowPageBreak: 'auto',
    columnStyles, // 添加欄位最大寬度設置
    headStyles: {
      fillColor: [41, 128, 185],
      lineWidth: 1,
      fontSize: 12,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [255, 255, 255]
    },
    styles: {
      font: 'Noto Serif TC',
      fontSize: 10,  // 可以縮小字體大小，適應更多欄位
      cellPadding: 5,
    },
    didDrawPage: (data) => {
      // 每頁繪製完成後添加頁眉與頁腳
      doc.setFontSize(12);

      // 設置當前時間，左對齊
      doc.text(`${reportHead.exporttime}`, 10, 10);

      // 計算標題的X軸位置，使報表標題居中顯示
      const pageWidth = doc.internal.pageSize.width;  // 獲取頁面寬度
      const fontSize = doc.internal.pageSize.height / 50;  // 獲取當前字體大小
      const titleWidth = doc.getStringUnitWidth(reportHead.reporttitle || '') * fontSize;  // 標題的寬度
      const titleX = (pageWidth - titleWidth) / 2;  // 計算標題的X軸位置
      doc.text(reportHead.reporttitle || '', titleX, 20);

      // 設置系統日期和使用者，右對齊
      doc.text(`系統日期:${reportHead.systemtime}`, pageWidth - 10, 30, { align: 'right' });
      doc.text(`使 用 者:${reportHead.exportuser}`, pageWidth - 10, 45, { align: 'right' });

      // 顯示總筆數，並設置為紅色
      doc.setTextColor('red');
      doc.text(`共${tableData.length}筆`, 10, 60);

      // 設置頁碼，右對齊
      doc.setTextColor('black');
      doc.text(`第${data.pageNumber}頁`, pageWidth - 10, 60, { align: 'right' });
    },
    margin: { top: 70, left: 10, right: 10 },
  });
  // 回傳 PDF Blob
  const pdfBlob = doc.output('blob');
  postMessage(pdfBlob);
});
