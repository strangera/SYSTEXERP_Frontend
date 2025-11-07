/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';

// 與後端一致：order 用 1 / -1
type ApiSort = { field: string; order: number };

@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
  styleUrl: './tls41020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
    InputTextComponent
  ],
})
export class TLS41020Component
  extends BasicQueryPageComponent<any>
  implements OnInit
{
  selectedItems: any[] = [];
  ECRNoOptions: any[] = [];

  // 初次查詢預設排序（只送 API，不再回灌 table）
  private readonly defaultSort: ApiSort[] = [{ field: 'ECR_No', order: 1 }];

  queryForm = this.formBuilder.group({
    ECR_No: [], // MultiSelect (可多台)
    EDC_No: [],
    EDC_BegDate_From: [],
    EDC_BegDate_To: [],
    EDC_EdnDate_From: [],
    EDC_EdnDate_To: [],
    EDC_Status1: [], // Dropdown (單選)
    EDC_Status2: [],
    ECR_TLT_No: [],
    EDC_IP1: [],
    EDC_IP2: [],
    EDC_IP3: [],
    EDC_TmID1: [],
    EDC_TmID2: [],
    EDC_TmID3: [],
    ...createPaginationConfig, // 內含 PageIndex / PageSize
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    // { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    {
      field: 'EDC_BegDate',
      header: '啟用日期',
      visible: true,
      format: this.formatDateTime,
    },
    {
      field: 'EDC_EndDate',
      header: '停用日期',
      visible: true,
      format: this.formatDateTime,
    },
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_Status2Name', header: '聯合刷卡機狀態', visible: true },
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'ECR_LocNo', header: '地點代號', visible: true },
    { field: 'LOCATION_Name', header: '地點名稱', visible: true },
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
    { field: 'EDC_TmID1', header: '中信刷卡機端末機號', visible: true },
    { field: 'EDC_IP2', header: '聯合刷卡機IP', visible: true },
    { field: 'EDC_TmID2', header: '聯合刷卡機端末機號', visible: true },
  ];

  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  constructor(
    private tls41020Service: TLS41020Service,
    private ECRNoSvc: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', '/tls/tls41020cru', this.queryForm);

    // 收銀機號下拉
    this.ECRNoSvc.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  /** 查詢：回到第一頁，送出預設排序（1/-1），不回灌 table 排序狀態 */
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = this.buildPayload(form, {
      pageIndex: 1,
      pageSize: form.value?.PageSize || 20,
      sort: this.defaultSort,
    });

    this.loading = true;
    this.messageService.blockUi();
    this.tls41020Service.queryTLS41020(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.totalRecords = res?.TotalCount ?? this.data.length ?? 0;
      },
      error: () => this.messageService.errorBubble('查詢失敗'),
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  /**
   * 懶載入（分頁/排序）：
   * 僅「讀取」子元件丟出的參數，不再把排序/分頁回灌給子元件，避免循環。
   */
  override onLazyLoadData(event: any, form: FormGroup): void {
    this.loading = true;

    // TableComponent 會在 goToPage/loadDataLazy 丟出 pageIndex/pageSize/SortBy
    const pageIndex =
      event?.pageIndex ??
      ((event?.first ?? 0) / (event?.rows ?? (form.value?.PageSize || 20)) + 1);

    const pageSize =
      event?.pageSize ?? event?.rows ?? form.value?.PageSize ?? 20;

    let sort: ApiSort[] = this.defaultSort;

    if (Array.isArray(event?.SortBy) && event.SortBy.length) {
      // 直接沿用 TableComponent 傳出的 SortBy（1 / -1）
      sort = event.SortBy.map((m: any) => ({
        field: m.field,
        order: m.order === -1 ? -1 : 1,
      }));
    } else if (Array.isArray(event?.multiSortMeta) && event.multiSortMeta.length) {
      // 兼容：若外層直接用 PrimeNG 事件
      sort = event.multiSortMeta.map((m: any) => ({
        field: m.field,
        order: m.order === -1 ? -1 : 1,
      }));
    } else if (event?.sortField) {
      sort = [{ field: event.sortField, order: event.sortOrder === -1 ? -1 : 1 }];
    }

    const payload = this.buildPayload(form, { pageIndex, pageSize, sort });

    this.tls41020Service.queryTLS41020(payload).subscribe({
      next: (res) => {
        this.data = res?.Data || [];
        this.totalRecords = res?.TotalCount ?? 0;
      },
      error: () => this.messageService.errorBubble('資料載入失敗'),
      complete: () => (this.loading = false),
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  /**
   * 刪除：改用 id 作為鍵值（支援單筆或多筆）
   */
  onDelete(data: any | any[]): void {
    const items = Array.isArray(data) ? data : [data];
    const idList = items
      .map((x) => x?.id)
      .filter((id) => id !== null && id !== undefined);

    if (!idList.length) {
      this.messageService.errorBubble('無法刪除：缺少有效鍵值 (id)');
      return;
    }

    const body = { idList };
    this.tls41020Service.deleteTLS41020(body).subscribe({
      next: (res) => {
        if (res?.Status === '0000') {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm); // 重新查詢
        } else {
          this.messageService.errorBubble(`刪除失敗: ${res?.Message || ''}`);
        }
      },
      error: () => this.messageService.errorBubble('刪除發生錯誤'),
    });
  }

  /** 組 API payload（SortBy 送 1/-1） */
  private buildPayload(
    form: FormGroup,
    opts: { pageIndex: number; pageSize: number; sort: ApiSort[] }
  ) {
    const raw = form.value;

    return {
      ECR_No: raw.ECR_No, // MultiSelect 直接傳陣列
      EDC_No: raw.EDC_No,
      EDC_BegDateStart: raw.EDC_BegDate_From,
      EDC_BegDateEnd: raw.EDC_BegDate_To,
      EDC_EndDateStart: raw.EDC_EdnDate_From,
      EDC_EndDateEnd: raw.EDC_EdnDate_To,

      // Dropdown 單選
      EDC_Status1: raw.EDC_Status1 ?? null,
      EDC_Status2: raw.EDC_Status2 ?? null,

      ECR_TLT_No: raw.ECR_TLT_No,

      EDC_IP1: raw.EDC_IP1,
      EDC_IP2: raw.EDC_IP2,
      EDC_IP3: raw.EDC_IP3,
      EDC_TmID1: raw.EDC_TmID1,
      EDC_TmID2: raw.EDC_TmID2,
      EDC_TmID3: raw.EDC_TmID3,

      SortBy: opts.sort,          // [{ field, order: 1|-1 }]
      PageIndex: opts.pageIndex,  // 1-based
      PageSize: opts.pageSize,
    };
  }

  /** 日期格式化 (yyyy/MM/dd) */
  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}
