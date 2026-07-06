import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12020Service } from '@service/api/ass/ass12020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from "@shared/componentkit/calendar-range/calendar-range.component";
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from "@shared/componentkit/input-number-range/input-number-range.component";
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize, forkJoin } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import {
  ASS12020QueryRow,
  QueryASS12020Request,
} from './ass12020.model';

/** 3.1.2.2 詢價登錄作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass12020',
  templateUrl: './ass12020.component.html',
  styleUrl: './ass12020.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputNumberComponent,
    CalendarComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
    InputNumberRangeComponent,
    CalendarRangeComponent
  ],
})
export class ASS12020Component extends BasicQueryPageComponent<ASS12020QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    /** 品項編號 */
    itemCode: [null as string | null],
    /** 商品價格(起) */
    goodsPriceFrom: [null as number | null],
    /** 商品價格(迄) */
    goodsPriceTo: [null as number | null],
    /** 銷售價格(起) */
    salePriceFrom: [null as number | null],
    /** 銷售價格(迄) */
    salePriceTo: [null as number | null],
    /** 品項單位 */
    itemUnit: [null as string | null],
    /** 供應商編號 */
    supplierCode: [null as string | null],
    /** 報價期限(起) */
    expDateFrom: [null as Date | null],
    /** 報價期限(迄) */
    expDateTo: [null as Date | null],
    /** 登錄批號 */
    batchId: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
  });

  itemCodeOptions = this.dropdownApiService.queryASS11040_DropDownList();
  supplierCodeOptions: { value: string; label: string }[] = [];
  itemUnitOptions = getSYS1000Options('UNIT');

  data: ASS12020QueryRow[] = [];
  selectedRows: ASS12020QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'BATCH_ID', header: '登錄批號', visible: true },
    { field: 'SUPPLIER_ID', header: '供應商編號', visible: true },
    { field: 'VENDOR_NAME', header: '供應商名稱', visible: true },
    { field: 'CRT_Date', header: '登錄日期', visible: true, format: formatDate },
    { field: 'EXPDATE', header: '報價期限', visible: true, format: formatDate },
    { field: 'NOTES', header: '說明', visible: true },
  ];

  /** 管理列額外按鈕：匯出 PDF */
  addButton: AddButton[] = [
    {
      label: '匯出 PDF',
      icon: 'pi pi-file-pdf',
      action: (row: ASS12020QueryRow) => this.onExportPDF(row),
      disabled: (row: ASS12020QueryRow) =>
        row.FAQuotationM_ID == null || !this.hasPermission('60'),
    },
  ];

  constructor(
    public readonly ass12020Service: ASS12020Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12020', 'ass/ass12020cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadSupplierOptions();
  }

  loadSupplierOptions(): void {
    this.dropdownApiService
      .queryPos2013({ VEN_Flag: '' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.supplierCodeOptions = res ?? [];
      });
  }

  queryFunction = (body: unknown): ReturnType<ASS12020Service['queryASS12020']> => {
    const raw = this.queryForm.getRawValue();
    const b = body as Record<string, unknown>;
    const payload: QueryASS12020Request = {
      GOODS_ID: raw.itemCode ?? undefined,
      GOODS_PRICE_S: raw.goodsPriceFrom ?? undefined,
      GOODS_PRICE_E: raw.goodsPriceTo ?? undefined,
      SALE_PRICE_S: raw.salePriceFrom ?? undefined,
      SALE_PRICE_E: raw.salePriceTo ?? undefined,
      GOODS_UNIT: raw.itemUnit ?? undefined,
      SUPPLIER_ID: raw.supplierCode ?? undefined,
      EXPDATE_S: raw.expDateFrom ? this.formatDate(raw.expDateFrom) : undefined,
      EXPDATE_E: raw.expDateTo ? this.formatDate(raw.expDateTo) : undefined,
      BATCH_ID: raw.batchId ?? undefined,
      PageSize: (b?.['PageSize'] ?? b?.['pageSize'] ?? 30) as number,
      PageIndex: (b?.['PageIndex'] ?? b?.['pageIndex'] ?? 1) as number,
      SortBy: b?.['SortBy'] as QueryASS12020Request['SortBy'],
      OrderBy: b?.['OrderBy'] as string | undefined,
      Offset: b?.['Offset'] as number | undefined,
      PageNo: b?.['PageNo'] as number | undefined,
      SortDir: b?.['SortDir'] as string | undefined,
    };
    return this.ass12020Service.queryASS12020(payload);
  };

  private formatDate(d: Date | null): string {
    if (!d) return '';
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        GOODS_ID: raw.itemCode ?? undefined,
        GOODS_PRICE_S: raw.goodsPriceFrom ?? undefined,
        GOODS_PRICE_E: raw.goodsPriceTo ?? undefined,
        SALE_PRICE_S: raw.salePriceFrom ?? undefined,
        SALE_PRICE_E: raw.salePriceTo ?? undefined,
        GOODS_UNIT: raw.itemUnit ?? undefined,
        SUPPLIER_ID: raw.supplierCode ?? undefined,
        EXPDATE_S: raw.expDateFrom ? this.formatDate(raw.expDateFrom) : undefined,
        EXPDATE_E: raw.expDateTo ? this.formatDate(raw.expDateTo) : undefined,
        BATCH_ID: raw.batchId ?? undefined,
        PageSize: 30,
        PageIndex: 1,
      };
      this.loading = true;
      this.queryFunction(this.lastQueryBody)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, raw);
          },
        });
    });
  }

  onDelete(selectedItems: ASS12020QueryRow[]): void {
    if (selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要刪除的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const rows = selectedItems.filter(
          row => row.FAQuotationM_ID != null && typeof row.FAQuotationM_ID === 'number'
        );
        if (rows.length === 0) {
          this.messageService.warnBubble('無可刪除的資料');
          return;
        }
        this.loading = true;
        const deletes = rows.map(row =>
          this.ass12020Service.deleteASS12020({ FAQuotationM_ID: row.FAQuotationM_ID! })
        );
        forkJoin(deletes)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: results => {
              const failed = results.filter(r => r.Status !== '0000');
              if (failed.length > 0) {
                this.messageService.errorBubble(
                  '操作失敗：' + (failed[0].Message ?? '部分刪除失敗')
                );
                return;
              }
              this.messageService.successBubble('刪除成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  onExportPDF(row: ASS12020QueryRow): void {
    const id = row.FAQuotationM_ID;
    if (id == null) {
      this.messageService.warnBubble('無法匯出：缺少主鍵');
      return;
    }
    this.ass12020Service
      .exportPDFASS12020({ FAQuotationM_ID: id })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: response => {
          const blob = response.body;
          if (blob && blob.size > 0) {
            const url = globalThis.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `詢價登錄_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            globalThis.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            this.messageService.successBubble('匯出成功');
          } else {
            this.messageService.warnBubble('沒有可匯出的資料');
          }
        },
        error: () => this.messageService.errorBubble('匯出 PDF 失敗'),
      });
  }
}
