import { InvoiceCategoryService } from './../../../service/basic/invoice-category.service';
import { CahserTypeService } from './../../../service/basic/cahser-type.service';
import { PosServerService } from './../../../service/basic/pos-server.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { PosStatusService } from './../../../service/basic/pos-status.service';
import { LocationService } from './../../../service/basic/location.service';
import { FloorService } from './../../../service/basic/floor.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// Shared
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { SortMeta } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Sysb400m } from '../../sys/module/sysb000.module';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS41010';

// 2.4.1.1 收銀機基本資料維護
@Component({
  selector: 'app-tls41010',
  templateUrl: './tls41010.component.html',
  styleUrl: './tls41010.component.scss',
})
export class TLS41010Component
  extends BasicQueryPageComponent<any>
  implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    // POS1002 收銀機設定檔
    iD: [, [Validators.required, Validators.maxLength(19)]], // iD
    SYS_StoreNo: ['', [Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.maxLength(6)]], // 收銀機號
    ECR_Name: ['', [Validators.maxLength(20)]], // 機台名稱
    ECR_Type: [, [Validators.maxLength(2)]], // 機台類型 1=集中收銀(統收) 2=專櫃機台(自收) 7=它社機台(不使用商場系統但開立商場發票)
    ECR_UseType: ['', [Validators.maxLength(2)]], // 機台用途別 PK=停車場機台
    ECR_GUI_Type: [, [Validators.maxLength(2)]], // 發票使用類別 00=不開發票 03=二聯式收銀機發票 07=電子發票(預設值)
    //
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號，專櫃機台(自收)必須設定專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬專櫃名稱
    ECR_USR_No: [, [Validators.maxLength(8)]], // 機台所屬收銀員，集中收銀(統收)必須設定收銀員
    ECR_USR_Name: ['', [Validators.maxLength(20)]], // 機台所屬收銀員姓名
    ECR_ActiveDate_From: [], // 啟用日期
    ECR_ActiveDate_To: [], // 啟用日期
    ECR_CloseDate_From: [], // 停用日期
    ECR_CloseDate_To: [], // 停用日期
    ECR_Status: [, [Validators.maxLength(2)]], // 收銀機狀態 A=啟用(預設值) C=停用 S=強制停用 T=訓練

    ECR_Group: [, [Validators.maxLength(20)]], // 樓層
    ECR_SubGroup: [, [Validators.maxLength(20)]], // 次樓別
    ECR_AreaNo: [, [Validators.maxLength(6)]], // 區域
    ECR_LocNo: [, [Validators.maxLength(8)]], // 位置
    HOS_No: [, [Validators.maxLength(6)]], // 倉庫編號
    ECR_ComName: ['', [Validators.maxLength(64)]], // 機台電腦名稱
    ECR_IP: [, [Validators.maxLength(20)]], // 機台網路IP
    ECR_SrvIP: [, [Validators.maxLength(20)]], // 後台主機IP
    ECR_TmplNo: [, [Validators.maxLength(8)]], //  環境變數編號: 新增收銀機設定時會依照輸入的模版編號匯入模版的設定內容，但允許使用者修改匯入後的設定
    //
    ECR_SernoType: [, [Validators.required, Validators.maxLength(20)]], // 交易序號模式
    ECR_TimeTickInvl: [, [Validators.required, Validators.maxLength(6)]], // 系統對時間隔(秒)，每 XXXXXX 秒鐘對時一次
    ECR_Interval: [, [Validators.required, Validators.maxLength(6)]], // 上下傳異動檔間隔(秒)
    ECR_MaxQty: [, [Validators.required, Validators.maxLength(6)]], // 單筆交易數量上限 0=不限制 預設值為999999
    ECR_MaxAmt: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易金額上限 0=不限制 預設值為999999
    ECR_MaxItemAmt: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易最大金額限制 0=不限制 預設值為99999999
    ECR_MaxDisc: [, [Validators.required, Validators.maxLength(8)]], // 單筆交易最大折扣比率限制 0=不限制 預設值為0
    ECR_EdcTimeout: [, [Validators.required, Validators.maxLength(6)]], // 信用卡刷卡機連線時限(秒)預設值為60
    ECR_EdcSettle: [, [Validators.required, Validators.maxLength(1)]], // 信用卡刷卡機連動日結 Y/N 預設值為Y
    //新增
    // ECR_ForceInput      VARCHAR(1)         NOT NULL,     /*是否強制輸入付款金額 預設值為N*/
    // ECR_CustCntEntry    VARCHAR(01)        NOT NULL,     /*是否輸入來客數 Y/N 預設值為N* 顯示/
    // ECR_CustTypeEntry   VARCHAR(01)        NOT NULL,     /*是否輸入客層數 Y/N 預設值為N*/
    // ECR_ClerkEntry      VARCHAR(01)        NOT NULL,     /*是否強制輸入營業員 預設值為N*/
    // ECR_ForceMember     VARCHAR(01)        NOT NULL,     /*是否強制輸入會員編號 預設值為N*/
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
    ECR_GUI_PeriodQty: [], // 機台每期電子發票預設配號數量，預設值為50，設定值必須為50的倍數
    ECR_GUI_MinQty: [], // 機台電子發票最小安全存量，預設值為50，設定值必須為50的倍數

    //
    ECR_SettleDD: ['T'], // 清機提示日期 T=當天(預設值) N=隔天
    ECR_SettleHHNN: ['23:30'], // 清機提示時間-時分 預設值為2330

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

    //分頁查詢
    pageSize: [10],
    pageIndex: [0],
    SortBy: [[{ field: 'SYS_StoreNo', order: 1 }] as SortMeta[]],
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      ECR_Group: 'B1',
      ECR_AreaNo: 'A區',
      ECR_LocNo: 'B1A01',
      ECR_No: '000011',
      ECR_TLT_No: '000001',
      ECR_TLT_Name: '小騎士',
      ECR_ActiveDate: '2014/12/28',
      ECR_CloseDate: '2014/12/31',
      posServer: 'LINE3',
      ECR_Status: '停用',
      ECR_Type: '自收',
      ECR_IP: '10.3.50.1',
      ECR_GUI_Type: '二聯式收銀機發票',
    },
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'ECR_Group', header: '樓層', visible: true },
    { field: 'ECR_AreaNo', header: '區域', visible: true },
    { field: 'ECR_LocNo', header: '位置', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'ECR_ActiveDate', header: '啟用日期', visible: true },
    { field: 'ECR_CloseDate', header: '停用日期', visible: true },
    { field: 'posServer', header: 'POS SERVER', visible: true },
    { field: 'ECR_Status', header: '收銀機狀態', visible: true },
    { field: 'ECR_Type', header: '機台類型', visible: true },
    { field: 'ECR_IP', header: '收銀機台IP', visible: true },
    { field: 'ECR_GUI_Type', header: '發票使用類別', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  counterIDOptions: any[] = [];
  registerIDOptions: any[] = [];
  locatioIDOptions: any[] = [];
  posStatusOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  posServerOptions: any[] = [];
  categoryOptions: any[] = [];
  invoiceCategoryOptions: any[] = [];

  ECR_Type_Option: any[] = [];
  ECR_GUI_Type_Option: any[] = [];
  ECR_Status_Option: any[] = [];
  ECR_SernoType_Option: any[] = [];
  YN_Option: any[] = [];
  ECR_SrvIP_Option: any[] = [];
  ECR_TmplNo_Option: any[] = [];
  ECR_SettleDD_Option: any[] = [];
  ECR_UseType_Option: any[] = [];

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Sysb400m[] = [];

  constructor(
    private counterCodeService: CounterCodeService,
    private floorService: FloorService,
    private locationService: LocationService,
    private posStatusService: PosStatusService,
    private RegionService: RegionService,
    private posServerService: PosServerService,
    private cahserTypeService: CahserTypeService,
    private invoiceCategoryService: InvoiceCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41010', 'TLS/TLS41010CRU');
    this.loadOptions();

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.sysb400Service.querySYSB400(frm.value).subscribe({
      //   next: (response: any) => {
      //     console.log('API response:', response);
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       this.filteredData = [...this.data];
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(storageKey, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.queryStateService.clearQueryState(storageKey);
  }

  // 刪除項目
  onDelete(data: any | any[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.id != null && item.id !== undefined)
      .map((item) => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    //  this.sysb400Service.deleteSYSB400(deleteBody).subscribe({
    //    next: (response: any) => {
    //      if (response.Status === '0000') {
    //        this.messageService.successBubble('選中項目刪除成功');
    //      } else {
    //        console.error('API error:', response.Status, response.Message);
    //        this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //      }
    //    },
    //    error: (err: string) => {
    //      console.error('API error:', err);
    //      this.messageService.errorBubble('刪除失敗');
    //    },
    //    complete: () => {
    //      this.onSubmit(this.queryForm);
    //    },
    //  });

    this.selectedItems = [];
  }

  loadOptions() {
    // ----------------------------------------------------------------
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterIDOptions = data;
    });
    //
    this.floorService.getFloors().subscribe((data) => {
      this.registerIDOptions = data;
      this.floorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe((data) => {
      this.locatioIDOptions = data;
    });
    //
    this.posStatusService.getSystemTypes().subscribe((data) => {
      this.posStatusOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe((data) => {
      this.regionOptions = data;
    });
    //
    this.posServerService.getSystemTypes().subscribe((data) => {
      this.posServerOptions = data;
    });
    //
    this.cahserTypeService.getSystemTypes().subscribe((data) => {
      this.categoryOptions = data;
    });
    //
    this.invoiceCategoryService.getSystemTypes().subscribe((data) => {
      this.invoiceCategoryOptions = data;
    });

    this.ECR_Type_Option = [
      { value: 1, label: '集中收銀(統收)' },
      { value: 2, label: '專櫃機台(自收)' },
      { value: 7, label: '它社機台(不使用商場系統但開立商場發票)' },
    ];
    this.ECR_GUI_Type_Option = [
      { value: 0, label: '不開發票' },
      { value: 3, label: '二聯式收銀機發票' },
      { value: 7, label: '電子發票(預設值)' },
    ];

    this.ECR_Status_Option = [
      { value: 'A', label: '啟用(預設值)' },
      { value: 'C', label: '停用' },
      { value: 'S', label: '電子發票(強制停用)' },
      { value: 'T', label: '訓練' },
    ];

    this.ECR_SernoType_Option = [
      { value: 1, label: '循環使用' },
      { value: 2, label: '每日重計' },
      { value: 3, label: '每月重計' },
    ];

    this.YN_Option = [
      { value: 1, label: 'Y' },
      { value: 2, label: 'N' },
    ];

    this.ECR_SrvIP_Option = [
      { value: 'LINE1', label: 'LINE1 / 10.3.50.1' },
      { value: 'LINE2', label: 'LINE2 / 10.3.50.2' },
      { value: 'LINE3', label: 'LINE3 / 10.3.50.3' },
    ];

    this.ECR_TmplNo_Option = [
      { value: 1, label: '周邊編號1' },
      { value: 2, label: '周邊編號2' },
      { value: 3, label: '周邊編號3' },
    ];

    this.ECR_SettleDD_Option = [
      { value: 'T', label: '當天' },
      { value: 'N', label: '隔天' },
    ];

    this.ECR_UseType_Option = [{ value: 'PK', label: '停車場機台' }];
  }

  loadData(event: TableLazyLoadEvent) {
    const form = this.queryForm.value;
    if (this.totalRecords === 0) {
      return;
    }
    form.pageSize = event.rows && event.rows > 0 ? event.rows : 10;
    form.pageIndex = (event.first ?? 0) / form.pageSize + 1;
    form.SortBy = event.multiSortMeta ?? [{ field: 'org_id', order: 1 }];
    this.onSubmit(this.queryForm);
  }
}
