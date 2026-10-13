import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { AddButton, Column, createPaginationConfig, formatAmount, LazyLoadEvent } from '@others/component/table/table.model';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
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
    TableComponent,
  ],
})
export class FIN53010Component extends BasicQueryPageComponent<FIN53010Data> implements OnInit {

  public readonly multiSortMeta = [{ field: 'VouNo', order: 1 }];

  public readonly queryForm = this.formBuilder.group({
    VouNoStart: new FormControl<number | void>(void 0),
    VouNoEnd: new FormControl<number | void>(void 0),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>('3'),
    VouDateStart: new FormControl<Date | void>(void 0),
    VouDateEnd: new FormControl<Date | void>(void 0),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */ // 需求#566: 傳票狀態的"確認"選項，請移除
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

  /** 傳票狀態查詢選項：需求#566，查詢條件排除 2:確認 */
  public readonly postFlagOptions = this.service.postFlagOptions.filter(({ value }) => value !== '2');

  public readonly tableData = signal<FIN53010Data[]>([]);
  public readonly totalRecords = signal(0);

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading();
  }, { allowSignalWrites: true });

  public readonly voidingRowId = signal<number | null>(null);
  public readonly deletingRowId = signal<number | null>(null);

  public readonly addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-trash text-red-500',
      action: (rowData: FIN53010Data) => this.onVoid(rowData),
      disabled: (rowData: FIN53010Data) => rowData.PostFlag !== '1',
      loading: (rowData: FIN53010Data) => this.voidingRowId() === rowData.id,
    },
    {
      label: '刪除',
      icon: 'pi pi-times text-red-700',
      action: (rowData: FIN53010Data) => this.onDelete(rowData),
      disabled: (rowData: FIN53010Data) => !rowData.CanDelete,
      loading: (rowData: FIN53010Data) => this.deletingRowId() === rowData.id,
    },
  ];

  public readonly columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', align: 'left' },
    { field: 'VouType', header: '傳票類別', align: 'left', format: d => this.service.vouTypeOptions.find(({ value }) => value === d)?.label ?? d },
    { field: 'VouDate', header: '傳票日期', align: 'left', format: d => this.date.transform(d, 'yyyy/MM/dd') ?? d },
    { field: 'PostFlag', header: '傳票狀態', align: 'left', format: v => this.service.postFlagOptions.find(item => String(item.value) === String(v))?.label ?? v },
    { field: 'Remark', header: '傳票摘要', align: 'left', format: d => this.service.noteDescMap().get(d)?.label ?? d },
    { field: 'VouTypeName', header: '傳票型態', align: 'left', format: v => this.service.voucherTypeMap().get(String(v))?.label ?? String(v) },
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

  public onVoid(rowData: FIN53010Data): void {
    if (rowData.PostFlag !== '1') return;
    this.messageService.confirm({
      header: '作廢確認',
      message: `是否作廢傳票 ${rowData.VouNo} ?`,
      accept: () => {
        this.voidingRowId.set(rowData.id);
        this.service.voidFIN53010Data([rowData.id]).pipe(
          finalize(() => this.voidingRowId.set(null)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble('作廢成功');
            this.onSubmit();
          },
        });
      },
    });
  }

  public onDelete(rowData: FIN53010Data): void {
    if (!rowData.CanDelete) return;
    this.messageService.confirm({
      header: '刪除確認',
      message: `是否刪除傳票 ${rowData.VouNo} ?`,
      accept: () => {
        this.deletingRowId.set(rowData.id);
        this.service.deleteFIN53010Data(rowData.id).pipe(
          finalize(() => this.deletingRowId.set(null)),
        ).subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.messageService.successBubble('刪除成功');
            this.onSubmit();
          },
        });
      },
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
   * 單一入口：取得可送 API 的 payload。
   */
  public buildApiPayload(body?: FIN53010Payload): FIN53010Payload {
    return body ?? this.buildQueryBodyFromForm();
  }

  /** 從表單組出查詢條件（含 pageSize/pageIndex/SortBy），過濾空值，不含分頁正規化。 */
  private buildQueryBodyFromForm(): FIN53010Payload {
    const vns = this.qf().VouNoStart.value;
    const vne = this.qf().VouNoEnd.value;

    /** 將 Date 或手 key 字串(yyyy/MM/dd、yyyy-MM-dd)正規化為 Date；無法解析回傳 undefined。 */
    const toDate = (v: Date | string | null | undefined | void): Date | undefined => {
      if (!v) return undefined;
      if (v instanceof Date) return Number.isNaN(v.getTime()) ? undefined : v;
      const m = /^\s*(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/.exec(String(v));
      if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
      const d = new Date(String(v));
      return Number.isNaN(d.getTime()) ? undefined : d;
    };

    /** 起日補 00:00:00、迄日補 23:59:59，輸出後端可解析的 ISO 字串 (yyyy-MM-ddTHH:mm:ss)。 */
    const formatDate = (v: Date | string | null | undefined | void, edge: 'start' | 'end'): string | undefined => {
      const d = toDate(v);
      if (!d) return undefined;
      if (edge === 'start') d.setHours(0, 0, 0, 0);
      else d.setHours(23, 59, 59, 999);
      return this.date.transform(d, "yyyy-MM-dd'T'HH:mm:ss") ?? undefined;
    };

    const raw = {
      ...this.queryForm.getRawValue(),
      VouNoStart: String(vns ?? ''),
      VouNoEnd: String(vne ?? ''),
      VoucherType: this.qf().VoucherType.value?.length ? this.qf().VoucherType.value! : null,
      VouDateStart: formatDate(this.qf().VouDateStart.value, 'start'),
      VouDateEnd: formatDate(this.qf().VouDateEnd.value, 'end'),
      CrtDateStart: formatDate(this.qf().CrtDateStart.value, 'start'),
      CrtDateEnd: formatDate(this.qf().CrtDateEnd.value, 'end'),
      UpdDateStart: formatDate(this.qf().UpdDateStart.value, 'start'),
      UpdDateEnd: formatDate(this.qf().UpdDateEnd.value, 'end'),
    };

    const cleanedEntries = Object.entries(raw).filter(([, v]) =>
      v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0),
    );

    return Object.fromEntries(cleanedEntries) as FIN53010Payload;
  }
}
