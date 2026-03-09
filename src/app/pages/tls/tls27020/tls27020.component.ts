import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { queryParams, TLS27020Data, TLS27020Service } from '@service/api/tls/tls27020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls27020',
  templateUrl: './tls27020.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, TableReportComponent, TranslateModule, MultiSelectComponent]
})
export class TLS27020Component extends BasicQueryPageComponent<TLS27020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: ['', [Validators.required]],  // 銷售日期
    TLT_NOList: [null], // 專櫃編號
    ECR_NoList: [null],       // 收銀機號
    ACT_PayAmt: [null, [Validators.max(99999999)]],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'TXN_Date, ECR_No', order: 1 }]],
  });
  lastQueryBody: queryParams | null = null;
  totalRecords = 0;
  data: TLS27020Data[] = [];
  selectedItems: TLS27020Data[] = [];
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'PayAmt', header: '實收金額', format: formatAmount },
    { field: 'crt_usr_name', header: '建立人員姓名' },
    { field: 'MOD_Date', header: '調整日期', format: formatDateTime },
  ];
  ECR_NoOptions = this.dropdown.queryPos1002(); // 收銀機號下拉選單
  TLTTALENT_DropDownList = this.dropdown.queryTltTalent(); // 專櫃編號下拉選單
  constructor(
    public readonly tls27020Service: TLS27020Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27020', 'TLS/TLS27020cru', this.queryForm, (form) => this.onSubmit(form));
    this.tls27020Service.queryClsDate().pipe(untilDestroyed(this)).subscribe(res => {
      const rawDate = res.Data;
      if (this.queryForm.get('TXN_Date')?.value && this.queryStateService.getQueryStateValue(this.ProgNo)) return; // 若有查詢紀錄則不預設
      this.queryForm.patchValue({ TXN_Date: formatDate(rawDate) }); // 預設日期
    });
  }

  editDisabled = (rowData: TLS27020Data): boolean => {
    return (rowData.Check_Status === 'Y' || rowData.isClose === 'Y'); // 已審核或已關帳的資料不可編輯
  };

  isRowSelectable(rowData: TLS27020Data): boolean {
    return rowData.isClose === 'N' && rowData.Check_Status === 'N';
  }

  onDelete(selectedItems: TLS27020Data[]) {
    this.messageService.confirm({
      message: `確定要刪除選取的 ${selectedItems.length} 筆資料嗎？`,
      header: `確認刪除`,
      accept: () => {
        this.loading = true;
        const body = {
          idList: selectedItems.map(item => item.id),
        };
        this.tls27020Service.deleteTLS27020(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.onSubmit(this.queryForm);
        });
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd'),
      }
      this.tls27020Service.queryTLS27020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.lastQueryBody = body;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
}
