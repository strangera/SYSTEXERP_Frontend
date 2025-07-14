import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { InvoiceCategoryService } from './../../../service/basic/invoice-category.service';
import { CahserTypeService } from './../../../service/basic/cahser-type.service';
import { PosServerService } from './../../../service/basic/pos-server.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { PosStatusService } from './../../../service/basic/pos-status.service';
import { LocationService } from './../../../service/basic/location.service';
import { FloorService } from './../../../service/basic/floor.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

// 2.4.1.6 收銀機發票安全量參數維護作業 CRU
@Component({
    selector: 'app-tls41060-cru',
    templateUrl: './tls41060-cru.component.html',
    styleUrl: './tls41060-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputNumberComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS41060CRUComponent extends BasicCrupageComponent implements OnInit {
  counterIDOptions: any[] = [];
  registerIDOptions: any[] = [];
  locatioIDOptions: any[] = [];
  posStatusOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  posServerOptions: any[] = [];
  categoryOptions: any[] = [];
  invoiceCategoryOptions: any[] = [];

  ECR_Type_Option: any[] = [
    { value: 1, label: '集中收銀(統收)' },
    { value: 2, label: '專櫃機台(自收)' },
    { value: 7, label: '它社機台(不使用商場系統但開立商場發票)' },
  ];
  ECR_GUI_Type_Option: any[] = [
    { value: 0, label: '不開發票' },
    { value: 3, label: '二聯式收銀機發票' },
    { value: 7, label: '電子發票(預設值)' },
  ];

  ECR_Status_Option: any[] = [
    { value: 'A', label: '啟用(預設值)' },
    { value: 'C', label: '停用' },
    { value: 'S', label: '電子發票(強制停用)' },
    { value: 'T', label: '訓練' },
  ];

  ECR_SernoType_Option: any[] = [
    { value: 1, label: '循環使用' },
    { value: 2, label: '每日重計' },
    { value: 3, label: '每月重計' },
  ];

  YN_Option: any[] = [
    { value: 1, label: 'Y' },
    { value: 2, label: 'N' },
  ];

  ECR_SrvIP_Option: any[] = [
    { value: 'LINE1', label: 'LINE1 / 10.3.50.1' },
    { value: 'LINE2', label: 'LINE2 / 10.3.50.2' },
    { value: 'LINE3', label: 'LINE3 / 10.3.50.3' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    SYS_StoreNo: ['000', [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    ECR_Name: ['', [Validators.required, Validators.maxLength(20)]], // 收銀機名稱
    ECR_Type: [, [Validators.required, Validators.maxLength(2)]], // 機台類型
    ECR_GUI_Type: [, [Validators.required, Validators.maxLength(2)]], // 發票使用類別
    //
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬櫃位名稱
    ECR_ActiveDate: [], // 啟用日期
    ECR_CloseDate: [], // 停用日期
    ECR_Status: [, [Validators.maxLength(2)]], // 收銀機狀態
    ECR_Group: [, [Validators.maxLength(20)]], // 樓層
    ECR_SubGroup: [, [Validators.maxLength(20)]], // 次樓別
    ECR_AreaNo: [, [Validators.maxLength(6)]], // 區域
    ECR_LocNo: [, [Validators.maxLength(8)]], // 位置
    HOS_No: [, [Validators.maxLength(6)]], // 倉庫編號
    ECR_IP: [, [Validators.maxLength(20)]], // 收銀機台IP
    ECR_SrvIP: [, [Validators.maxLength(20)]], // 收銀機後台主機IP
    ECR_TmplNo: [, [Validators.maxLength(8)]], // 周邊設定模版編號: 新增收銀機設定時會依照輸入的模版編號匯入模版的設定內容，但允許使用者修改匯入後的設定
    //
    ECR_SernoType: [, [Validators.required, Validators.maxLength(20)]], // 交易序號使用方式
    ECR_TimeTickInvl: [, [Validators.required, Validators.maxLength(6)]], // 系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次
    ECR_Interval: [, [Validators.required, Validators.maxLength(6)]], // 上下傳異動檔間隔(秒)
    ECR_MaxQty: [, [Validators.required, Validators.maxLength(6)]], // 單筆交易數量上限 0=不限制 預設值為999999
    ECR_MaxAmt: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易金額上限 0=不限制 預設值為999999
    ECR_MaxItemAmt: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易最大金額限制 0=不限制 預設值為99999999
    ECR_MaxDisc: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易最大折扣比率限制 0=不限制 預設值為0
    ECR_EdcTimeout: [, [Validators.required, Validators.maxLength(6)]], // 信用卡刷卡機連線時限(秒)預設值為60
    ECR_EdcSettle: [, [Validators.required, Validators.maxLength(1)]], // 信用卡刷卡機連動日結 Y/N 預設值為Y
    // 報表列印設定
    ECR_SelfReport: [, [Validators.required, Validators.maxLength(1)]], // 是否執行自我報帳 Y/N 預設值為Y
    ECR_SaleRpt1: [, [Validators.required, Validators.maxLength(1)]], // 是否列印收銀員交班表 Y/N 預設值為Y
    ECR_SaleRpt2: [, [Validators.required, Validators.maxLength(1)]], // 是否列印收銀機財務報表 Y/N 預設值為Y
    ECR_SaleRpt3: [, [Validators.required, Validators.maxLength(1)]], // 是否列印時段銷售報表 Y/N 預設值為Y
    ECR_SaleRpt4: [, [Validators.required, Validators.maxLength(1)]], // 是否列印部門銷售報表 Y/N 預設值為Y
    ECR_SaleRpt5: [, [Validators.required, Validators.maxLength(1)]], // 是否列印單品銷售報表 Y/N 預設值為Y
    ECR_SaleRpt6: [, [Validators.required, Validators.maxLength(1)]], // 是否列印銷貨明細表 Y/N 預設值為Y
    ECR_SaleRpt7: [, [Validators.required, Validators.maxLength(1)]], // 是否列印作廢明細表 Y/N 預設值為Y
    ECR_SaleRpt8: [, [Validators.required, Validators.maxLength(1)]], // 是否列印自我報帳(現額報告)帳條 Y/N 預設值為Y
    ECR_SaleRpt9: [, [Validators.required, Validators.maxLength(1)]], // 是否列印保全現金帳條(現金明細表) Y/N 預設值為Y
    ECR_SaleRpt10: [2, [Validators.required, Validators.maxLength(1)]], // 保留 預設值為N
    //
    ECR_PrnLogo: [, [Validators.maxLength(1)]], // 是否列印商標 Y/N 預設值為Y
    ECR_Logo1: ['', [Validators.maxLength(100)]], // 商標1 (店名)
    ECR_Logo2: ['', [Validators.maxLength(100)]], // 商標1 (地址)
    ECR_Logo3: ['', [Validators.maxLength(100)]], // 商標3 (電話)
    ECR_Logo4: ['', [Validators.maxLength(100)]], // 商標4 (統一編號)
    ECR_Logo5: ['', [Validators.maxLength(100)]], // 商標5
    ECR_Logo6: ['', [Validators.maxLength(100)]], // 商標6
    //
    ECR_GUI_PeriodQty: [, [Validators.required]], // 每期發票預設配號量，預設值為50，設定值必須為50的倍數
    ECR_GUI_MinQty: [, [Validators.required]], // 發票最小安全存量，預設值為50，設定值必須為50的倍數
    // 周邊設定
    ECR_KBLevel: [, [Validators.maxLength(6)]], // 機台鍵盤等級
    ECR_KBType: [, [Validators.maxLength(2)]], // 鍵盤型態
    ECR_ScrType: ['', [Validators.maxLength(20)]], // 收銀畫面樣式
    ECR_GUIPrn: ['', [Validators.maxLength(20)]], // 發票印表機型態，預設值空白代表未設定
    ECR_SlipPrn: ['', [Validators.maxLength(20)]], // 收據印表機型態，預設值空白代表未設定
    ECR_EDC: ['', [Validators.maxLength(20)]], // 信用卡刷卡機型態，預設值空白代表未設定
    ECR_CD: ['', [Validators.maxLength(20)]], // 客戶顯示器型態，預設值空白代表未設定
    ECR_ExtScr: ['', [Validators.maxLength(20)]], // 多媒體客戶顯示器名稱，預設值空白代表未設定
    ECR_Drawer: ['', [Validators.maxLength(20)]], // 錢櫃型態，預設值空白代表未設定
    ECR_Scanner: ['', [Validators.maxLength(20)]], // 掃描器型態，預設值空白代表未設定
    ECR_LablePrn: ['', [Validators.maxLength(20)]], // 標籤印表機型態，預設值空白代表未設定
    ECR_RmtSlipPrn: ['', [Validators.maxLength(20)]], // 第二台收據印表機型態，預設值空白代表未設定
    ECR_EDC2: ['', [Validators.maxLength(20)]], // 第二台信用卡刷卡機型態，預設值空白代表未設定
    ECR_EDC3: ['', [Validators.maxLength(20)]], // 第三台信用卡刷卡機型態，預設值空白代表未設定
    ECR_ElecSVCrdA: ['', [Validators.maxLength(20)]], // 悠遊卡，預設值空白代表未設定
    ECR_ElecSVCrdB: ['', [Validators.maxLength(20)]], // 一卡通，預設值空白代表未設定
    ECR_ElecSVCrdC: ['', [Validators.maxLength(20)]], // 愛金卡，預設值空白代表未設定
    ECR_ElecPay: ['', [Validators.maxLength(20)]], // 電子支付，預設值空白代表未設定
    //
    ECR_GUICom: [, [Validators.maxLength(2)]], // 發票印表機連接埠，預設值為0(未啟用)
    ECR_SlipPrnCom: [, [Validators.maxLength(2)]], // 收據印表機連接埠，預設值為0(未啟用)
    ECR_EDCCom: [, [Validators.maxLength(2)]], // 信用卡刷卡機連接埠，預設值為0(未啟用)
    ECR_CDCom: [, [Validators.maxLength(2)]], // 客戶顯示器連接埠，預設值為0(未啟用)
    ECR_ExtScrCom: [, [Validators.maxLength(2)]], // 多媒體客戶顯示器連接埠，預設值為0(未啟用)
    ECR_CashD1Com: [, [Validators.maxLength(2)]], // 錢櫃連接埠，預設值為0(未啟用)
    ECR_ScannerCom: [, [Validators.maxLength(2)]], // 掃描器連接埠，預設值為0(未啟用)
    ECR_LablePrnCom: [, [Validators.maxLength(2)]], // 標籤印表機連接埠，預設值為0(未啟用)
    ECR_RmtSlipPrnCom: [, [Validators.maxLength(2)]], // 第二台收據印表機連接埠，預設值為0(未啟用)
    ECR_EDC2Com: [, [Validators.maxLength(2)]], // 第二台信用卡刷卡機連接埠，預設值為0(未啟用)
    ECR_EDC3Com: [, [Validators.maxLength(2)]], // 第三台信用卡刷卡機連接埠，預設值為0(未啟用)
    ECR_ElecSVCrdACom: [, [Validators.maxLength(2)]], // 悠遊卡連接埠，預設值為0(未啟用)
    ECR_ElecSVCrdBCom: [, [Validators.maxLength(2)]], // 一卡通連接埠，預設值為0(未啟用)
    ECR_ElecSVCrdCCom: [, [Validators.maxLength(2)]], // 愛金卡連接埠，預設值為0(未啟用)
    ECR_ElecPayCom: [, [Validators.maxLength(2)]], // 電子支付連接埠，預設值為0(未啟用)

    // 可以從10015知道獲取 主機、主機後台ip，不使用原網頁的Server欄位
    // server: [], // POS SERVER
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private counterCodeService: CounterCodeService,
    private floorService: FloorService,
    private locationService: LocationService,
    private posStatusService: PosStatusService,
    private RegionService: RegionService,
    private posServerService: PosServerService,
    private cahserTypeService: CahserTypeService,
    private invoiceCategoryService: InvoiceCategoryService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '240006';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.counterIDOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.registerIDOptions = data;
      this.floorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locatioIDOptions = data;
    });
    //
    this.posStatusService.getSystemTypes().subscribe(data => {
      this.posStatusOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.posServerService.getSystemTypes().subscribe(data => {
      this.posServerOptions = data;
    });
    //
    this.cahserTypeService.getSystemTypes().subscribe(data => {
      this.categoryOptions = data;
    });
    //
    this.invoiceCategoryService.getSystemTypes().subscribe(data => {
      this.invoiceCategoryOptions = data;
      // 全選填入
      // let allSystemValues = this.invoiceCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   invoiceCategory: allSystemValues
      // });
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

    console.log(this.accordionTabCss);

    // 禁用 SYS_StoreNo 欄位
    this.dataForm.get('SYS_StoreNo')?.disable();
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      // name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
      // CashRegisterType: ['1', Validators.required], // 收銀機型態
      // SalesDate: ['', Validators.required], // 銷售日期
      // CashRegisterCode: ['', Validators.required], // 收銀機代號
      // TransactionSerialNumber: ['', Validators.required], // 交易流水號
      // CounterNumber: ['', Validators.required], // 專櫃編號
      // TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      // TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      // TaxableAmount: ['', Validators.required], // 應稅金額
      // TaxFreeAmount: ['', Validators.required], // 免稅金額
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/TLS4000/TLS41060']);
  }
}
