import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { AutoCompleteComponent } from '@shared/components/auto-complete/auto-complete.component';
import { InputTextareaComponent } from "src/app/shared/components/input-textarea/input-textarea.component";
import { TLS41010Service } from '../../../service/api/tls/tls41010.service';
import { TLTTALENTActiveContractItem } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem, ITLS42010KBLevelItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TLS41010Data, TLS41010Item, tltNoPickerCruColumns } from '../tls41010/tls41010.model';
import { TltNoPickerComponent } from '../tls41010/tlt-no-picker/tlt-no-picker.component';

/** 專櫃編號下拉選項：僅列出每個專櫃「最近一次已生效」的合約(排除未生效的未來合約，但保留已到期停用的歷史資料)，並附帶可直接 patch 表單的相關欄位 */
interface CounterOption extends TLTTALENTActiveContractItem {
  label: string;
  value: string;
}

/** 通用 label/value 下拉選項 */
interface LabelValueOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-tls41010-cru',
  templateUrl: './tls41010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    AccordionModule,
    InputNumberComponent,
    TranslateModule,
    InputTextareaComponent,
    TltNoPickerComponent,
    AutoCompleteComponent,
  ],
})
export class TLS41010CRUComponent extends BasicCruPageComponent<TLS41010Data> implements OnInit {
  private readonly dropDownListService = inject(DropDownListService);
  private readonly tls41010Service = inject(TLS41010Service);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);

  /** 預設 11:10 的時間 */
  private defaultTime1110(): Date {
    const d = new Date();
    d.setHours(11, 10, 0, 0);
    return d;
  }

  /** 解析清機提示時間：可能為 Date、3~4 碼數字字串(如 '2330')，其餘一律回退為預設時間 */
  private parseSettleTime(val: string | number | Date | null | undefined): Date {
    if (val instanceof Date) return val;
    if (typeof val === 'number' || (typeof val === 'string' && /^\d{3,4}$/.test(val))) {
      const s = String(val).padStart(4, '0');
      const hh = Number.parseInt(s.substring(0, 2), 10);
      const mm = Number.parseInt(s.substring(2, 4), 10);
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      return d;
    }
    return this.defaultTime1110();
  }

  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    ECR_SchNo: [null as string | null],
    ECR_No: [null as string | null, [Validators.required, Validators.maxLength(10)]],
    ECR_Name: [null, [Validators.required, Validators.maxLength(60)]],
    ECR_TLT_No: [null, [Validators.maxLength(20)]],
    ECR_TLT_Name: [null, [Validators.maxLength(60)]],
    ECR_Type: ['2', [Validators.required, Validators.maxLength(2)]],
    ECR_SAL_Type: [null, [Validators.maxLength(8)]],
    ECR_LocNo: [null, [Validators.maxLength(10)]],
    ECR_USR_No: [null, [Validators.maxLength(8)]],
    ECR_USR_Name: [null as string | null, [Validators.maxLength(20)]],
    ECR_Status: ['A'],
    ECR_ActiveDate: [null as Date | null, [Validators.required]],
    ECR_ExpireDate: [null as Date | null, [Validators.required]],
    ECR_Group: [null],
    ECR_AreaNo: [null],
    ECR_SubGroup: [null],
    ECR_CloseDate: [null as Date | null],
    ECR_GUI_MinQty: [50, [Validators.min(0), Validators.max(99999999)]],
    ECR_ComName: [null, [Validators.maxLength(64)]],
    ECR_IP: [null, [Validators.maxLength(20)]],
    ECR_SrvIP: [null, [Validators.maxLength(20)]],
    ECR_TmplNo: [null, [Validators.maxLength(8)]],
    ECR_Desc: [null, [Validators.maxLength(256)]],
    ECR_SernoType: ['2', [Validators.required, Validators.maxLength(1)]],
    ECR_GUI_Type: ['07', [Validators.required, Validators.maxLength(2)]],
    ECR_TimeTickInvl: [1, [Validators.required, Validators.min(1), Validators.max(999999)]],
    ECR_Interval: [6, [Validators.required, Validators.min(0), Validators.max(999999)]],
    ECR_MaxQty: [999999, [Validators.required, Validators.min(0), Validators.max(9999999999)]],
    ECR_MaxAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999)]],
    ECR_MaxItemAmt: [99999999, [Validators.required, Validators.min(0), Validators.max(9999999999)]],
    ECR_MaxDisc: [0, [Validators.required, Validators.min(0), Validators.max(9999999999)]],
    ECR_EdcTimeout: [60, [Validators.required, Validators.min(0), Validators.max(999999)]],
    ECR_EdcSettle: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_ForceInput: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_CustCntEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_CustTypeEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_ClerkEntry: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_ForceMember: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_BoxReqCode: ['N', [Validators.required, Validators.maxLength(1)]],
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
    ECR_Logo1: [null, [Validators.maxLength(100)]],
    ECR_Logo2: [null, [Validators.maxLength(100)]],
    ECR_Logo3: [null, [Validators.maxLength(100)]],
    ECR_Logo4: [null, [Validators.maxLength(100)]],
    ECR_Logo5: [null, [Validators.maxLength(100)]],
    ECR_Logo6: [null, [Validators.maxLength(100)]],
    ECR_VoidTxn: ['Y', [Validators.required, Validators.maxLength(1)]],
    ECR_VoidRstDay: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    ECR_CreditNote: ['N', [Validators.required, Validators.maxLength(1)]],
    ECR_GUI_PeriodQty: [50, [Validators.min(0), Validators.max(99999999)]],
    ECR_SettleHHNN: [this.defaultTime1110(), [Validators.required]],
    ECR_SettleDD: ['T', [Validators.required, Validators.maxLength(2)]],
    ECR_KBLevel: [null, [Validators.maxLength(6)]],
    ECR_KBType: [null, [Validators.maxLength(6)]],
    ECR_Scanner: [null, [Validators.maxLength(20)]],
    ECR_ScannerCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ScrType: [null, [Validators.maxLength(20)]],
    ECR_CD: [null, [Validators.maxLength(20)]],
    ECR_CDCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ExtScr: [null, [Validators.maxLength(20)]],
    ECR_ExtScrCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_GUIPrn: [null, [Validators.maxLength(20)]],
    ECR_GUICom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_SlipPrn: [null, [Validators.maxLength(20)]],
    ECR_SlipPrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_OrderPrn: [null, [Validators.maxLength(20)]],
    ECR_OrderPrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_LablePrn: [null, [Validators.maxLength(20)]],
    ECR_LablePrnCom: [null, [Validators.min(0), Validators.max(99)]],
    ECR_EDC: [null, [Validators.maxLength(20)]],
    ECR_EDCCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_EDC2: [null, [Validators.maxLength(20)]],
    ECR_EDC2Com: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdA: [null, [Validators.maxLength(20)]],
    ECR_ElecSVCrdACom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdB: [null, [Validators.maxLength(20)]],
    ECR_ElecSVCrdBCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecSVCrdC: [null, [Validators.maxLength(20)]],
    ECR_ElecSVCrdCCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_ElecPay: [null, [Validators.maxLength(20)]],
    ECR_ElecPayCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_Drawer: [null, [Validators.maxLength(20)]],
    ECR_DrawerCom: [0, [Validators.min(0), Validators.max(99)]],
    ECR_MSR: [null, [Validators.maxLength(20)]],
    ECR_MSRCom: [null, [Validators.min(0), Validators.max(99)]],
    CRT_Date: [null],
    CRT_USR_No: [null, [Validators.maxLength(16)]],
    CRT_USR_Name: [null, [Validators.maxLength(20)]],
    UPD_Date: [null],
    UPD_USR_No: [{ value: '', disabled: true }],
    UPD_USR_Name: [null, [Validators.maxLength(20)]],
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
  CounterOptions: CounterOption[] = [];
  /** 使用者在專櫃選擇器彈窗實際點選的那一筆合約(同一專櫃可能同時有生效中/尚未生效多筆)，優先用這筆帶入表單，避免用專櫃代號 find 挑錯 */
  private selectedCounterRow: TLTTALENTActiveContractItem | null = null;
  /** 專櫃編號選擇器彈窗欄位（11 欄） */
  tltNoPickerColumns = tltNoPickerCruColumns;
  CashierOptions: IDropdownItem[] = [];
  LocOptions: IDropdownItem[] = [];
  /** 目前輸入的位置編號是否查無位置主檔(POS2002)資料，控制常駐警告文字顯示(不阻擋送出) */
  locNoWarning = false;
  readonly locNoWarningMessage = '查無此位置編號對應的位置主檔資料';
  KBLevelOptions: LabelValueOption[] = []; // 機台鍵盤編號 下拉選項
  tmplDetailList: TLS41010Item[] = [];

  // 周邊設定：disabled 顯示用下拉選項，統一「代號 - 名稱」格式，值只能透過切換環境變數範本(ECR_TmplNo)連動改變，不開放手動編輯
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
  ECR_ElecSVCrdA_Option = getSYS1000Options('ECR_ElecSVCrdA');
  ECR_ElecSVCrdB_Option = getSYS1000Options('ECR_ElecSVCrdB');
  ECR_ElecSVCrdC_Option = getSYS1000Options('ECR_ElecSVCrdC');
  ECR_ElecPay_Option = getSYS1000Options('ECR_ElecPay');
  ECR_Drawer_Option = getSYS1000Options('ECR_Drawer');

  ngOnInit(): void {
    this.initializePage('TLS41010', this.dataForm);

    // 專櫃編號下拉（共通：僅顯示每個專櫃最近一次已生效的合約，選取後直接帶入相關欄位，不需再打 API）
    this.dropdownApiService.queryTltTalentActiveContract()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.CounterOptions = (res ?? []) as CounterOption[];
      });

    // Disable 一些欄位
    for (const field of [
      'ECR_KBType', 'ECR_Scanner', 'ECR_MSR', 'ECR_ScrType', 'ECR_CD', 'ECR_ExtScr',
      'ECR_GUIPrn', 'ECR_SlipPrn', 'ECR_OrderPrn', 'ECR_LablePrn', 'ECR_EDC', 'ECR_EDC2',
      'ECR_ElecSVCrdA', 'ECR_ElecSVCrdB', 'ECR_ElecSVCrdC', 'ECR_ElecPay', 'ECR_Drawer',
      'CRT_Date', 'CRT_USR_No', 'CRT_USR_Name', 'UPD_Date', 'UPD_USR_No', 'UPD_USR_Name',
      'ECR_TLT_Name',
      // 館別/樓層/區域：一律由位置編號查位置主檔(POS2002)自動回填，不開放手動輸入
      'ECR_Group', 'ECR_SubGroup', 'ECR_AreaNo',
    ]) this.dataForm.get(field)?.disable();

    if (this.isFormCreateable) {
      this.dataForm.get('ECR_No')?.enable();
      this.dataForm.get('ECR_No')?.reset('');
      this.dataForm.get('ECR_Status')?.setValue('A');
      this.dataForm.get('ECR_Status')?.disable();
      this.dataForm.get('ECR_Type')?.setValue('2'); // 預設為專櫃機台(自收)，但保持可選
    } else if (this.isFormEditable) {
      this.dataForm.get('ECR_No')?.disable();
    }
    // 新增/編輯模式時，收銀員姓名由系統依 ECR_USR_No 自動帶入，不允許手動編輯
    if (this.isFormCreateable || this.isFormEditable) {
      this.dataForm.get('ECR_USR_Name')?.disable();
    }
    // 環境變數下拉選單
    this.dropDownListService.queryPOS1002TML_ALL_DropDownList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
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
    this.dropdownApiService.queryPos10015()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.ECR_SrvIP_Option = (options ?? []).map(item => ({
          label: `${item['Name']} - ${item['No']}`, // 下拉顯示 IP
          value: item['No'],        // 實際值使用代碼(例如 DEVAP / TEST01)
          No: item['No'],
          Name: item['Name'],
        }));
      });

    //收銀員下拉選單
    this.dropdownApiService.queryPos2001()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.CashierOptions = (options ?? []) as IDropdownItem[];
      });

    // 綁定下拉選單選取 → 自動帶出姓名
    this.dataForm.get('ECR_USR_No')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(selectedNo => {
        const selected = this.CashierOptions.find(c => c.No === selectedNo);
        this.dataForm.patchValue({
          ECR_USR_Name: selected ? selected.Name : ''
        }, { emitEvent: false });
      });

    //位置編號
    this.dropdownApiService.queryPos2002()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(options => {
        this.LocOptions = (options ?? []) as IDropdownItem[];
        // LocOptions 是非同步載入，編輯模式的既有位置編號在這批資料回來前就已由 initializePage() 帶入表單，
        // 這裡載入完成後要用目前欄位值重新查一次，警告提示/館別樓層區域才會跟著正確顯示
        this.syncLocNo(this.dataForm.get('ECR_LocNo')?.value);
      });

    // 機台鍵盤編號下拉 (來自 TLS42010 下拉資料，key/value 皆為 USR_Level，附鍵盤說明組成顯示文字)
    this.dropDownListService.queryTLS42010DropDownList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.KBLevelOptions = (res?.Data ?? []).map((item: ITLS42010KBLevelItem) => ({
          label: item.ECR_KBDesc ? `${item.valueUSR_Level} - ${item.ECR_KBDesc}` : item.valueUSR_Level,
          value: item.keyUSR_Level,
        }));
      });

    this.dataForm.get('ECR_LocNo')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(selectedNo => this.syncLocNo(selectedNo));

    // 監聽欄位變化：環境變數（範本）切換
    this.dataForm.get('ECR_TmplNo')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tmplNo) => {
        if (!tmplNo) return;
        const detail = this.tmplDetailList.find(x => x.ECR_TmplNo === tmplNo);
        if (!detail) return;

        const patchObj: Record<string, string | number | Date | null> = {};

        // 1. 先用迴圈把所有要更新的欄位值整理到 patchObj 物件中
        for (const key of Object.keys(this.dataForm.controls)) {
          const value = detail[key as keyof TLS41010Item];
          if (value === undefined) continue;

          // 特別處理連接埠欄位為 null 的情況
          if ((key === 'ECR_MSRCom' || key === 'ECR_OrderPrnCom') && value === null) {
            patchObj[key] = 0;
            continue;
          }

          // 特別處理 ECR_SettleHHNN：可能為 '2330' / 2330 / Date
          if (key === 'ECR_SettleHHNN') {
            patchObj[key] = this.parseSettleTime(value);
            continue;
          }

          // 其他欄位暫存入物件
          patchObj[key] = value;
        }

        this.dataForm.patchValue(patchObj, { emitEvent: false });
      });
    this.dataForm.get('ECR_Type')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.checkTltNoRequired(value);
      });
    this.checkTltNoRequired(this.dataForm.get('ECR_Type')?.value ?? '');

    // 專櫃編號選取 → 直接從下拉選項帶入相關欄位，不需再打 API
    this.dataForm.get('ECR_TLT_No')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedNo) => {
        if (!selectedNo) return;

        // 若剛好是使用者在彈窗選中的那筆，優先用它；否則(例如手動輸入代號)才回頭用專櫃代號 find(同專櫃若有多筆合約，會挑到最新一筆)
        const selected = this.selectedCounterRow?.No === selectedNo
          ? this.selectedCounterRow
          : this.CounterOptions.find(c => c.No === selectedNo);
        if (!selected) return;

        // 只要專櫃資料有值，就覆蓋（不動沒給值的欄位）；館別/樓層/區域不直接用合約自帶的值，
        // 一律交給 syncLocNo() 依覆蓋後的位置編號重新比對位置主檔(POS2002)決定，查無資料時才會正確留空+顯示警告
        const patch: Record<string, string | Date> = {};
        if (selected.ECR_LocNo) patch['ECR_LocNo'] = selected.ECR_LocNo;
        if (selected.tlt_bdate) patch['ECR_ActiveDate'] = new Date(selected.tlt_bdate);
        if (selected.tlt_edate) patch['ECR_ExpireDate'] = new Date(selected.tlt_edate);
        if (selected.Name) patch['ECR_Name'] = selected.Name;
        if (selected.Name) patch['ECR_TLT_Name'] = selected.Name;

        this.dataForm.patchValue(patch, { emitEvent: false });
        this.syncLocNo(this.dataForm.get('ECR_LocNo')?.value);
      });

    // 若後端/範本回傳 null/undefined 的連接埠欄位，畫面預設顯示 0
    for (const field of ['ECR_MSRCom', 'ECR_OrderPrnCom']) {
      const ctrl = this.dataForm.get(field);
      if (ctrl && (ctrl.value === null || ctrl.value === undefined)) {
        ctrl.setValue(0, { emitEvent: false });
      }
    }


  }

  /** 專櫃選擇器彈窗點選某列：記住這筆(可能是生效中或尚未生效的營運區間)，供 ECR_TLT_No valueChanges 精確帶入表單 */
  onCounterRowSelect(row: TLTTALENTActiveContractItem): void {
    this.selectedCounterRow = row;
  }

  /**
   * 位置編號比對位置主檔(POS2002)：查得到就回填館別/樓層/區域並隱藏警告，查不到則清空該三欄並顯示常駐警告，
   * 不論來源是自動帶入(專櫃合約/範本)、手動輸入，或 LocOptions 非同步載入完成後的重新比對，都走同一套邏輯。
   */
  private syncLocNo(selectedNo: string | null | undefined): void {
    const selected = this.LocOptions.find(c => c.value === selectedNo);
    this.locNoWarning = !!selectedNo && !selected;

    const patch: Record<string, string> = {
      ECR_Group: selected?.tlt_building || '',
      ECR_SubGroup: selected?.tlt_floor || '',
      ECR_AreaNo: selected?.area_no || '',
    };

    if (selected && this.isFormCreateable && !this.dataForm.get('ECR_TLT_Name')?.value) {
      patch['ECR_TLT_Name'] = selected.Name || '';
    }

    this.dataForm.patchValue(patch, { emitEvent: false });
  }

  /** 判斷 TLT (專櫃編號) 必填 */
  checkTltNoRequired(value: string) {
    const tltControl = this.dataForm.get('ECR_TLT_No');
    if (!tltControl) return;

    // 當機台類型為 '2' (專櫃機台) 時，專櫃編號為必填
    if (value === '2') {
      tltControl.addValidators(Validators.required);
    } else {
      // 其他類型 (例如 '1' 集中統收) 則清除必填卡控
      tltControl.clearValidators();
    }

    // 關鍵：必須重新驗證欄位狀態，畫面上的紅框與錯誤提示才會即時更新
    tltControl.updateValueAndValidity({ emitEvent: false });
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 檢查是否為集中收銀(1) 且 專櫃編號有值
      const rawValue = frm.getRawValue();
      if (rawValue.ECR_Type === '1' && rawValue.ECR_TLT_No) {
        this.messageService.confirm({
          header: '變更確認',
          message: '機台類型已變更為【統收(集中)機台】，系統將自動清空【機台所屬專櫃】，是否確定送出？',
          accept: () => {
            // 用戶點選同意，執行原本的送出流程
            this.executeSubmit(frm);
          },
          reject: () => {
            this.loading = false;
          },
        });
      } else {
        // 一般狀況直接送出
        this.executeSubmit(frm);
      }
    });
  }
  private executeSubmit(frm: FormGroup) {
    this.loading = true;
    const body = this.createBody(frm);
    const serviceCall = this.isFormCreateable
      ? this.tls41010Service.insertTLS41010(body)
      : this.tls41010Service.updateTLS41010(body);

    serviceCall
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
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
  }

  private toDateStr(val: Date | string | null | undefined): string | undefined {
    if (!val) return undefined;
    const d = val instanceof Date ? val : new Date(String(val).replaceAll(/\//g, '-'));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
    if (rawValue.ECR_Type === '1') {
      rawValue.ECR_TLT_No = null;
      rawValue.ECR_TLT_Name = null;
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
      ECR_ExpireDate: this.toDateStr(rawValue.ECR_ExpireDate),
      ECR_CloseDate: this.toDateStr(rawValue.ECR_CloseDate),
      CRT_Date: rawValue.CRT_Date ?? undefined,
      UPD_Date: rawValue.UPD_Date ?? undefined,
      ECR_SettleHHNN: settleHHNN,
      ECR_MSRCom: rawValue.ECR_MSRCom ?? 0,
      ECR_OrderPrnCom: rawValue.ECR_OrderPrnCom ?? 0,
      ECR_SchNo: this.isFormCreateable
        ? '自動編號'
        : (rawValue.ECR_SchNo || this.rowdata?.ECR_SchNo || '自動編號')
    } as TLS41010Item;
  }
}
