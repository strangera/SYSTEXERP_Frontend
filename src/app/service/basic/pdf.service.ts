import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class PdfService {

  exportReportPDF(
    options: {
      orientation?: 'p' | 'l',
      title: string,
      dateStart: string,
      dateEnd: string,
      printedAt: string,
      columns: { header: string, field: string, style?: string, format?: (val: any) => any }[],
      data: any[],
      subtotalFields?: string[],
      summaryText?: string[],
      mergeTotalCols?: number, // ✅ 新增這行
    }
  ): void {
    const {
      orientation = 'p',
      title,
      dateStart,
      dateEnd,
      printedAt,
      columns,
      data,
      subtotalFields = [],
      summaryText = []

    } = options;

    const columnCount = columns.length;
    const columnWidth = 80; // 每欄給 80pt（約28mm）
    const pageWidth = Math.max(595, columnCount * columnWidth); // 最小寬度為 A4 的 595pt

    const doc = new jsPDF({
      orientation: 'l',
      unit: 'pt',
      format: [pageWidth, 842] // 高為 A4 高度 842pt，自訂寬度
    });

    // ✅ 直接使用註冊好的字型
    doc.addFont('assets/fonts/NotoSansTC-VariableFont_wght.ttf', 'Noto Sans TC', 'normal');
    doc.setFont('Noto Sans TC');


    const marginLeft = 40;
    let currentY = 40;

    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    doc.setFontSize(10);
    doc.text(`資料區間：${dateStart} ~ ${dateEnd}`, marginLeft, currentY);
    doc.text(`列印時間：${printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });
    currentY += 20;

    const headers = columns.map(col => col.header);
    const columnStyles: { [key: number]: any } = {};
    columns.forEach((col, index) => {
      let halign: 'left' | 'right' | 'center' = 'center';
      if (col.style === 'text-left') halign = 'left';
      else if (col.style === 'text-right' || subtotalFields.includes(col.field)) halign = 'right';
      columnStyles[index] = { halign };
    });

    const body = data.map((row, rowIndex) => {
      return columns.map(col => {
        if (col.field === '__index') return String(rowIndex + 1); // ✅ 自動產生序號
        const value = col.format ? col.format(row[col.field]) : row[col.field];
        return String(value ?? '');
      });
    });

    const mergeTotalCols = options.mergeTotalCols ?? 0; // 預設不合併

    const totalRow: any[] = [];
    if (mergeTotalCols > 0) {
      totalRow.push({
        content: '總計：',
        colSpan: mergeTotalCols,
        styles: { halign: 'right' },
      });

      for (let i = mergeTotalCols; i < columns.length; i++) {
        const col = columns[i];
        if (subtotalFields.includes(col.field)) {
          const sum = data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
          totalRow.push({ content: sum.toLocaleString(), styles: { halign: 'right' } });
        } else {
          totalRow.push({ content: '', styles: { halign: 'right' } });
        }
      }
    } else {
      // 原本不合併欄的總計邏輯
      columns.forEach(col => {
        if (col.field === '__index') {
          totalRow.push('總計');
        } else if (subtotalFields.includes(col.field)) {
          const sum = data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
          totalRow.push(sum.toLocaleString());
        } else {
          totalRow.push('');
        }
      });
    }


    body.push(totalRow);

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body,
      margin: { left: marginLeft, right: marginLeft },
      tableWidth: 'wrap', // ✅ 重點一：讓表格寬度跟內容一致
      styles: {
        font: 'Noto Sans TC',
        fontSize: 9,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        minCellWidth: 80 // ✅ 重點二：避免欄位縮太小（視欄數調整）
      },
      columnStyles,
      headStyles: {
        font: 'Noto Sans TC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: [212, 222, 254],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      didParseCell(data) {
        const isTotalRow = data.row.index === body.length - 1;
        if (isTotalRow) {
          data.cell.styles.fillColor = [250, 250, 210];
          data.cell.styles.fontStyle = 'normal';
          data.cell.styles.font = 'Noto Sans TC';
        }
      },
    });

    const autoTableDoc = doc as any;
    let summaryY = autoTableDoc.lastAutoTable.finalY + 20;
    if (summaryText.length) {
      doc.setFont('Noto Sans TC');
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      summaryText.forEach(line => {
        doc.text(line, marginLeft, summaryY);
        summaryY += 14;
      });
    }

    doc.save(`${title}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
