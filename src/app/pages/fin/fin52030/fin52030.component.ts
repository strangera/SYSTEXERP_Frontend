import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN52030Data, FIN52030Payload } from './fin52030.model';

@Component({
  selector: 'app-fin52030',
  templateUrl: './fin52030.component.html',
  styleUrl: './fin52030.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030Component extends BasicQueryPageComponent<FIN52030Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    TempNo: new FormControl<string | void>(void 0),
    VouType: new FormControl<string | void>(void 0),
    TempName: new FormControl<string | void>(void 0),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly totalRecords = computed(() => this.service.FIN52030Data().length);

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '傳票號碼' },
    { field: 'TempName', header: '傳票代號' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.subpoenaTypeMap.get(v) ?? v },
    { field: 'DetailCount', header: '明細筆數' },
  ];

  constructor(
    public readonly service: FIN52030Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', '/FIN/FIN52030CRU', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.queryForm.setValue(store.value);

    this.service.getUsrList();

    this.logger.debug(`init:`, [this.service.usrList()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = <FIN52030Payload>{
        ...this.queryForm.getRawValue(),
        TempNo: String(this.qf().TempNo.value ?? ''),
        VouType: String(this.qf().VouType.value ?? ''),
        TempName: String(this.qf().TempName.value ?? ''),
        CRT_USR_No: String(this.qf().CRT_USR_No.value ?? ''),
        UPD_USR_No: String(this.qf().UPD_USR_No.value ?? ''),
      };

      const payload = Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (v !== null && v !== void 0 && v !== '') acc[key as keyof typeof raw] = v;
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [payload]);
      this.service.FIN52030Data.set([]);

      this.service.loadFIN52030(payload).pipe(
        finalize(() => {
          this.loading = !1;
          this.logger.debug(`onSubmit:`, [this.queryForm.getRawValue()]);
        }),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  public onClearForm(): void {
    this.queryForm.reset();
  }
}
