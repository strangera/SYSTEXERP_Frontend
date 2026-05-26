import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls46050Request, Tls46050Response, Tls46050Service } from '@service/api/tls/tls46050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount2, formatDateTime } from '@shared/componentkit/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.4.6.5  TM監控報表
@Component({
  selector: 'app-tls46050',
  templateUrl: './tls46050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    DropdownRangeComponent,
    AsyncPipe,
    TableReportComponent,
    MultiSelectComponent
  ]
})
export class TLS46050Component extends BasicQueryPageComponent<Tls46050Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No_Start: [null], // start serial number
    ECR_No_End: [null],   // end serial Text
    ShowTypes: [null],    // DropDown
    ECR_GrpNos: [null],   // DropDown
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  }, { validators: this.validation.textRangeValidator('ECR_No_Start', 'ECR_No_End') });

  totalRecords = 0;
  historyRequestBody: Tls46050Request | null = null;
  ECR_NoOptions = this.dropdown.queryPos1002();
  ECR_GrpNoOptions = this.dropdown.queryPos1002Grm();
  data: Tls46050Response[] = [];

  // 依據有星號的欄位順序排列，並加入日期、金額格式化與顏色切換樣式
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'ECR_TLT_No', header: '專櫃編號' },
    { field: 'ECR_TLT_Name', header: '櫃位名稱' },
    { field: 'EOS_IP', header: '收銀機IP' },
    { field: 'EOS_Class', header: '班別' },
    { field: 'EOS_Status', header: '收銀機即時狀態' }, // 0=暫停交易、1=登出、3=交易中、5=關機
    { field: 'TLT_No', header: '機台所屬專櫃編號', visible: false },
    { field: 'TLT_Name', header: '機台所屬專櫃名稱', visible: false },
    { field: 'USR_No', header: '作業中的收銀員代碼' },
    { field: 'EOS_FreeGUIQty', header: '機台剩餘可開立發票張數', format: (val) => formatAmount2(val) },
    { field: 'EOS_Type', header: '機台類型' }, // 1=統收、2=自收、5=離線、7=虛擬、OT=它社
    { field: 'EOS_Online', header: '收銀機連線狀態' }, // Y=連線、N=離線
    { field: 'EOS_CloseTime', header: '完成清帳時間', format: (val) => formatDateTime(val) },
    { field: 'EOS_StartUpTime', header: '收銀機開機時間', format: (val) => formatDateTime(val) },
    { field: 'EOS_ShutDownTime', header: '收銀機關機時間', format: (val) => formatDateTime(val) },
    { field: 'EOS_LastTxnTime', header: '當天最後一筆交易時間', format: (val) => formatDateTime(val) },

    // 主程式、附加、資料、參數、外顯五大系統版本（隱藏的 New 用於判斷色調）
    {
      field: 'EOS_MstSysVer',
      header: '收銀系統主程式 KGPOS 版本',
      cellClass: (row) => row.EOS_MstSysNew === 'N' ? 'text-red-500' : 'text-color'
    },
    {
      field: 'EOS_ExtSysVer',
      header: '收銀系統 KGExtFunc 版本',
      cellClass: (row) => row.EOS_ExtSysNew === 'N' ? 'text-red-500' : 'text-color'
    },
    {
      field: 'EOS_DataSysVer',
      header: '收銀系統 KGDataFunc 版本',
      cellClass: (row) => row.EOS_DataSysNew === 'N' ? 'text-red-500' : 'text-color'
    },
    {
      field: 'EOS_PrmSysVer',
      header: '收銀系統 KGPrmFunc 版本',
      cellClass: (row) => row.EOS_PrmSysNew === 'N' ? 'text-red-500' : 'text-color'
    },
    {
      field: 'EOS_DmnSysVer',
      header: '收銀系統 STDmnPOS 版本',
      cellClass: (row) => row.EOS_DmnSysNew === 'N' ? 'text-red-500' : 'text-color'
    },

    { field: 'EOS_KBLevel', header: '鍵盤編號-機台回傳' },

    // 客戶顯示器周邊 (以 EOS_CDCheck 判斷 COM 埠顏色)
    { field: 'EOS_CD', header: '客戶顯示器型態' },
    { field: 'EOS_CDSysVer', header: '客戶顯示器程式版本', cellClass: (row) => row.EOS_CDSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_CDCom',
      header: '客戶顯示器連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_CDCheck)
    },

    // 收銀客顯螢幕周邊
    { field: 'EOS_ExtScr', header: '收銀客顯螢幕型態' },
    { field: 'EOS_ExtScrSysVer', header: '發票印表機程式版本', cellClass: (row) => row.EOS_ExtScrSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_ExtScrCom',
      header: '收銀客顯螢幕連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_ExtScrCheck)
    },

    // 發票印表機周邊
    { field: 'EOS_GUIPrn', header: '發票印表機型態' },
    { field: 'EOS_GUISysVer', header: '發票印表機程式版本', cellClass: (row) => row.EOS_GUISysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_GUICom',
      header: '發票印表機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_GUIPrnCheck)
    },

    // 收據印表機周邊
    { field: 'EOS_SlipPrn', header: '收據印表機型態' },
    { field: 'EOS_SlipPrnSysVer', header: '收據印表機程式版本', cellClass: (row) => row.EOS_SlipPrnSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_SlipPrnCom',
      header: '收據印表機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_SlipPrnCheck)
    },

    // 訂單印表機周邊
    { field: 'EOS_OrderPrn', header: '訂單印表機型態' },
    { field: 'EOS_OrderPrnSysVer', header: '訂單印表機程式版本', cellClass: (row) => row.EOS_OrderPrnSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_OrderPrnCom',
      header: '訂單印表機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_OrderPrnCheck)
    },

    // 標籤印表機周邊
    { field: 'EOS_LablePrn', header: '標籤印表機型態' },
    { field: 'EOS_LablePrnSysVer', header: '標籤印表機程式版本', cellClass: (row) => row.EOS_LablePrnSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_LablePrnCom',
      header: '標籤印表機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_LablePrnCheck)
    },

    // 信用卡刷卡機1周邊
    { field: 'EOS_EDC', header: '信用卡刷卡機型態' },
    { field: 'EOS_EDCSysVer', header: '信用卡刷卡機程式版本', cellClass: (row) => row.EOS_EDCSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_EDCCom',
      header: '信用卡刷卡機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_EDCCheck)
    },

    // 信用卡刷卡機2周邊
    { field: 'EOS_EDC2', header: '第二台信用卡刷卡機型態' },
    { field: 'EOS_EDC2SysVer', header: '第二台信用卡刷卡機程式版本', cellClass: (row) => row.EOS_EDC2SysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_EDC2Com',
      header: '第二台信用卡刷卡機連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_EDC2Check)
    },

    // 悠遊卡周邊
    { field: 'EOS_ElecSVCrdA', header: '悠遊卡型態' },
    { field: 'EOS_ElecSVCrdASysVer', header: '悠遊卡程式版本', cellClass: (row) => row.EOS_ElecSVCrdASysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_ElecSVCrdACom',
      header: '悠遊卡連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_ElecSVCrdACheck)
    },

    // 一卡通周邊
    { field: 'EOS_ElecSVCrdB', header: '一卡通型態' },
    { field: 'EOS_ElecSVCrdBSysVer', header: '一卡通程式版本', cellClass: (row) => row.EOS_ElecSVCrdBSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_ElecSVCrdBCom',
      header: '一卡通連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_ElecSVCrdBCheck)
    },

    // 愛金卡周邊
    { field: 'EOS_ElecSVCrdC', header: '愛金卡型態' },
    { field: 'EOS_ElecSVCrdCSysVer', header: '愛金卡程式版本', cellClass: (row) => row.EOS_ElecSVCrdCSysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_ElecSVCrdCCom',
      header: '愛金卡連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_ElecSVCrdCCheck)
    },

    // 電子支付周邊
    { field: 'EOS_ElecPay', header: '電子支付型態' },
    { field: 'EOS_ElecPaySysVer', header: '電子支付程式版本', cellClass: (row) => row.EOS_ElecPaySysNew === 'N' ? 'text-red-500' : 'text-color' },
    {
      field: 'EOS_ElecPayCom',
      header: '電子支付連接埠',
      format: (val) => formatAmount2(val),
      cellClass: (row) => this.getComCheckClass(row.EOS_ElecPayCheck)
    },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly validation: ValidationService,
    public readonly tls46050Service: Tls46050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46050', '/tls/tls46050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls46050Service.queryTLS57050(frm.getRawValue()).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = frm.getRawValue();
      });
    });
  }

  /**
   * 根據 Check 狀態切換連接埠 COM 欄位的文字顏色
   * Y -> 保持預設黑 (text-color)
   * N -> 顯示紅色 (text-red-500)
   * X -> 顯示紫色 (text-purple-500)
   */
  private getComCheckClass(checkValue: string): string {
    if (checkValue === 'N') return 'text-red-500';
    if (checkValue === 'X') return 'text-purple-500';
    return 'text-color'; // 預設黑或 Y
  }
}
