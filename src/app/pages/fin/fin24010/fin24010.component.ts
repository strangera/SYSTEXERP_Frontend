import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24010Service, QueryFIN24010Request, QueryFIN24010Response } from '@service/api/fin/fin24010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin24010',
  templateUrl: './fin24010.component.html',
  standalone: true,
  imports: [AsyncPipe, CalendarRangeQuickComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN24010Component extends BasicQueryPageComponent<QueryFIN24010Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ACP_No: [null, [Validators.maxLength(14)]], // 應付帳款編號 (varchar(14))
    Org_Id: [null, [Validators.maxLength(20)]], // 組織代碼 (varchar(20))
    ACP_YYYYMM: [new Date(), [Validators.required, Validators.maxLength(6)]], // 應付帳款年月 (varchar(6), 必填)
    ACP_TermNo: [null, [Validators.max(99)]], // 帳款帳次 (numeric(2))
    AcpAmt_From: [null, [Validators.max(9999999999)]], // 應付金額起 (NUMERIC(14,4))
    AcpAmt_To: [null, [Validators.max(9999999999)]], // 應付金額迄 (NUMERIC(14,4))
    PtaAmt_From: [null, [Validators.max(9999999999)]], // 沖帳金額起 (NUMERIC(14,4))
    PtaAmt_To: [null, [Validators.max(9999999999)]], // 沖帳金額迄 (NUMERIC(14,4))
    BalAmt_From: [null, [Validators.max(9999999999)]], // 應付餘額起 (NUMERIC(14,4))
    BalAmt_To: [null, [Validators.max(9999999999)]], // 應付餘額迄 (NUMERIC(14,4))
    Reserve_From: [null, [Validators.max(9999999999)]], // 保留款金額起 (NUMERIC(14,4))
    Reserve_To: [null, [Validators.max(9999999999)]], // 保留款金額迄 (NUMERIC(14,4))
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
    HasUnpaid: [null], // 是否有未付款
    CheckChangedUser: [null], // 異動帳號檢核
  });
  data: QueryFIN24010Response[] = [];
  lastQueryBody: QueryFIN24010Request | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'ACP_No', header: '應付帳款編號' }, // (單據別+YYYYMMDD+XXXX)
    { field: 'org_id', header: '組織代碼' }, // (SYS3100)
    { field: 'ACP_YYYYMM', header: '應付帳款年月' },
    { field: 'acp_termno', header: '帳款帳次' },
    { field: 'ACP_Date', header: '立帳日期' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'VEN_Uniform', header: '廠商統一編號/身份證字號' },
    { field: 'AccNo', header: '會計科目' },
    { field: 'ACP_SourceNo', header: '帳款來源單號' },
    { field: 'ACP_Amt', header: '應付金額' },
    { field: 'PTA_Amt', header: '沖帳金額' },
    { field: 'ACP_Balance', header: '應付餘額' }, // (ACP_Amt - PTA_Amt)
    { field: 'ACP_ReserveAmt', header: '保留金額' },
    { field: 'VEN_PayType', header: '付款方式' }, // (1:電匯,2:開票,3:現金)
    { field: 'VEN_BNK_No', header: '匯款銀行代碼' },
    { field: 'VEN_BNK_BranchNo', header: '匯款銀行分行代碼' },
    { field: 'VEN_BankAccountNo', header: '匯款帳號' },
    { field: 'VEN_AccountName', header: '匯款帳戶名稱' },
    { field: 'ACP_ExpectPayDate', header: '預計付款日期' },
    { field: 'VEN_CheckTitle', header: '支票抬頭' },
    { field: 'VEN_CTRLYN', header: '是否禁止背書轉讓' }, // (Y是 N否)
    { field: 'Bank_Name', header: '銀行名稱' },
    { field: 'Bank_BranchName', header: '銀行分行名稱' },
    { field: 'Bank_AccName', header: '公司銀行帳戶名稱' },
    { field: 'VouNo', header: '傳票編號' },
    { field: 'Vou_PostFlag', header: '傳票過帳旗標' }, // (0=未過帳 1=已製票 3=已過帳)
    { field: 'Vou_PostFlagName', header: '傳票過帳狀態中文說明' },
    { field: 'ACP_Status', header: '應付帳款狀態' }, // (0=作廢 2=建立)
    { field: 'SubDetailNo', header: '對象編號' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_No', header: '建立人員' },
    { field: 'CRT_USR_Name', header: '建立人員姓名' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_No', header: '變更人員' },
    { field: 'UPD_USR_Name', header: '變更人員姓名' },
    { field: 'POS_VEN_BNK_No', header: 'POS2013 廠商銀行代碼' },
    { field: 'POS_VEN_BankAccountNo', header: 'POS2013 廠商銀行帳號' },
    { field: 'POS_VEN_AccountName', header: 'POS2013 廠商帳戶名稱' },
    { field: 'Diff_BNK_No', header: '銀行代碼是否不同' }, // (Y/N)
    { field: 'Diff_BankAccountNo', header: '銀行帳號是否不同' }, // (Y/N)
    { field: 'Diff_AccountName', header: '帳戶名稱是否不同' }, // (Y/N)
  ];

  // 下拉選單/多選列表的 Options 宣告 (必須與 HTML 中的 options 屬性對應)
  Org_IdOptions = this.dropDown.querySys3100(); // 組織代碼
  PayTypeOptions = [{ label: '電匯', value: '1' }, { label: '開票', value: '2' }, { label: '現金', value: '3' }] // 付款方式 1:電匯,2:開票,3:現金
  VEN_BNK_No_ParamOptions = this.dropDown.queryAps1001NoBranch(); // 匯款銀行代號
  CTRLYNOptions = [{ label: '是', value: 'Y' }, { label: '否', value: 'N' }]; // 票據禁止背書轉讓 (Y/N)
  VEN_No_ParamOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號
  AccNo_ParamOptions = this.dropDown.queryGls1005(); // 會計科目代號
  VouStatusOptions = getSYS1000Options('VOU_Status'); // 傳票狀態
  ACP_Status_ParamOptions = getSYS1000Options('ACP_Status'); // 應付狀態
  SubDetailNo_ParamOptions = this.dropDown.queryGLS1016();  // 對象別編號
  HasUnpaidOptions = [{ label: '是', value: 'Y' }, { label: '否', value: null }]; // 是否有未付款 (Y/N)
  CheckChangedUserOptions = [{ label: '是', value: 'Y' }, { label: '否', value: null }]; // 異動帳號檢核

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
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM'),
      }
      this.fin24010Service.queryFIN24010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = body;
      });
    });
  }
}
