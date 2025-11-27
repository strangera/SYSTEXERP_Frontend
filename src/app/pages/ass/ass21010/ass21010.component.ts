import { Component, computed, effect, OnInit, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, tap } from 'rxjs';
import { ASS2100ENGMeterType, ASS21010Data, ASS21010Payload, EngType } from './ass21010.model';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextareaComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})

export class ASS21010Component extends BasicQueryPageComponent<ASS21010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | void>(void 0),
    ENG_MeterNo: new FormControl<string | void>(void 0),
    Location_No: new FormControl<string | void>(void 0),
    ENG_Remark: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'ENG_Type', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);

  public readonly tableData = signal<ASS21010Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  public readonly tableLoading = signal<boolean>(!1);

  public readonly usrData = computed(() => ({
    SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
    Mid: Number(this.authService.currentUserValue!.mid),
    user_No: this.authService.currentUserValue!.user_No,
  }));

  public readonly filteredMeterNo = signal<ASS2100ENGMeterType[]>([]);

  /** 改變engType 更新錶號選項 */
  public readonly engTypeEffect = effect(() => {
    const type = this.engTypeSignal() ?? void 0;
    const options = this.service.engMeterNoOptions();
    untracked(() => this.qf().ENG_MeterNo.setValue(void 0));

    if (type?.length && type.length !== 3) this.filteredMeterNo.set(options
      .filter(o => this.service.engTypeMap.get(o.ENG_Type)));
    return this.filteredMeterNo.set(options);
  }, { allowSignalWrites: !0 });

  /** 改變錶號 更新設備位置編號 */
  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal() ?? void 0;
    this.logger.debug(`meterNoEffect:`, [meterNo]);
    if (!meterNo) return untracked(() => this.qf().Location_No.setValue(void 0));
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.engMeterNoLoading()
      || this.service.locationLoading()
      || this.service.exportLoading();
  });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof ASS21010Data; exportFormat?: unknown[]; })[] = [
    {
      field: 'ENG_Type',
      header: '能源類型',
      format: v => this.service.engTypeOptions.find(t => t.value === v)?.label || v,
      exportFormat: [{ G01: '水錶' }, { G02: '電錶' }, { G03: '瓦斯錶' }],
    },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Remark', header: '備註' },
  ];

  constructor(
    public readonly service: ASS21010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', '/ASS/ASS21010CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngMeterNo();
    this.service.loadLocationNo();

    this.logger.debug(`init:`, [this.queryForm]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = {
        ...this.queryForm.getRawValue(),
        ...this.usrData(),
      };

      const payload = (Object.keys(raw) as (keyof typeof raw)[]).reduce<Record<string, unknown>>((acc, key) => {
        const v = raw[key];
        if (v !== null && v !== void 0 && v !== '' && !(Array.isArray(v) && !v.length)) acc[key] = v;
        return acc;
      }, {}) as unknown as ASS21010Payload;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.service.loadASS21010(payload).pipe(
        tap(res => this.logger.debug(`onSubmit:`, [raw, payload, res])),
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data.Data);
          this.totalRecords.set(res.Data.TotalCount || 0);
        },
      });
    });
  }

  public onDelete(data: ASS21010Data[]): void {
    this.logger.debug(`Deleting ASS21010:`, [data, this.user, this.queryForm.getRawValue(), this.usrData()]);
    this.tableLoading.set(!0);
    for (let i = 0; i < data.length; i++) {
      this.service.deleteASS21010({ ...data[i], ...this.usrData() }).pipe(
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.update(table =>
            table.filter(value => data.some(item => value.ID !== item.ID)));
          this.messageService.successBubble('刪除成功');
        },
      });
      if (i === data.length - 1) this.onSubmit();
    }
  }

  public onExport(type: string): void {
    const Conditions = {
      ...this.queryForm.getRawValue(),
      SYS_StoreNo: this.usrData().SYS_StoreNo,
      Mid: this.usrData().Mid,
    };

    const timeFormat = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '-');

    const payload = {
      report_title: '能源錶號基本維護',
      // report_title: this.currentPageService.currentPageProgNoSubject.value,
      file_name: `${this.usrData().user_No}-32110-${timeFormat}`,
      columns: this.columns.map(c => (c.visible = !0) && c),
      query_condition: { ServiceName: 'QueryASS21010', Conditions },
      config: {
        footer_DataType: "ASS21010",
        page_lines: 10,
        print_eject: 'Y',
        print_field_title: 'Y',
        print_field_title_per_page: 'N',
        print_line_number: 'Y',
        print_reportFooter: 'Y',
        print_reportFooter_per_page: 'N',
        print_reportTitle: 'Y',
        print_reportTitle_per_page: 'N',
      },
    };

    this.logger.debug(`onExport ${type} payload:`, [payload]);

    this.service.export(type as 'PDF' | 'Excel', payload);
  }
}
