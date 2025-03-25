import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';

// 2.4.6.2 POS環境變數維護作業 CRU
@Component({
  selector: 'app-tls46020-cru',
  templateUrl: './tls46020-cru.component.html',
  styleUrl: './tls46020-cru.component.scss'
})
export class TLS46020CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS1002TML_收銀機週邊設定模版檔
    ECR_TmplNo: [,[Validators.required, Validators.maxLength(20)]], // 環境變數編號
    ECR_TmplDesc: [,[Validators.required]], // 環境變數備註 (統收機台預設設定)
    ECR_SernoType: [2,[Validators.required, Validators.maxLength(1)]], // 交易序號模式 1=循環使用 2=每日重計(預設值) 3=每月重計
    ECR_GUI_Type: [7,[Validators.required, Validators.maxLength(2)]], // 發票使用類別 00=不開發票 03=二聯式收銀機發票 07=電子發票(預設值)
    ECR_TimeTickInvl: [,[Validators.required, Validators.maxLength(6)]], // 系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次

    //收銀設定
    ECR_ForceInput: [0,[Validators.required, Validators.maxLength(1)]], // 是否強制輸入付款金額 預設值為N
    ECR_CustCntEntry: [0,[Validators.required, Validators.maxLength(1)]], // 是否輸入來客數 Y/N 預設值為N * special to POS1002
    ECR_CustTypeEntry: [0,[Validators.required, Validators.maxLength(1)]], // 是否輸入客層數 Y/N 預設值為N
    ECR_ClerkEntry: [0,[Validators.required, Validators.maxLength(1)]], // 是否強制輸入營業員 Y/N 預設值為N
    ECR_ForceMember: [0,[Validators.required, Validators.maxLength(1)]], // 是否強制輸入會員編號 Y/N 預設值為N
    ECR_Interval: [6,[this.validationService.numberValidator,Validators.required, Validators.max(999999)]], // 上下傳異動檔間隔(秒) 預設值為6

    ECR_MaxQty: [999999,[Validators.required, Validators.maxLength(8)]], // 單筆交易數量上限 0=不限制 預設值為999999
    ECR_MaxAmt: [99999999,[Validators.required, Validators.maxLength(8)]], // 單筆交易金額上限 0=不限制 預設值為99999999
    ECR_MaxItemAmt: [99999999,[Validators.required, Validators.maxLength(8)]], //單一明細金額上限 0=不限制 預設值為99999999
    ECR_MaxDisc: [0,[Validators.required, Validators.maxLength(8)]], // 單筆交易最大折扣比率限制 0=不限制 預設值為0
    ECR_EdcTimeout: [60,[Validators.required, Validators.maxLength(8)]], // 信用卡刷卡機連線時限(秒)預設值為60
    ECR_EdcSettle: [0,[Validators.required]], // 信用卡刷卡機連動日結 Y/N 預設值為Y
    
    // 報表列印設定
    ECR_SelfReport: [1,[Validators.required, Validators.maxLength(1)]], // 是否執行自我報帳 Y/N 預設值為Y
    ECR_SaleRpt1: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印收銀員交班表 Y/N 預設值為Y
    ECR_SaleRpt2: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印收銀機財務報表 Y/N 預設值為Y
    ECR_SaleRpt3: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印時段銷售報表 Y/N 預設值為Y
    ECR_SaleRpt4: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印部門銷售報表 Y/N 預設值為Y
    ECR_SaleRpt5: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印單品銷售報表 Y/N 預設值為Y
    ECR_SaleRpt6: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印銷貨明細表 Y/N 預設值為Y
    ECR_SaleRpt7: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印作廢明細表 Y/N 預設值為Y
    ECR_SaleRpt8: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印自我報帳(現額報告)帳條 Y/N 預設值為Y
    ECR_SaleRpt9: [1,[Validators.required, Validators.maxLength(1)]], // 是否列印保全現金帳條(現金明細表) Y/N 預設值為Y
    ECR_SaleRpt10: [2,[Validators.required, Validators.maxLength(1)]], // 保留 預設值為N
    //
    ECR_PrnLogo: [1,[Validators.maxLength(1)]], // 是否列印商標 Y/N 預設值為Y
    ECR_Logo1: ['',[Validators.maxLength(100)]], // 商標1 (店名)
    ECR_Logo2: ['',[Validators.maxLength(100)]], // 商標1 (地址)
    ECR_Logo3: ['',[Validators.maxLength(100)]], // 商標3 (電話)
    ECR_Logo4: ['',[Validators.maxLength(100)]], // 商標4 (統一編號)
    ECR_Logo5: ['',[Validators.maxLength(100)]], // 商標5
    ECR_Logo6: ['',[Validators.maxLength(100)]], // 商標6
    //
    ECR_GUI_PeriodQty: [50], // 機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數
    ECR_GUI_MinQty: [50], // 機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數

    ECR_SettleDD: ['T',[Validators.required]], // 清機提示日期 T=當天(預設值) N=隔天
    ECR_SettleHHNN: ['23:30',[Validators.required]], // 清機提示時間-時分 預設值為2330

    // 周邊設定
    // 輸入
    ECR_KBLevel: [,[Validators.maxLength(6)]], // 機台鍵盤等級
    ECR_KBType: [,[Validators.maxLength(2)]], // 鍵盤型態
    ECR_Scanner: ['',[Validators.maxLength(20)]], // 掃描器型態，預設值空白代表未設定
    ECR_ScannerCom: [0,[Validators.maxLength(2)]], // 掃描器連接埠，預設值為0(未啟用)
    // 顯示
    ECR_ScrType: ['',[Validators.maxLength(20)]], // 收銀畫面樣式
    ECR_CD: ['',[Validators.maxLength(20)]], // 客戶顯示器型態，預設值空白代表未設定
    ECR_CDCom: [0,[Validators.maxLength(2)]], // 客戶顯示器連接埠，預設值為0(未啟用)
    ECR_ExtScr: ['',[Validators.maxLength(20)]], // 收銀外接顯示器名稱，預設值空白代表未設定
    ECR_ExtScrCom: [0,[Validators.maxLength(2)]], // 收銀外接顯示器連接埠，預設值為0(未啟用)
    // 列印
    ECR_GUIPrn: ['',[Validators.maxLength(20)]], // 發票印表機型態，預設值空白代表未設定
    ECR_GUICom: [0,[Validators.maxLength(2)]], // 發票印表機連接埠，預設值為0(未啟用)
    ECR_SlipPrn: ['',[Validators.maxLength(20)]], // 菜單印表機型態，預設值空白代表未設定
    ECR_SlipPrnCom: [0,[Validators.maxLength(2)]], // 菜單印表機連接埠，預設值為0(未啟用)
    ECR_LablePrn: ['',[Validators.maxLength(20)]], // 標籤印表機型態，預設值空白代表未設定
    ECR_LablePrnCom: [0,[Validators.maxLength(2)]], // 標籤印表機連接埠，預設值為0(未啟用)

    // 信用卡
    ECR_EDC: ['',[Validators.maxLength(20)]], // 信用卡刷卡機型態，預設值空白代表未設定
    ECR_EDCCom: [0,[Validators.maxLength(2)]], // 信用卡刷卡機連接埠，預設值為0(未啟用)
    ECR_EDC2: ['',[Validators.maxLength(20)]], // 第二台信用卡刷卡機型態，預設值空白代表未設定
    ECR_EDC2Com: [0,[Validators.maxLength(2)]], // 第二台信用卡刷卡機連接埠，預設值為0(未啟用)
    ECR_EDC3: ['',[Validators.maxLength(20)]], // 第三台信用卡刷卡機型態，預設值空白代表未設定
    ECR_EDC3Com: [0,[Validators.maxLength(2)]], // 第三台信用卡刷卡機連接埠，預設值為0(未啟用)

    // 電子票證、電子支付
    ECR_ElecSVCrdA: ['',[Validators.maxLength(20)]], // 悠遊卡，預設值空白代表未設定
    ECR_ElecSVCrdACom: [0,[Validators.maxLength(2)]], // 悠遊卡連接埠，預設值為0(未啟用)
    ECR_ElecSVCrdB: ['',[Validators.maxLength(20)]], // 一卡通，預設值空白代表未設定
    ECR_ElecSVCrdBCom: [0,[Validators.maxLength(2)]], // 一卡通連接埠，預設值為0(未啟用)
    ECR_ElecSVCrdC: ['',[Validators.maxLength(20)]], // 愛金卡，預設值空白代表未設定
    ECR_ElecSVCrdCCom: [0,[Validators.maxLength(2)]], // 愛金卡連接埠，預設值為0(未啟用)
    ECR_ElecPay: ['',[Validators.maxLength(20)]], // 電子支付，預設值空白代表未設定
    ECR_ElecPayCom: [0,[Validators.maxLength(2)]], // 電子支付連接埠，預設值為0(未啟用)

    // 其他
    ECR_Drawer: ['',[Validators.maxLength(20)]], // 錢櫃型態，預設值空白代表未設定
    ECR_CashD1Com: [0,[Validators.maxLength(2)]], // 錢櫃連接埠，預設值為0(未啟用)
    ECR_Device1Name: ['',[Validators.maxLength(20)]], // 週邊裝置1 名稱，預設值空白代表未設定
    ECR_Device1Com: [0,[Validators.maxLength(2)]], // 週邊裝置1 連接埠，預設值為0(未啟用)
    ECR_Device2Name: ['',[Validators.maxLength(20)]], // 週邊裝置2 名稱，預設值空白代表未設定
    ECR_Device2Com: [0,[Validators.maxLength(2)]], // 週邊裝置2 連接埠，預設值為0(未啟用)
    ECR_Device3Name: ['',[Validators.maxLength(20)]], // 週邊裝置3 名稱，預設值空白代表未設定
    ECR_Device3Com: [0,[Validators.maxLength(2)]], // 週邊裝置3 連接埠，預設值為0(未啟用)
    ECR_Device4Name: ['',[Validators.maxLength(20)]], // 週邊裝置4 名稱，預設值空白代表未設定
    ECR_Device4Com: [0,[Validators.maxLength(2)]], // 週邊裝置4 連接埠，預設值為0(未啟用)
    ECR_Device5Name: ['',[Validators.maxLength(20)]], // 週邊裝置5 名稱，預設值空白代表未設定
    ECR_Device5Com: [0,[Validators.maxLength(2)]], // 週邊裝置5 連接埠，預設值為0(未啟用)
    ECR_Device6Name: ['',[Validators.maxLength(20)]], // 週邊裝置6 名稱，預設值空白代表未設定
    ECR_Device6Com: [0,[Validators.maxLength(2)]], // 週邊裝置6 連接埠，預設值為0(未啟用)
    ECR_Device7Name: ['',[Validators.maxLength(20)]], // 週邊裝置7 名稱，預設值空白代表未設定
    ECR_Device7Com: [0,[Validators.maxLength(2)]], // 週邊裝置7 連接埠，預設值為0(未啟用)
    ECR_Device8Name: ['',[Validators.maxLength(20)]], // 週邊裝置8 名稱，預設值空白代表未設定
    ECR_Device8Com: [0,[Validators.maxLength(2)]], // 週邊裝置8 連接埠，預設值為0(未啟用)
    ECR_Device9Name: ['',[Validators.maxLength(20)]], // 週邊裝置9 名稱，預設值空白代表未設定
    ECR_Device9Com: [0,[Validators.maxLength(2)]], // 週邊裝置9 連接埠，預設值為0(未啟用)
    ECR_Device10Name: ['',[Validators.maxLength(20)]], // 週邊裝置10 名稱，預設值空白代表未設定
    ECR_Device10Com: [0,[Validators.maxLength(2)]], // 週邊裝置10 連接埠，預設值為0(未啟用)

    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  ECR_SernoType_Option: any[] = [
    { value: 1, label: '循環使用' },
    { value: 2, label: '每日重計'},
    { value: 3, label: '每月重計'},
  ];
  ECR_GUI_Type_Option: any[] = [
    { value: 7, label: '電子發票'},
    { value: 0, label: '不開發票' },
    { value: 3, label: '二聯式收銀機發票'},
  ];

  YN_Option: any[] = [
    { value: 1, label: '是'},
    { value: 0, label: '否' },
  ];

  ECR_SettleDD_Option: any[] = [
    { value: 'T', label: '當天' },
    { value: 'N', label: '隔天'},
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private translate: TranslateService,
    //
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '240020';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss= 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss= 'edit-accordionTab';
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

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
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
    this.router.navigate(['/TLS4000/TLS46020']);
  }
}
