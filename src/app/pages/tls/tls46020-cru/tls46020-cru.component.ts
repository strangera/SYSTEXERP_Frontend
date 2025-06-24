import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms'; // 這裡已經有了，只是再次確認
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS46020Item, TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { ECR_GUI_Type_Option, ECR_SernoType_Option, ECR_SettleDD_Option, getToday2330, YN_Option } from '../tls46020/tls46020.model';
import { finalize } from 'rxjs';

// 2.4.6.2 POS環境變數維護作業 CRU
@Component({
  selector: 'app-tls46020-cru',
  templateUrl: './tls46020-cru.component.html',
})
export class TLS46020CRUComponent extends BasicCruPageComponent<TLS46020Item> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [{ value: 0, disabled: true }], // 主鍵 ID
    ECR_TmplNo: [{ value: '系統自動產生', disabled: true }], // 環境變數編號
    ECR_TmplBegDate: ['', [Validators.required]], // 有效日期(起始日期)
    ECR_TmplEndDate: ['', [Validators.required]], // 有效日期(結束日期)
    ECR_TmplStatus: [''], // 狀態 1=啟用 2=停用(預設值)
    ECR_TmplDesc: ['', [Validators.required]], // 環境變數備註 (統收機台預設設定)
    // 收銀設定
    ECR_SernoType: ['1', [Validators.required]], // 交易序號模式 1=循環使用 2=每日重計(預設值) 3=每月重計
    ECR_Interval: [6, [Validators.required, Validators.min(1), Validators.max(999999)]], // 上下傳異動檔間隔(秒)，預設6
    // 修改 ECR_TimeTickInvl 的驗證規則和預設值
    ECR_TimeTickInvl: [60, [Validators.required, Validators.min(1), Validators.max(999999)]], // 系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次 (預設值改為60，範圍1-999999)
    ECR_MaxQty: [999999, [Validators.required, Validators.maxLength(8)]], // 單筆交易數量上限 0=不限制 預設值為999999
    ECR_MaxAmt: [99999999, [Validators.required, Validators.maxLength(8)]], // 單筆交易金額上限 0=不限制 預設值為99999999
    ECR_MaxItemAmt: [99999999, [Validators.required, Validators.maxLength(8)]], //單一明細金額上限 0=不限制 預設值為99999999
    ECR_EdcTimeout: [60, [Validators.required, Validators.maxLength(8)]], // 信用卡刷卡機連線時限(秒)預設值為60
    ECR_EdcSettle: ['Y', [Validators.required]], // 信用卡刷卡機連動日結 Y/N 預設值為Y
    ECR_CustCntEntry: ['N', [Validators.required]], // 是否輸入來客數 Y/N 預設值為N * special to POS1002
    ECR_GUI_Type: ['07', [Validators.required]], // 發票使用類別 00=不開發票 03=二聯式收銀機發票 07=電子發票(預設值)
    ECR_GUI_PeriodQty: [50], // 機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數
    ECR_GUI_MinQty: [50], // 機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數
    ECR_SettleDD: ['T', [Validators.required]], // 清機提示日期 T=當天(預設值) N=隔天
    ECR_SettleHHNN: [getToday2330(), [Validators.required]],
    // 報表設定
    ECR_SelfReport: ['Y', [Validators.required]], // 是否執行自我報帳 Y/N 預設值為Y
    ECR_ClerkEntry: ['N', [Validators.required]], // 是否強制輸入營業員，預設N
    ECR_CreditNote: ['N', [Validators.required]], // 是否允許開立折讓單，預設N
    ECR_ForceInput: ['N', [Validators.required]], // 是否強制輸入付款金額，預設N
    ECR_PcashValid: ['N', [Validators.required]], // 零用金是否需要認證，預設N
    ECR_PickUpValid: ['N', [Validators.required]], // 中途取現是否需要認證，預設N
    ECR_ReprintGUI: ['N', [Validators.required]], // 是否允許補印發票，預設N
    ECR_ForceMember: ['N', [Validators.required]], // 是否強制輸入會員編號，預設N
    ECR_CustTypeEntry: ['N', [Validators.required]], // 是否輸入客層數，預設N
    // 補齊錯誤訊息中提到的必填欄位預設值和驗證
    ECR_VoidTxn: ['Y', [Validators.required]], // 是否允許作廢交易，預設Y
    ECR_RestoreVoid: ['Y', [Validators.required]], // 是否允許回復已作廢交易，預設Y
    ECR_SaleRpt3: ['Y', [Validators.required]], // 是否列印時段銷售報表，預設Y
    ECR_SaleRpt4: ['Y', [Validators.required]], // 是否列印部門銷售報表，預設Y
    ECR_SaleRpt5: ['Y', [Validators.required]], // 是否列印單品銷售報表，預設Y
    ECR_SaleRpt10: ['N', [Validators.required]], // 保留，預設N

    ECR_SaleRpt1: ['Y', [Validators.required]], // 是否列印收銀員交班表 Y/N 預設值為Y
    ECR_SaleRpt2: ['Y', [Validators.required]], // 是否列印收銀機財務報表 Y/N 預設值為Y
    ECR_SaleRpt6: ['Y', [Validators.required]], // 是否列印銷貨明細表 Y/N 預設值為Y
    ECR_SaleRpt7: ['Y', [Validators.required]], // 是否列印作廢明細表 Y/N 預設值為Y
    ECR_SaleRpt8: ['Y', [Validators.required]], // 是否列印自我報帳(現額報告)帳條 Y/N 預設值為Y
    ECR_SaleRpt9: ['Y', [Validators.required]], // 是否列印保全現金帳條(現金明細表) Y/N 預設值為Y
    // 周邊設定
    ECR_KBLevel: ['', [Validators.maxLength(6)]], // 機台鍵盤等級
    ECR_KBType: ['', [Validators.maxLength(2)]], // 鍵盤型態
    ECR_Scanner: ['', [Validators.maxLength(20)]], // 掃描器型態，預設值空白代表未設定
    ECR_ScannerCom: [0, [Validators.maxLength(2)]], // 掃描器連接埠，預設值為0(未啟用)
  });
  // ----------------------------------------------------------------
  ECR_SernoType_Option = ECR_SernoType_Option;
  ECR_GUI_Type_Option = ECR_GUI_Type_Option;
  YN_Option = YN_Option;
  ECR_SettleDD_Option = ECR_SettleDD_Option;

  constructor(
    private tls46020Service: TLS46020Service,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS46020', this.dataForm);
    if (this.isFormCreateable) {
      this.dataForm.get('ECR_TmplStatus')?.setValue('A');
      this.dataForm.get('ECR_TmplStatus')?.disable();
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const serviceCall = this.isFormCreateable
        ? this.tls46020Service.insertTLS46020(this.createBody(frm))
        : this.tls46020Service.updateTLS46020(this.createBody(frm));
      serviceCall.pipe(finalize(() => this.loading = false)).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
      });
    });
  }

  private createBody(frm: FormGroup): TLS46020Item {
    const form = frm.getRawValue();
    const date: Date = form.ECR_SettleHHNN;

    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');

    return {
      ...form,
      ECR_TmplNo: this.isFormCreateable ? undefined : form.ECR_TmplNo,
      ECR_SettleHHNN: `${HH}${mm}`,
    };
  }
}
