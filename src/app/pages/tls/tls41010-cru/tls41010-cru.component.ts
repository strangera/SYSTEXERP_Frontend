import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { TLS41010Service } from '../../../service/api/tls/tls41010.service';
import { TLS41010Data, TLS41010Item } from '../tls41010/tls41010.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';

@Component({
  selector: 'app-tls41010-cru',
  templateUrl: './tls41010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    AccordionModule,
    InputNumberComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS41010CRUComponent extends BasicCruPageComponent<TLS41010Data> implements OnInit {

  /** 預設 11:10 的時間 */
  private defaultTime1110(): Date {
    const d = new Date();
    d.setHours(11, 10, 0, 0);
    return d;
  }

  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [''],
    ECR_No: ['', [Validators.required, Validators.maxLength(10)]],
    ECR_Name: ['', [Validators.required, Validators.maxLength(20)]],
    ECR_TLT_No: ['', [Validators.maxLength(20)]],
    ECR_TLT_Name: ['', [Validators.maxLength(60)]],
    ECR_Type: ['1', [Validators.required, Validators.maxLength(2)]],
    ECR_SAL_Type: ['', [Validators.maxLength(8)]],
    ECR_LocNo: ['', [Validators.maxLength(10)]],
    ECR_USR_No: ['', [Validators.maxLength(8)]],
    ECR_USR_Name: ['', [Validators.maxLength(20)]],
    ECR_Status: ['A'],
    ECR_ActiveDate: [null as Date | null],
    ECR_Group: [''],
    ECR_AreaNo: [''],
    ECR_SubGroup: [''],
    ECR_CloseDate: [null as Date | null],
    ECR_GUI_MinQty: [50, [Validators.min(0), Validators.max(99999999)]],
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
    ECR_SettleHHNN: [this.defaultTime1110(), [Validators.required]],
    ECR_SettleDD: ['T', [Validators.required, Validators.maxLength(2)]],
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

  typeOptions = getSYS1000Options('ECR_Type');
  statusOptions = getSYS1000Options('ECR_Status').filter(item => item.value === 'A' || item.value === 'C');
  salTypeOptions = getSYS1000Options('ECR_SAL_Type');
  sernoTypeOptions = getSYS1000Options('ECR_SernoType');
  settleDDOptions = getSYS1000Options('ECR_SettleDD');
  yesNoOptions = getSYS1000Options('YES_NO');
  ECR_GUI_Type_Option = getSYS1000Options('ECR_GUI_Type');
  ECR_TmplNo_Option: IDropdownItem[] = [];
  ECR_SrvIP_Option: IDropdownItem[] = [];
  CounterOptions: any[] = [];
  CashierOptions: IDropdownItem[] = [];
  LocOptions: IDropdownItem[] = [];
  tmplDetailList: any[] = [];

  constructor(
    public override formBuilder: FormBuilder,
    private dropDownListService: DropDownListService,
    private tls41010Service: TLS41010Service,
    private counterNameService: CounterNameService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', this.dataForm);
    this.counterNameService.getCounters().subscribe((res) => { this.CounterOptions = res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) || []; });

    // Disable 一些欄位
    [
      'ECR_KBLevel', 'ECR_KBType', 'ECR_Scanner', 'ECR_MSR', 'ECR_ScrType', 'ECR_CD', 'ECR_ExtScr',
      'ECR_GUIPrn', 'ECR_SlipPrn', 'ECR_OrderPrn', 'ECR_LablePrn', 'ECR_EDC', 'ECR_EDC2',
      'ECR_ElecSVCrdA', 'ECR_ElecSVCrdB', 'ECR_ElecSVCrdC', 'ECR_ElecPay', 'ECR_Drawer',
      'CRT_Date', 'CRT_USR_No', 'CRT_USR_Name', 'UPD_Date', 'UPD_USR_No', 'UPD_USR_Name',
    ].forEach(field => this.dataForm.get(field)?.disable());

    if (this.isFormCreateable) {
      this.dataForm.get('ECR_No')?.enable();
      this.dataForm.get('ECR_No')?.reset('');
      this.dataForm.get('ECR_Status')?.setValue('A');
      this.dataForm.get('ECR_Status')?.disable();
      this.dataForm.get('ECR_Type')?.setValue('2'); // 預設為專櫃機台(自收)，但保持可選
    } else if (this.isFormEditable) {
      this.dataForm.get('ECR_No')?.disable();
    }
    // 環境變數下拉選單
    this.dropDownListService.queryPOS1002TML_ALL_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.ECR_TmplNo_Option = res.Data.map(item => ({
          value: item.ECR_TmplNo,
          label: `${item.ECR_TmplNo}-${item.ECR_TmplDesc}`,
          No: item.ECR_TmplNo ?? '',
          Name: item.ECR_TmplDesc,
        }));
        this.tmplDetailList = res.Data;
      }
    });
    this.dropDownListService.queryPOS10015_DropDownList().subscribe(option => {
      this.ECR_SrvIP_Option = option.Data.map(item => ({
        label: `${item.Name}`, // 顯示用
        value: item.Name,
        No: item.No,
        Name: item.Name
      }));
    });

    //收銀員下拉選單
    this.dropDownListService.queryPOS2001_DropDownList().subscribe(res => {
      if (res?.Data) {
        this.CashierOptions = res.Data.map(item => ({
          No: item.No,
          Name: item.Name,
          label: `${item.No} - ${item.Name}`, // 顯示時更清楚
          value: item.No
        }));
      }
    });

    // 綁定下拉選單選取 → 自動帶出姓名
    this.dataForm.get('ECR_USR_No')?.valueChanges.subscribe(selectedNo => {
      const selected = this.CashierOptions.find(c => c.No === selectedNo);
      this.dataForm.patchValue({
        ECR_USR_Name: selected ? selected.Name : ''
      }, { emitEvent: false });
    });

    //位置編號
    const locationParams = {} as any; // 依後端定義填入查詢參數
    this.dropDownListService.queryPOS2002_Location_DropDownList(locationParams).subscribe(res => {
      if (res?.Data) {
        this.LocOptions = res.Data.map(item => ({
          No: item.location_no,
          Name: item.location_no,
          value: item.location_no,
          label: item.location_no,
          tlt_building: item.tlt_building,
          tlt_floor: item.tlt_floor,
          area_no: item.area_no
        }));
      }
    });

    this.dataForm.get('ECR_LocNo')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(selectedNo => {
        const selected = this.LocOptions.find(c => c.value === selectedNo);
        if (!selected) return;

        const patch: any = {
          ECR_Group: selected.tlt_building,
          ECR_SubGroup: selected.tlt_floor,
          ECR_AreaNo: selected.area_no,
        };

        if (this.isFormCreateable && !this.dataForm.get('ECR_TLT_Name')?.value) {
          patch.ECR_TLT_Name = selected.Name;
        }

        this.dataForm.patchValue(patch, { emitEvent: false });
      });

    // 監聽欄位變化
    this.dataForm.get('ECR_TmplNo')?.valueChanges.subscribe((tmplNo) => {
      if (tmplNo) {
        const detail = this.tmplDetailList.find(x => x.ECR_TmplNo === tmplNo);
        if (detail) {
          const patchObj: any = {};
          Object.keys(this.dataForm.controls).forEach(key => {
            if (detail[key] !== undefined) patchObj[key] = detail[key];
          });
          this.dataForm.patchValue(patchObj);
        }
      }
    });
    this.dataForm.get('ECR_Type')?.valueChanges.subscribe(value => {
      this.checkTltNoRequired(value);
    });
    this.checkTltNoRequired(this.dataForm.get('ECR_Type')?.value ?? '');

    this.dataForm.get('ECR_TLT_No')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((selectedNo) => {
        if (!selectedNo) return;

        this.tls41010Service.queryTLT_NoInfo(selectedNo).subscribe({
          next: (res) => {
            if (res?.Status === '0000' && res.Data) {
              const info = res.Data;
              console.log('自動帶入櫃位資訊:', info);

              //  無論新增或編輯，都可 patch，但限定特定欄位
              const patch: any = {};

              // 只要櫃位查詢回來有值，就覆蓋（不動沒給值的欄位）
              if (info.ECR_LocNo) patch.ECR_LocNo = info.ECR_LocNo;
              if (info.ECR_Group) patch.ECR_Group = info.ECR_Group;
              if (info.ECR_SubGroup) patch.ECR_SubGroup = info.ECR_SubGroup;
              if (info.ECR_AreaNo) patch.ECR_AreaNo = info.ECR_AreaNo;
              if (info.tlt_bdate) patch.ECR_ActiveDate = new Date(info.tlt_bdate);
              if (info.tlt_edate) patch.ECR_CloseDate = new Date(info.tlt_edate);
              this.dataForm.patchValue(patch, { emitEvent: false });
            } else {
              console.warn('查詢櫃位資訊失敗:', res?.Message);
            }
          },
          error: (err) => console.error('呼叫 queryTLT_NoInfo 失敗:', err),
        });
      });


  }

  /** 套用範本資料 */
  callTLS41010Api(tmplNo: string) {
    this.tls41010Service.queryTLS41010({ ECR_TmplNo: tmplNo }).subscribe({
      next: (res) => {
        if (res.Data?.length) {
          const patchData = res.Data[0];
          // delete patchData.ECR_TmplNo;


          if ('ECR_SettleHHNN' in patchData) {
            const val = patchData.ECR_SettleHHNN;
            if (typeof val === 'string' && /^\d{4}$/.test(val)) {
              const hh = parseInt(val.substring(0, 2), 10);
              const mm = parseInt(val.substring(2, 4), 10);
              const d = new Date();
              d.setHours(hh, mm, 0, 0);
              patchData.ECR_SettleHHNN = d;
            } else if (!(val instanceof Date)) {
              patchData.ECR_SettleHHNN = this.defaultTime1110();
            }
          }
          // 這邊幫我有的值再patch
          this.dataForm.patchValue({
            ECR_SchNo: patchData.ECR_SchNo ?? '',
          });

        }
      },
    });
  }

  /** 判斷 TLT 必填 */
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

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = this.createBody(frm);
      const serviceCall = this.isFormCreateable
        ? this.tls41010Service.insertTLS41010(body)
        : this.tls41010Service.updateTLS41010(body);

      serviceCall
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe({
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

  /** 組裝 Body */
  private createBody(frm: FormGroup): TLS41010Item {
    const rawValue = frm.getRawValue();
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo ?? '';

    let settleHHNN: string | undefined;
    if (rawValue.ECR_SettleHHNN) {
      const date = new Date(rawValue.ECR_SettleHHNN);
      settleHHNN = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
    }

    return {
      ...rawValue,
      id: this.isFormEditable ? this.rowdata?.id : undefined,
      SYS_StoreNo: storeNo,
      ECR_Logo1: rawValue.ECR_Logo1 ?? undefined,
      ECR_Logo2: rawValue.ECR_Logo2 ?? undefined,
      ECR_Logo3: rawValue.ECR_Logo3 ?? undefined,
      ECR_Logo4: rawValue.ECR_Logo4 ?? undefined,
      ECR_Logo5: rawValue.ECR_Logo5 ?? undefined,
      ECR_Logo6: rawValue.ECR_Logo6 ?? undefined,
      ECR_ActiveDate: rawValue.ECR_ActiveDate ?? undefined,
      CRT_Date: rawValue.CRT_Date ?? undefined,
      UPD_Date: rawValue.UPD_Date ?? undefined,
      ECR_SettleHHNN: settleHHNN,
      ECR_SchNo: this.isFormCreateable
        ? '自動編號'
        : (rawValue.ECR_SchNo || this.rowdata?.ECR_SchNo || '自動編號')
    } as TLS41010Item;
  }
}
