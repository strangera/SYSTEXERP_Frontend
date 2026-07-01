import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime } from '@shared/componentkit/table-report/table-report.model';
import { Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN25010Data, FIN25010Service, QueryDropFIN25010Response, QueryFIN25010Request } from '../../../service/api/fin/fin25010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin25010',
  templateUrl: './fin25010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
    CalendarRangeComponent,
    DropdownTableComponent
  ]
})
export class FIN25010Component extends BasicQueryPageComponent<FIN25010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PAM_No: [null, Validators.maxLength(12)],           // 電匯來源單號
    CRT_Date_b: [null as Date | null],                    // 建立日期(起)
    CRT_Date_e: [null as Date | null],                    // 建立日期(迄)
    D_Date_b: [null as Date | null],                  // 收/付款日(起)
    D_Date_e: [null as Date | null],                  // 收/付款日(迄)
    Remit_Status: [null],                               // 是否形成電匯
    WSLIP_NO: [null, Validators.maxLength(12)],        // 匯款單號
    payday_Counts: [null, this.validationService.numberValidator], // 付款天數
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'D_Date', order: -1 }]],
  });

  data: FIN25010Data[] = [];
  selectedItems: FIN25010Data[] = [];
  totalRecords = 0;
  lastQueryBody: QueryFIN25010Request | null = null;
  columns: Column[] = [
    { field: 'PAM_No', header: '電匯來源單號', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'D_Date', header: '收/付款日', visible: true, format: formatDate },
    { field: 'Remit_Status', header: '是否形成電匯', visible: true, format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : value },
    { field: 'WSLIP_NO', header: '匯款單號', visible: true }
  ];

  //#region 電匯來源單號 查詢式dropdown table
  suggestions: QueryDropFIN25010Response[] = [];
  opData: QueryDropFIN25010Response[] = [];
  opTotalRecords = 0;
  opLoading = false;

  opForm = this.formBuilder.group({
    PTA_Date_b: [null],
    PTA_Date_e: [null],
    Remit_Status: [null],
    PAM_No: [null, Validators.maxLength(12)],
    ...createPaginationConfig([{ field: "D_Date", order: -1 }])
  });

  fieldsConfig: FieldsConfig[] = [
    { field: '', header: '電匯來源單號', mainDataField: true }
  ];

  opColumns: Column[] = [
    { field: 'PAM_No', header: '電匯來源單號' },
    { field: 'D_Date', header: '建立日期', format: formatDate },
    { field: 'Remit_Status', header: '是否形成電匯', format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : value }
  ];

  // auto complete 查詢事件
  onAutoCompleteInputChange(event: Record<string, string>): void {
    this.fin25010Service.queryDropFIN25010(event).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PAM_No,
      }))];
    });
  }

  // overlay panel 查詢事件
  onFormValueChanged(event: Record<string, string>): void {
    this.opLoading = true;
    this.fin25010Service.queryDropFIN25010(
      {
        ...event,
        SortBy: [{ field: "D_Date", order: -1 }]
      }
    )
      .pipe(untilDestroyed(this), finalize(() => this.opLoading = false))
      .subscribe((results) => {
        this.opData = results.Data;
        this.opTotalRecords = results.TotalCount;
      });
  }
  //#endregion

  constructor(
    public readonly fin25010Service: FIN25010Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25010', 'fin/fin25010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    const body = {
      ...form.getRawValue(),

    }
    this.handleSubmit(form, () => {
      this.fin25010Service.queryFIN25010(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = form.getRawValue();
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  onDelete(selectedItems: FIN25010Data[]) {
    const body = {
      selectList: selectedItems.map(item => ({
        PAM_No: item.PAM_No,
      })),
    }
    const PAM_NoList = selectedItems.map((item: FIN25010Data) => item.PAM_No);

    this.messageService.confirm({
      message: `確定要刪除 ${PAM_NoList.length} 筆資料嗎？`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.fin25010Service.deleteFIN25010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.onSubmit(this.queryForm);
        });
      },
      reject: () => {
        // 使用者取消刪除，不做任何事
      }
    });
  }
}
