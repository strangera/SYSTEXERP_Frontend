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
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

interface Ass15040MockRow {
  seq: number;
  assetCode: string;
  itemCode: string;
  itemName: string;
  enableYears: number;
  purchaseDate: string;
  acquireCost: number;
  reserveResidualValue: number;
  yearBeginAccumulatedDepreciation: number;
  previousDepreciationAmount: number;
  currentDepreciationAmount: number;
  accumulatedDepreciationAmount: number;
  bookValue: number;
  keeperUnit: string;
  propertyRemark: string;
  baseYYMM: string;
  accountCode: string;
}

// 3.1.5.4 財產目錄之會計科目報表
@UntilDestroy()
@Component({
  selector: 'app-ass15040',
  templateUrl: './ass15040.component.html',
  styleUrl: './ass15040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS15040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    baseYYMM: [null as Date | string | null], // 基準日 YYYYMM
    keeperUnit: [null as string | null], // 保管單位
    accountCode: [null as string | null], // 會計科目代碼
    itemCode: [null as string | null], // 品項編號
  });

  data: any[] = [];
  totalRecords = 0;
  readonly tableLoading = signal(false);
  exportExcelLoading = false;
  private allMockRows: Ass15040MockRow[] = [];

  columns: any[] = [
    { field: 'seq', header: '項次', visible: true },
    { field: 'assetCode', header: '財產編號', visible: true },
    { field: 'itemCode', header: '品項編號', visible: true },
    { field: 'itemName', header: '項目名稱', visible: true },
    { field: 'enableYears', header: '啟用\n年數', visible: true },
    { field: 'purchaseDate', header: '購入日期', visible: true },
    { field: 'acquireCost', header: '取得成本', visible: true },
    { field: 'reserveResidualValue', header: '預留殘值', visible: true },
    { field: 'yearBeginAccumulatedDepreciation', header: '年初\n累計折舊', visible: true },
    { field: 'previousDepreciationAmount', header: '前期\n折舊金額', visible: true },
    { field: 'currentDepreciationAmount', header: '本期\n折舊金額', visible: true },
    { field: 'accumulatedDepreciationAmount', header: '累計\n折舊金額', visible: true },
    { field: 'bookValue', header: '帳面價值', visible: true },
    { field: 'keeperUnitName', header: '保管單位', visible: true },
    { field: 'propertyRemark', header: '財產註記', visible: true },
  ];

  keeperUnitOptions: Option[] = [];
  accountCodeOptions: Option[] = [];
  itemCodeOptions: Option[] = [];

  constructor(private readonly dropdownApiService: DropdownApiService) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15040', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
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
      baseYYMM: null,
      keeperUnit: null,
      accountCode: null,
      itemCode: null,
    });
    this.data = [];
    this.totalRecords = 0;
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
      this.downloadBlob(blob, `ASS15040_${this.getTimestamp()}.xlsx`);
    } catch {
      this.messageService.errorBubble('檔案匯出失敗，請重試。');
    } finally {
      this.exportExcelLoading = false;
    }
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.keeperUnitOptions = opts ?? []));

    // 目前無 queryFASAccNoDropDownList，先用 GLS1005 科目下拉代替
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));
  }

  private seedMockData(): void {
    this.allMockRows = [
      {
        seq: 1,
        assetCode: 'FA-2024-1001',
        itemCode: 'A0001',
        itemName: '辦公桌',
        enableYears: 5,
        purchaseDate: '2024-01-10',
        acquireCost: 50000,
        reserveResidualValue: 5000,
        yearBeginAccumulatedDepreciation: 9200,
        previousDepreciationAmount: 1100,
        currentDepreciationAmount: 1200,
        accumulatedDepreciationAmount: 10400,
        bookValue: 39600,
        keeperUnit: 'D001',
        propertyRemark: '正常使用',
        baseYYMM: '202601',
        accountCode: '150101',
      },
      {
        seq: 2,
        assetCode: 'FA-2023-1002',
        itemCode: 'B0002',
        itemName: '筆電',
        enableYears: 3,
        purchaseDate: '2023-08-15',
        acquireCost: 32000,
        reserveResidualValue: 1000,
        yearBeginAccumulatedDepreciation: 12000,
        previousDepreciationAmount: 900,
        currentDepreciationAmount: 950,
        accumulatedDepreciationAmount: 12950,
        bookValue: 19050,
        keeperUnit: 'D002',
        propertyRemark: '資產移轉',
        baseYYMM: '202602',
        accountCode: '151201',
      },
      {
        seq: 3,
        assetCode: 'FA-2022-1003',
        itemCode: 'C0003',
        itemName: '空調主機',
        enableYears: 8,
        purchaseDate: '2022-03-01',
        acquireCost: 150000,
        reserveResidualValue: 10000,
        yearBeginAccumulatedDepreciation: 48000,
        previousDepreciationAmount: 3400,
        currentDepreciationAmount: 3500,
        accumulatedDepreciationAmount: 51500,
        bookValue: 98500,
        keeperUnit: 'D001',
        propertyRemark: '大型設備',
        baseYYMM: '202603',
        accountCode: '152201',
      },
    ];
  }

  private filterMockData(): any[] {
    const q = this.queryForm.getRawValue();
    const baseYYMM = this.toYYYYMM(q.baseYYMM);
    return this.allMockRows.map(row => ({
      ...row,
      keeperUnitName: this.getOptionLabel(this.keeperUnitOptions, row.keeperUnit) || row.keeperUnit,
    }));
  }

  private toYYYYMM(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      const y = value.getFullYear().toString();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    const normalized = String(value).trim().replaceAll('/', '');
    return /^\d{6}$/.test(normalized) ? normalized : null;
  }

  private getOptionLabel(options: Option[], value: string): string {
    return options.find(x => x.value === value)?.label ?? '';
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
}
