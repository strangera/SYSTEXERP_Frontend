import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS55070Service } from '@service/api/tls/tls55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { createPaginationConfig } from '@others/component/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { TableReportComponent } from './table-report/table-report.component';
import { formatAmount2, formatDate, ReportColumn } from './table-report/table-report.model';

/** SP_TLS55070Query_Summary 折扣率彙總列 */
interface TLS55070SummaryRow {
  TXN_Date: string;
  TLT_No: string;
  TLT_Name: string;
  HOS_No: string;
  HOS_NAME: string;
  TXN_TaxType: string;
  TXN_Disc: number;
  DiscRate_100: number;
  DiscRate_95: number;
  DiscRate_90: number;
  DiscRate_80: number;
  DiscRate_Other: number;
  TXN_SaleAmt: number;
}

type SummaryAmtField = 'TXN_Disc' | 'DiscRate_100' | 'DiscRate_95' | 'DiscRate_90' | 'DiscRate_80' | 'DiscRate_Other' | 'TXN_SaleAmt';

/** 依倉別分組的彙總表（對應匯出檔每個 sheet 下方的統計表） */
interface TLS55070SummaryGroup {
  hosName: string;
  rows: TLS55070SummaryRow[];
  total: Record<SummaryAmtField, number>;
}

const SUMMARY_AMT_FIELDS: SummaryAmtField[] = ['TXN_Disc', 'DiscRate_100', 'DiscRate_95', 'DiscRate_90', 'DiscRate_80', 'DiscRate_Other', 'TXN_SaleAmt'];

@Component({
  selector: 'app-tls55070',
  standalone: true,
  templateUrl: './tls55070.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    CheckboxModule,
    ButtonModule,
    InputTextRangeComponent,
    TableReportComponent,
    TableModule,
    AsyncPipe
  ],
})
export class TLS55070Component extends BasicQueryPageComponent<any> implements OnInit {
  btnLoadingExcel = false;
  btnLoadingPDF = false;
  data: any[] = [];
  footerData: any = null;
  totalRecords = 0;
  historyRequestBody: any = null;
  summaryGroups: TLS55070SummaryGroup[] = [];
  readonly summaryAmtFields = SUMMARY_AMT_FIELDS;
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, [Validators.required]],
    TXN_DateEnd: [yesterday, [Validators.required]],
    TXN_SaleNoteNo: [null],
    ECR_No: [null],
    TXN_GUIBegNoStart: [null],
    TXN_GUIBegNoEnd: [null],
    TXN_NoStart: [null, [this.validationService.numberValidator, Validators.maxLength(6)]],
    TXN_NoEnd: [null, [this.validationService.numberValidator, Validators.maxLength(6)]],
    LOGO_No: [null],
    TLT_No: [null],
    HOS_NO: [null],
    USR_No: [null],
    TXN_Status: [null],
    IsShowStatus: ['0'],
    ...createPaginationConfig([{ field: 'TXN_SaleNoteNo', order: 1 }, { field: 'TXN_Date', order: 1 }, { field: 'ECR_No', order: 1 },]),
  });
  columns: ReportColumn[] = [
    { field: 'TXN_SaleNoteNo', header: '銷售單號', width: '11rem', align: 'left' },
    { field: 'TXN_Date', header: '銷售日期', format: formatDate, align: 'left', width: '5rem' },
    { field: 'ECR_No', header: '收銀機號', align: 'left', width: '5rem' },
    { field: 'TLT_No', header: '專櫃編號', align: 'left', width: '5rem' },
    { field: 'tlt_name', header: '櫃位名稱', align: 'left', width: '8rem' },
    { field: 'HOS_NO', header: '倉別', align: 'left', width: '5rem' },
    { field: 'HOS_NAME', header: '倉別名稱', align: 'left', width: '5rem' },
    { field: 'TXN_TaxType', header: '稅別', align: 'left', width: '3rem' },
    { field: 'GUINO', header: '發票號碼', align: 'left', width: '5rem' },
    { field: 'PLU_MagNo', header: '商品管理編號', align: 'left', width: '5rem' },
    { field: 'PLU_NO', header: '國際條碼', align: 'left', width: '8rem' },
    { field: 'PLU_Name', header: '商品名稱', align: 'left', width: '10rem' },
    { field: 'TXN_Qty', header: '數量', align: 'right', width: '3rem' },
    { field: 'TXN_Disc', header: '折讓金額', align: 'right', width: '5rem' },
    { field: 'DiscRate', header: '折扣率', align: 'right', width: '5rem' },
    { field: 'TXN_SaleAmt', header: '單項小計', align: 'right', width: '10rem', format: formatAmount2, isTotal: true, isSubTotal: true, },
  ];
  ECRNoOptions = this.dropdown.queryOwnPOS1002();
  cashierOptions = this.dropdown.queryPos2001();
  logoOptions = this.dropdown.queryPluLogo();
  hosOptions = this.dropdown.queryPos2034();
  txnStatusOptions = [{ value: '1', label: '一般交易' }, { value: '2', label: '一般作廢' }, { value: '3', label: '退貨' },];
  yesNoOptions = [{ value: '0', label: '全部' }, { value: '1', label: '顯示' },];
  CounterOptions: any[] = [];
  constructor(
    public readonly tls55070Service: TLS55070Service,
    private readonly validationService: ValidationService,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS55070');
    this.dropDownListService.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList().subscribe((res) => {
      this.CounterOptions = res?.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No, })) || [];
    });
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = {
        ...form.getRawValue(),
      };
      this.tls55070Service.queryTLS55070(payload).pipe(finalize(() => (this.loading = false)),).subscribe((res: any) => {
        this.data = res?.Data || [];
        this.footerData = { TXN_SaleAmt: res.TotalData };
        this.totalRecords = res?.TotalCount || 0;
        this.historyRequestBody = payload;
        this.summaryGroups = this.buildSummaryGroups(res?.Summary ?? []);
      })
    });
  }

  private buildSummaryGroups(rows: TLS55070SummaryRow[]): TLS55070SummaryGroup[] {
    const map = new Map<string, TLS55070SummaryGroup>();
    for (const row of rows) {
      const key = row.HOS_No ?? '';
      let group = map.get(key);
      if (!group) {
        const total = Object.fromEntries(SUMMARY_AMT_FIELDS.map(f => [f, 0])) as Record<SummaryAmtField, number>;
        group = { hosName: row.HOS_NAME || key, rows: [], total };
        map.set(key, group);
      }
      group.rows.push(row);
      SUMMARY_AMT_FIELDS.forEach(f => group!.total[f] += Number(row[f]) || 0);
    }
    return [...map.values()];
  }

  // === 匯出 Excel ===
  onExportExcel() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls55070Service.exportTLS55070Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoadingExcel = isLoading).subscribe();
  }

  // === 匯出 PDF ===
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls55070Service.exportTLS55070PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoadingPDF = isLoading).subscribe();
  }
}
