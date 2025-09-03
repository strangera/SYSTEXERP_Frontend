/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { PaymentTypeService } from '../../../service/basic/payment-type.service';
import { TLS23100Service } from '../../../service/api/tls/tls23100.service';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23100',
  templateUrl: './tls23100.component.html',
  styleUrls: ['./tls23100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ]
})
export class TLS23100Component extends BasicQueryPageComponent<any> {
  // 資料
  data: any[] = [];
  totalRecords = 0;

  // 預設日期（昨天）
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // --- 排序狀態 ---
  sortMeta: any[] = [];
  /** 依需求：ECR_No → TXN_No → tlt_no（皆 ASC） */
  readonly defaultSort: any[] = [
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
    { field: 'tlt_no', order: 1 },
  ];

  /** 去抖動 + 防重複查詢 */
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  /** 後端需要分頁/排序參數 */
  private readonly includePagingAndSorting = true;

  // Request
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday as Date, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No:        [[]],
    TLT_No:        [[]],
    Pay_No:        [[]],
    CRD_No:        [],
    tlt_building:  [],
    tlt_floor:     [[]],
    org_id:        [[]],

    // ✅ 預設帶 ECR_No → TXN_No → tlt_no
    ...createPaginationConfig([
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
      { field: 'tlt_no', order: 1 },
    ]),
  });

  // 下拉選單
  paymentTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  ECRNoOptions: any[] = [];

  constructor(
    private paymentTypeService: PaymentTypeService,
    private tls23100Service: TLS23100Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  // 頁面起始
  ngOnInit(): void {
    this.initializePage('TLS23100', 'tls/tls23100', this.queryForm, (form) => this.onSubmit(form));

    // 初始化 Sort 狀態
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    // 下拉載入
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.paymentTypeService.getPaymentTypes()
      .subscribe((data) => (this.paymentTypeOptions = data));
    this.tls11010Service.getBuildingOptions()
      .subscribe((data) => (this.BUILDING_NO_Options = data));
    this.floorService.getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
  }

  // 欄位
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true, style: 'text-left' },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別', visible: true },
    { field: 'PAY_NAME', header: '付款名稱', visible: true },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (val: number) => (val ?? 0).toLocaleString('en-US') },
  ];

  /** 表格 lazy 事件（分頁/排序） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    // 若排序變更 → 回到第 1 頁
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    // 同步回表單（不觸發 valueChanges）
    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    // 更新表頭排序狀態
    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    // 去重簽章（viewMode 不存在，帶核心參數）
    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    // 只呼叫一次查詢
    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  // 送出查詢
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      // 由 pageIndex/pageSize 推算 Offset（0-based）
      const pageSize  = Number.isFinite(val?.pageSize)  ? Number(val.pageSize)  : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;
      const offset    = Math.max(0, (pageIndex - 1) * pageSize);

      // 🔑 排序：表單 → sortMeta → defaultSort
      const sortByArr = (Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy
        : (this.sortMeta.length ? this.sortMeta : this.defaultSort)
      ).map((s: any) => ({ ...s }));

      const orderBy = sortByArr.length
        ? sortByArr.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

      // 組 payload（保留分頁/排序）
      const payload: any = {
        TXN_DateStart: this.toIso(val?.TXN_DateStart),
        TXN_DateEnd  : this.toIso(val?.TXN_DateEnd),
        ECR_No       : val?.ECR_No,        // 可為陣列或字串，後端自理
        TLT_No       : val?.TLT_No,
        Pay_No       : val?.Pay_No,
        CRD_No       : val?.CRD_No,
        tlt_building : val?.tlt_building,
        tlt_floor    : val?.tlt_floor,
        org_id       : val?.org_id,
      };

      if (this.includePagingAndSorting) {
        Object.assign(payload, {
          pageSize,
          pageIndex,
          Offset:  offset,
          SortBy:  sortByArr,
          ...(orderBy ? { OrderBy: orderBy } : {}),
        });
      }

      // 移除空字串 / null / undefined / 空陣列
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23100Service.queryTLS23100(payload).subscribe({
        next: (res: any) => {
          // 期待：{ Data: [{ totalPayAmt, tLS23100Details: [...] }], TotalCount, ... }
          const data = res?.Data;
          const wrapper = Array.isArray(data) ? data[0] : data;

          const details =
            wrapper?.tLS23100Details ??
            wrapper?.TLS23100Details ??
            wrapper?.tls23100Details ??
            [];

          this.data = Array.isArray(details) ? details : [];

          // 總物件數
          this.totalRecords =
            typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // 工具：將日期轉成本地 ISO（去時區偏移）
  private toIso(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }


}