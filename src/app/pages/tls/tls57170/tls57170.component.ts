/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS57170Data, TLS57170Service } from '@service/api/tls/tls57170.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-tls57170',
  templateUrl: './tls57170.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent
  ]
})
export class TLS57170Component extends BasicQueryPageComponent<TLS57170Data> implements OnInit {
  constructor(
    private tls57170Service: TLS57170Service
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    SYS_StoreNo: [null],                    // 門市編號
    STK_YM: [null, Validators.required],    // 存貨年月 - 必填
    HOS_No: [null],                         // 倉別
    LOGO_No: [null],                        // 品牌
    PLU_MagNo: [null],                      // 商品管理編號
    PLU_No: [null],                         // 國際條碼
    PLU_OrgPLUNo: [null],                   // 廠商貨號
    FeeRate: [null],                        // 推銷費用率
    ...createPaginationConfig([])
  });

  data: TLS57170Data[] = [];
  selectedItems: TLS57170Data[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;

  columns: Column[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'LOGO_No', header: '品牌編號', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'LOGO_CH_NAME', header: '品名', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'Amt_A', header: '期末存貨售價(A)', visible: true, format: formatAmount },
    { field: 'FeeRate_B', header: '推銷費用率(B)', visible: true, format: (val: number) => val != null ? (val * 100).toFixed(2) + '%' : '' },
    { field: 'Amt_C', header: '淨變現價值(C)', visible: true, format: formatAmount },
    { field: 'STK_UnitCost_D', header: '期末成本價(D)', visible: true, format: formatAmount },
    { field: 'UP_PORFIT', header: '回升利益', visible: true, format: formatAmount },
    { field: 'DOWN_COST', header: '跌價損失', visible: true, format: formatAmount },
  ];

  ngOnInit(): void {
    this.initializePage('TLS57170', 'stock/tls/tls57170cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.tls57170Service.queryTLS57170(this.buildQueryPayload(formValue))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (response) => {
            // 根據 API 回傳結構解析資料
            const dataArray = response.Data?.[0];
            this.data = dataArray?.QueryData ?? [];
            this.totalRecords = dataArray?.TotalCount ?? this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, formValue);
          },
          error: () => {
            this.messageService?.warnBubble?.('查詢失敗，請稍後再試。');
          }
        });
    });
  }

  // ========= 匯出 =========
  onExportPDF(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.STK_YM) {
      this.messageService?.warnBubble?.('請輸入存貨年月');
      return;
    }

    this.exportPDFbtnLoading = true;
    this.tls57170Service.exportTLS57170PDF(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '存貨評價分析表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportExcel(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.STK_YM) {
      this.messageService?.warnBubble?.('請輸入存貨年月');
      return;
    }

    this.exportExcelbtnLoading = true;
    this.tls57170Service.exportTLS57170Excel(this.buildQueryPayload(formValue))
      .pipe(untilDestroyed(this), finalize(() => (this.exportExcelbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '存貨評價分析表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生查詢 payload */
  private buildQueryPayload(formValue: any): any {
    return {
      ...formValue,
      STK_YM: this.toYearMonth(formValue.STK_YM),
      FeeRate: formValue.FeeRate != null ? Number(formValue.FeeRate) : undefined,
    };
  }

  // ========= 本地工具 =========
  /** 將 Date 轉換為 YYYY-MM 格式 */
  private toYearMonth(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    if (!resp) {
      this.messageService?.warnBubble?.('匯出失敗，無回應資料。');
      return;
    }
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    if (!blob || !(blob instanceof Blob)) {
      this.messageService?.warnBubble?.('匯出失敗，檔案格式錯誤。');
      return;
    }
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}