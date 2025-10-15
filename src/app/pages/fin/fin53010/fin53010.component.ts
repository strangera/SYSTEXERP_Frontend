import { DatePipe } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
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
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN53010Data, FIN53010Payload } from './fin53010.model';

@Component({
  selector: 'app-fin53010',
  templateUrl: './fin53010.component.html',
  styleUrl: './fin53010.component.scss',
  standalone: !0,
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
    RadiobuttonComponent,
    TableComponent,
  ],
})
export class FIN53010Component extends BasicQueryPageComponent<FIN53010Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    VouNoStart: new FormControl<number | void>(void 0),
    VouNoEnd: new FormControl<number | void>(void 0),
    /** 傳票種類 */
    VouType: new FormControl<'0' | '1' | '2' | void>(void 0),
    VouDateStart: new FormControl<Date | void>(void 0),
    VouDateEnd: new FormControl<Date | void>(void 0),
    /** 傳票狀態 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    Remark: new FormControl<string | void>(void 0),
    /** 傳票型態 */
    VouForm: new FormControl<string | void>(void 0),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CrtDateStart: new FormControl<Date | void>(void 0),
    CrtDateEnd: new FormControl<Date | void>(void 0),
    UpdDateStart: new FormControl<Date | void>(void 0),
    UpdDateEnd: new FormControl<Date | void>(void 0),
    VouAccType: new FormControl<'0' | '1' | '2' | '3'>('0'),
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly totalRecords = computed(() => this.service.FIN53010Data().length);

  public readonly columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'VouType', header: '傳票種類', format: d => this.service.VouTypes().find(vt => vt.value === d)?.label ?? d },
    { field: 'VouDate', header: '傳票日期', format: d => this.datePipe.transform(d, 'yyyy/MM/dd') ?? d },
    { field: 'Remark', header: '傳票摘要' },
    { field: 'AccAmt', header: '傳票金額' },
    { field: 'DetailCount', header: '明細筆數' },
  ];

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', '/FIN/FIN53010CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getVouTypes();
    this.service.getPostFlags();
    this.service.getVouAccTypes();
    this.service.getAccNoList();
    this.service.getVendorList();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.loading = !0;
      const raw = this.queryForm.getRawValue();
      const payload = <FIN53010Payload>Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (!!v) acc[key as keyof typeof raw] = v;
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [this.qf(), raw, payload]);
      this.service.FIN53010Data.set([]);

      this.service.loadFIN53010(payload).pipe(
        finalize(() => {
          this.loading = !1;
          this.logger.debug('FIN53010 查詢結果:', [this.service.FIN53010Data()]);
        })
      ).subscribe();
    });
  }
}
