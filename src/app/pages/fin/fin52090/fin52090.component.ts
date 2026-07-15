
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52090Service } from '@service/api/fin/fin52090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@others/component/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN52090Data, FIN52090DeleteRequest, FIN52090Query } from './fin52090.model';


@Component({
  selector: 'app-fin52090',
  templateUrl: './fin52090.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    MultiSelectComponent,
    InputTextComponent,
    MenubarComponent,
    TableReportComponent,
  ],
})
export class FIN52090Component extends BasicQueryPageComponent<FIN52090Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    id: new FormControl<number | void>(void 0),
    AccNo: new FormControl<string[]>([]),
    NoteDesc: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly accNoSignal = toSignal(this.qf().AccNo.valueChanges);
  public readonly noteDescSignal = toSignal(this.qf().NoteDesc.valueChanges);

  public readonly accNoWithDisplayLabel = computed(() =>
    this.service.accNo().map(item => ({
      ...item,
      displayLabel: `${item.AccNo}-${item.AccCName}`
    }))
  );

  public readonly tableData = signal<FIN52090Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
  }, { allowSignalWrites: true });

  public readonly columns: ReportColumn[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'NoteDesc', header: '科目摘要' },
  ];

  lastQueryBody?: FIN52090Query;
  selectedItems: FIN52090Data[] = [];
  isRowSelectable = (_row: FIN52090Data): boolean => true;

  constructor(
    public readonly service: FIN52090Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52090', '/FIN/FIN52090CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.accNo.set([]);
    this.service.getAccNo();

    this.logger.debug(`init:`, [this.service.accNo()]);

  }

  queryFunction = (body: any) => {
    const rawValue = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? rawValue.pageSize;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? rawValue.pageIndex;
    const raw = {
      ...rawValue,
      AccNo: this.qf().AccNo.value?.length ? this.qf().AccNo.value : void 0,
      NoteDesc: this.qf().NoteDesc.value ?? void 0,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy ?? rawValue.SortBy,
    } as FIN52090Query;
    const filtered = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
      v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
    ));
    delete (filtered as any).pageSize;
    delete (filtered as any).pageIndex;
    return this.service.loadFIN52090(filtered as FIN52090Query);
  };

  onDelete(data: FIN52090Data | FIN52090Data[]) {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;
    this.messageService.confirm({
      header: '刪除確認',
      message: '確定要刪除選取的資料嗎？',
      accept: () => {
        const ids = items.map(row => row.id).filter((id): id is number => id != null);
        const payload: FIN52090DeleteRequest = { Ids: ids };
        this.service.deleteFIN52090(payload).subscribe({
          next: () => {
            this.onSubmit();
            this.selectedItems = [];
          },
          error: () => { this.loading = false; },
        });
      },
    });
  }

  onSubmit() {
    this.handleSubmit(this.queryForm, () => {
      const rawValue = this.queryForm.getRawValue();
      const raw = {
        ...rawValue,
        AccNo: this.qf().AccNo.value?.length ? this.qf().AccNo.value : void 0,
        NoteDesc: this.qf().NoteDesc.value ?? void 0,
        // 轉換分頁欄位為大寫（API 需要大寫）
        PageSize: rawValue.pageSize,
        PageIndex: rawValue.pageIndex,
        SortBy: rawValue.SortBy,
        // OrderBy 和 Offset 為可選欄位，如果需要的話可以在這裡加入
        // OrderBy: undefined,
        // Offset: undefined,
      } as FIN52090Query;

      // 過濾掉 undefined、null 和空陣列
      const filtered = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      ));

      // 移除小寫的分頁欄位，避免重複
      delete (filtered as any).pageSize;
      delete (filtered as any).pageIndex;

      const payload = filtered as unknown as FIN52090Query;
      this.lastQueryBody = payload;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [raw, payload]);
      this.service.loadFIN52090(payload).pipe(
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
}
