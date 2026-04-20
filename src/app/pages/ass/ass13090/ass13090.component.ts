import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

interface Ass13090MockRow {
  id: string;
  amortCode: string;
  itemCode: string;
  purchaseDate: string;
  postingDate: string;
  assetType: string;
  inputAmount: number;
  amortStatus: '已設定攤提' | '未設定攤提';
  /** 未攤提列表：折舊狀態顯示用（如 未設定 → 紅字） */
  depreciationStatus?: string;
  itemName: string;
  inputDate: string;
  assetStatus: string;
  accountCode: string;
  purchaseNo: string;
  amortYearMonth: string;
}

const ASS13090_COLUMNS_CONFIGURED: ReportColumn[] = [
  { field: 'amortCode', header: '攤提代號', visible: true },
  { field: 'itemCode', header: '品項編號', visible: true },
  { field: 'purchaseDate', header: '購入日期', visible: true },
  { field: 'postingDate', header: '入帳日期', visible: true },
  { field: 'assetType', header: '資產類型', visible: true },
  { field: 'inputAmount', header: '購入金額', visible: true },
  { field: 'amortStatus', header: '攤提狀態', visible: true },
];

const ASS13090_COLUMNS_UNAMORTIZED: ReportColumn[] = [
  { field: 'amortCode', header: '攤提代號', visible: true },
  { field: 'itemCode', header: '料項編號', visible: true },
  { field: 'purchaseDate', header: '購入日期', visible: true },
  { field: 'postingDate', header: '入帳日期', visible: true },
  { field: 'assetType', header: '資產類型', visible: true },
  { field: 'inputAmount', header: '購入金額', visible: true },
  {
    field: 'depreciationStatus',
    header: '折舊狀態',
    visible: true,
    cellClass: (row: Ass13090MockRow) => (row.depreciationStatus === '未設定' ? 'text-red-500' : ''),
  },
];

//3.1.3.9 資產攤提作業
@UntilDestroy()
@Component({
  selector: 'app-ass13090',
  templateUrl: './ass13090.component.html',
  styleUrl: './ass13090.component.scss',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextRangeComponent,
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    RadiobuttonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS13090Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    amortCode: [null as string | null], // 攤提代號
    itemCode: [null as string | null], // 品項編號
    inputDateFrom: [null as Date | null], // 輸入日期(起)
    inputDateTo: [null as Date | null], // 輸入日期(訖)
    assetStatus: [null as string | null], // 資產狀態
    assetType: [null as string | null], // 資產類型
    accountCode: [null as string | null], // 會計科目代號
    inputAmountFrom: [null as string | null], // 輸入金額(起)
    inputAmountTo: [null as string | null], // 輸入金額(訖)
    purchaseNo: [null as string | null], // 採購單號
    amortYearMonth: [null as Date | string | null], // 攤提年月 YYYYMM
    conditionFilter: ['1'], // 1:已設定攤提 0:未設定攤提
  });

  data: any[] = [];
  totalRecords = 0;
  readonly tableLoading = signal(false);
  /** 上次查詢成功的條件篩選（用於結果表版型） */
  lastQueriedConditionFilter: string | null = null;
  selectedRows: unknown[] = [];
  exportExcelLoading = false;
  columns: ReportColumn[] = [...ASS13090_COLUMNS_CONFIGURED];
  itemCodeOptions: Option[] = [];
  assetStatusOptions: Option[] = [];
  assetTypeOptions: Option[] = [];
  accountCodeOptions: Option[] = [];
  purchaseNoOptions: Option[] = [];
  conditionFilterOptions: Option[] = [
    { value: '1', label: '已設定攤提' },
    { value: '0', label: '未設定攤提' },
  ];

  constructor(private readonly dropdownApiService: DropdownApiService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13090', 'ass/ass13090cru', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    // TODO: 串接 API
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        try {
          const raw = frm.getRawValue();
          this.data = [
            {
              id: '1',
              amortCode: 'AMT-0001',
              itemCode: 'A0001',
              purchaseDate: '2024/01/10',
              postingDate: '2024/01/20',
              assetType: '資產',
              inputAmount: 50000,
              amortStatus: '已設定攤提',
              depreciationStatus: '已設定',
              itemName: '辦公桌',
              inputDate: '2024/01/05',
              assetStatus: '正常',
              accountCode: '150101',
              purchaseNo: '201410300001',
              amortYearMonth: '202501',
            },
            {
              id: '2',
              amortCode: '1C264300000020000016',
              itemCode: '1C26430000002',
              purchaseDate: '2020/09/01',
              postingDate: '2024/06/12',
              assetType: '資產',
              inputAmount: 39905,
              amortStatus: '未設定攤提',
              depreciationStatus: '未設定',
              itemName: '筆電',
              inputDate: '2023/08/10',
              assetStatus: '停用',
              accountCode: '151201',
              purchaseNo: '201410300002',
              amortYearMonth: '202502',
            },
          ];
          this.totalRecords = this.data.length;
          this.lastQueriedConditionFilter = raw.conditionFilter ?? null;
          this.applyResultTableLayout();
          this.selectedRows = [];
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        } catch {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.warnBubble('查詢失敗，請稍後再試');
        } finally {
          this.loading = false;
          this.tableLoading.set(false);
        }
      },
      v => this.tableLoading.set(v),
    );
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.queryForm.reset({
      amortCode: null,
      itemCode: null,
      inputDateFrom: null,
      inputDateTo: null,
      assetStatus: null,
      assetType: null,
      accountCode: null,
      inputAmountFrom: null,
      inputAmountTo: null,
      purchaseNo: null,
      amortYearMonth: null,
      conditionFilter: '1',
    });
    this.data = [];
    this.totalRecords = 0;
    this.lastQueriedConditionFilter = null;
    this.selectedRows = [];
    this.columns = [...ASS13090_COLUMNS_CONFIGURED];
  }

  /** 條件為「未設定攤提」時：圖示表頭 + 勾選 + 序號連結 + 攤提按鈕 */
  get isUnamortizedResultLayout(): boolean {
    return this.lastQueriedConditionFilter === '0';
  }

  private applyResultTableLayout(): void {
    this.columns =
      this.lastQueriedConditionFilter === '0'
        ? [...ASS13090_COLUMNS_UNAMORTIZED]
        : [...ASS13090_COLUMNS_CONFIGURED];
  }

  onSelectionChange(rows: unknown[]): void {
    this.selectedRows = rows ?? [];
  }

  onBatchAmortize(): void {
    if (!this.selectedRows.length) {
      this.messageService.warnBubble('請先勾選要攤提的資料');
      return;
    }
    // TODO: 接批次攤提 API
    this.messageService.successBubble(`已選取 ${this.selectedRows.length} 筆（攤提 API 待接）`);
  }

  onExportExcel(): void {
    // TODO 串接報表 API
    this.exportExcelLoading = true;
    try {
      const payload = {
        query: this.queryForm.getRawValue(),
        columns: this.columns.map(col => col.header),
        data: this.data,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.downloadBlob(blob, `ASS13090_${this.getTimestamp()}.xlsx`);
    } catch {
      this.messageService.errorBubble('檔案匯出失敗，請重試。');
    } finally {
      this.exportExcelLoading = false;
    }
  }

  override onCreate(): void {
    if (this.hasPermission(this.Actions.Create)) {
      this.navigateWithState(CRUDStatus.Create, null);
    }
  }

  override onEdit(data: any): void {
    if (this.hasPermission(this.Actions.Edit)) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  override onDetail(data: any): void {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetStatusOptions = (list ?? []).map(x => ({
          value: x.No,
          label: x.Name,
        }));
      });

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_TYPE' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetTypeOptions = (list ?? []).map(x => ({
          value: x.No,
          label: `${x.No} - ${x.Name}`,
        }));
      });

    // 目前無 queryFASAccNoDropDownList，先用 GLS1005 科目下拉
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFAASSCHKM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.purchaseNoOptions = opts ?? []));
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private getTimestamp(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}_${hh}${mm}${ss}`;
  }
}
