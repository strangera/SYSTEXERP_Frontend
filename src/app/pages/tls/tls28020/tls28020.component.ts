import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

import { ITLS28020Data, QueryTLS28020Request, TLS28020Service } from '@service/api/tls/tls28020.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton, formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls28020',
  templateUrl: './tls28020.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarComponent, DropdownComponent, AsyncPipe, ButtonComponent,
    TableReportComponent, TranslateModule
  ],
  providers: [DatePipe]
})
export class TLS28020Component extends BasicQueryPageComponent<ITLS28020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DATE: [new Date(), [Validators.required]],
    STATUS: [0, [Validators.required]], // 0=全部 (對應 SP @STATUS)
    BAG_TYPE: [null],                   // 對應 SP @BAG_TYPE
    ECR_NO: [null],                    // 對應 SP @ECR_NO
  });
  totalRecords = 0;
  data: ITLS28020Data[] = [];
  lastQueryBody: QueryTLS28020Request | null = null;
  statusOptions: { No: number; Name: string }[] = [
    { No: 0, Name: '全部' },
    { No: 1, Name: '未領袋' },
    { No: 2, Name: '未繳袋' },
    { No: 3, Name: '未領袋且未繳袋' },
  ];
  bagTypeOptions: IDropdownItem[] = [
    { No: '1', Name: '現金袋' },
    { No: '2', Name: '帳務袋' },
    { No: '3', Name: '零用金袋' },
  ];

  queryEcrNoOptions = this.dropdown.queryPos1002();

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', format: formatDate },
    {
      field: 'BAG_TYPE', header: '袋子類型', format: (v) => {
        const type = this.bagTypeOptions.find(option => option.No === v);
        return type ? type.Name : v;
      },
      exportFormat: [{ '1': '現金袋' }, { '2': '帳務袋' }, { '3': '零用金袋' }],
    },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TLT_No', header: '錢箱號' },
    { field: 'GET_TIME', header: '領袋時間', format: formatDateTime },
    { field: 'BAK_TIME', header: '繳袋時間', format: formatDateTime },
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime, visible: false },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', format: formatDateTime, visible: false },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];

  addButton: AddButton[] = [
    {
      label: '領袋',
      icon: 'pi pi-sign-in', // PrimeIcons 登入圖示，象徵領取
      // 只有當尚未領袋時才啟用 (GET_TIME 為空)
      disabled: (rowData: ITLS28020Data) => !!rowData.GET_TIME,
      action: (rowData: ITLS28020Data) => this.onUpdateStatus(rowData, '領袋')
    },
    {
      label: '繳袋',
      icon: 'pi pi-sign-out', // PrimeIcons 登出圖示，象徵繳回
      // 只有當已領袋且尚未繳袋時才啟用 (GET_TIME 有值且 BAK_TIME 為空)
      disabled: (rowData: ITLS28020Data) => !rowData.GET_TIME || !!rowData.BAK_TIME,
      action: (rowData: ITLS28020Data) => this.onUpdateStatus(rowData, '繳袋')
    },
  ];

  constructor(
    public readonly tls28020Service: TLS28020Service,
    private readonly datePipe: DatePipe,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS28020');
  }

  /**
   * 執行新增 (對應 SP_TLS28020Insert)
   * SA 規格：輸入入帳日期後按確認，產生領袋資料
   */
  override onCreate() {
    const txnDate = this.datePipe.transform(this.queryForm.value.TXN_DATE, 'yyyy-MM-dd');
    const txnDate2 = this.datePipe.transform(this.queryForm.value.TXN_DATE, 'yyyy/MM/dd');
    this.loading = true;
    this.tls28020Service.insertTLS28020({ TXN_DATE: txnDate })
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
        this.messageService.successBubble(res.Message + '，產生日期：' + txnDate2, '產生領帶資料');
        this.onSubmit(this.queryForm);
      });
  }

  /**
   * 執行查詢 (對應 SP_TLS28020Query)
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: QueryTLS28020Request = {
        TXN_DATE: this.datePipe.transform(frm.value.TXN_DATE, 'yyyy-MM-dd') ?? '',
        BAG_TYPE: frm.value.BAG_TYPE,
        ECR_NO: frm.value.ECR_NO,
        STATUS: frm.value.STATUS
      };

      this.tls28020Service.queryTLS28020(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe((res) => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.lastQueryBody = body;
        });
    });
  }
  /**
   * 執行更新狀態 (領袋/繳袋)
   */
  onUpdateStatus(rowData: ITLS28020Data, actionName: string) {
    // 建立請求物件，注意欄位大小寫需與後端 Request Class 一致
    const body = {
      TXN_DATE: this.datePipe.transform(rowData.TXN_Date, 'yyyy-MM-dd') ?? '',
      ECR_NO: rowData.ECR_No,
      BAG_TYPE: rowData.BAG_TYPE
    };

    this.loading = true;
    this.tls28020Service.updateTLS28020(body)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res) => {
        this.messageService.successBubble(res.Message, actionName);
        this.onSubmit(this.queryForm);
      });
  }
}
