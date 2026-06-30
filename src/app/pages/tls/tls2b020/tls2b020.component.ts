import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Service
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS2B020Service } from '../../../service/api/tls/tls2-b020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// UI
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@others/component/table2/table2.component';
import { AccordionModule } from 'primeng/accordion';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls2b020',
  templateUrl: './tls2b020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    MultiSelectComponent,
    TranslateModule,
    Table2Component,
  ],
})
export class TLS2B020Component extends BasicQueryPageComponent<any> implements OnInit {
  private fromLazy = false;
  // 預設上個月 yyyy/MM
  readonly lastMonth: string = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${year}/${month}`;
  })();

  // 下拉
  cashierDistinctionOptions = [
    { value: null, label: '全部' },
    { value: 2, label: '集中' },
    { value: 3, label: '獨立' },
  ];
  overflowStatusOptions = [
    { value: null, label: '全部' },
    { value: 2, label: '溢款' },
    { value: 3, label: '欠款' },
  ];
  cashierOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];

  // 表格資料
  data: any[] = [];
  totalRecords = 0;
  columns: any[] = [];

  // 後端回傳全月合計（給 table2 的總計 / 溢欠顯示用）
  externalTotals: Record<string, number> = {};
  externalTotalFieldMap: Record<string, string> = {};

  // 給 overflowStatusDisplay 用
  columnTotals: Record<string, number> = {};

  // 查詢表單
  queryForm = this.formBuilder.group({
    tlt_building: [null],                         // 館別
    tlt_floor: [[]],                              // 樓層
    TXN_Date: [this.lastMonth, [Validators.required]], // 銷售年/月
    USR_No_List: [[]],                                 // 收銀員
    cashierDistinction: [null],                   // 收銀員區分
    overflowStatus: [null],                       // 溢欠狀態
    ...createPaginationConfig([{ field: 'cashier', order: 1 }]),
    pageSize: [1000],
  });

  constructor(
    private tls2b020Service: TLS2B020Service,
    private dropdownApiService: DropdownApiService,
    private tls11010Service: Tls11010Service,
    public override messageService: NotificationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2B020',
      '/TLS2000/TLS2B020CRU',
      this.queryForm,
      (form) => this.onSubmit(form),
    );

    this.dropdownApiService.queryPos2001().subscribe((res) => {
      this.cashierOptions =
        (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: x.label,
          value: x.value,
        }));
    });
    this.dropdownApiService.querySys3900().pipe(
      map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name })))
    ).subscribe((data) => {
      this.floorOptions = data;
    });
    this.tls11010Service.getBuildingOptions().subscribe((res) => {
      this.BUILDING_NO_Options = res;
    });

    // 欄位（支援雙層表頭：headerRow=1 / 2）
    this.columns = [
      { field: 'building_desc', header: '館別', visible: true, rowspan: true },
      { field: 'floor_desc', header: '樓層', visible: true, rowspan: true },
      { field: 'USR_Name', header: '收銀員代號', visible: true, rowspan: true },

      // 第一列 1–16 日
      { field: 'Day01', header: '1', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day02', header: '2', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day03', header: '3', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day04', header: '4', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day05', header: '5', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day06', header: '6', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day07', header: '7', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day08', header: '8', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day09', header: '9', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day10', header: '10', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day11', header: '11', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day12', header: '12', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day13', header: '13', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day14', header: '14', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day15', header: '15', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day16', header: '16', headerRow: 1, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },

      // 第二列 17–31 日
      { field: 'Day17', header: '17', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day18', header: '18', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day19', header: '19', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day20', header: '20', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day21', header: '21', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day22', header: '22', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day23', header: '23', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day24', header: '24', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day25', header: '25', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day26', header: '26', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day27', header: '27', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day28', header: '28', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day29', header: '29', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day30', header: '30', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
      { field: 'Day31', header: '31', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },

      // 合計
      { field: 'TotalAmt', header: '合計', headerRow: 2, visible: true, style: 'text-right', isTotal: true, format: this.moneyFormat },
    ];
  }

  // 查詢主程式（給查詢按鈕 + lazy 分頁共用）
  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      this.fromLazy = false; // 保險
      return;
    }

    // ✅ 如果不是從 lazy 來的（= 使用者按查詢），就強制回第 1 頁、pageSize=20
    if (!this.fromLazy) {
      this.queryForm.patchValue(
        {
          pageIndex: 1,
          pageSize: 20,
          // 也可以順便把 SortBy 歸回預設，有需要再加
          SortBy: [{ field: 'cashier', order: 1 }],
        } as any,
        { emitEvent: false },
      );
    }

    // 用完旗標後記得清掉
    this.fromLazy = false;

    const payload: any = { ...this.queryForm.value };

    // string trim
    Object.keys(payload).forEach((k) => {
      if (typeof payload[k] === 'string') {
        payload[k] = payload[k].trim() || null;
      }
    });

    // TXN_YYYYMM 可留著給後端用
    if (payload.TXN_Date) {
      const raw = payload.TXN_Date;
      const yyyymm =
        typeof raw === 'string'
          ? raw.substring(0, 7).replace('-', '')
          : `${raw.getFullYear()}${(raw.getMonth() + 1).toString().padStart(2, '0')}`;
      payload.TXN_YYYYMM = yyyymm;
    }

    this.loading = true;
    this.messageService.blockUi();

    this.tls2b020Service.queryTLS2B020(payload).subscribe({
      next: (resp) => {
        // 依你的 API 回傳結構調整，如果是 { Data:{Items,Totals}, TotalCount }
        const core = resp?.Data ?? {};
        const items = core.Items ?? core.items ?? resp?.Data ?? [];

        this.data = items;
        this.totalRecords = resp?.TotalCount ?? items.length;

        // 紀錄查詢狀態（回上頁可還原）
        this.queryStateService.setQueryState(this.ProgNo, payload);

        // 全月合計 Totals（不受分頁影響）
        const t = core.Totals ?? core.totals;
        if (t) {
          this.externalTotals = {
            SumDay01: t.SumDay01 ?? t.sumDay01 ?? 0,
            SumDay02: t.SumDay02 ?? t.sumDay02 ?? 0,
            SumDay03: t.SumDay03 ?? t.sumDay03 ?? 0,
            SumDay04: t.SumDay04 ?? t.sumDay04 ?? 0,
            SumDay05: t.SumDay05 ?? t.sumDay05 ?? 0,
            SumDay06: t.SumDay06 ?? t.sumDay06 ?? 0,
            SumDay07: t.SumDay07 ?? t.sumDay07 ?? 0,
            SumDay08: t.SumDay08 ?? t.sumDay08 ?? 0,
            SumDay09: t.SumDay09 ?? t.sumDay09 ?? 0,
            SumDay10: t.SumDay10 ?? t.sumDay10 ?? 0,
            SumDay11: t.SumDay11 ?? t.sumDay11 ?? 0,
            SumDay12: t.SumDay12 ?? t.sumDay12 ?? 0,
            SumDay13: t.SumDay13 ?? t.sumDay13 ?? 0,
            SumDay14: t.SumDay14 ?? t.sumDay14 ?? 0,
            SumDay15: t.SumDay15 ?? t.sumDay15 ?? 0,
            SumDay16: t.SumDay16 ?? t.sumDay16 ?? 0,
            SumDay17: t.SumDay17 ?? t.sumDay17 ?? 0,
            SumDay18: t.SumDay18 ?? t.sumDay18 ?? 0,
            SumDay19: t.SumDay19 ?? t.sumDay19 ?? 0,
            SumDay20: t.SumDay20 ?? t.sumDay20 ?? 0,
            SumDay21: t.SumDay21 ?? t.sumDay21 ?? 0,
            SumDay22: t.SumDay22 ?? t.sumDay22 ?? 0,
            SumDay23: t.SumDay23 ?? t.sumDay23 ?? 0,
            SumDay24: t.SumDay24 ?? t.sumDay24 ?? 0,
            SumDay25: t.SumDay25 ?? t.sumDay25 ?? 0,
            SumDay26: t.SumDay26 ?? t.sumDay26 ?? 0,
            SumDay27: t.SumDay27 ?? t.sumDay27 ?? 0,
            SumDay28: t.SumDay28 ?? t.sumDay28 ?? 0,
            SumDay29: t.SumDay29 ?? t.sumDay29 ?? 0,
            SumDay30: t.SumDay30 ?? t.sumDay30 ?? 0,
            SumDay31: t.SumDay31 ?? t.sumDay31 ?? 0,
            SumTotalAmt: t.SumTotalAmt ?? t.sumTotalAmt ?? 0,
          };

          this.externalTotalFieldMap = {
            Day01: 'SumDay01',
            Day02: 'SumDay02',
            Day03: 'SumDay03',
            Day04: 'SumDay04',
            Day05: 'SumDay05',
            Day06: 'SumDay06',
            Day07: 'SumDay07',
            Day08: 'SumDay08',
            Day09: 'SumDay09',
            Day10: 'SumDay10',
            Day11: 'SumDay11',
            Day12: 'SumDay12',
            Day13: 'SumDay13',
            Day14: 'SumDay14',
            Day15: 'SumDay15',
            Day16: 'SumDay16',
            Day17: 'SumDay17',
            Day18: 'SumDay18',
            Day19: 'SumDay19',
            Day20: 'SumDay20',
            Day21: 'SumDay21',
            Day22: 'SumDay22',
            Day23: 'SumDay23',
            Day24: 'SumDay24',
            Day25: 'SumDay25',
            Day26: 'SumDay26',
            Day27: 'SumDay27',
            Day28: 'SumDay28',
            Day29: 'SumDay29',
            Day30: 'SumDay30',
            Day31: 'SumDay31',
            TotalAmt: 'SumTotalAmt',
          };

          // 給 overflowStatusDisplay 用（只需要 TotalAmt 即可）
          this.columnTotals = {
            TotalAmt: this.externalTotals['SumTotalAmt'] ?? 0,
          };
        } else {
          this.externalTotals = {};
          this.externalTotalFieldMap = {};
          this.columnTotals = {};
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗，請稍後再試');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  // Table2 的 lazy 分頁事件
  override onLazyLoadData(ev: { pageIndex: number; pageSize: number; SortBy: any[] }): void {
    this.fromLazy = true;  // ✅ 告訴 onSubmit 這次是「分頁」，不要重設頁碼

    this.queryForm.patchValue(
      {
        pageIndex: ev.pageIndex,
        pageSize: ev.pageSize,
        SortBy: ev.SortBy,
      } as any,
      { emitEvent: false },
    );
    this.onSubmit(this.queryForm);
  }
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  private formatAmount(value: number): string {
    return (
      value?.toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) ?? '0'
    );
  }

  // 右下角溢欠顯示：用整體 SumTotalAmt，正為溢付，負為欠收
  get overflowStatusDisplay(): string {
    const rawValue = this.queryForm.get('overflowStatus')?.value;
    const value = rawValue as number | null;

    const net = this.columnTotals['TotalAmt'] ?? 0;
    const overpaid = net > 0 ? net : 0;
    const underpaid = net < 0 ? -net : 0;

    if (value === 3) {
      return `欠收金額：${this.formatAmount(underpaid)} 元`;
    } else if (value === 2) {
      return `溢付金額：${this.formatAmount(overpaid)} 元`;
    } else {
      const showOver = `溢付金額：${this.formatAmount(overpaid)} 元`;
      const showUnder = `欠收金額：${this.formatAmount(underpaid)} 元`;
      return `${showOver}　${showUnder}`;
    }
  }

  onClearForm(): void {
    this.queryForm.reset({
      tlt_building: null,
      tlt_floor: [],
      TXN_Date: this.lastMonth,
      USR_No_List: [],
      cashierDistinction: null,
      overflowStatus: null,
      pageIndex: 1,
      pageSize: 20,
      SortBy: [{ field: 'cashier', order: 1 }],
    } as any);
  }
}
