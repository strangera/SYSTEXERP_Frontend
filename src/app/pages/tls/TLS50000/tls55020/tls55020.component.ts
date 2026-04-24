import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55020MasterData, Tls55020QueryRequest, Tls55020Service } from '@service/api/tls/tls55020.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { debounceTime, distinctUntilChanged, filter, finalize, map, Observable, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-tls55020',
  templateUrl: './tls55020.component.html',
  standalone: true,
  imports: [
    DropdownComponent,
    PanelModule,
    TableReportComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    ButtonComponent,
    TranslateModule,
    InputTextComponent,
    AsyncPipe,
    AutoCompleteComponent,
    CheckboxModule
  ]
})
export class TLS55020Component extends BasicQueryPageComponent<Tls55020MasterData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    TXN_Date: [yesterday, Validators.required],
    ECR_No: [null],
    TLT_No: [null],
    TXN_No: [null, [Validators.maxLength(8), this.validation.numberValidator]],
    IncludeSpecialMagNo: [false], // 新增此控制項
    pageIndex: [1],
    pageSize: [30]
  });
  ECR_NoOptions$: Observable<Option[] | null> = new Observable<Option[] | null>();
  TLT_NoOptions$: Observable<Option[] | null> = new Observable<Option[] | null>();
  data: Tls55020MasterData[] = [];
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '機號' },
    { field: 'TXN_No', header: '序號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'TXN_Status', header: '狀態', format: (val) => getSYS1000('TXN_Status', val) },
    { field: 'TXN_Uniform', header: '統編' },
    { field: 'GUI_Track', header: '字軌' },
    { field: 'TXN_GUIBegNo', header: '發票號碼' },
    { field: 'TXN_TaxType', header: '稅別', format: (val) => getSYS1000('TXN_TaxType', val) },
    { field: 'TXN_CustCnt', header: '來客數' },
    { field: 'TXN_MemCard', header: '會員卡號' },
    { field: 'TXN_Time', header: '交易時間' },
    { field: 'TXN_GUI_CarrType', header: '載具類別', format: (val) => getSYS1000('TXN_GUI_CarrType', val) },
    { field: 'TXN_GUIVehicle', header: '載具編號' },
    { field: 'tlt_term_type', header: '抽成別', format: (val) => getSYS1000('tlt_term_type', val) },
    { field: 'TXN_Remark', header: '備註' }
  ];
  totalRecords = 0;
  lastQueryBody: Tls55020QueryRequest | null = null;
  constructor(
    public readonly tls55020Service: Tls55020Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly validation: ValidationService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55020', '/tls/tls55020cru', this.queryForm, (form) => this.onSubmit(form));
    // 2. 監聽日期變化來連動下拉選單
    const dateChange$ = this.queryForm.controls.TXN_Date.valueChanges.pipe(
      startWith(this.queryForm.controls.TXN_Date.value),
      debounceTime(500), // 重要：等使用者停下 0.5 秒，避免連續觸發
      distinctUntilChanged(),
      filter(date => {
        // 驗證：日期必須存在，且如果是字串，長度要夠（避免 2025/01/0 這種情況）
        if (!date) return false;
        const dateStr = date instanceof Date ? date.toISOString() : String(date);
        return dateStr.length >= 10;
      }),
      map(date => {
        try {
          const transformed = this.datePipe.transform(date, 'yyyy-MM-dd');
          return transformed ? { TXN_Date: transformed } : null;
        } catch {
          return null;
        }
      }),
      filter(body => body !== null),
      untilDestroyed(this)
    );
    // 3. 將日期流轉換為 API 下拉資料流
    this.ECR_NoOptions$ = dateChange$.pipe(
      switchMap(body => this.dropDown.queryPos1002Tls55020(body))
    );

    this.TLT_NoOptions$ = dateChange$.pipe(
      switchMap(body => this.dropDown.queryTltTalentTls55020(body))
    );

    // 4. 加碼功能：當日期清空或改變時，自動清空已選的機號與專櫃（選配）
    this.queryForm.controls.TXN_Date.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.queryForm.patchValue({ ECR_No: null, TLT_No: null });
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();
      const body = {
        ...rawValue,
        ECR_No: rawValue.ECR_No?.value || rawValue.ECR_No || null,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd'),
      }
      this.tls55020Service.queryTLS55020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      });
    });
  }
}
