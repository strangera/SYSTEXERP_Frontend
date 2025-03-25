import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import { ReportHead } from '../../models/ReportHead';
import { DatePipe } from '@angular/common';
import autoTable from 'jspdf-autotable';

export class BasicPrintComponent {
  BasicPrinting(doc: jsPDF, columns:any[], data: any[], reportHead: ReportHead, datepipe: DatePipe): void {
    // PDF format
    // ----------------------------------------------------------------
    //const doc = new jsPDF('p', 'pt', 'letter'); //'p' 代表緃向頁面，'pt' 為單位, a4:紙張大小
    const now = datepipe.transform(new Date(),  'yyyy/MM/dd HH:mm');
    const systemDate = datepipe.transform(new Date(),  'yyyy/MM/dd');

    //設置字體
    doc.addFont('assets/font/NotoSerifTC-VariableFont_wght.ttf', 'Noto Serif TC', 'normal');
    doc.setFont('Noto Serif TC');

    //重置表頭欄位
    const tablColumns: any[] = [];
    columns.forEach(row => {
      //判斷是否匯出隱藏資料
      if (reportHead.outputvisible) {
        if (row.visible != undefined && row.visible != '' && row.visible == true) {
          tablColumns.push(row.header);
        }
      } else {
        tablColumns.push(row.header);
      }
    });
    //console.log('columns:', tablColumns);

    //重置內容
    const tableRows: any[] = [];
    data.forEach(row => {
      //console.log('row:', row);
      let rowData: any[] = [];
      columns.forEach(col => {
        //判斷是否匯出隱藏資料
        if (reportHead.outputvisible) {
          if (col.visible != undefined && col.visible != '' && col.visible == true) {
            rowData.push(row[col.field]);
          }
        } else {
          rowData.push(row[col.field]);
        }
      })

      tableRows.push(rowData);
    });

		// Create a table using `jspdf-autotable`.
		autoTable(doc, {
			head: [tablColumns],
			body: tableRows,
			startY: 75, // Adjust the `startY` position as needed.
      theme: 'grid', //striped：行背景色交替显示（默认值）, grid：线框形式, plain：无样式
      tableWidth: 'auto', //表格宽度设置, auto：自动撑满整个页面宽度（默认值）, wrap：在内容可以显示完全的情况下，尽可能减小宽度, 具体数值：设置一个指定的宽度（如：200）
      pageBreak: 'auto',  //设置表格跨越多个页面时的行为（是否另起一页）, auto：它只会在下一行不匹配时添加一个新页面（默认值）, always：每个表格将总是在一个新页面上开始, avoid：如果没有足够的空间容纳当前页面上的整个表格，它将在新页面上启动。如果空间足够，则不会添加新页面
      rowPageBreak: 'auto', //Splits rows if they exceed page height
      //showHead:  'everyPage', //设置是否显示表头, everyPage：每一页都显示表头（默认值）, firstPage：仅第一页显示表头, never：每一页都不显示表头
      headStyles: {fillColor: false, lineWidth: 1, fontSize: 12, fontStyle: 'bold', halign:'center', textColor: [41, 128, 185] },
      //bodyStyles: { textColor: [0, 0, 0] },
      //alternateRowStyles: { fillColor: [240, 240, 240] },
      styles: {
        font: 'Noto Serif TC',
        fontSize: 12,
        //cellWidth: 'wrap',
        //overflow: 'linebreak', // Ensures text breaks into lines inside the cell
      },
      didDrawPage: (data) => {
        // Adding a header on each page
        //表頭 start
        doc.setFontSize(12);
        //系統時間
        doc.text(`${now}`, 10, 10);

        //報表名稱
        doc.text(`${reportHead.reporttitle}`, 500, 20, {align: 'center'});
        //系統日期
        doc.text(`系統日期:${systemDate}`, 850, 30);
        //使用者
        doc.text(`使 用 者:${reportHead.exportuser}`, 850, 45);

        //筆數(設定為紅色)
        doc.setTextColor('red');
        doc.text(`共${tableRows.length}筆`, 10, 60);
        //console.log('tableRows:', tableRows);

        //恢復字體為黑色
        doc.setTextColor('black');
        //頁數
        doc.text(`第${data.pageNumber}頁`, 980, 60, {align: 'right'});
        //表頭 end

        },
        margin: { top: 70, left: 10, right: 10},
		});

    // Save the PDF.
    // ----------------------------------------------------------------
    doc.save(`${reportHead.reportname}.pdf`);
  }
}
