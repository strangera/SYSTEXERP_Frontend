import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { QueryStateService } from '../../../shared/service/query-state.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

export interface ITxnData {
  TXN_DATE: string;
  ECR_No: string;
  building_no: string;
  AREA_NO: string;
  FLOOR_NO: string;
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
  SLE_SaleAmt: number;
  TXN_Mode_P: number;
  Status_Code: string;
}

@Component({
  selector: 'app-tls22010-cru',
  templateUrl: './tls22010-cru.component.html',
  styleUrls: ['./tls22010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    AccordionModule,
    ButtonComponent,
    TableReportComponent
  ]
})
export class TLS22010CRUComponent extends BasicCruPageComponent<ITxnData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: ['', Validators.required],
    ECR_No: [''],
    floor_no: [''],
  });

  data: ITxnData[] = [];
  totalRecords = 0;
  selectedItems: ITxnData[] = [];
  footerData: any[] = [];
  historyRequestBody: unknown = null;
  columnscru: ReportColumn[] = [
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUIBegNo', header: '起始發票號', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', visible: true, format: formatAmount },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', visible: true, format: formatAmount },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)', visible: true, format: formatAmount },
  ];


  constructor(
    public readonly tls22010Service: Tls22010Service,
    private queryStateService: QueryStateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22010', this.queryForm);

    // 儲存查詢頁面的數據到 queryStateService，以便返回時能恢復
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    if (state?.['queryConditions']) {
      // 如果從查詢頁面傳過來查詢條件，儲存起來
      this.queryStateService.setQueryState('TLS22010_data', state['queryConditions']);
    }

    this.onSubmit(this.queryForm);
  }

  onSubmit(frm: FormGroup) {
    const raw = frm.getRawValue();
    const toApiDate = (v: Date | string | null | undefined) => {
      if (!v) return null;
      if (v instanceof Date) {
        const y = v.getFullYear();
        const m = String(v.getMonth() + 1).padStart(2, '0');
        const d = String(v.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
      }
      return String(v).replace(/[-/]/g, ''); //轉成 20250801
    };

    const body = {
      PageSize: raw.pageSize ?? 1000,
      PageIndex: raw.pageIndex ?? 1,
      SortBy: [{ field: 'TXN_No', order: 1 }],
      TXN_Date: toApiDate(this.rowdata?.TXN_DATE),
      ECR_No: this.rowdata?.ECR_No ?? "",
      floor_no: this.rowdata?.FLOOR_NO ?? ""
    };


    this.loading = true;
    this.tls22010Service.queryTLS22010_Detail(body).subscribe({
      next: (res) => {
        const dataWrapper = res.Data || res;
        this.data = dataWrapper.queryTLS22010_DetailDataList || [];
        this.totalRecords = this.data.length || 0;
        this.footerData = dataWrapper.queryTLS22010_DetailSum
          ? dataWrapper.queryTLS22010_DetailSum
          : {};

        this.loading = false;
        const viewOnly = true;
        if (viewOnly) this.queryForm.disable();
      },

    });

  }

  exportExcel(): void {
    // 修改日期格式為後端期望的 DateTime 格式
    const toApiDate = (v: Date | string | null | undefined) => {
      if (!v) return null;
      if (v instanceof Date) {
        // 轉換為 ISO 日期格式 (YYYY-MM-DD)
        const y = v.getFullYear();
        const m = String(v.getMonth() + 1).padStart(2, '0');
        const d = String(v.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // 如果是字串，嘗試轉換為 YYYY-MM-DD 格式
      const dateStr = String(v);
      if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
        // 20250801 -> 2025-08-01
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }
      return dateStr; // 其他格式直接返回
    };

    // 使用與查詢明細相同的參數格式
    const body = {
      PageSize: 0, // 匯出全部資料
      PageIndex: 1,
      SortBy: [{ field: 'TXN_No', order: 1 }],
      TXN_Date: toApiDate(this.rowdata?.TXN_DATE),
      ECR_No: this.rowdata?.ECR_No ?? "",
      floor_no: this.rowdata?.FLOOR_NO ?? ""
    };

    this.tls22010Service.exportTLS22010Detail(body).subscribe({
      next: (res: Blob) => {
        if (res.size === 0) {
          alert('匯出失敗：沒有資料可匯出');
          return;
        }
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `收銀機對帳明細_${this.rowdata?.TXN_DATE || 'unknown'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log(' Excel 檔案下載完成');
      },
    });
  }

  exportPDF(): void {
    // 修改日期格式為後端期望的 DateTime 格式
    const toApiDate = (v: Date | string | null | undefined) => {
      if (!v) return null;
      if (v instanceof Date) {
        // 轉換為 ISO 日期格式 (YYYY-MM-DD)
        const y = v.getFullYear();
        const m = String(v.getMonth() + 1).padStart(2, '0');
        const d = String(v.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      // 如果是字串，嘗試轉換為 YYYY-MM-DD 格式
      const dateStr = String(v);
      if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
        // 20250801 -> 2025-08-01
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }
      return dateStr; // 其他格式直接返回
    };

    // 使用與查詢明細相同的參數格式
    const body = {
      PageSize: 0, // 匯出全部資料
      PageIndex: 1,
      SortBy: [{ field: 'TXN_No', order: 1 }],
      TXN_Date: toApiDate(this.rowdata?.TXN_DATE),
      ECR_No: this.rowdata?.ECR_No ?? "",
      floor_no: this.rowdata?.FLOOR_NO ?? ""
    };


    this.tls22010Service.exportTLS22010DetailPDF(body).subscribe({
      next: (res: Blob) => {
        if (res.size === 0) {
          alert('匯出失敗：沒有資料可匯出');
          return;
        }

        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `收銀機對帳明細_${this.rowdata?.TXN_DATE || 'unknown'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      },
    });
  }


}
