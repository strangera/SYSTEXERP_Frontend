import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin62010Service, QueryFIN62010Request, QueryFIN62010Response } from '@service/api/fin/fin62010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, formatDateTime, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
@Component({
  selector: 'app-fin62010',
  templateUrl: './fin62010.component.html',
  standalone: true,
  imports: [AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, DropdownComponent, TranslateModule]
})
export class FIN62010Component extends BasicQueryPageComponent<QueryFIN62010Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Tran_No: [null, [Validators.maxLength(13)]],
    Tran_Date_Start: [null],
    Tran_Date_End: [null],
    CRT_Date_Start: [null],
    CRT_Date_End: [null],
    BNK_No_In: [null],
    BNK_No_Out: [null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'Tran_No', order: -1 }]],
  });
  BNK_NoOptions = this.dropdown.queryGls1005_BNK_DepositAcc();
  data: QueryFIN62010Response[] = [];
  selectedItems: QueryFIN62010Response[] = [];
  lastQueryBody: QueryFIN62010Request | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'Tran_No', header: '調撥單號' },
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
    { field: 'Tran_Date', header: '轉帳日期', format: formatDate },
    { field: 'BNK_No_In', header: '轉入公司銀行科目代號' },
    { field: 'BNK_No_In_Name', header: '轉入銀行名稱' },
    { field: 'BNK_No_Out', header: '轉出公司銀行科目代號' },
    { field: 'BNK_No_Out_Name', header: '轉出銀行名稱' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'Tran_Amt', header: '金額', format: formatAmount, align: 'right' },
    { field: 'Fee_Amt', header: '手續費', format: formatAmount, align: 'right' },
    { field: 'Remark', header: '備註' }
  ];
  constructor(
    public readonly fin62010Service: Fin62010Service,
    private readonly dropdown: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('FIN62010', 'fin/fin62010cru', this.queryForm, (from) => this.onSubmit(from));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin62010Service.queryFIN62010(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
  onDelete(selectedRows: QueryFIN62010Response[]) {
    this.messageService.confirm({
      header: '刪除確認',
      message: `是否刪除${selectedRows.length}筆已選擇項目?`,
      accept: () => {
        const idList = selectedRows.map(row => row.ID);
        this.loading = true;
        this.fin62010Service.deleteFIN62010({ IdList: idList }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
          this.messageService.successBubble(res.Message);
        });
      }
    })
  }
  isRowSelectable(row: QueryFIN62010Response): boolean {
    return row.Tran_Status !== '2';
  }

  editDisabled(rowdata: QueryFIN62010Response): boolean {
    return rowdata.Tran_Status === '2';
  }
}
