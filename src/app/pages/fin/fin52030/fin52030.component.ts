import { Component, computed, effect, OnInit } from '@angular/core';
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
import { finalize, forkJoin } from 'rxjs';
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
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0),
    TempName: new FormControl<string | void>(void 0),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly columns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '傳票號碼' },
    { field: 'TempName', header: '傳票代號' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions().find(option => option.value === v)?.label ?? v },
    { field: 'DetailCount', header: '明細筆數' },
  ];

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.accLoading()
      || this.service.venLoading()
      || this.service.usrLoading()
      || this.service.RefNameLoading()
      || this.service.noteDescLoading();
  });

  constructor(
    public readonly service: FIN52030Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', '/FIN/FIN52030CRU', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.queryForm.patchValue(store.value);

    this.service.getAccNoList();
    this.service.getUsrList();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = this.queryForm.getRawValue() as FIN52030Payload;
      const payload = Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (v !== null && v !== void 0 && v !== '') acc[key as keyof typeof raw] = v;
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [payload]);

      this.service.loadFIN52030(payload).pipe(
        finalize(() => {
          this.logger.debug(`onSubmit:`, [this.queryForm.getRawValue()]);
        }),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }
}
