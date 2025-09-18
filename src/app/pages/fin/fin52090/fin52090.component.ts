
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
import { FIN52090Data } from './fin52090.model';

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
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class FIN52090Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    accountCodes: new FormControl<string[]>([]),
    accountSummary: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly codeSignal = toSignal(this.qf().accountCodes.valueChanges);
  public readonly summarySignal = toSignal(this.qf().accountSummary.valueChanges);

  public filteredData = computed(() => {
    return this.service.FIN52090Data();
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52090Data; })[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCname', header: '科目名稱' },

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
    if (store?.value) this.queryForm.setValue(store.value);

    this.service.loadAccountCodes();

    this.logger.debug(`init:`, []);


    // this.vendorService.getVendors().subscribe((data) => {
    //   this.vendorOptions = data;
    // });
    // this.flippingstateService.getOptions().subscribe((data) => {
    //   this.FlippingstateOptions = data;
    // });
    // this.organizationNumberService
    //   .getOrganizationNumbers()
    //   .subscribe((data) => {
    //     this.departmentOptions = data;
    //   });
    // this.accountingaccountService.getOptions().subscribe((data) => {
    //   this.accountingaccountOptions = data;
    // });
  }

  onSubmit() {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        accCode: this.qf().accountCodes.value,
        accCname: this.qf().accountSummary.value,
      };

      this.service.loadFIN52090(payload);

      this.logger.debug(`onSubmit:`, [payload]);
      this.loading = this.service.tableLoading;
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  onClearForm() {
    this.queryForm.reset();
  }
}
