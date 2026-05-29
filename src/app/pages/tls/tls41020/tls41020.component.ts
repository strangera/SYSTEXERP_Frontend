import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { QueryTLS41020Request, TLS41020Data, TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ValidationService } from '@shared/service/validation.service';
@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TranslateModule,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
    AsyncPipe,
  ],
})
export class TLS41020Component extends BasicQueryPageComponent<TLS41020Data> implements OnInit {
  private readonly tls41020Service = inject(TLS41020Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly validationService = inject(ValidationService);
  ECRNoOptions = this.dropDown.queryPos1002();
  CounterOptions = this.dropDown.queryTltTalent();
  EDC_Status_Option = getSYS1000Options('EDC_Status1');
  ipPattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  queryForm = this.formBuilder.group({
    ECR_No: [null], // MultiSelect
    EDC_No: [null],
    EDC_BegDate_From: [null],
    EDC_BegDate_To: [null],
    EDC_EdnDate_From: [null],
    EDC_EdnDate_To: [null],
    // 狀態 1~5
    EDC_Status1: [null],
    EDC_Status2: [null],
    EDC_Status3: [null],
    EDC_Status4: [null],
    EDC_Status5: [null],
    ECR_TLT_No: [null],
    // IP 1~5
    EDC_IP1: [null, [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_IP2: [null, [Validators.maxLength(20), this.validationService.ipValidator]],
    // 端末機代碼 1~5
    EDC_TmID1: [null, [Validators.maxLength(8)]],
    EDC_TmID2: [null, [Validators.maxLength(8)]],
    EDC_TmID3: [null, [Validators.maxLength(8)]],
    EDC_IP3: [null, [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_IP4: [null, [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_IP5: [null, [Validators.maxLength(20), this.validationService.ipValidator]],
    EDC_TmID4: [null, [Validators.maxLength(8)]],
    EDC_TmID5: [null, [Validators.maxLength(8)]],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  data: TLS41020Data[] = [];
  selectedItems: TLS41020Data[] = [];
  totalRecords = 0;
  lastQueryBody: QueryTLS41020Request | null = null;
  queryFunction = (body: QueryTLS41020Request): Observable<ApiResponse<TLS41020Data[]>> => this.tls41020Service.queryTLS41020(body);
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'EDC_BegDate', header: '啟用日期', visible: true, format: formatDate },
    { field: 'EDC_EndDate', header: '停用日期', visible: true, format: formatDate },
    // 專櫃與地點資料
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '櫃位名稱', visible: true },
    { field: 'ECR_LocNo', header: '地點代號', visible: true },
    { field: 'LOCATION_Name', header: '地點名稱', visible: true },
    // 第一台 (中信)
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
    { field: 'EDC_TmID1', header: '中信刷卡機端末機號', visible: true },
    // 第二台 (聯合)
    { field: 'EDC_Status2Name', header: '聯合刷卡機狀態', visible: true },
    { field: 'EDC_IP2', header: '聯合刷卡機IP', visible: true },
    { field: 'EDC_TmID2', header: '聯合刷卡機端末機號', visible: true },
    // 第三台 (中信分期)
    { field: 'EDC_Status3Name', header: '中信分期刷卡機狀態', visible: false },
    { field: 'EDC_IP3', header: '中信分期刷卡機IP', visible: false },
    { field: 'EDC_TmID3', header: '中信分期刷卡機端末機號', visible: false },
    // 第四台 (中信紅利)
    { field: 'EDC_Status4Name', header: '中信紅利刷卡機狀態', visible: false },
    { field: 'EDC_IP4', header: '中信紅利刷卡機IP', visible: false },
    { field: 'EDC_TmID4', header: '中信紅利刷卡機端末機號', visible: false },
    // 第五台 (中信銀聯)
    { field: 'EDC_Status5Name', header: '中信銀聯刷卡機狀態', visible: false },
    { field: 'EDC_IP5', header: '中信銀聯刷卡機IP', visible: false },
    { field: 'EDC_TmID5', header: '中信銀聯刷卡機端末機號', visible: false },
    // 審核異動欄位
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];
  constructor() { super(); }

  ngOnInit(): void {
    this.initializePage('TLS41020', '/tls/tls41020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      this.queryFunction(raw).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.lastQueryBody = raw;
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount;
      });
    });
  }

  onDelete(event: TLS41020Data[]): void {
    const idList = event.map(r => r.id).filter(id => id !== undefined);
    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除選取的 ${idList.length} 筆資料嗎？`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.tls41020Service.deleteTLS41020({ idList }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message || '刪除成功');
          this.onSubmit(this.queryForm);
        });
      },
    });
  }
}
