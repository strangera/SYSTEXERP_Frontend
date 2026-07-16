/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { SortMeta } from 'primeng/api';
import { finalize, Observable } from 'rxjs';

import { TLS51130Service } from '@service/api/tls/tls51130.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@others/component/table/table.model';

// UI
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';

@Component({
  selector: 'app-tls51130',
  templateUrl: './tls51130.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    TranslateModule,
    TableReportComponent,
  ],
})
export class TLS51130Component extends BasicQueryPageComponent<any> implements OnInit {
  // table-report 需要
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  /** table-report：最後一次查詢條件（給排序/捲動載入沿用） */
  lastQueryBody: any = null;

  /** table-report：查詢函式 */
  queryFunction = (body: any): Observable<any> => this.TLS51130Service.queryTLS51130(body);

  // 下拉
  CAT_LOptions: any[] = [];
  LOGOOptions: any[] = [];

  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    CAT_LNo: [''],
    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  // 欄位
  columns: any[] = [
    { field: 'LOGO_No', header: '品牌編號', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },

    { field: 'CAT_LNo', header: '大分類編號', visible: true },
    { field: 'CAT_LName', header: '大分類名稱', visible: true },

    { field: 'CAT_MNo', header: '中分類編號', visible: true },
    { field: 'CAT_MName', header: '中分類名稱', visible: true },

    { field: 'CAT_SNo', header: '小分類編號', visible: true },
    { field: 'CAT_SName', header: '小分類名稱', visible: true },

    { field: 'PLU_OrderPrcRate', header: '進貨折數', visible: true },
    { field: 'DISC_Remark', header: '備註', visible: true },
  ];

  /** 需要的話可加條件：例如某些狀態不可勾選 */
  isRowSelectable = (_row: any) => true;

  constructor(
    private TLS51130Service: TLS51130Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', '/tls/tls51130cru', this.queryForm);

    const combineForOption = (code?: any, name?: any) => {
      const a = (code ?? '').toString().trim();
      const b = (name ?? '').toString().trim();
      return a && b ? `${a}-${b}` : (a || b || '');
    };

    // 大分類下拉：no-name
    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res: any) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item: any) => ({
        label: combineForOption(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });

    // 品牌下拉：no-name
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res: any) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item: any) => ({
        label: combineForOption(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });

    // ✅ 若你希望「從 CRU 回來自動還原 + 自動查」
    // const fromCru = !!(history.state && history.state['fromCru']);
    // if (fromCru) {
    //   const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    //   if (saved) {
    //     this.queryForm.patchValue(saved, { emitEvent: false });
    //     this.onSubmit(this.queryForm);
    //   }
    // }
  }

  /** 排序欄位：目前欄位名稱都是真實 DB 欄位，直接回傳即可 */
  private normalizeSort(sortBy: SortMeta[] | undefined): SortMeta[] {
    return Array.isArray(sortBy) ? sortBy : [];
  }

  /** 去除空字串 -> null */
  private normalizeFormValue(form: FormGroup): any {
    const v: any = { ...form.value };

    Object.keys(v).forEach((key) => {
      if (typeof v[key] === 'string') {
        v[key] = v[key].trim() || null;
      }
    });

    // SortBy
    v.SortBy = this.normalizeSort(v.SortBy);
    if (!v.SortBy || v.SortBy.length === 0) {
      v.SortBy = [{ field: 'LOGO_No', order: 1 }];
    }

    // pageIndex / pageSize 兜底
    v.pageIndex = Number(v.pageIndex) >= 1 ? Number(v.pageIndex) : 1;
    v.pageSize = Number(v.pageSize) > 0 ? Number(v.pageSize) : 30;

    return v;
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    const body = this.normalizeFormValue(form);

    // ✅ 按查詢：回第一頁
    body.pageIndex = 1;
    form.patchValue({ pageIndex: 1 }, { emitEvent: false });

    // ✅ 交給 table-report 用
    this.lastQueryBody = { ...body };

    // ✅ 自己先查一次（畫面立即更新）
    this.loading = true;
    this.messageService.blockUi();

    this.TLS51130Service.queryTLS51130(body)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res: any) => {
          if (res?.Status === '0000') {
            this.data = res?.Data ?? [];
            this.totalRecords = res?.TotalCount ?? this.data.length;

            // ✅ 保存查詢條件（回 CRU 还原用）
            this.queryStateService.setQueryState(this.ProgNo, { ...form.getRawValue() });
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
        },
      });
  }

  /** table-report 的刪除事件：event 可能是 selectedItems 或單筆 row */
  onDelete(event: any): void {
    const ids = this.normalizeIds(event);

    if (!ids.length) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }

    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除選取的 ${ids.length} 筆資料嗎？`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();

        this.TLS51130Service.deleteTLS51130(ids)
          .pipe(finalize(() => this.messageService.unblockUi()))
          .subscribe({
            next: () => {
              this.messageService.successBubble('刪除成功');

              // ✅ 刪完重查（用 lastQueryBody 沿用頁碼/排序）
              if (this.lastQueryBody) {
                this.loading = true;
                this.TLS51130Service.queryTLS51130(this.lastQueryBody)
                  .pipe(finalize(() => (this.loading = false)))
                  .subscribe({
                    next: (res: any) => {
                      if (res?.Status === '0000') {
                        this.data = res?.Data ?? [];
                        this.totalRecords = res?.TotalCount ?? this.data.length;
                      } else {
                        this.data = [];
                        this.totalRecords = 0;
                      }
                    },
                    error: () => {
                      // 不做額外提示，避免刪除成功後又跳錯
                    },
                  });
              } else {
                // 沒查詢條件就清空
                this.data = [];
                this.totalRecords = 0;
              }

              // 清選取
              this.selectedItems = [];
            },
            error: () => {
              this.messageService.errorBubble('刪除失敗');
            },
          });
      },
    });
  }

  /** 將 table-report delete event 正規化為 number[] */
  private normalizeIds(input: any): number[] {
    // 1) 若 table-report 傳 selectedItems array
    if (Array.isArray(input)) {
      return input
        .map((x) => Number(x?.id ?? x?.ID ?? x))
        .filter((n) => Number.isFinite(n));
    }

    // 2) 若傳單筆 row
    const n = Number(input?.id ?? input?.ID ?? input);
    return Number.isFinite(n) ? [n] : [];
  }

  onClear(): void {
    this.submitted = false;

    this.queryForm.reset(
      {
        LOGO_No: '',
        CAT_LNo: '',
        ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
      } as any,
      { emitEvent: false }
    );

    this.queryStateService.clearQueryState(this.ProgNo);

    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }
}
