import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service, QueryFIN24010Request, QueryFIN24010Response } from '@service/api/fin/fin24010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin24010',
  templateUrl: './fin24010.component.html',
  standalone: true,
  imports: [NgIf, ButtonModule, AsyncPipe, CalendarRangeComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN24010Component extends BasicQueryPageComponent<QueryFIN24010Response> implements OnInit {
  queryForm = this.formBuilder.group({
    ACP_No: [null, [Validators.maxLength(14)]], // 應付帳款編號 (varchar(14))
    Org_Id: [null, [Validators.maxLength(20)]], // 組織代碼 (varchar(20))
    ACP_YYYYMM: [null, [Validators.maxLength(6)]], // 應付帳款年月 (varchar(6), 必填)
    ACP_TermNo: [null, [Validators.max(99)]], // 帳款帳次 (numeric(2))
    AcpAmt_From: [null, [Validators.max(9999999999)]], // 應付金額起 (NUMERIC(14,4))
    AcpAmt_To: [null, [Validators.max(9999999999)]], // 應付金額迄 (NUMERIC(14,4))
    PtaAmt_From: [null, [Validators.max(9999999999)]], // 沖帳金額起 (NUMERIC(14,4))
    PtaAmt_To: [null, [Validators.max(9999999999)]], // 沖帳金額迄 (NUMERIC(14,4))
    BalAmt_From: [null, [Validators.max(9999999999)]], // 應付餘額起 (NUMERIC(14,4))
    BalAmt_To: [null, [Validators.max(9999999999)]], // 應付餘額迄 (NUMERIC(14,4))
    Reserve_From: [null, [Validators.max(9999999999)]], // 保留款金額起 (NUMERIC(14,4))
    Reserve_To: [null, [Validators.max(9999999999)]], // 保留款金額迄 (NUMERIC(14,4))
    RetReserve_From: [null, [Validators.max(9999999999)]], // 退保留款金額起 (NUMERIC(14,4))
    RetReserve_To: [null, [Validators.max(9999999999)]], // 退保留款金額迄 (NUMERIC(14,4))
    PayType: [null], // 付款方式 (char(1))
    VEN_BNK_No_Param: [null], // 匯款銀行代號 (varchar(5))
    BankAccountNo: [null, [Validators.maxLength(50)]], // 銀行帳號 (varchar(50))
    AccountName: [null, [Validators.maxLength(80)]], // 帳戶名稱 (nvarchar(80))
    CTRLYN: [null], // 票據禁止背書轉讓 (char(1))
    CheckTitle: [null, [Validators.maxLength(100)]], // 票據抬頭 (nvarchar(100))
    ExpectPayDate_From: [null], // 預計付款日起 (DATE)
    ExpectPayDate_To: [null], // 預計付款日迄 (DATE)
    ACP_Date_From: [null], // 立帳日期起 (DATE)
    ACP_Date_To: [null], // 立帳日期迄 (DATE)
    VEN_No_Param: [null], // 廠商編號 (varchar(16))
    VEN_Uniform_Param: [null, [Validators.maxLength(16)]], // 統一編號 (varchar(16))
    AccNo_Param: [null], // 會計科目代號 (VARCHAR(14))
    ACP_SourceNo_Param: [null, [Validators.maxLength(20)]], // 帳款來源單號 (VARCHAR(20))
    NoteDesc_Param: [null, [Validators.maxLength(160)]], // 摘要 (NVARCHAR(160))
    VouNo_Param: [null, [Validators.maxLength(12)]], // 傳票號碼 (VARCHAR(12))
    VouStatus: [null], // 傳票狀態
    ACP_Status_Param: [null], // 應付狀態 (VARCHAR(1))
    SubDetailNo_Param: [null], // 對象別編號 (VARCHAR(30))
    PTA: [null, [Validators.maxLength(19)]], // 立沖代號 (VARCHAR(19))
    HasUnpaid: [null], // 是否有未付款
    CheckChangedUser: [null], // 是否只顯示銀行資料有差異
  });
  data: QueryFIN24010Response[] = [];
  selectedItems: QueryFIN24010Response[] = [];
  lastQueryBody: QueryFIN24010Request | null = null;
  totalRecords = 0;
  // 1. 原始查詢欄位 (預設/通用)
  columns: ReportColumn[] = [
    { field: 'ACP_No', header: '應付ID' },
    { field: 'ACP_YYYYMM', header: '帳款年月' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'PTA_Amt', header: '沖帳金額', format: formatAmount },
    { field: 'ACP_Balance', header: '應付帳款餘額', format: formatAmount },
    { field: 'VEN_PayType_Name', header: '付款方式' }, // 註：此處顯示的是代碼(1,2,3)，若需顯示中文可能需另外處理 mapping
    { field: 'ACP_Date', header: '立帳日期', format: formatDate },
    { field: 'ACP_ExpectPayDate', header: '預計付款日', format: formatDate },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' }, // 視需求保留，通常廠客代號後會接名稱
    { field: 'NoteDesc', header: '摘要' },
    { field: 'VouNo', header: '傳票編號' },
    { field: 'Vou_PostFlagName', header: '傳票狀態' }, // 使用後端給的中文說明欄位
    { field: 'ACP_Status_Name', header: '狀態' }, // 應付帳款狀態 (0=作廢 2=建立)
    { field: 'PTA_Key', header: '立沖代號' },
  ];

  // 2. 是否只顯示銀行資料有差異專屬欄位 (新增)
  checkChangedUserColumns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    // 帳款檔資訊 (顯示組合後的結果)
    { field: 'Full_VEN_BNK_No', header: '匯款銀行代號' },
    { field: 'Full_Bank_Name', header: '匯款銀行名稱' },
    { field: 'VEN_BankAccountNo', header: '銀行帳號' },
    // 廠商主檔資訊 (顯示組合後的結果)
    { field: 'Full_POS_VEN_BNK_No', header: '廠商主檔匯款銀行代號' },
    { field: 'Full_POS_Bank_Name', header: '廠商主檔匯款銀行名稱' },
    { field: 'POS_VEN_BankAccountNo', header: '廠商主檔銀行帳號' },
  ];

  // 3. 追蹤目前是否處於異動檢核模式 (新增)
  isCheckChangedUserMode = false;

  // 下拉選單/多選列表的 Options 宣告 (必須與 HTML 中的 options 屬性對應)
  Org_IdOptions = this.dropDown.querySys3100(); // 組織代碼
  PayTypeOptions = getSYS1000Options('VEN_PayType'); // 付款方式 1:電匯,2:開票,3:現金
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001_DropDownList(); // 匯款銀行代號
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商編號
  AccNo_ParamOptions = this.dropDown.queryGls1005(); // 會計科目代號
  VouStatusOptions = getSYS1000Options('VOU_Status'); // 傳票狀態
  ACP_Status_ParamOptions = getSYS1000Options('ACP_Status'); // 應付狀態
  SubDetailNo_ParamOptions = this.dropDown.queryGLS1016();  // 對象別編號
  CTRLYNOptions = getSYS1000Options('YES_NO'); // 票據禁止背書轉讓 (Y/N)
  HasUnpaidOptions = [
    { label: '有未付款', value: 'Y' },
    { label: '沒有未付款', value: 'N' },
  ];// 是否有未付款 (Y/N)
  CheckChangedUserOptions = [{ label: '是', value: 'Y' }, { label: '否', value: null }]; // 是否只顯示銀行資料有差異

  constructor(
    public readonly fin24010Service: Fin24010Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN24010', 'fin/fin24010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.isCheckChangedUserMode = false;
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        pageIndex: 1, // 第一次查詢預設從第一頁開始
        pageSize: 1000, // 第一次查詢預設1000筆
        ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM'),
        ExpectPayDate_From: this.datePipe.transform(frm.value.ExpectPayDate_From, 'yyyy-MM-dd'),
        ExpectPayDate_To: this.datePipe.transform(frm.value.ExpectPayDate_To, 'yyyy-MM-dd'),
        ACP_Date_From: this.datePipe.transform(frm.value.ACP_Date_From, 'yyyy-MM-dd'),
        ACP_Date_To: this.datePipe.transform(frm.value.ACP_Date_To, 'yyyy-MM-dd'),
      }
      this.fin24010Service.queryFIN24010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onCheckChangedUser(frm: FormGroup) {
    // this.handleSubmit(frm, () => {
    this.loading = true;
    this.isCheckChangedUserMode = true;
    const body = {
      ...frm.value,
      pageIndex: 1, // 第一次查詢預設從第一頁開始
      pageSize: 1000, // 第一次查詢預設1000筆
      ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM'),
      ExpectPayDate_From: this.datePipe.transform(frm.value.ExpectPayDate_From, 'yyyy-MM-dd'),
      ExpectPayDate_To: this.datePipe.transform(frm.value.ExpectPayDate_To, 'yyyy-MM-dd'),
      ACP_Date_From: this.datePipe.transform(frm.value.ACP_Date_From, 'yyyy-MM-dd'),
      ACP_Date_To: this.datePipe.transform(frm.value.ACP_Date_To, 'yyyy-MM-dd'),
      CheckChangedUser: 'Y'
    }
    this.fin24010Service.queryFIN24010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
      this.data = response.Data;
      this.totalRecords = response.TotalCount;
      this.lastQueryBody = body;
    });
    // });
  }
  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-ban',
      disabled: (item: QueryFIN24010Response) => item.ACP_Status !== '2' || (item.PTA_Amt ?? 0) !== 0,
      action: (item: QueryFIN24010Response) => this.onVoid(item),
    },
    {
      label: '反作廢',
      icon: 'pi pi-replay',
      disabled: (item: QueryFIN24010Response) => item.ACP_Status !== '0',
      action: (item: QueryFIN24010Response) => this.onUnVoid(item),
    },
  ];

  onVoid(item: QueryFIN24010Response) {
    this.fin24010Service.voidFIN24010({ ACP_No: item.ACP_No }).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        this.messageService.successBubble(res.Message);
        this.refreshQuery();
      }
    });
  }

  onUnVoid(item: QueryFIN24010Response) {
    this.fin24010Service.unVoidFIN24010({ ACP_No: item.ACP_No }).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        this.messageService.successBubble(res.Message);
        this.refreshQuery();
      }
    });
  }

  private refreshQuery() {
    if (!this.lastQueryBody) return;
    this.loading = true;
    this.fin24010Service.queryFIN24010(this.lastQueryBody)
      .pipe(finalize(() => this.loading = false), untilDestroyed(this))
      .subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
      });
  }

  btnLoading = false;
  onUpdateRemit() {
    this.btnLoading = true;
    this.fin24010Service.updateFIN24010Remit({
      ACP_No_List: this.selectedItems.map(item => item.ACP_No)
    }).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCheckChangedUser(this.queryForm);
      this.selectedItems = [];
    });
  }

  // "查無可更新資料：可能應付ID不存在、非建立狀態(ACP_Status<>2)、或已沖帳(PTA_Amt<>0)。"
  editDisabled(item: QueryFIN24010Response) {
    return item.ACP_Status !== '2' || (item.PTA_Amt !== null && item.PTA_Amt !== 0);
  }
}
