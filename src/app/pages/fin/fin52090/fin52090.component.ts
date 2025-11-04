
import { Component, OnInit, computed, effect } from '@angular/core';
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
    AccNo: new FormControl<string[]>([]),
    NoteDesc: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly accNoSignal = toSignal(this.qf().AccNo.valueChanges);
  public readonly noteDescSignal = toSignal(this.qf().NoteDesc.valueChanges);

  public filteredData = computed(() => {
    return this.service.FIN52090Data();
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.accNoLoading();
  });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52090Data; })[] = [
    { field: 'AccNo', header: '科目代號', format: v => this.service.accNoMap.get(v) ?? v },
    { field: 'NoteDesc', header: '科目摘要' },
  ];

  constructor(
    public readonly service: FIN52090Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52090', '/FIN/FIN52090CRU', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.queryForm.patchValue(store.value);

    this.service.accNo.set([]);
    this.service.getAccNo();

    this.logger.debug(`init:`, [this.service.accNo()]);
  }

  onSubmit() {
    this.handleSubmit(this.queryForm, () => {
      const payload = <FIN52090Query>{
        ...this.queryForm.getRawValue(),
        AccNo: this.qf().AccNo.value?.length ? this.qf().AccNo.value : void 0,
        NoteDesc: this.qf().NoteDesc.value ?? void 0,
      };

      this.logger.debug(`onSubmit:`, [payload]);

      this.service.loadFIN52090(payload).subscribe();

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }
}
