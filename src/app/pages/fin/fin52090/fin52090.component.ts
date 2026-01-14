
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
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN52090Data, FIN52090Query } from './fin52090.model';


@Component({
  selector: 'app-fin52090',
  templateUrl: './fin52090.component.html',
  styleUrl: './fin52090.component.scss',
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
    TableComponent,
  ],
})
export class FIN52090Component extends BasicQueryPageComponent<unknown> implements OnInit {

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

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52090Data; })[] = [
    { field: 'AccNo', header: '科目代號', format: v => this.service.accNoMap.get(v) ?? v },
    { field: 'NoteDesc', header: '科目摘要' },
  ];

  selectedRows: any[] = [];

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

  onDelete(selectedRows: any[]) {
    const ids = selectedRows.map(row => row.id);
    this.service.deleteFIN52090({ ids }).subscribe({
      next: () => {
        this.onSubmit();
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  onSubmit() {
    this.handleSubmit(this.queryForm, () => {
      const raw = {
        ...this.queryForm.getRawValue(),
        AccNo: this.qf().AccNo.value?.length ? this.qf().AccNo.value : void 0,
        NoteDesc: this.qf().NoteDesc.value ?? void 0,
      } as FIN52090Query;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN52090Query;

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
