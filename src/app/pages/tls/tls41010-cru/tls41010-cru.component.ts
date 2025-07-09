import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms'; // Import FormBuilder
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS41010Data } from '../../../service/api/tls/tls41010.service';
import { TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { guiTypeOptions, salTypeOptions, sernoTypeOptions, settleDDOptions, statusOptions, typeOptions, yesNoOptions } from './tls41010-cru.model';

// 2.4.1.1 收銀機基本資料維護 CRU
@Component({
  selector: 'app-tls41010-cru',
  templateUrl: './tls41010-cru.component.html',
})
export class TLS41010CRUComponent extends BasicCruPageComponent<TLS41010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SYS_StoreNo: [{ value: '', disabled: true }], // 收銀機所屬門市店號
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]], // 收銀機號
    ECR_Name: ['', [Validators.required, Validators.maxLength(20)]], // 收銀機名稱
    ECR_Type: ['1', [Validators.required, Validators.maxLength(2)]], // 機台類型
    ECR_TLT_No: ['', [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬專櫃名稱
    ECR_USR_No: ['', [Validators.maxLength(8)]], // 機台所屬收銀員
    ECR_USR_Name: ['', [Validators.maxLength(20)]], // 機台所屬收銀員姓名
    ECR_ActiveDate: [null], // 啟用日期
    ECR_ExpireDate: [null], // 到期日期
    ECR_CloseDate: [null], // 停用日期
    ECR_Status: ['A', [Validators.maxLength(2)]], // 收銀機狀態
    ECR_Group: ['', [Validators.maxLength(20)]], // 群組
    ECR_SubGroup: ['', [Validators.maxLength(20)]], // 次樓別
    ECR_AreaNo: ['', [Validators.maxLength(6)]], // 區域
    ECR_LocNo: ['', [Validators.maxLength(10)]], // 位置編號
    HOS_No: ['', [Validators.maxLength(10)]], // 倉庫編號
    ECR_SAL_Type: ['', [Validators.maxLength(8)]], // 機台用途別
    ECR_ComName: ['', [Validators.maxLength(64)]], // 收銀機電腦名稱
    ECR_IP: ['', [Validators.maxLength(20)]], // 收銀機網路IP
    ECR_SrvIP: ['', [Validators.maxLength(20)]], // 收銀機後台主機(POSServer)IP
    ECR_TmplNo: ['', [Validators.maxLength(8)]], // 周邊設定模版編號
    ECR_SernoType: ['2', [Validators.required, Validators.maxLength(1)]], // 交易序號模式
    ECR_GUI_Type: ['07', [Validators.required, Validators.maxLength(2)]], // 發票使用類別
    ECR_TimeTickInvl: [0, [Validators.required, Validators.min(0), Validators.max(999999)]], // 系統對時間隔(秒)
    ECR_Interval: [6, [Validators.required, Validators.min(0), Validators.max(999999)]], // 上下傳異動檔間隔(秒)
    ECR_MaxQty: [999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]], // 單筆交易數量上限
    ECR_MaxAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]], // 單筆交易金額上限
    ECR_MaxItemAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]], // 單一明細金額上限
    ECR_MaxDisc: [0, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]], // 單筆交易最大折扣比率限制
    ECR_EdcTimeout: [60, [Validators.required, Validators.min(0), Validators.max(999999)]], // 信用卡刷卡機連線時限(秒)
    ECR_EdcSettle: ['Y', [Validators.required, Validators.maxLength(1)]], // 信用卡刷卡機連動日結(Y/N)
    ECR_ForceInput: ['N', [Validators.required, Validators.maxLength(1)]], // 是否強制輸入付款金額(Y/N)
    ECR_CustCntEntry: ['N', [Validators.required, Validators.maxLength(1)]], // 是否輸入來客數(Y/N)
    ECR_CustTypeEntry: ['N', [Validators.required, Validators.maxLength(1)]], // 是否輸入客層數(Y/N)
    ECR_ClerkEntry: ['N', [Validators.required, Validators.maxLength(1)]], // 是否強制輸入營業員(Y/N)
    ECR_ForceMember: ['N', [Validators.required, Validators.maxLength(1)]], // 是否強制輸入會員編號(Y/N)
    ECR_BoxReqCode: ['N', [Validators.required, Validators.maxLength(1)]], // 開抽屜是否輸入密碼(Y/N)
    ECR_SelfReport: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否執行自我報帳(Y/N)
    ECR_SaleRpt1: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印收銀員交班表(Y/N)
    ECR_SaleRpt2: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印收銀機財務報表(Y/N)
    ECR_SaleRpt3: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印時段銷售報表(Y/N)
    ECR_SaleRpt4: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印部門銷售報表(Y/N)
    ECR_SaleRpt5: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印單品銷售報表(Y/N)
    ECR_SaleRpt6: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印銷貨明細表(Y/N)
    ECR_SaleRpt7: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印作廢明細表(Y/N)
    ECR_SaleRpt8: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印自我報帳(現額報告)帳條(Y/N)
    ECR_SaleRpt9: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否列印保全現金帳條(現金明細表)(Y/N)
    ECR_SaleRpt10: ['N', [Validators.required, Validators.maxLength(1)]], // 保留(Y/N)
    ECR_PcashValid: ['N', [Validators.required, Validators.maxLength(1)]], // 零用金是否需要認證(Y/N)
    ECR_PickUpValid: ['N', [Validators.required, Validators.maxLength(1)]], // 中途取現是否需要認證(Y/N)
    ECR_ReprintGUI: ['N', [Validators.required, Validators.maxLength(1)]], // 是否允許執行補印發票(Y/N)
    ECR_PrnLogo: ['Y', [Validators.maxLength(1)]], // 是否列印商標(Y/N)
    ECR_Logo1: ['', [Validators.maxLength(100)]], // 商標1(店名)
    ECR_Logo2: ['', [Validators.maxLength(100)]], // 商標2(地址)
    ECR_Logo3: ['', [Validators.maxLength(100)]], // 商標3(電話)
    ECR_Logo4: ['', [Validators.maxLength(100)]], // 商標4(統一編號)
    ECR_Logo5: ['', [Validators.maxLength(100)]], // 商標5
    ECR_Logo6: ['', [Validators.maxLength(100)]], // 商標6
    ECR_VoidTxn: ['Y', [Validators.required, Validators.maxLength(1)]], // 是否允許作廢交易(Y/N)
    ECR_VoidRstDay: [0, [Validators.required, Validators.min(0), Validators.max(9999)]], // 作廢交易限制天數
    ECR_CreditNote: ['N', [Validators.required, Validators.maxLength(1)]], // 是否允許開立折讓單(Y/N)
    ECR_GUI_PeriodQty: [50, [Validators.min(0), Validators.max(99999999)]], // 機台每期電子發票預設配號數量
    ECR_GUI_MinQty: [50, [Validators.min(0), Validators.max(99999999)]], // 機台電子發票最小安全存量
    ECR_SettleDD: ['T', [Validators.required, Validators.maxLength(2)]], // 清機提示日期
    ECR_SettleHHNN: ['2330', [Validators.required, Validators.maxLength(4)]], // 清機提示時間-時分
    ECR_KBLevel: ['', [Validators.maxLength(6)]], // 機台鍵盤等級
    ECR_KBType: ['', [Validators.maxLength(6)]], // 鍵盤型態
    ECR_Scanner: ['', [Validators.maxLength(20)]], // 掃描器型態
    ECR_ScannerCom: [0, [Validators.min(0), Validators.max(99)]], // 掃描器連接埠
    ECR_ScrType: ['', [Validators.maxLength(20)]], // 收銀畫面樣式
    ECR_CD: ['', [Validators.maxLength(20)]], // 客戶顯示器型態
    ECR_CDCom: [0, [Validators.min(0), Validators.max(99)]], // 客戶顯示器連接埠
    ECR_ExtScr: ['', [Validators.maxLength(20)]], // 收銀外接顯示器名稱
    ECR_ExtScrCom: [0, [Validators.min(0), Validators.max(99)]], // 收銀外接顯示器連接埠
    ECR_GUIPr: ['', [Validators.maxLength(20)]], // 發票印表機型態
    ECR_GUICom: [0, [Validators.min(0), Validators.max(99)]], // 發票印表機連接埠
    ECR_SlipPr: ['', [Validators.maxLength(20)]], // 菜單印表機型態
    ECR_SlipPrnCom: [0, [Validators.min(0), Validators.max(99)]], // 菜單印表機連接埠
    ECR_LablePr: ['', [Validators.maxLength(20)]], // 標籤印表機型態
    ECR_LablePrnCom: [0, [Validators.min(0), Validators.max(99)]], // 標籤印表機連接埠
    ECR_EDC: ['', [Validators.maxLength(20)]], // 信用卡刷卡機型態
    ECR_EDCCom: [0, [Validators.min(0), Validators.max(99)]], // 信用卡刷卡機連接埠
    ECR_EDC2: ['', [Validators.maxLength(20)]], // 第二台信用卡刷卡機型態
    ECR_EDC2Com: [0, [Validators.min(0), Validators.max(99)]], // 第二台信用卡刷卡機連接埠
    ECR_EDC3: ['', [Validators.maxLength(20)]], // 第三台信用卡刷卡機型態
    ECR_EDC3Com: [0, [Validators.min(0), Validators.max(99)]], // 第三台信用卡刷卡機連接埠
    ECR_ElecSVCrdA: ['', [Validators.maxLength(20)]], // 悠遊卡
    ECR_ElecSVCrdACom: [0, [Validators.min(0), Validators.max(99)]], // 悠遊卡連接埠
    ECR_ElecSVCrdB: ['', [Validators.maxLength(20)]], // 一卡通
    ECR_ElecSVCrdBCom: [0, [Validators.min(0), Validators.max(99)]], // 一卡通連接埠
    ECR_ElecSVCrdC: ['', [Validators.maxLength(20)]], // 愛金卡
    ECR_ElecSVCrdCCom: [0, [Validators.min(0), Validators.max(99)]], // 愛金卡連接埠
    ECR_ElecPay: ['', [Validators.maxLength(20)]], // 電子支付
    ECR_ElecPayCom: [0, [Validators.min(0), Validators.max(99)]], // 電子支付連接埠
    ECR_Drawer: ['', [Validators.maxLength(20)]], // 錢櫃型態
    ECR_DrawerCom: [0, [Validators.min(0), Validators.max(99)]], // 錢櫃連接埠
    ECR_Device1Name: ['', [Validators.maxLength(20)]], // 週邊裝置1名稱
    ECR_Device1Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置1連接埠
    ECR_Device2Name: ['', [Validators.maxLength(20)]], // 週邊裝置2名稱
    ECR_Device2Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置2連接埠
    ECR_Device3Name: ['', [Validators.maxLength(20)]], // 週邊裝置3名稱
    ECR_Device3Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置3連接埠
    ECR_Device4Name: ['', [Validators.maxLength(20)]], // 週邊裝置4名稱
    ECR_Device4Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置4連接埠
    ECR_Device5Name: ['', [Validators.maxLength(20)]], // 週邊裝置5名稱
    ECR_Device5Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置5連接埠
    ECR_Device6Name: ['', [Validators.maxLength(20)]], // 週邊裝置6名稱
    ECR_Device6Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置6連接埠
    ECR_Device7Name: ['', [Validators.maxLength(20)]], // 週邊裝置7名稱
    ECR_Device7Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置7連接埠
    ECR_Device8Name: ['', [Validators.maxLength(20)]], // 週邊裝置8名稱
    ECR_Device8Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置8連接埠
    ECR_Device9Name: ['', [Validators.maxLength(20)]], // 週邊裝置9名稱
    ECR_Device9Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置9連接埠
    ECR_Device10Name: ['', [Validators.maxLength(20)]], // 週邊裝置10名稱
    ECR_Device10Com: [0, [Validators.min(0), Validators.max(99)]], // 週邊裝置10連接埠
    CRT_Date: [null], // 建立日期
    CRT_USR_No: ['', [Validators.maxLength(16)]], // 建立人員
    CRT_USR_Name: ['', [Validators.maxLength(20)]], // 建立人員姓名
    UPD_Date: [null], // 變更日期
    UPD_USR_No: ['', [Validators.maxLength(16)]], // 變更人員
    UPD_USR_Name: ['', [Validators.maxLength(20)]], // 變更人員姓名
  });

  typeOptions = typeOptions
  statusOptions = statusOptions
  salTypeOptions = salTypeOptions
  sernoTypeOptions = sernoTypeOptions
  guiTypeOptions = guiTypeOptions
  settleDDOptions = settleDDOptions;
  yesNoOptions = yesNoOptions

  constructor(
    private tls46020Service: TLS46020Service,
    private http: HttpClient
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', this.dataForm);
    this.dataForm.get('ECR_TmplNo')?.valueChanges.subscribe((tmplNo) => {
      if (tmplNo) {
        this.callTLS46020Api(tmplNo);
      }
    });
  }
  callTLS46020Api(tmplNo: string) {
    const params = {
      ECR_TmplNo: tmplNo,
      PageSize: 10,
      PageIndex: 1
    };

    this.loading = true;
    this.tls46020Service.queryTLS46020(params).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        console.log('查詢 TLS46020 成功', res.Data);
      },
      error: (err) => {
        console.error('查詢 TLS46020 失敗', err);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // this.sysb400Service.insertSYSB400(frm.value).pipe(untilDestroyed(this)).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.onCancel(); // 新增成功後返回查詢頁面
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('frm.value', frm.value);
            // this.sysb400Service.updateSYSB400(frm.value).pipe(untilDestroyed(this)).subscribe(() => {
            //   this.messageService.successBubble('更新成功');
            //   this.onCancel(); // 更新成功後返回查詢頁面
            // });
          }
          break;
      }
    });
  }
}
