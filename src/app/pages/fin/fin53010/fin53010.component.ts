import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, tap } from 'rxjs';
import { FIN53010Data, FIN53010Payload } from './fin53010.model';

@Component({
  selector: 'app-fin53010',
  templateUrl: './fin53010.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    TableComponent,
  ],
})
export class FIN53010Component extends BasicQueryPageComponent<FIN53010Data> implements OnInit {

  public readonly multiSortMeta = [{ field: 'id', order: 1 }];

  public readonly queryForm = this.formBuilder.group({
    VouNoStart: new FormControl<number | void>(void 0),
    VouNoEnd: new FormControl<number | void>(void 0),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>('3'),
    VouDateStart: new FormControl<Date | void>(void 0),
    VouDateEnd: new FormControl<Date | void>(void 0),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    Remark: new FormControl<string | void>(void 0),
    /** 傳票型態(SYS1000.VoucherType) (多選) */
    VoucherType: new FormControl<string[]>([]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CrtDateStart: new FormControl<Date | void>(void 0),
    CrtDateEnd: new FormControl<Date | void>(void 0),
    UpdDateStart: new FormControl<Date | void>(void 0),
    UpdDateEnd: new FormControl<Date | void>(void 0),
    /** ROC/IFRS 0:ROC 1:IFRS 2:全部 */
    // VouAccType: new FormControl<'0' | '1' | '2'>('2'),
    ...createPaginationConfig(this.multiSortMeta),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN53010Data[]>([]);
  public readonly totalRecords = signal(0);

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading();
  }, { allowSignalWrites: true });

  public readonly columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', align: 'left' },
    { field: 'VouType', header: '傳票類別', align: 'left', format: d => this.service.vouTypeOptions.find(({ value }) => value === d)?.label ?? d },
    { field: 'VouDate', header: '傳票日期', align: 'left', format: d => this.date.transform(d, 'yyyy/MM/dd') ?? d },
    { field: 'PostFlag', header: '傳票狀態', align: 'left', format: v => this.service.postFlagOptions.find(item => String(item.value) === String(v))?.label ?? v },
    { field: 'Remark', header: '傳票摘要', align: 'left', format: d => this.service.noteDescMap().get(d)?.label ?? d },
    { field: 'VoucherType', header: '傳票型態', align: 'left', format: v => this.service.voucherTypeMap().get(String(v))?.label ?? String(v) },
    { field: 'AccAmt', header: '傳票金額', align: 'right', format: d => formatAmount(d), style: 'text-right' },
    { field: 'DetailCount', header: '明細筆數', align: 'right' },
  ];

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
    private readonly date: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', '/FIN/FIN53010CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getVoucherTypeOptions();
    this.service.getUsrOptions();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = this.buildApiPayload();
      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.loadFIN53010(payload).pipe(
        tap(res => this.service.getAccDescOptions(res.Data.map(d => d.Remark).filter(Boolean))),
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  /**
   * 給 `<app-table>` 的 LazyLoad 事件。
   * 會先把分頁/排序參數回填到 queryForm，再觸發查詢維持功能正常。
   */
  public onTableLazyLoadData(event: LazyLoadEvent): void {
    this.onLazyLoadData(event, this.queryForm);
    this.onSubmit();
  }

  /**
   * 輔助函數：將陣列轉換為逗號分隔的字串
   * 參考功能：TLS32020、TLS32030
   */
  private formatListForBackend(list: string[] | null): string | null {
    if (Array.isArray(list) && list.length > 0) {
      return list.map(item => String(item)).join(',');
    }
    return null;
  }

  /**
   * 單一入口：取得可送 API 的 payload。
   */
  public buildApiPayload(body?: FIN53010Payload): FIN53010Payload {
    return body ?? this.buildQueryBodyFromForm();
  }

  /** 從表單組出查詢條件（含 pageSize/pageIndex/SortBy），過濾空值，不含分頁正規化。 */
  private buildQueryBodyFromForm(): FIN53010Payload {
    const vns = this.qf().VouNoStart.value;
    const vne = this.qf().VouNoEnd.value;

    const raw = {
      ...this.queryForm.getRawValue(),
      VouNoStart: String(vns ?? ''),
      VouNoEnd: String(vne ?? ''),
      VoucherType: this.formatListForBackend(this.qf().VoucherType.value),
    };

    const cleanedEntries = Object.entries(raw).filter(([, v]) =>
      v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0),
    );

    return Object.fromEntries(cleanedEntries) as FIN53010Payload;
  }
}
