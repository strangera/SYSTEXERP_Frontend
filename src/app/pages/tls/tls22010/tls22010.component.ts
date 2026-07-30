import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton } from '@shared/components/table-report/table-report.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { columns, columnscru, ITxnData, ITxnDataDetail, ITxnDataDetailSum, TLS22010Query, toApiDate } from "./tls22010.model";

@Component({
  templateUrl: './tls22010.component.html',
  styleUrls: ['./tls22010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownModule,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    NgIf,
    TableReportComponent,
    AsyncPipe,
    DialogComponent
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<ITxnData> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, { validators: [Validators.required], updateOn: 'change' }],
    floor_noList: [null],
    ECR_NoList: [null],
    ShowStatus: ['1'],
    SysAccountStatus: ['0'],   // 💡 初始值改為 '0' (全部)
    CloseAccountStatus: ['0'], // 💡 初始值改為 '0' (全部)
    pageSize: [500],
    pageIndex: [1],
  });
  historyRequestBody: TLS22010Query | null = null;
  totalRecords = 0;
  data: ITxnData[] = [];
  selectedData: ITxnData | null = null;
  footerData: ITxnData[] = [];
  statusSummary = {
    LDataButZZero: 0,
    ZNotMatchL: 0,
    NoTxnMachine: 0
  };
  statusOptions = [
    { label: '全部', value: '0' },
    { label: '正常', value: '1' },
    { label: '異常', value: '2' },
  ];
  floorOptions = this.dropdown.querySys3900()
  ECRNoOptions = this.dropdown.queryPos1002();
  TXN_Date: string | null = null;
  columns = columns;
  addButton: AddButton[] = [
    { label: '匯出收銀機對帳查詢作業_明細PDF', icon: 'fa fa-file-pdf text-red-500', action: (rowData: ITxnData) => { this.exportPDF(rowData) } },
    { label: '匯出收銀機對帳查詢作業_明細Excel', icon: 'fa fa-file-lines text-green-500', action: (rowData: ITxnData) => { this.exportExcel(rowData) } }
  ]

  constructor(
    public readonly tls22010Service: Tls22010Service,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  // --------- 生命週期 ----------
  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm);
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.value;

      const payload = {
        ...raw,
        TXN_Date: this.datePipe.transform(raw.TXN_Date, 'yyyy-MM-dd'),
        ShowStatus: raw.ShowStatus ?? '1',
        // 💡 修正：直接帶入前端選擇的 '0' / '1' / '2'，並做基本防呆
        SysAccountStatus: raw.SysAccountStatus || '0',
        CloseAccountStatus: raw.CloseAccountStatus || '0'
      };

      this.tls22010Service.queryTLS22010(payload).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.data = response.Data ?? [];
        this.footerData = { ...response.footerData[0] ?? {} };
        this.totalRecords = response.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        this.historyRequestBody = payload;
        this.TXN_Date = this.datePipe.transform(raw.TXN_Date, 'yyyy/MM/dd');
      });
    });
  }
  override onDetail(data: ITxnData): void {
    this.dialogVisible = true;
    this.selectedData = data;
    const body = {
      ...data,
      PageSize: 1000,
      PageIndex: 1,
      SortBy: [{ field: 'TXN_No', order: 1 }],
      TXN_Date: toApiDate(data?.TXN_DATE),
    };
    this.dialogLoading = true;
    this.tls22010Service.queryTLS22010_Detail(body).pipe(finalize(() => this.dialogLoading = false), untilDestroyed(this)).subscribe({
      next: (res) => {
        this.dialogHistoryRequestBody = body;
        this.dialogData = res.Data; // 列表
        this.dialogTotalRecords = res.TotalCount || 0; // 總筆數
        this.dialogFooterData = res.footerData; // 總結資料
      },
    });
  }
  onDialogClose(event: boolean): void {
    this.dialogVisible = event;
    if (!event) {
      this.selectedData = null;
      this.dialogData = [];
      this.dialogTotalRecords = 0;
      this.dialogFooterData = null;
      this.dialogHistoryRequestBody = null;
    }
  }
  dialogVisible = false;
  columnscru = columnscru;
  dialogHistoryRequestBody: any;
  dialogData: ITxnDataDetail[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: ITxnDataDetailSum | null = null;
  dialogLoading = false;

  onExport(event: string) {
    if (event == 'PDF' && this.selectedData) {
      this.exportPDF(this.selectedData);
    } else if (event == 'Excel' && this.selectedData) {
      this.exportExcel(this.selectedData);
    }
  }

  exportExcel(raw: ITxnData): void {
    const body = {
      TXN_Date: this.datePipe.transform(raw.TXN_DATE, 'yyyy-MM-dd'),
      ECR_No: raw.ECR_No ?? "",
      floor_no: raw.FLOOR_NO ?? ""
    };

    this.tls22010Service.exportTLS22010Detail(body).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `收銀機對帳明細_${raw.TXN_DATE || 'unknown'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        globalThis.URL.revokeObjectURL(url);
        console.log(' Excel 檔案下載完成');
      },
    });
  }
  exportPDF(raw: ITxnData): void {
    // 使用與查詢明細相同的參數格式
    const body = {
      TXN_Date: this.datePipe.transform(raw.TXN_DATE, 'yyyy-MM-dd'),
      ECR_No: raw.ECR_No ?? "",
      floor_no: raw.FLOOR_NO ?? ""
    };
    this.tls22010Service.exportTLS22010DetailPDF(body).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `收銀機對帳明細_${raw.TXN_DATE || 'unknown'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        globalThis.URL.revokeObjectURL(url);
      },
    });
  }
}


