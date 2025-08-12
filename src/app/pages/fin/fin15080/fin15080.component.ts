import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN15080Service } from '../../../service/api/fin/fin15080.service';
import { BusinessIdService } from '../../../service/basic/business-id.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { query } from '@angular/animations';
import { QueryYearMonthComponent } from '@shared/componentkit/query-year-month/query-year-month.component';
import { TableModule  } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { ButtonModule } from 'primeng/button'; // ← 若是 standalone，要在 imports 放這個

type Num = number | null;

interface SalesRow {
  code: string;
  item: string;
  taxable: Num;   // 應稅-銷售額
  tax: Num;       // 應稅-稅額
  zeroRate: Num;  // 零稅率銷售額
  exempt: Num;    // 免稅銷售額
}

interface PurchaseRow {
  code: string;
  item: string;
  amount: Num;    // 金額
  tax: Num;       // 稅額
}

@Component({
  selector: 'app-fin15080',
  templateUrl: './fin15080.component.html',
  styleUrls: ['./fin15080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    QueryYearMonthComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent,
    TableModule,
    ButtonModule,  
  ],
})
export class FIN15080Component extends BasicQueryPageComponent<any> {

   meta = {
    uniformNo: '53472305',
    name: '南紡流通事業',
    taxId: '70990223',
    address: '東區東光里中華東路1段366號、396號7樓之1',
    period: '108年01月~02月',
    unit: '新台幣元',
    invoiceCount: 778_995,
  };
  // 銷項
  sales: SalesRow[] = [
    { code: '31', item: '三聯式、電子計算機發票',          taxable: 157_142_407, tax: 7_857_147, zeroRate: 0,      exempt: 116_361 },
    { code: '32', item: '二聯式發票、收銀機發票(二聯式)',     taxable: 28_844_134,  tax: 1_442_207, zeroRate: 0,      exempt: 534_848 },
    { code: '33', item: '(銷)三聯式銷貨退回或折讓證明單',     taxable: 1_058_854,   tax: 52_999,   zeroRate: 0,      exempt: 0 },
    { code: '34', item: '(銷)二聯式銷貨退回或折讓證明單',     taxable: 5_043,       tax: 247,      zeroRate: 0,      exempt: 0 },
    { code: '35', item: '三聯式收據開立—發票',               taxable: 708_354_976, tax: 35_417_708, zeroRate: 2_238, exempt: 640_646 },
    { code: '36', item: '免用統一發票—發票',                 taxable: 0,           tax: 0,        zeroRate: 0,      exempt: 0 },
    { code: '37', item: '特種稅額憑證—證明',                 taxable: 0,           tax: 0,        zeroRate: 0,      exempt: 0 },
    { code: '38', item: '特種稅額退回或折讓—證明',           taxable: 0,           tax: 0,        zeroRate: 0,      exempt: 0 },
  ];

  // 進項
  purchases: PurchaseRow[] = [
    { code: '21', item: '三聯式、電子計算機發票',                           amount: 611_004_661, tax: 30_550_274 },
    { code: '22', item: '載有稅額之其他憑證(包含三聯式收銀機發票)',          amount: 342_103,     tax: 17_094 },
    { code: '23', item: '(進)三聯式進貨退出或折讓證明單',                    amount: 1_364_736,   tax: 68_238 },
    { code: '24', item: '(進)二聯式進貨退出或折讓證明單',                    amount: 0,           tax: 0 },
    { code: '25', item: '三聯式收據—發票',                                   amount: 209_906_243, tax: 10_493_766 },
    // 下列為參考列（展示用途）
    { code: '26', item: '參考：不合格進項（不列入計算）',                    amount: null,        tax: null },
    { code: '27', item: '參考：免稅購貨（不列入計算）',                      amount: null,        tax: null },
    { code: '28', item: '參考：海關完稅憑證（不列入計算）',                  amount: null,        tax: null },
    { code: '29', item: '參考：進項稅額代繳（不列入計算）',                  amount: null,        tax: null },
  ];
    get salesTotals() {
    return {
      taxable: this.sum(this.sales.map(r => r.taxable)),
      tax:     this.sum(this.sales.map(r => r.tax)),
      zeroRate:this.sum(this.sales.map(r => r.zeroRate)),
      exempt:  this.sum(this.sales.map(r => r.exempt)),
    };
  }

  get purchaseTotals() {
    return {
      amount: this.sum(this.purchases.map(r => r.amount)),
      tax:    this.sum(this.purchases.map(r => r.tax)),
    };
  }

private sum(vals: (number | null | undefined)[]): number {
  return vals.reduce<number>((a, v) => a + (v ?? 0), 0);
}


  format(n: number | null | undefined) {
    if (n == null) return '';
    return n.toLocaleString('zh-TW');
  }
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  businessIdOptions: any[] = [];

  queryForm = this.formBuilder.group({
    DeclareYM: [null, Validators.required], // 申報年月
    Business_ID: [null, Validators.required], // 稅籍編號
    ...createPaginationConfig,
  });


  columns = [
    { field: 'SEQ', header: '序號', visible: true },
    { field: 'UNI_NO', header: '統一編號', visible: true },
    { field: 'BUSINESS_NAME', header: '營業人名稱', visible: true },
    { field: 'BUSINESS_ID', header: '稅籍編號', visible: true },
    { field: 'ADDRESS', header: '營業地址', visible: true },
    { field: 'INVOICE_COUNT', header: '使用發票份數', visible: true },
    { field: 'SALE_AMOUNT', header: '應稅(銷售額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TAX_AMOUNT', header: '應稅(稅額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'ZERO_RATE_AMOUNT', header: '零稅率銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'DUTY_FREE_AMOUNT', header: '免稅銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
  ];
columnGroup = [];
  constructor(
    private fin15080Service: FIN15080Service,
    private businessIdService: BusinessIdService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15080',
      '/fin/fin15080cru',
      this.queryForm,
      () => this.onSubmit()
    );

    this.businessIdService.getBusinessIdList().subscribe((data) => {
      this.businessIdOptions = data;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const formValue = this.queryForm.value;

    const payload = {
      DeclareYM: formValue.DeclareYM,
      Business_ID: formValue.Business_ID,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin15080Service.queryFIN15080({ request: payload }).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }



  // 1) 產生 PDF 內容（不要直接存檔，回傳 doc 給三種用途共用）
private async buildPdf(forPrint = false): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginLeft = 14;
  const marginRight = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

// 嵌入字型
await this.embedFont(doc, 'assets/fonts/NotoSansTC-VariableFont_wght.ttf', 'NotoSansTC');
doc.setFont('NotoSansTC', 'normal');


  // 標題
  doc.setFontSize(14);
  doc.text('營業人媒體檔案申報表', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // 抬頭
  doc.setFontSize(10);
  const ln = (t: string, dy = 6) => { doc.text(t, marginLeft, y); y += dy; };
  ln(`統一編號：${this.meta.uniformNo}      營業人名稱：${this.meta.name}      稅籍編號：${this.meta.taxId}`);
  ln(`營業地址：${this.meta.address}`);
  ln(`所屬月份：${this.meta.period}      金額單位：${this.meta.unit}      使用發票份數：${this.format(this.meta.invoiceCount)} 份`);
  y += 2;

  // 銷項表
  const salesHead: RowInput[] = [
    [
      { content: '項次', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: '項目', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
      { content: '應稅', colSpan: 2, styles: { halign: 'center' } },
      { content: '零稅率銷售額', rowSpan: 2, styles: { halign: 'right', valign: 'middle' } },
      { content: '免稅銷售額', rowSpan: 2, styles: { halign: 'right', valign: 'middle' } },
    ],
    [{ content: '銷售額', styles: { halign: 'right' } }, { content: '稅額', styles: { halign: 'right' } }],
  ];
  const salesBody: RowInput[] = this.sales.map(r => [r.code, r.item, this.format(r.taxable), this.format(r.tax), this.format(r.zeroRate), this.format(r.exempt)]);
  const salesFoot: RowInput[] = [[{ content: '合計', colSpan: 2, styles: { halign: 'left' } },
    this.format(this.salesTotals.taxable), this.format(this.salesTotals.tax), this.format(this.salesTotals.zeroRate), this.format(this.salesTotals.exempt)]];
// ── 銷項小標題 ──────────────────────────────
doc.setFontSize(11);
{
  const label = '銷項';
  // (可選) 畫小框
  const tw = doc.getTextWidth(label);
  doc.setLineWidth(0.25);
  doc.setDrawColor(0);
  doc.rect(marginLeft - 2, y - 5.5, tw + 6, 8); // 小框線
  doc.text(label, marginLeft, y);
}
y += 6;  // 留一點間距再放表格
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: salesHead as any,
    body: salesBody,
    foot: salesFoot,
    margin: { left: marginLeft, right: marginRight },
    styles: { font: 'NotoSansTC', fontSize: 9, cellPadding: 2,    lineWidth: 0.2,          
    lineColor: [0, 0, 0],    },
    headStyles: { font: 'NotoSansTC', fontStyle: 'normal', fontSize: 10, fillColor: [230, 230, 250], textColor: [0, 0, 0], halign: 'center' },
    footStyles: { font: 'NotoSansTC', fontStyle: 'normal' }, 
    columnStyles: { 0: { halign: 'center', cellWidth: 16 }, 1: { halign: 'left' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.text(`第 ${data.pageNumber} / ${pageCount} 頁`, pageWidth - marginRight, pageHeight - 8, { align: 'right' });
    },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // 進項表
  const purchaseHead: RowInput[] = [
    [
      { content: '項次', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: '項目', rowSpan: 2, styles: { halign: 'left', valign: 'middle' } },
      { content: '(得扣抵)進項稅額', colSpan: 2, styles: { halign: 'center' } },
    ],
    [{ content: '金額', styles: { halign: 'right' } }, { content: '稅額', styles: { halign: 'right' } }],
  ];
  const purchaseBody: RowInput[] = this.purchases.map(r => [r.code, r.item, this.format(r.amount), this.format(r.tax)]);
  const purchaseFoot: RowInput[] = [[{ content: '合計', colSpan: 2, styles: { halign: 'left' } }, this.format(this.purchaseTotals.amount), this.format(this.purchaseTotals.tax)]];
// ── 進項小標題 ──────────────────────────────
doc.setFontSize(11);
{
  const label = '進項';
  const tw = doc.getTextWidth(label);
  doc.setLineWidth(0.25);
  doc.setDrawColor(0);
  doc.rect(marginLeft - 2, y - 5.5, tw + 6, 8);
  doc.text(label, marginLeft, y);
}
y += 6;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: purchaseHead as any,
    body: purchaseBody,
    foot: purchaseFoot,
    margin: { left: marginLeft, right: marginRight },
    styles: { font: 'NotoSansTC', fontSize: 9, cellPadding: 2 ,    lineWidth: 0.2,          
    lineColor: [0, 0, 0],    },
    footStyles: { font: 'NotoSansTC', fontStyle: 'normal' }, 
    headStyles: { font: 'NotoSansTC', fontStyle: 'normal', fontSize: 10, fillColor: [230, 230, 250], textColor: [0, 0, 0], halign: 'center' },
    columnStyles: { 0: { halign: 'center', cellWidth: 16 }, 1: { halign: 'left' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  if (forPrint) doc.autoPrint(); // ← 打開 PDF 檢視器時自動叫出列印對話框
  return doc;
}

// 2) 下載
async downloadPDF() {
  const doc = await this.buildPdf(false);
  doc.save('營業人媒體檔案申報表.pdf');
}

// 3) 預覽（新視窗開啟）
async previewPDF() {
  const doc = await this.buildPdf(false);
  doc.output('dataurlnewwindow');
}

// 4) 列印（新視窗 + 自動列印）
async printPDF() {
  const doc = await this.buildPdf(true);
  const blob = doc.output('blob') as Blob;
  const blobUrl = URL.createObjectURL(blob); // ← 這裡回傳 string

  const win = window.open(blobUrl);
  if (!win) {
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', width: '0', height: '0', border: '0' });
    iframe.src = blobUrl; // ✅ string
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); // 小清理
    };
  }
}

/** 嵌入字型 */
private async embedFont(doc: jsPDF, url: string, fontName: string) {
  const res = await fetch(url);
  const bytes = new Uint8Array(await res.arrayBuffer());

  // chunked base64
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);

  const fileName = `${fontName}.ttf`;
  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, fontName, 'normal');
  doc.setFont(fontName, 'normal');
}
}
