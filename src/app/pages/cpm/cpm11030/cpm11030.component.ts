import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateMinNumber, validateNumber } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Cpm11030Service, DailyEquipAvailabilityRow, QueryCPM11030Request, QueryCPM11030Row } from '../../../service/api/cpm/cpm11030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-cpm11030',
  templateUrl: './cpm11030.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,
    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    DialogComponent,
    CalendarModule,
    CalendarComponent,
    TableReportComponent,
    MultiSelectComponent,
    AsyncPipe,
    TableEditComponent
  ],
})
export class CPM11030Component extends BasicQueryPageComponent<QueryCPM11030Row> implements OnInit {
  queryForm = this.formBuilder.group({
    Loan_No: [null, [Validators.maxLength(20)]],
    Loan_BDate: [new Date()],
    Loan_EDate: [new Date()],
    User_Name: [null, [Validators.maxLength(50)]],
    Loan_USR_No: [null],
    Loan_Phone: [null, [Validators.maxLength(20)]],
    Cert_Type: [null],
    Device_Name: [null],
    Service_Id: [null],
    Cert_No: [null, [Validators.maxLength(30)]],
    ...createPaginationConfig([{ field: 'Loan_Date', order: -1 }, { field: 'Loan_Time', order: -1 }]),
  });
  data: QueryCPM11030Row[] = [];
  totalRecords = 0;
  lastQueryBody: QueryCPM11030Request | null = null;
  tableVer = 0;
  btnLoading = false;
  columns: ReportColumn[] = [
    { field: 'Loan_No', header: '紀錄編號' },
    { field: 'Loan_Date', header: '出借日期', format: formatDate },
    { field: 'Loan_Time', header: '出借時間' },
    { field: 'Service_Id', header: '服務中心位置編號' },
    { field: 'Service_Name', header: '服務中心名稱' },
    { field: 'Loan_Status', header: '出借狀態', format: (v) => getSYS1000('Loan_Status', v), },
    { field: 'User_Name', header: '借用人姓名' },
    { field: 'Cert_Type', header: '證件類型', format: (v) => getSYS1000('Cert_Type', v) },
    { field: 'Cert_No', header: '證件編號' },
    { field: 'Loan_Phone', header: '連絡電話' },
    { field: 'Device_Names', header: '出借設備' },
  ];
  counterCodeOptions = this.dropDown.queryCSS1001()
  certTypeOptions = getSYS1000Options('Cert_Type');
  deviceNameOptions = this.dropDown.queryCSS2001();
  Loan_USR_NoOptions = this.dropDown.queryTblUser();

  constructor(
    public readonly cpm11030Service: Cpm11030Service,
    private readonly dropDown: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('CPM11030', '/cpm/cpm11030cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = this.queryForm.getRawValue();
      const payload: QueryCPM11030Request = {
        ...raw,
        Loan_No: (raw?.Loan_No ?? '').trim() || undefined,
        Loan_BDate: this.datePipe.transform(raw?.Loan_BDate, 'yyyy-MM-dd') ?? undefined,
        Loan_EDate: this.datePipe.transform(raw?.Loan_EDate, 'yyyy-MM-dd') ?? undefined,
        User_Name: (raw?.User_Name ?? '').trim() || undefined,
        Loan_USR_No: raw?.Loan_USR_No ?? undefined,
        Loan_Phone: (raw?.Loan_Phone ?? '').trim() || undefined,
        Cert_No: (raw?.Cert_No ?? '').trim() || undefined,
        Cert_Type: raw?.Cert_Type ?? undefined,
        Device_Name: raw?.Device_Name ?? undefined,
        Service_Id: raw?.Service_Id ?? undefined,
      };
      this.cpm11030Service.queryCPM11030(payload).pipe(untilDestroyed(this), finalize(() => { this.loading = false })).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = payload;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.cpm11030Service.exportCPM11030PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.cpm11030Service.exportCPM11030Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  /* ----------------- Daily Dialog ----------------- */
  dailyDialogVisible = false;
  dailyLoading = false;
  dailySubmitted = false;

  dailyForm = this.formBuilder.group({
    Service_Id: [null, [Validators.required, Validators.maxLength(20)]],
    CSS_Date: [new Date(), [Validators.required]],
  });
  dailyRows: DailyEquipAvailabilityRow[] = [];
  dailyColumns: EditColumn[] = [
    { field: 'Device_ID', header: '設備代碼' },
    { field: 'Device_Name', header: '設備名稱' },
    {
      field: 'Device_TotQty', header: '本日期初量', type: 'inputNumber', width: '120px',
      disabled: (v, i, row) => row.CSS_PriorQty !== null,
      min: 1,
      validate: [validateNumber, validateMinNumber(1)]
    },
    { field: 'CSS_CurrentQty', header: '今日剩餘可出借數量' },
  ];
  validateRow = (rowData: any): { isValid: boolean, errorMessage: string } => {
    if (rowData.Device_TotQty > rowData.MaxLimit) {
      return {
        isValid: false,
        errorMessage: `「${rowData.Device_Name}」輸入值(${rowData.Device_TotQty}) 超過庫存總量(${rowData.MaxLimit})`
      };
    }
    return { isValid: true, errorMessage: '' };
  };
  // 判斷是否「全部都已經設定過了」
  get isAllInitialized(): boolean {
    return this.dailyRows.length > 0 && this.dailyRows.every(r => r.CSS_PriorQty !== null);
  }
  // 判斷是否「沒有任何資料可以存檔」
  get cannotSaveDaily(): boolean {
    // 如果正在讀取，或是根本沒資料，或是全部都設定過了 -> 不能存
    return this.dailyLoading || this.dailyRows.length === 0 || this.isAllInitialized;
  }
  openDailyDialog() {
    const mainServiceId = this.queryForm.get('Service_Id')?.value;
    if (mainServiceId) {
      this.dailyForm.patchValue({
        Service_Id: mainServiceId[0],
        CSS_Date: new Date() // 順便確保日期是今天
      });
      this.onDailyQuery(this.dailyForm);
    } else {
      this.dailyForm.reset({ CSS_Date: new Date() });
      this.dailyRows = []; // 清空之前的資料
    }
    this.dailyDialogVisible = true;
  }
  onDailyQuery(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const Service_Id = this.dailyForm.getRawValue().Service_Id ?? '';
      this.cpm11030Service.queryCPM11030_DailyEquipAvailability({ Service_Id }).pipe(untilDestroyed(this), finalize(() => this.dailyLoading = false)).subscribe(res => {
        this.dailyRows = res.Data.map(item => ({
          ...item,
          MaxLimit: item.Device_TotQty
        }));
      });
    },
      (val) => this.dailyLoading = val,
      (val) => this.dailySubmitted = val
    );
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onDailySave() {
    const valid = this.tableEditComponent.validateAndShowErrors();
    if (!valid) return;
    const raw = this.dailyForm.getRawValue();
    const targets = this.dailyRows.filter(r => !r.CSS_PriorQty || r.CSS_PriorQty === 0);
    const calls = targets.map((r) => {
      return this.cpm11030Service.insertCPM11030_DailyEquipAvailability({
        ...r,
        CSS_Date: raw.CSS_Date,
        Service_Id: raw.Service_Id ?? '',
        CSS_PriorQty: r.Device_TotQty,
        CSS_LendQty: 0,
        CSS_ReturnQty: 0,
        CSS_CurrentQty: r.Device_TotQty,
      });
    });
    this.dailyLoading = true;
    forkJoin(calls).pipe(finalize(() => this.dailyLoading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res[0].Message || '設備初始化成功');
      this.dailyDialogVisible = false;
      if (this.lastQueryBody) this.onSubmit(this.queryForm);
    });
  }
}
