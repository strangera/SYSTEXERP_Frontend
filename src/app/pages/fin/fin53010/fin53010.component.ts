import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
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
import { finalize, tap } from 'rxjs';
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

  public readonly multiSortMeta = [{ field: 'id', order: 1 }];

  public readonly queryForm = this.formBuilder.group({
    VouNoStart: new FormControl<number | void>(void 0),
    VouNoEnd: new FormControl<number | void>(void 0),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'0' | '1' | '2' | void>(void 0),
    VouDateStart: new FormControl<Date | void>(void 0),
    VouDateEnd: new FormControl<Date | void>(void 0),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    Remark: new FormControl<string | void>(void 0),
    /** 傳票種類(SYS1000.VoucherType) */
    VoucherType: new FormControl<string | void>(void 0),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CrtDateStart: new FormControl<Date | void>(void 0),
    CrtDateEnd: new FormControl<Date | void>(void 0),
    UpdDateStart: new FormControl<Date | void>(void 0),
    UpdDateEnd: new FormControl<Date | void>(void 0),
    /** ROC/IFRS 0:ROC 1:IFRS 2:全部 */
    VouAccType: new FormControl<'0' | '1' | '2'>('0'),
    ...createPaginationConfig(this.multiSortMeta),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<FIN53010Data[]>([]);
  public readonly totalRecords = signal(0);

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.accLoading()
      || this.service.venLoading()
      || this.service.usrLoading()
      || this.service.orgNoLoading()
      || this.service.sys1000Loading()
      || this.service.voucherTypeLoading()
      || this.service.refNameLoading()
      || this.service.noteDescLoading()
      || this.service.fin52030Loading()
      || this.service.vocTempLoading();
  });

  public readonly columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'VouType', header: '傳票類別', format: d => this.service.vouTypeOptions.find(({ value }) => value === d)?.label ?? d },
    { field: 'VouDate', header: '傳票日期', format: d => this.date.transform(d, 'yyyy/MM/dd') ?? d },
    { field: 'Remark', header: '傳票摘要', format: d => this.service.noteDescMap().get(d)?.label ?? d },
    { field: 'AccAmt', header: '傳票金額' },
    { field: 'DetailCount', header: '明細筆數' },
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
    this.service.getAccNoOptions();
    this.service.getUsrOptions();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const vns = this.qf().VouNoStart.value;
      const vne = this.qf().VouNoEnd.value;

      const raw = <FIN53010Payload>{
        ...this.queryForm.getRawValue(),
        VouNoStart: vns ? String(vns).padEnd(12, '0') : void 0,
        VouNoEnd: vne ? String(vne).padEnd(12, '9') : void 0,
      };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN53010Payload;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [vns, vne, payload]);
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
}
