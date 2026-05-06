import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15080Service } from '@service/api/fin/fin15080.service';
import { FIN15090Service } from '@service/api/fin/fin15090.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import {
  Column,
  formatDateTime,
  formatYYYYMM,
} from '../../../shared/componentkit/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

const today = new Date();
let invoiceYear = today.getFullYear();
let invoiceMonth = today.getMonth() + 1;

if (invoiceMonth % 2 !== 0) {
  invoiceMonth += 1;

  if (invoiceMonth > 12) {
    invoiceMonth = 1;
    invoiceYear += 1;
  }
}

export const invoiceDate =
  invoiceYear.toString() + invoiceMonth.toString().padStart(2, '0');

interface REP_TaxNo_list {
  No: string;
  Label: string;
  STO_Status: string;
  STO_TaxNo: string;
  STO_TaxName: string;
  REP_BegGUIYM?: string;
  REP_EndGUIYM?: string;
}

export interface TDS1002 {
  id: number;
  STO_No: string;
  REP_GUIYM: string;
  REP_DataType?: string | null;
  REP_Uniform?: string | null;
  REP_Times?: string | null;
  REP_TaxNo: string;
  REP_OrgCode?: string | null;
  REP_MonthType?: string | null;
  REP_CityCode?: string | null;
  REP_TaxName?: string | null;
  REP_ManagerName?: string | null;
  REP_Addr?: string | null;
  REP_GuiCnt?: number | null;
  REP_SalSAmt_31?: number | null;
  REP_SalSAmt_35?: number | null;
  REP_SalSAmt_32?: number | null;
  REP_SalSAmt_36?: number | null;
  REP_SalSAmt_RE?: number | null;
  REP_SalSAmt_Sum?: number | null;
  REP_SalTaxAmt_31?: number | null;
  REP_SalTaxAmt_35?: number | null;
  REP_SalTaxAmt_32?: number | null;
  REP_SalTaxAmt_36?: number | null;
  REP_SalTaxAmt_RE?: number | null;
  REP_SalTaxAmt_Sum?: number | null;
  REP_SalZeoTaxAmt_31?: number | null;
  REP_SalZeoTaxAmt_35?: number | null;
  REP_SalZeoTaxAmt_32?: number | null;
  REP_SalZeoTaxAmt_36?: number | null;
  REP_SalZeoTaxAmt_RE?: number | null;
  REP_SalZeoTaxAmt_Sum?: number | null;
  REP_SalNoTaxAmt_31?: number | null;
  REP_SalNoTaxAmt_35?: number | null;
  REP_SalNoTaxAmt_32?: number | null;
  REP_SalNoTaxAmt_36?: number | null;
  REP_SalNoTaxAmt_RE?: number | null;
  REP_SalNoTaxAmt_Sum?: number | null;
  REP_SalSPSAmt_25?: number | null;
  REP_SalSPSAmt_15?: number | null;
  REP_SalSPSAmt_2?: number | null;
  REP_SalSPSAmt_5?: number | null;
  REP_SalSPSAmt_1?: number | null;
  REP_SalSPSAmt_No?: number | null;
  REP_SalSPSAmt_RE?: number | null;
  REP_SalSPSAmt_Sum?: number | null;
  REP_SalSPTax_25?: number | null;
  REP_SalSPTax_15?: number | null;
  REP_SalSPTax_2?: number | null;
  REP_SalSPTax_5?: number | null;
  REP_SalSPTax_1?: number | null;
  REP_SalSPTax_RE?: number | null;
  REP_SalSPTax_Sum?: number | null;
  REP_SalTotalSaleAmt?: number | null;
  REP_SalLand?: number | null;
  REP_SalAssets?: number | null;
  REP_PurAmt_f21?: number | null;
  REP_PurAmt_f25?: number | null;
  REP_PurAmt_f22?: number | null;
  REP_PurAmt_f28?: number | null;
  REP_PurAmt_fRE?: number | null;
  REP_PurTax_f21?: number | null;
  REP_PurTax_f25?: number | null;
  REP_PurTax_f22?: number | null;
  REP_PurTax_f28?: number | null;
  REP_PurTax_fRE?: number | null;
  REP_PurAmt_c21?: number | null;
  REP_PurAmt_c25?: number | null;
  REP_PurAmt_c22?: number | null;
  REP_PurAmt_c28?: number | null;
  REP_PurAmt_cRE?: number | null;
  REP_PurTax_c21?: number | null;
  REP_PurTax_c25?: number | null;
  REP_PurTax_c22?: number | null;
  REP_PurTax_c28?: number | null;
  REP_PurTax_cRE?: number | null;
  REP_PurAmt_fSum?: number | null;
  REP_PurTax_fSum?: number | null;
  REP_PurAmt_cSum?: number | null;
  REP_PurTax_cSum?: number | null;
  REP_PurfTotalSaleAmt?: number | null;
  REP_PurcTotalSaleAmt?: number | null;
  REP_NotToCounteractRate?: number | null;
  REP_ToCounteractTax?: number | null;
  REP_PurImportNoTax?: number | null;
  REP_PurBuyExternal?: number | null;
  REP_PurBuyExternal75?: number | null;
  REP_PurBuyExternal76?: number | null;
  REP_TaxSum01?: number | null;
  REP_TaxSum02?: number | null;
  REP_TaxSum03?: number | null;
  REP_TaxSum04?: number | null;
  REP_TaxSum05?: number | null;
  REP_TaxSum06?: number | null;
  REP_TaxSum07?: number | null;
  REP_TaxSum08?: number | null;
  REP_TaxSum09?: number | null;
  REP_TaxSum10?: number | null;
  REP_TaxSum11?: number | null;
  REP_TaxSum12?: number | null;
  REP_TaxSum13?: number | null;
  REP_TaxSum14?: number | null;
  REP_TaxSum15?: number | null;
  REP_NoPublishInvoice?: number | null;
  CanDel: boolean;
}

@Component({
  selector: 'app-fin15090',
  templateUrl: './fin15090.component.html',
  styleUrls: ['./fin15090.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN15090Component
  extends BasicQueryPageComponent<TDS1002>
  implements OnInit {

  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]],
    STO_No: [
      this.authService.getUserInfo()?.SYS_StoreNo ?? null,
      [Validators.required],
    ],
    REP_GUIYM: [invoiceDate, [Validators.required, Validators.maxLength(6)]],
    REP_TaxNo: ['' as string, [Validators.required, Validators.maxLength(10)]],
  });

  // 控制畫面是否顯示
  pageReady = false;

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: TDS1002[] = [];
  selectedRows: TDS1002[] = [];

  REP_TaxNo_Options: REP_TaxNo_list[] = [];

  columns: Column[] = [
    { field: 'REP_GUIYM', header: '資料所屬年月', visible: true, format: formatYYYYMM },
    { field: 'REP_OrgCode', header: '總繳代號', visible: true },
    { field: 'REP_PurAmt_fSum', header: '進貨及費用金額合計', visible: true },
    { field: 'REP_PurAmt_cSum', header: '固定資產金額合計', visible: true },
    { field: 'REP_PurImportNoTax', header: '進口免稅貨物', visible: true },
    { field: 'REP_PurBuyExternal', header: '購買國外勞務給付額', visible: true },
    { field: 'REP_TaxSum08', header: '上期(月)累積留抵稅額', visible: true },
    { field: 'REP_TaxSum13', header: '得退稅限額合計', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
  ];

  constructor(
    private fin15090Service: FIN15090Service,
    private fin15080Service: FIN15080Service,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    // 一開始先隱藏畫面
    this.pageReady = false;
    this.initializePage('FIN15090', '/FIN/FIN15090cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOption();
  }

  private loadOption(): void {
    const mid = Number(this.authService.getUserInfo()?.mid ?? 0);
    const STO_No = String(this.authService.getUserInfo()?.SYS_StoreNo ?? '');

    this.pageReady = false;
    this.loading = true;

    this.fin15080Service
      .getStoTaxNoOptions({
        mid,
        STO_No,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.pageReady = true;
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (rows) => {
          this.REP_TaxNo_Options = this.buildTaxNoOptions(rows);

          const active =
            this.REP_TaxNo_Options.find(
              (x) => String(x.STO_Status).trim() === '1'
            ) ?? this.REP_TaxNo_Options[0];

          if (active) {
            this.queryForm.controls.REP_TaxNo.setValue(active.No);
          }
        },
        error: (err) => {
          console.error('取得稅籍編號下拉失敗:', err);
          this.REP_TaxNo_Options = [];
          this.messageService.errorBubble('稅籍編號清單取得失敗');
        },
      });
  }

  private buildTaxNoOptions(rows: any[]): REP_TaxNo_list[] {
    const map = new Map<string, REP_TaxNo_list>();

    rows.forEach((x) => {
      const taxNo = String(x?.STO_TaxNo ?? '').trim();
      const taxName = String(x?.STO_TaxName ?? '').trim();
      const status = String(x?.STO_Status ?? '').trim();

      if (!taxNo) return;

      const option: REP_TaxNo_list = {
        Label: `${taxNo}-${taxName}`,
        No: taxNo,
        STO_Status: status,
        STO_TaxNo: taxNo,
        STO_TaxName: taxName,
        REP_BegGUIYM: String(x?.REP_BegGUIYM ?? '').trim(),
        REP_EndGUIYM: String(x?.REP_EndGUIYM ?? '').trim(),
      };

      const exists = map.get(taxNo);

      if (!exists) {
        map.set(taxNo, option);
        return;
      }

      if (status === '1') {
        map.set(taxNo, option);
      }
    });

    return Array.from(map.values());
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      };

      console.log('營業人媒體檔案遞送單 request', body);

      this.loading = true;

      this.fin15090Service
        .PrintFIN15090(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              const printURL = response.Data?.printURL;

              if (printURL) {
                const url = printURL.startsWith('http')
                  ? printURL
                  : environment.BaseUrl + printURL;

                window.open(url, '_blank');
              }
            }

            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
    });
  }

  onDelete(selectedRows: TDS1002[]): void {
    const ids = selectedRows.map((row) => row.id);
  }
}