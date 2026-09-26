import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'; // 這裡已經有了，只是再次確認
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS46020Item, TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/components/input-textarea/input-textarea.component';
import { ECR_GUI_Type_Option, ECR_SernoType_Option, ECR_SettleDD_Option, getToday2330, YN_Option } from '../tls46020/tls46020.model';

// 2.4.6.2 POS環境變數維護作業 CRU
@Component({
  selector: 'app-tls46020-cru',
  templateUrl: './tls46020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextareaComponent,
    InputNumberComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS46020CRUComponent extends BasicCruPageComponent<TLS46020Item> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [{ value: 0, disabled: true }], // 主鍵 ID，保持不變

    // 模版設定
    ECR_TmplNo: [{ value: '系統自動產生', disabled: true }], // VARCHAR(20) NOT NULL
    ECR_TmplDesc: ['', [Validators.required, Validators.maxLength(255)]], // NVARCHAR(255) NOT NULL
    ECR_TmplStatus: ['A', [Validators.required, Validators.maxLength(2)]], // VARCHAR(02) NOT NULL, 預設值調整為'A'
    ECR_TmplBegDate: ['', [Validators.required]], // DATETIME NOT NULL
    ECR_TmplEndDate: ['', [Validators.required]], // DATETIME NOT NULL

    // 收銀設定
    ECR_SernoType: ['1', [Validators.required, Validators.maxLength(1)]], // VARCHAR(01) NOT NULL, 預設值調整為'1' (循環使用)
    ECR_GUI_Type: ['07', [Validators.required, Validators.maxLength(2)]], // VARCHAR(02) NOT NULL
    ECR_TimeTickInvl: [60, [Validators.required, Validators.min(0), Validators.max(999999)]], // DECIMAL(06) NOT NULL, 允許 0
    ECR_Interval: [6, [Validators.required, Validators.min(1), Validators.max(999999)]], // DECIMAL(06) NOT NULL
    ECR_MaxQty: [999999.00, [Validators.required, Validators.min(0), Validators.max(999999.99)]], // DECIMAL(10,2) NOT NULL
    ECR_MaxAmt: [99999999.00, [Validators.required, Validators.min(0), Validators.max(99999999.99)]], // DECIMAL(10,2) NOT NULL
    ECR_MaxItemAmt: [99999999.00, [Validators.required, Validators.min(0), Validators.max(99999999.99)]], // DECIMAL(10,2) NOT NULL
    ECR_MaxDisc: [0.00, [Validators.required, Validators.min(0), Validators.max(99999999.99)]], /* DECIMAL(10,2) NOT NULL */ // 修改為 ECR_MaxDisc
    ECR_EdcTimeout: [60, [Validators.required, Validators.min(0), Validators.max(999999)]], // DECIMAL(06) NOT NULL
    ECR_EdcSettle: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_ForceInput: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_CustCntEntry: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_CustTypeEntry: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_ClerkEntry: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_ForceMember: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SettleDD: ['T', [Validators.required, Validators.maxLength(2)]], // VARCHAR(02) NOT NULL
    ECR_SettleHHNN: [getToday2330(), [Validators.required, Validators.maxLength(4)]], // VARCHAR(04) NOT NULL
    ECR_VoidTxn: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_VoidRstDay: [0, [Validators.required, Validators.min(0), Validators.max(9999)]], // DECIMAL(04) NOT NULL
    ECR_CreditNote: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_RestoreVoid: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL (注意：表格預設是 'N' 且 NOT NULL)
    ECR_GUI_PeriodQty: [50, [Validators.min(50), Validators.max(99999999)]], // DECIMAL(08) NULL (只給數字驗證，不預設 required)
    ECR_GUI_MinQty: [50, [Validators.min(50), Validators.max(99999999)]], // DECIMAL(08) NULL (只給數字驗證，不預設 required)

    // 報表設定
    ECR_SelfReport: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt1: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt2: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt3: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt4: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt5: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt6: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt7: ['Y', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt8: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt9: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_SaleRpt10: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_PcashValid: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_PickUpValid: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL
    ECR_ReprintGUI: ['N', [Validators.required, Validators.maxLength(1)]], // CHAR(01) NOT NULL

    ECR_PrnLogo: ['Y', [Validators.maxLength(1)]], // CHAR(01) NULL
    ECR_Logo1: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL
    ECR_Logo2: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL
    ECR_Logo3: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL
    ECR_Logo4: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL
    ECR_Logo5: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL
    ECR_Logo6: [null, [Validators.maxLength(100)]], // VARCHAR(100) NULL

    // 周邊設定 (輸入)
    ECR_KBLevel: [null, [Validators.maxLength(6)]], // VARCHAR(06) NULL
    ECR_KBType: [null, [Validators.maxLength(6)]], // VARCHAR(06) NULL (原為 VARCHAR(2))
    ECR_Scanner: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ScannerCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_MSR: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_MSRCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL

    // 周邊設定 (顯示)
    ECR_ScrType: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_CD: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_CDCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_ExtScr: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ExtScrCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL

    // 周邊設定 (列印)
    ECR_GUIPrn: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_GUICom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_SlipPrn: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_SlipPrnCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_OrderPrn: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_OrderPrnCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_LablePrn: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_LablePrnCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL

    // 周邊設定 (信用卡)
    ECR_EDC: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_EDCCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_EDC2: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_EDC2Com: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL

    // 周邊設定 (電子票證、電子支付)
    ECR_ElecSVCrdA: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ElecSVCrdACom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_ElecSVCrdB: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ElecSVCrdBCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_ElecSVCrdC: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ElecSVCrdCCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    ECR_ElecPay: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_ElecPayCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL

    // 周邊設定 (其他)
    ECR_Drawer: [null, [Validators.maxLength(20)]], // VARCHAR(20) NULL
    ECR_DrawerCom: [0, [Validators.min(0), Validators.max(99)]], // DECIMAL(02) NULL
    // 稽核欄位
    CRT_Date: [{ value: null, disabled: true }], // DATETIME NULL
    CRT_USR_No: [{ value: null, disabled: true }], // VARCHAR(16) NULL
    CRT_USR_Name: [{ value: null, disabled: true }], // NVARCHAR(20) NULL
    UPD_Date: [{ value: null, disabled: true }], // DATETIME NULL
    UPD_USR_No: [{ value: null, disabled: true }], // VARCHAR(16) NULL
    UPD_USR_Name: [{ value: null, disabled: true }], // NVARCHAR(20) NULL
  });
  // ----------------------------------------------------------------
  ECR_SernoType_Option = ECR_SernoType_Option;
  ECR_GUI_Type_Option = ECR_GUI_Type_Option;
  YN_Option = YN_Option;
  ECR_SettleDD_Option = ECR_SettleDD_Option;
  TSB_Name_Option: { TSB_Name: string }[] = [];

  // 顯示格式統一改為「代號 - 名稱」(displayText)，故改用 getSYS1000Options() 而非 SystemOptionsService.getOptions()
  ECR_KBType_Option = getSYS1000Options('ECR_KBType');
  ECR_Scanner_Option = getSYS1000Options('ECR_Scanner');
  ECR_MSR_Option = getSYS1000Options('ECR_MSR');
  ECR_CD_Option = getSYS1000Options('ECR_CD');
  ECR_ExtScr_Option = getSYS1000Options('ECR_ExtScr');
  ECR_GUIPrn_Option = getSYS1000Options('ECR_GUIPrn');
  ECR_SlipPrn_Option = getSYS1000Options('ECR_SlipPrn');
  ECR_OrderPrn_Option = getSYS1000Options('ECR_OrderPrn');
  ECR_LablePrn_Option = getSYS1000Options('ECR_LablePrn');
  ECR_EDC_Option = getSYS1000Options('ECR_EDC');
  ECR_EDC2_Option = getSYS1000Options('ECR_EDC2');
  ECR_ElecPay_Option = getSYS1000Options('ECR_ElecPay');

  ECR_ElecSVCrdA_Option = getSYS1000Options('ECR_ElecSVCrdA');
  ECR_ElecSVCrdB_Option = getSYS1000Options('ECR_ElecSVCrdB');
  ECR_ElecSVCrdC_Option = getSYS1000Options('ECR_ElecSVCrdC');
  ECR_Drawer_Option = getSYS1000Options('ECR_Drawer');

  constructor(
    private tls46020Service: TLS46020Service,
    private dropDownListService: DropDownListService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS46020', this.dataForm);
    if (this.isFormCreateable) {
      this.dataForm.get('ECR_TmplStatus')?.setValue('A');
      this.dataForm.get('ECR_TmplStatus')?.disable();
    }
    this.dropDownListService.queryPOS1008DropDownList().pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        this.TSB_Name_Option = res.Data.map(item => ({
          TSB_Name: item.TSB_Name
        }));
      },
    });
    // 監聽 ECR_GUI_Type 的變化來動態調整 ECR_GUI_PeriodQty 和 ECR_GUI_MinQty 的驗證
    this.dataForm.get('ECR_GUI_Type')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.setGuiQtyValidators(value === '07');
    });
  }

  // 輔助方法：設定或移除電子發票數量欄位的驗證器
  private setGuiQtyValidators(required: boolean): void {
    const periodQtyControl = this.dataForm.get('ECR_GUI_PeriodQty');
    const minQtyControl = this.dataForm.get('ECR_GUI_MinQty');

    if (periodQtyControl && minQtyControl) {
      if (required) {
        console.log('設定驗證器');
        periodQtyControl.addValidators(Validators.required);
        minQtyControl.addValidators(Validators.required);
      } else {
        periodQtyControl.removeValidators(Validators.required);
        minQtyControl.removeValidators(Validators.required);
      }
      // 更新驗證狀態
      periodQtyControl.updateValueAndValidity();
      minQtyControl.updateValueAndValidity();
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const serviceCall = this.isFormCreateable
        ? this.tls46020Service.insertTLS46020(this.createBody(frm))
        : this.tls46020Service.updateTLS46020(this.createBody(frm));
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
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
      ECR_SettleHHNN: `${HH}${mm}`,
    };
  }
}
