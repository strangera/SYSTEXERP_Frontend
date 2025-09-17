import { Component, OnInit } from '@angular/core';
import {  FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';

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
    TableComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    AccordionModule,
    ButtonComponent,
  ]
})
export class TLS22010CRUComponent extends BasicCruPageComponent<ITxnData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: ['', Validators.required],
    ECR_No: [''],
    floor_no: [''],
    ...createPaginationConfig([{ field: 'TXN_No', order: 1 }]),
  });

  data: ITxnData[] = [];
  totalRecords = 0;
  selectedItems: ITxnData[] = [];
  columnscru: Column[] = [
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_GUIBegNo', header: '起始發票號' },
    { field: 'TXN_GUIEndNo', header: '結束發票號' },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', format: (v) => this.formatNumber(v) },
    { field: 'sad_preorder_Amt', header: '預購金額', format: (v) => this.formatNumber(v) },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', format: (v) => this.formatNumber(v) },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', format: (v) => this.formatNumber(v) },
    { field: 'GUI_REFUND', header: '折讓 (J)', format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)', format: (v) => this.formatNumber(v) },
  ];


  constructor(
    private apiService: Tls22010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22010', this.queryForm);
    this.onSubmit(this.queryForm);
  }

  onSubmit(frm: FormGroup) {
    const raw = frm.getRawValue();
    const toApiDate = (v: any) => {
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
      PageSize: raw.pageSize ?? 10,
      PageIndex: raw.pageIndex ?? 1,
      SortBy: [{ field: 'TXN_No', order: 1 }],
      TXN_Date: toApiDate(this.rowdata?.TXN_DATE),
      ECR_No: this.rowdata?.ECR_No ?? "",
      floor_no: this.rowdata?.FLOOR_NO ?? ""
    };


    this.loading = true;
    this.apiService.queryTLS22010_Detail(body).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? 0;
        this.loading = false;

        const viewOnly = true;
        if (viewOnly) this.queryForm.disable();
      },
      error: (err) => {
        console.error('查詢失敗:', err);
        this.loading = false;
      }
    });
  }

  /** 千分位格式化 */
  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString('en-US', { maximumFractionDigits: 20 });
  }
}
