import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

interface Ass15030MockRow {
  seq: number;
  assetCode: string;
  itemCode: string;
  itemName: string;
  keeperUnit: string;
  usefulYears: number;
  changedUsefulYears: number;
  afterChangedUsefulYears: number;
  purchasedMonths: number;
  postedMonths: number;
  amortizedMonths: number;
  currentYearDepreciation: number;
  propertyRemark: string;
  accountCode: string;
  bigCategoryCode: string;
  midCategoryCode: string;
  smlCategoryCode: string;
  baseYYMM: string;
  purchaseDate: string;
  entryDate: string;
  acquireAmountTotal: number;
  changeAmountTotal: number;
  afterChangeAmountTotal: number;
  reserveResidualValueTotal: number;
  currentDepreciationTotal: number;
  accumulatedDepreciationTotal: number;
  undepreciatedAmountTotal: number;
  currentScrapOrSale: boolean;
  reportType: '1' | '2';
}

//3.1.5.3  財產目錄
@UntilDestroy()
@Component({
  selector: 'app-ass15030',
  templateUrl: './ass15030.component.html',
  styleUrl: './ass15030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, CheckboxModule, ButtonComponent, TableReportComponent, TranslateModule, ButtonModule]
})
export class ASS15030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    paperType: ['1'], // 報表型態 1=折舊前試算 2=拋轉
    accountCode: [null as string | null], // 會計科目代碼
    keeperUnit: [null as string | null], // 保管單位
    purchaseDateFrom: [null as Date | null], // 購入日期(起)
    purchaseDateTo: [null as Date | null], // 購入日期(訖)
    bigCategoryCode: [null as string | null], // 大分類編號
    midCategoryCode: [null as string | null], // 中分類編號
    smlCategoryCode: [null as string | null], // 小分類編號
    entryDateFrom: [null as Date | null], // 入帳日期(起)
    entryDateTo: [null as Date | null], // 入帳日期(訖)
    itemCode: [null as string | null], // 品項編號
    baseYYMM: [null as string | null], // 基準日 YYYYMM
    showReceiveAmount: [false], // 是否顯示取得金額為0 (勾選=true)
    showScrapData: [false], // 是否顯示當期報廢、變賣資料 (勾選=true)
    reportStyle: ['1'], // 報表樣式 1=彙總 2=明細
  });
  data: any[] = [];
  totalRecords = 0;
  readonly tableLoading = signal(false);
  exportExcelLoading = false;
  private allMockRows: Ass15030MockRow[] = [];

  private readonly summaryColumns: any[] = [
    { field: 'seq', header: '項次', visible: true },
    { field: 'itemCode', header: '品項編號', visible: true },
    { field: 'itemName', header: '品項名稱', visible: true },
    { field: 'keeperUnitName', header: '保管單位', visible: true },
    { field: 'acquireAmountTotal', header: '取得價格\n合計', visible: true },
    { field: 'changeAmountTotal', header: '異動價格\n合計', visible: true },
    { field: 'afterChangeAmountTotal', header: '異動後價格\n合計', visible: true },
    { field: 'reserveResidualValueTotal', header: '預留總值\n合計', visible: true },
    { field: 'previousDepreciationAmount', header: '前期折舊金額', visible: true },
    { field: 'currentDepreciationTotal', header: '本期\n折舊金額\n合計', visible: true },
    { field: 'accumulatedDepreciationTotal', header: '累計\n折舊金額\n合計', visible: true },
    { field: 'undepreciatedAmountTotal', header: '未折舊金額\n合計', visible: true },
  ];

  private readonly detailColumns: any[] = [
    { field: 'seq', header: '項次', visible: true },
    { field: 'assetCode', header: '財產編號', visible: true },
    { field: 'itemName', header: '項目名稱', visible: true },
    { field: 'purchaseDate', header: '購入\n日期', visible: true },
    { field: 'entryDate', header: '入帳\n日期', visible: true },
    { field: 'keeperUnitName', header: '保管單位', visible: true },
    { field: 'acquireAmountTotal', header: '取得價格', visible: true },
    { field: 'changeAmountTotal', header: '異動價格', visible: true },
    { field: 'afterChangeAmountTotal', header: '異動後價格', visible: true },
    { field: 'reserveResidualValueTotal', header: '預留\n殘值', visible: true },
    { field: 'usefulYears', header: '耐用\n年數', visible: true },
    { field: 'changedUsefulYears', header: '異動\n耐用\n年數', visible: true },
    { field: 'afterChangedUsefulYears', header: '異動後\n耐用\n年數', visible: true },
    { field: 'purchasedMonths', header: '已購入\n月數', visible: true },
    { field: 'postedMonths', header: '已入帳\n月數', visible: true },
    { field: 'amortizedMonths', header: '已攤提\n月數', visible: true },
    { field: 'currentYearDepreciation', header: '本年\n折舊金額', visible: true },
    { field: 'currentDepreciationTotal', header: '本期\n折舊金額', visible: true },
    { field: 'accumulatedDepreciationTotal', header: '累計\n折舊金額', visible: true },
    { field: 'undepreciatedAmountTotal', header: '未折舊金額', visible: true },
    { field: 'propertyRemark', header: '財產註記', visible: true },
  ];

  columns: any[] = [...this.summaryColumns];

  paperTypeOptions: Option[] = [
    { value: '1', label: '折舊前試算' },
    { value: '2', label: '拋轉' },
  ];
  accountCodeOptions: Option[] = [];
  keeperUnitOptions: Option[] = [];
  bigCategoryCodeOptions: Option[] = [];
  midCategoryCodeOptions: Option[] = [];
  smlCategoryCodeOptions: Option[] = [];
  itemCodeOptions: Option[] = [];
  reportStyleOptions: Option[] = [
    { value: '1', label: '彙總' },
    { value: '2', label: '明細' },
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15030', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
    this.setupCategoryCascade();
    this.seedMockData();
  }

  onSubmit(frm: FormGroup): void {
    // TODO 串接查詢 API
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        try {
          this.columns = this.getColumnsByReportStyle(this.queryForm.controls.reportStyle.value);
          this.data = this.filterMockData();
          this.totalRecords = this.data.length;
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
      paperType: '1',
      accountCode: null,
      keeperUnit: null,
      purchaseDateFrom: null,
      purchaseDateTo: null,
      bigCategoryCode: null,
      midCategoryCode: null,
      smlCategoryCode: null,
      entryDateFrom: null,
      entryDateTo: null,
      itemCode: null,
      baseYYMM: null,
      showReceiveAmount: false,
      showScrapData: false,
      reportStyle: '1',
    });
    this.data = [];
    this.totalRecords = 0;
    this.columns = [...this.summaryColumns];
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
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.keeperUnitOptions = opts ?? []));

    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.bigCategoryCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));
  }

  private setupCategoryCascade(): void {
    this.queryForm.controls.bigCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(bigCode => {
        this.queryForm.patchValue(
          { midCategoryCode: null, smlCategoryCode: null },
          { emitEvent: false },
        );
        this.midCategoryCodeOptions = [];
        this.smlCategoryCodeOptions = [];
        if (!bigCode) return;
        this.dropdownApiService
          .queryFaClass1({ B_CLASS_ID: bigCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.midCategoryCodeOptions = opts ?? []));
      });

    this.queryForm.controls.midCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(midCode => {
        this.queryForm.patchValue({ smlCategoryCode: null }, { emitEvent: false });
        this.smlCategoryCodeOptions = [];
        if (!midCode) return;
        this.dropdownApiService
          .queryFaClass2({ M_CLASS_ID: midCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.smlCategoryCodeOptions = opts ?? []));
      });
  }

  private seedMockData(): void {
    this.allMockRows = [
      {
        seq: 1,
        assetCode: 'FA-2025-0001',
        itemCode: 'A0001',
        itemName: '辦公桌',
        keeperUnit: 'D001',
        usefulYears: 5,
        changedUsefulYears: 0,
        afterChangedUsefulYears: 5,
        purchasedMonths: 12,
        postedMonths: 11,
        amortizedMonths: 11,
        currentYearDepreciation: 8000,
        propertyRemark: '正常使用',
        accountCode: '150101',
        bigCategoryCode: 'A',
        midCategoryCode: 'A01',
        smlCategoryCode: 'A0101',
        baseYYMM: '202601',
        purchaseDate: '2025-01-10',
        entryDate: '2025-01-20',
        acquireAmountTotal: 50000,
        changeAmountTotal: 0,
        afterChangeAmountTotal: 50000,
        reserveResidualValueTotal: 5000,
        currentDepreciationTotal: 1200,
        accumulatedDepreciationTotal: 6800,
        undepreciatedAmountTotal: 43200,
        currentScrapOrSale: false,
        reportType: '1',
      },
      {
        seq: 2,
        assetCode: 'FA-2024-0002',
        itemCode: 'B0002',
        itemName: '筆電',
        keeperUnit: 'D002',
        usefulYears: 3,
        changedUsefulYears: 1,
        afterChangedUsefulYears: 4,
        purchasedMonths: 18,
        postedMonths: 17,
        amortizedMonths: 17,
        currentYearDepreciation: 1800,
        propertyRemark: '已異動耐用年數',
        accountCode: '151201',
        bigCategoryCode: 'C',
        midCategoryCode: 'C01',
        smlCategoryCode: 'C0102',
        baseYYMM: '202602',
        purchaseDate: '2024-08-15',
        entryDate: '2024-08-18',
        acquireAmountTotal: 0,
        changeAmountTotal: 5000,
        afterChangeAmountTotal: 5000,
        reserveResidualValueTotal: 300,
        currentDepreciationTotal: 700,
        accumulatedDepreciationTotal: 2000,
        undepreciatedAmountTotal: 3000,
        currentScrapOrSale: true,
        reportType: '2',
      },
      {
        seq: 3,
        assetCode: 'FA-2023-0003',
        itemCode: 'C0003',
        itemName: '空調主機',
        keeperUnit: 'D001',
        usefulYears: 8,
        changedUsefulYears: 0,
        afterChangedUsefulYears: 8,
        purchasedMonths: 36,
        postedMonths: 35,
        amortizedMonths: 35,
        currentYearDepreciation: 42000,
        propertyRemark: '大型設備',
        accountCode: '152201',
        bigCategoryCode: 'D',
        midCategoryCode: 'D01',
        smlCategoryCode: 'D0101',
        baseYYMM: '202603',
        purchaseDate: '2023-03-01',
        entryDate: '2023-03-05',
        acquireAmountTotal: 150000,
        changeAmountTotal: -10000,
        afterChangeAmountTotal: 140000,
        reserveResidualValueTotal: 10000,
        currentDepreciationTotal: 3500,
        accumulatedDepreciationTotal: 56000,
        undepreciatedAmountTotal: 84000,
        currentScrapOrSale: false,
        reportType: '1',
      },
    ];
  }

  private filterMockData(): any[] {
    const q = this.queryForm.getRawValue();

    const purchaseFrom = this.toDate(q.purchaseDateFrom);
    const purchaseTo = this.toDate(q.purchaseDateTo);
    const entryFrom = this.toDate(q.entryDateFrom);
    const entryTo = this.toDate(q.entryDateTo);

    return this.allMockRows
      .filter(row => !q.paperType || row.reportType === q.paperType)
      .filter(row => !q.accountCode || row.accountCode === q.accountCode)
      .filter(row => !q.keeperUnit || row.keeperUnit === q.keeperUnit)
      .filter(row => !q.bigCategoryCode || row.bigCategoryCode === q.bigCategoryCode)
      .filter(row => !q.midCategoryCode || row.midCategoryCode === q.midCategoryCode)
      .filter(row => !q.smlCategoryCode || row.smlCategoryCode === q.smlCategoryCode)
      .filter(row => !q.itemCode || row.itemCode === q.itemCode)
      .filter(row => !q.baseYYMM || row.baseYYMM === q.baseYYMM)
      .filter(row => {
        const d = this.toDate(row.purchaseDate);
        if (!d) return false;
        if (purchaseFrom && d < purchaseFrom) return false;
        if (purchaseTo && d > purchaseTo) return false;
        return true;
      })
      .filter(row => {
        const d = this.toDate(row.entryDate);
        if (!d) return false;
        if (entryFrom && d < entryFrom) return false;
        if (entryTo && d > entryTo) return false;
        return true;
      })
      .filter(row => (q.showReceiveAmount ? true : row.acquireAmountTotal !== 0))
      .filter(row => (q.showScrapData ? true : !row.currentScrapOrSale))
      .map(row => ({
        ...row,
        keeperUnitName: this.getOptionLabel(this.keeperUnitOptions, row.keeperUnit) || row.keeperUnit,
        previousDepreciationAmount: Math.max(
          0,
          row.accumulatedDepreciationTotal - row.currentDepreciationTotal,
        ),
      }));
  }

  private getColumnsByReportStyle(reportStyle: string | null | undefined): any[] {
    return reportStyle === '2' ? [...this.detailColumns] : [...this.summaryColumns];
  }

  onExportExcel(): void {
    this.exportExcelLoading = true;
    try {
      // TODO: 匯出報表 API
      const payload = {
        query: this.queryForm.getRawValue(),
        columns: this.columns.map(col => col.header),
        data: this.data,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.downloadBlob(blob, `ASS15030_${this.getTimestamp()}.xlsx`);
    } catch {
      this.messageService.errorBubble('檔案匯出失敗，請重試。');
    } finally {
      this.exportExcelLoading = false;
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0')
    );
  }

  private toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getOptionLabel(options: Option[], value: string): string {
    return options.find(x => x.value === value)?.label ?? '';
  }
}
