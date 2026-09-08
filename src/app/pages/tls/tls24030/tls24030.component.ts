import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy'; // 確保引入 UntilDestroy
import { TranslateModule } from '@ngx-translate/core';
import { TLS24030Item, TLS24030Request, Tls24030Service } from '@service/api/tls/tls24030.service';
import { TLS41010Service } from '@service/api/tls/tls41010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model'; // 引入 Option 型別
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AutoCompleteComponent } from '@shared/components/auto-complete/auto-complete.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map, Observable, of } from 'rxjs'; // 引入 map
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-tls24030',
  templateUrl: './tls24030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    CalendarComponent,
    AutoCompleteComponent,
    DropdownComponent,
    InputTextComponent,
    AsyncPipe
  ],
})
export class TLS24030Component extends BasicQueryPageComponent<TLS24030Item> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [yesterday, [Validators.required]],
    ECR_No: [null as string | null],
    TLT_No: [null as string | null],
    TXN_No: [null as string | number | null, [Validators.maxLength(8), this.validation.numberValidator]],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'TXN_No', order: 1 }]],
  });
  totalRecords = 0;
  lastQueryBody: TLS24030Request | null = null;
  TLT_NoOptions$: Observable<Option[] | null> = of([]);
  ECR_NoOptions = this.dropDown.queryPos1002();

  data: TLS24030Item[] = [];
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'TXN_GUIPaperDesc', header: '發票狀態' },
    { field: 'TXN_Status', header: '交易狀態', format: (value) => getSYS1000('TXN_Status', value) },
  ];

  constructor(
    public readonly tls24030Service: Tls24030Service,
    private readonly datePipe: DatePipe,
    private readonly validation: ValidationService,
    private readonly dropDown: DropdownApiService,
    private readonly tLS41010Service: TLS41010Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS24030', 'tls/tls24030cru', this.queryForm, (form) => this.onSubmit(form));
    this.getTltOptions(this.queryForm.controls.TXN_Date.value);
    this.queryForm.controls.TXN_Date.valueChanges.pipe(untilDestroyed(this)).subscribe(date => {
      this.getTltOptions(date);
    });
  }
  /**
     * 根據傳入的日期重新讀取專櫃下拉選單
     */
  getTltOptions(date: Date | null): void {
    if (!date) {
      this.TLT_NoOptions$ = of([]);
      return;
    }
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd')!;
    this.TLT_NoOptions$ = this.dropDown.queryTltTalentByContractDate({
      tlt_contract_date: formattedDate
    }).pipe(map(items => items ? items.map(i => ({
      label: `${i.No} - ${i.Name}`,
      value: i.No
    })) : []), untilDestroyed(this));
    this.queryForm.get('TLT_No')?.setValue(null);
  }
  onECRNoChanged(ecrNo: string): void {
    if (!ecrNo) {
      this.queryForm.get('TLT_No')?.setValue(null);
      return;
    }
    this.tLS41010Service.queryTLS41010({ ECR_No: ecrNo }).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Data && res.Data.length !== 0) {
        const targetTltNo = res.Data[0].ECR_TLT_No;
        this.TLT_NoOptions$.subscribe(options => {
          if (options) {
            const found = options.find(opt => opt.value === targetTltNo);
            this.queryForm.get('TLT_No')?.setValue(found ? found.value : null);
          }
        });
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd')!,
      };
      this.tls24030Service.queryTLS24030(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
}
