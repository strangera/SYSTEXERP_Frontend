import { Component, computed, effect, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
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
import { finalize } from 'rxjs';
import { ASS21010Data, ASS21010Payload } from './ass21010.model';

@Component({
  selector: 'app-ass21010',
  templateUrl: './ass21010.component.html',
  styleUrl: './ass21010.component.scss',
  standalone: !0,
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
export class ASS21010Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | undefined>(void 0),
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string | undefined>(void 0),
    ENG_Remark: new FormControl<string | undefined>(void 0),
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // 變化追蹤
  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly engMeterSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly locationSignal = toSignal(this.qf().Location_No.valueChanges);

  public readonly totalRecords = computed(() => this.service.ASS21010Data().length);
  public readonly usrData = computed(() => ({
    SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
    Mid: Number(this.authService.currentUserValue!.mid),
  }));

  public readonly tableEffect = effect(() => {
    const types = this.engTypeSignal() || [];
    const meters = this.engMeterSignal() || [];
    const locs = this.locationSignal() || [];
    this.logger.debug(`tableEffect:`, [types, meters, locs]);
  }, { allowSignalWrites: !0 });

  public readonly columns: (Column & { exportFormat?: unknown[]; })[] = [
    {
      field: 'ENG_Type',
      header: '能源類型',
      format: v => this.service.engTypeSignal().find(t => t.No === v)?.Name || v,
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

    this.service.loadEngType();
    this.service.loadEngMeterNo();
    this.service.loadLocationNo();

    this.logger.debug(`init:`, [this.queryForm]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = <ASS21010Payload>{
        ...this.queryForm.getRawValue(),
        ...this.usrData(),
      };
      this.service.loadASS21010(payload);

      this.logger.debug(`onSubmit:`, [payload]);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.loading = !1;
    });
  }

  public onDelete(data: ASS21010Data[]): void {
    this.logger.debug(`Deleting ASS21010:`, [data, this.user, this.queryForm.getRawValue(), this.authService.currentUserValue]);
    for (const d of data) {
      this.service.deleteASS21010({ ...d, ...this.usrData() })
        .pipe(finalize(() => this.loading = !1))
        .subscribe(res => {
          if (!res.IsUpdateSuccess) return this.messageService.errorBubble(res.ErrorMsg, '刪除失敗');
          this.service.ASS21010Data.update(v => v.filter(d => data.some(item => d.ID !== item.ID)));
          this.messageService.successBubble('刪除成功');
        });
    }
    this.service.loadASS21010(<ASS21010Payload>{
      ...this.queryForm.getRawValue(),
      ...this.usrData(),
    });
  }

  public onExport(type: string): void {
    const Conditions: any = this.queryForm.getRawValue();
    Conditions.Mid = Number(this.authService.currentUserValue?.mid);
    Conditions.SYS_StoreNo = this.authService.currentUserValue?.SYS_StoreNo;

    const timeFormat = new Date().toLocaleString('sv-SE', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[-\s:]/g, '-');

    const payload = {
      report_title: '能源錶號基本維護',
      // report_title: this.currentPageService.currentPageProgNoSubject.value,
      file_name: `${this.authService.getUserInfo()?.user_No}-32110-${timeFormat}`,
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
