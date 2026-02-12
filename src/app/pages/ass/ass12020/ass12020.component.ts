import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS12020Service,
  ASS12020QueryRow,
  QueryASS12020Request,
} from '@service/api/ass/ass12020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

/** 3.1.2.2 詢價登錄作業 */
@UntilDestroy()
@Component({
  selector: 'app-ass12020',
  templateUrl: './ass12020.component.html',
  styleUrl: './ass12020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputNumberRangeComponent,
    CalendarRangeQuickComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS12020Component extends BasicQueryPageComponent<ASS12020QueryRow> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    itemCode: [null as string | null], // 品項編號 (QueryFASITEM_DropDownList 未實作前留空)
    supplierCode: [null as string | null], // 供應商編號
    purchaseFrom: [null as number | null], // 品項進價(報價金額) 起
    purchaseTo: [null as number | null], // 品項進價(報價金額) 訖
    singlePriceFrom: [null as number | null], // 品項單價 起
    singlePriceTo: [null as number | null], // 品項單價 訖
    itemUnit: [null as string | null], // 品項單位
    reportFrom: [null as Date | null], // 報價期限 起
    reportTo: [null as Date | null], // 報價期限 訖
    loginBatches: [null as string | null], // 登錄批號
    PageSize: [30],
    PageIndex: [1],
  });

  /** 品項編號下拉 (QueryFASITEM_DropDownList 未實作前為空) */
  itemCodeOptions: { value: string; label: string }[] = [];
  supplierCodeOptions: { value: string; label: string }[] = [];
  itemUnitOptions = getSYS1000Options('UNIT');

  data: ASS12020QueryRow[] = [];
  selectedRows: ASS12020QueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: QueryASS12020Request | null = null;
  columns: ReportColumn[] = [
    { field: 'BATCH_NO', header: '登錄批號', visible: true },
    { field: 'SUPPLIER_ID', header: '供應商編號', visible: true },
    { field: 'LOG_DATE', header: '登錄日期', visible: true },
    { field: 'EXPDATE', header: '報價期限', visible: true },
    { field: 'NOTES', header: '說明', visible: true },
  ];

  constructor(
    public readonly ass12020Service: ASS12020Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12020', 'ass/ass12020cru', this.queryForm, () =>
      this.onSubmit(this.queryForm),
    );
    this.loadSupplierOptions();
  }

  /** 載入供應商下拉 (queryTBLUSER_DropDownList) */
  loadSupplierOptions(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierCodeOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
  }

  /** 查詢函數，供 app-table-report 分頁/排序使用 */
  queryFunction = (body: unknown): ReturnType<ASS12020Service['queryASS12020']> => {
    const raw = this.queryForm.getRawValue();
    const payload: QueryASS12020Request = {
      GOODS_ID: raw.itemCode ?? undefined,
      SUPPLIER_ID: raw.supplierCode ?? undefined,
      PRICE_FROM: raw.purchaseFrom ?? undefined,
      PRICE_TO: raw.purchaseTo ?? undefined,
      UNIT_PRICE_FROM: raw.singlePriceFrom ?? undefined,
      UNIT_PRICE_TO: raw.singlePriceTo ?? undefined,
      GOODS_UNIT: raw.itemUnit ?? undefined,
      EXPDATE_FROM: raw.reportFrom ? this.formatDate(raw.reportFrom) : undefined,
      EXPDATE_TO: raw.reportTo ? this.formatDate(raw.reportTo) : undefined,
      BATCH_NO: raw.loginBatches ?? undefined,
      ...(body as object),
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
        ...raw,
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
    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const idList = selectedItems
          .map(row => row.id)
          .filter((v): v is number => typeof v === 'number');
        if (idList.length === 0) {
          this.messageService.warnBubble('無可刪除的資料');
          return;
        }
        this.ass12020Service
          .deleteASS12020(idList)
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('刪除成功');
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }
}
