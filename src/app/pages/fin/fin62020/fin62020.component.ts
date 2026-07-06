import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin62020FooterData, Fin62020QueryRequest, Fin62020QueryResponseItem, Fin62020Service, Fin62020Subtotals } from '@service/api/fin/fin62020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
@Component({
  selector: 'app-fin62020',
  templateUrl: './fin62020.component.html',
  standalone: true,
  imports: [ButtonModule, AsyncPipe, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN62020Component extends BasicQueryPageComponent<Fin62020QueryResponseItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    Tran_No: [null, [Validators.maxLength(13)]],
    Tran_Date_Start: [null],
    Tran_Date_End: [null],
    CRT_Date_Start: [null],
    CRT_Date_End: [null],
    BNK_No_In: [null],
    BNK_No_Out: [null],
    IsLoadRemark: [false],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'Tran_Date', order: 1 }]],
  });
  BNK_NoOptions = this.dropdown.queryGls1005_BNK_DepositAcc();
  ifOptions = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];
  data: Fin62020QueryResponseItem[] = [];
  lastQueryBody: Fin62020QueryRequest | null = null;
  footerData: Fin62020FooterData | null = null;
  subTotalData: Fin62020Subtotals[] = [];
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'Tran_No', header: '調撥單號' },
    { field: 'Tran_Date', header: '轉帳日期', format: formatDate },
    { field: 'BNK_No_In', header: '調入銀行' },
    { field: 'BNK_No_In_Name', header: '調入銀行名稱' },
    { field: 'BNK_AccNo_In', header: '調入帳號' },
    { field: 'BNK_No_Out', header: '調出銀行' },
    { field: 'BNK_No_Out_Name', header: '調出銀行名稱' },
    { field: 'BNK_AccNo_Out', header: '調出帳號' },
    { field: 'Tran_Amt', header: '金額', format: formatAmount, isSubTotal: true },
    { field: 'Fee_Amt', header: '手續費', format: formatAmount, isSubTotal: true },
    { field: 'Total_Amt', header: '合計', format: formatAmount, isSubTotal: true },
    { field: 'Remark', header: '備註' },
  ];

  constructor(
    public readonly fin62020Service: Fin62020Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN62020');
    this.queryForm.controls.IsLoadRemark.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      if (this.lastQueryBody) {
        this.lastQueryBody = {
          ...this.lastQueryBody,
          IsLoadRemark: val
        };
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin62020Service.queryFIN62020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.footerData = res.GrandTotal;
        this.subTotalData = res.Subtotals;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.value;
      })
    })
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin62020Service.exportFIN62020PDF(this.lastQueryBody);

    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin62020Service.exportFIN62020Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}
