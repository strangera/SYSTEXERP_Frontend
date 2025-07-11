import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { TLS41010Service } from '../../../service/api/tls/tls41010.service';
import { TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { TLS41010Data } from '../tls41010/tls41010.model';
import {
  salTypeOptions,
  sernoTypeOptions,
  settleDDOptions,
  statusOptions,
  typeOptions,
  yesNoOptions,
  ECR_GUI_Type_Option,
} from './tls41010-cru.model';

@Component({
  selector: 'app-tls41010-cru',
  templateUrl: './tls41010-cru.component.html',
})
export class TLS41010CRUComponent extends BasicCruPageComponent<TLS41010Data> implements OnInit {
  isCopyMode = false;
  copyForm!: FormGroup;

  dataForm = this.formBuilder.nonNullable.group({
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    ECR_Name: ['', [Validators.required, Validators.maxLength(20)]],
    ECR_TLT_No: ['', [Validators.maxLength(20)]],
    ECR_TLT_Name: ['', [Validators.maxLength(60)]],
    ECR_Type: ['1', [Validators.required, Validators.maxLength(2)]],
    ECR_SAL_Type: ['', [Validators.maxLength(8)]],
    ECR_LocNo: ['', [Validators.maxLength(10)]],
    ECR_USR_No: ['', [Validators.maxLength(8)]],
    ECR_USR_Name: ['', [Validators.maxLength(20)]],
    ECR_Status: [''],
    ECR_ActiveDate: [null],
    ECR_CloseDate: [null],
    ECR_ComName: ['', [Validators.maxLength(64)]],
    ECR_IP: ['', [Validators.maxLength(20)]],
    ECR_SrvIP: ['', [Validators.maxLength(20)]],
    ECR_TmplNo: ['', [Validators.maxLength(8)]],
    ECR_SernoType: ['2', [Validators.required, Validators.maxLength(1)]],
    ECR_GUI_Type: ['07', [Validators.required, Validators.maxLength(2)]],
    ECR_TimeTickInvl: [1, [Validators.required, Validators.min(1), Validators.max(999999)]],
    ECR_Interval: [6, [Validators.required, Validators.min(0), Validators.max(999999)]],
    ECR_MaxQty: [999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]],
    ECR_MaxAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]],
    ECR_MaxItemAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]],
    ECR_MaxDisc: [0, [Validators.required, Validators.min(0), Validators.max(9999999999.99)]],
    ECR_EdcTimeout: [60, [Validators.required, Validators.min(0), Validators.max(999999)]],
    ECR_EdcSettle: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_ForceInput: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_CustCntEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_CustTypeEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_ClerkEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_ForceMember: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_SelfReport: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt1: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt2: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt3: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt4: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt5: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt6: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt7: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt8: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt9: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_SaleRpt10: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_PcashValid: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_PickUpValid: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_ReprintGUI: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_PrnLogo: ['Y', [Validators.maxLength(1)]],
    ECR_Logo1: ['', [Validators.maxLength(100)]],
    ECR_Logo2: ['', [Validators.maxLength(100)]],
    ECR_Logo3: ['', [Validators.maxLength(100)]],
    ECR_Logo4: ['', [Validators.maxLength(100)]],
    ECR_Logo5: ['', [Validators.maxLength(100)]],
    ECR_Logo6: ['', [Validators.maxLength(100)]],
    ECR_VoidTxn: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_VoidRstDay: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    ECR_CreditNote: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_GUI_PeriodQty: [50, [Validators.min(0), Validators.max(99999999)]],
    ECR_GUI_MinQty: [50, [Validators.min(0), Validators.max(99999999)]],
    ECR_SettleDD: ['T', [Validators.required, Validators.maxLength(2)]],
    ECR_SettleHHNN: ['', [Validators.required, Validators.maxLength(4)]],
    ECR_KBLevel: ['', [Validators.maxLength(6)]],
    ECR_KBType: ['', [Validators.maxLength(6)]],
    ECR_Scanner: ['', [Validators.maxLength(20)]],
    ECR_ScannerCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ScrType: ['', [Validators.maxLength(20)]],
    ECR_CD: ['', [Validators.maxLength(20)]],
    ECR_CDCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ExtScr: ['', [Validators.maxLength(20)]],
    ECR_ExtScrCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_GUIPrn: ['', [Validators.maxLength(20)]],
    ECR_GUICom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_SlipPrn: ['', [Validators.maxLength(20)]],
    ECR_SlipPrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_OrderPrn: ['', [Validators.maxLength(20)]],
    ECR_OrderPrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_LablePrn: ['', [Validators.maxLength(20)]],
    ECR_LablePrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_EDC: ['', [Validators.maxLength(20)]],
    ECR_EDCCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_EDC2: ['', [Validators.maxLength(20)]],
    ECR_EDC2Com: [0, [Validators.min(0), Validators.max(99)]],
    ECR_EDC3: ['', [Validators.maxLength(20)]],
    ECR_EDC3Com: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdA: ['', [Validators.maxLength(20)]],
    ECR_ElecSVCrdACom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdB: ['', [Validators.maxLength(20)]],
    ECR_ElecSVCrdBCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdC: ['', [Validators.maxLength(20)]],
    ECR_ElecSVCrdCCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecPay: ['', [Validators.maxLength(20)]],
    ECR_ElecPayCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_Drawer: ['', [Validators.maxLength(20)]],
    ECR_DrawerCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_MSR: ['', [Validators.maxLength(20)]],
    ECR_MSRCom: [null, [Validators.min(0), Validators.max(99)]],
    CRT_Date: [null],
    CRT_USR_No: ['', [Validators.maxLength(16)]],
    CRT_USR_Name: ['', [Validators.maxLength(20)]],
    UPD_Date: [null],
    UPD_USR_No: [{ value: '', disabled: true }],
    UPD_USR_Name: ['', [Validators.maxLength(20)]],
    ECR_RestoreVoid: ['N', [Validators.required, Validators.maxLength(1)]],
  });



  typeOptions = typeOptions;
  statusOptions = statusOptions;
  salTypeOptions = salTypeOptions;
  sernoTypeOptions = sernoTypeOptions;
  settleDDOptions = settleDDOptions;
  yesNoOptions = yesNoOptions;
  ECR_GUI_Type_Option = ECR_GUI_Type_Option;
  ECR_TmplNo_Option: IDropdownItem[] = [];

  constructor(
    override protected formBuilder: FormBuilder,
    private tls46020Service: TLS46020Service,
    private dropDownListService: DropDownListService,
    private tls41010Service: TLS41010Service,
    private route: ActivatedRoute,
  ) {
    super();
  }

  get sourceECRControl(): FormControl {
    return this.copyForm.get('sourceECR') as FormControl;
  }

  get targetECRsControl(): FormControl {
    return this.copyForm.get('targetECRs') as FormControl;
  }


  ngOnInit(): void {
    this.copyForm = this.formBuilder.group({
      sourceECR: ['', Validators.required],
      targetECRs: ['', Validators.required],
      isAllCopy: [false]
    });

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'copy') {
        this.isCopyMode = true;
      }
    });

    if (!this.isCopyMode) {
      this.initializePage('TLS41010', this.dataForm);
      this.dropDownListService.queryPOS1002TML_DropDownList().subscribe(option => {
        this.ECR_TmplNo_Option = option.Data;
      });

      this.dataForm.get('ECR_TmplNo')?.valueChanges.subscribe((tmplNo) => {
        if (tmplNo) {
          this.callTLS46020Api(tmplNo);
        }
      });
      this.dataForm.get('ECR_Type')?.valueChanges.subscribe((value) => {
        this.checkTltNoRequired(value);
      });
      this.checkTltNoRequired(this.dataForm.get('ECR_Type')?.value ?? '');
    }
  }

  onSubmitCopy(frm: FormGroup) {
    if (frm.invalid) {
      this.messageService.errorBubble('請完整填寫來源與目標收銀機號');
      return;
    }
    console.log('Copy submit', frm.value);
    // 這裡放呼叫 copy API 的邏輯
  }

  callTLS46020Api(tmplNo: string) {
    const params = { ECR_TmplNo: tmplNo };
    this.tls46020Service.queryTLS46020(params).subscribe({
      next: (res) => {
        if (res.Data && res.Data.length > 0) {
          const data = res.Data[0];
          const patchData = { ...data };
          delete patchData.ECR_TmplNo;
          this.dataForm.patchValue(patchData);
        }
      },
      error: (err) => {
        console.error('查詢 TLS46020 失敗', err);
      },
    });
  }

  checkTltNoRequired(value: string) {
    const tltControl = this.dataForm.get('ECR_TLT_No');
    if (!tltControl) return;
    if (value === '3') {
      tltControl.addValidators(Validators.required);
    } else {
      tltControl.clearValidators();
    }
    tltControl.updateValueAndValidity();
  }
}
