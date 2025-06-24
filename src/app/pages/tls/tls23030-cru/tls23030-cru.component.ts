import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';

@Component({
  selector: 'app-tls23030-cru',
  templateUrl: './tls23030-cru.component.html',
  styleUrl: './tls23030-cru.component.scss'
})
export class TLS23030CRUComponent extends BasicCruPageComponent<any> {
  data: any[] = [];
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pdfSummary: string[] = [];
  displayMode: 'SummaryReport' | 'Report' = 'SummaryReport';
  OrganizationCodeOptions: any[] = [
  ];

  dataForm = this.formBuilder.nonNullable.group({});

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res || []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  async ngOnInit(): Promise<void> {
    this.displayMode = 'SummaryReport'; // ✅ for testing
    const state = history.state;
    console.log('✅ Router 傳入的 state:', state);

    if (state?.data) {
      this.data = state.data;
      this.dateStart = state.queryFormValue?.TXN_DateStart || '';
      this.dateEnd = state.queryFormValue?.TXN_DateEnd || '';
      this.printedAt = new Date().toLocaleString('zh-TW');
      this.displayMode = state.queryFormValue?.DisplayMode || 'Report';
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.initializePage('TLS23030', this.dataForm);
  }

  get columns() {
    if (this.displayMode === 'SummaryReport') {
      return [
        {
          header: '銷售日期', field: 'TXN_Date', format: (val: string) => {
            const date = new Date(val);
            return isNaN(date.getTime())
              ? val
              : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
          }
        },

        { header: '專櫃編號', field: 'tlt_no' },
        { header: '櫃位名稱', field: 'tlt_name', style: 'text-left' },
        { header: '付款別', field: 'PAY_NAME', style: 'text-left' },
        {
          header: '金額', field: 'TXN_PayAmt', style: 'text-right',
          format: (val: number) => val?.toLocaleString() || '0'
        },
        {
          field: 'TXN_TaxAlwnc', header: '備抵稅額', style: 'text-right',
          format: (val: number) => val?.toLocaleString() || '0'
        },
        {
          field: 'org_id', header: '組織編號', style: 'text-right',
          format: (val: number) => val?.toLocaleString() || '0'
        }
      ];
    } else {
      return [
        {
          header: '銷售日期', field: 'TXN_Date', format: (val: string) => {
            const date = new Date(val);
            return isNaN(date.getTime())
              ? val
              : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
          }
        },
        { header: '收銀機代號', field: 'ECR_No' },
        { header: '交易序號', field: 'TXN_No' },
        { header: '專櫃編號', field: 'tlt_no' },
        { header: '櫃位名稱', field: 'tlt_name' },
        { header: '交易型態', field: 'TXN_Status' },
        { header: '付款別', field: 'PAY_NAME', style: 'text-left' },
        {
          header: '金額', field: 'TXN_PayAmt', style: 'text-right',
          format: (val: number) => val?.toLocaleString() || '0'
        },
        {
          field: 'TXN_TaxAlwnc', header: '備抵稅額', style: 'text-right',
          format: (val: number) => val?.toLocaleString() || '0'
        },
        { header: '發票號碼', field: 'TXN_GUINo' },
        {
          header: '交易時間',
          field: 'TXN_Time',
          format: (val: string) => {
            if (!val) return '';
            const valStr = typeof val === 'string' ? val : String(val ?? '');
            const date = new Date(`1970-01-01T${valStr.length === 5 ? valStr : valStr.slice(0, 5)}`);
            if (!isNaN(date.getTime())) {
              const hh = date.getHours().toString().padStart(2, '0');
              const mm = date.getMinutes().toString().padStart(2, '0');
              return `${hh}:${mm}`;
            }
            // 若 val 已經是 HH:mm 格式
            if (/^\d{2}:\d{2}$/.test(val)) return val;
            // 若 val 是 Date string
            const d = new Date(val);
            if (!isNaN(d.getTime())) {
              const hh = d.getHours().toString().padStart(2, '0');
              const mm = d.getMinutes().toString().padStart(2, '0');
              return `${hh}:${mm}`;
            }
            return val;
          }
        },
        { header: '信用卡類別', field: 'CRD_Type' },
        { header: '信用卡卡號/條碼', field: 'CRD_No' },
        {
          field: 'IsHaveTERM_No',
          header: '是否分期',
          visible: true,
          format: (val: any) => val === 'Y' ? '是' : val === 'N' ? '否' : val
        },
        { header: '會員卡號', field: 'TXN_MemCard' },
        { field: 'org_id', header: '組織編號', visible: true },
        { field: 'org_id', header: '組織名稱', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.OrganizationCodeOptions) },
      ];
    }
  }
  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  goBack(): void {
    this.location.back();
  }

  printPage(): void {
    window.print();
  }

  exportSummaryPDF(): void {
    const columns = this.columns;
    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '銷售報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns,
      data: this.data,
      subtotalFields: this.displayMode === 'SummaryReport' ? ['sum', 'TXN_Net', 'TXN_Tax'] : [],
      summaryText: [],
      mergeTotalCols: this.displayMode === 'SummaryReport' ? 5 : 0
    });
  }

  exportSummaryExcel(): void {
    import('xlsx').then(xlsx => {
      const exportData = this.data.map(row => {
        const obj: any = {};
        this.columns.forEach(col => {
          obj[col.header] = row[col.field];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, this.displayMode === 'SummaryReport' ? '銷售總額' : '交易明細');
      xlsx.writeFile(wb, `銷售報表_${new Date().toISOString()}.xlsx`);
    });
  }


} 