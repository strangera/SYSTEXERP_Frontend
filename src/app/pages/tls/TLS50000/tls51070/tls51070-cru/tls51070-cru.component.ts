import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51060Service } from '@service/api/tls/tls51060.service';
import { Tls51070Service } from '@service/api/tls/tls51070.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ImgUploadComponent } from '@shared/componentkit/img-upload/img-upload.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { apiOption, option } from '@shared/models/sys/sysb000.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { POS2004 } from '@shared/models/tls/tls000.model';
import { ValidationService } from '@shared/service/validation.service';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { dropDown51070 } from './dropDown51070';
import { IMG1001Detail, POS2005Detail, POS2020Detail } from './tls51070-cru.module';

// 每個欄位對應的區塊名稱
export type SectionName =
  | '基本資料'
  | '商品規格'
  | '商品規格(二)'
  | '商品資訊'
  | '其他';

export type FieldSectionMap = Record<string, SectionName>;

export const fieldSectionMap: FieldSectionMap = {
  // 基本資料 (buttonID === 1)
  PLU_MagNo: '基本資料',
  PLU_Name: '基本資料',
  PLU_EngName: '基本資料',
  PLU_PrnName: '基本資料',
  VEN_No: '基本資料',
  PLU_OrgPLUNo: '基本資料',
  PLU_No: '基本資料',
  CAT_LNo: '基本資料',
  CAT_MNo: '基本資料',
  CAT_SNo: '基本資料',
  PLU_MinOrder: '基本資料',
  PLU_Lable: '基本資料',
  PLU_Reserve1: '基本資料',

  // 商品規格 (buttonID === 2)
  PLU_Attribute: '商品規格',
  PLU_StockTaxType: '商品規格',
  PLU_Unit: '商品規格',
  PLU_TaxType: '商品規格',
  PLU_Type: '商品規格',
  PLU_BoxQty: '商品規格',
  PLU_Length: '商品規格',
  PLU_Width: '商品規格',
  PLU_Height: '商品規格',
  PLU_Weight: '商品規格',
  PLU_Volume: '商品規格',

  // 商品規格(二) (buttonID === 3)
  PLU_Reserve2: '商品規格(二)',
  PLU_Reserve3: '商品規格(二)',

  // 商品資訊 (buttonID === 4)
  TLT_NO: '商品資訊',
  LOGO_No: '商品資訊',
  PLU_ECStatus: '商品資訊',
  PLU_SalePrc: '商品資訊',
  STK_CurrentQty: '商品資訊',
  PLU_OrderPrc: '商品資訊',
  PLU_SafeQty: '商品資訊',
  PLU_OrderPrcRate: '商品資訊',
};

@UntilDestroy()
// 2.5.1.7  商品基本資料 CRU
@Component({
  selector: 'app-tls51070-cru',
  templateUrl: './tls51070-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    InputTextComponent,
    InputNumberComponent,
    ImgUploadComponent,
    DropdownComponent,
    DividerModule,
    TranslateModule,
    TableEditComponent]
})
export class TLS51070CRUComponent extends BasicCruPageComponent<POS2004> implements OnInit {
  // 在父組件中聲明
  // @ViewChild('pos2005Table') pos2005Table!: ExpandableEditTableComponent;
  // @ViewChild('pos2020Table') pos2020Table!: ExpandableEditTableComponent;

  //目前標籤列
  buttonID = 1; //預設在 基本資料標籤

  isRefreshing = false; // 是否是重製表單狀態(預設為false)

  //2004廠商編號選擇後自動帶入預設到2020

  // 新增 欄位PLU_PrnName 和  預設商品中文名稱 一樣 --ok
  // 商品採購廠商 編號模糊查詢 --ok
  // 廠商編號新增 --ok
  // 刪除廠商編號 只能刪除不一樣的 廠商 (POS2020不能刪除POS2004對應到的廠商編號) --ok
  // login token自動帶出 分店編號 readonly --ok
  // 2004 最主要"PLU_No": [""], > 指定給 2005 多筆"PLU_No": [""], -- 新增時增加提示這樣使用者也不用輸入兩次 --ok
  // 修改 標準進價 不要連動到 目前進價 --ok 新增重算的標準進價會另外送出，不會影響到舊的 --ok

  // 品牌代碼 ---PLULOGO 站存試算資料 --ok
  // 標籤檔 新增 預覽 (規格書藍色字) > 然後再確認 --ok
  // 變價表單拆成 主資料 變價前後 組合

  // ---0905 SA 需求更新-------------------------------------------------------------

  // 查詢(單選) 新增 編輯 新增 專櫃編號(主檔: TLT_NO)
  // 國際條碼 比照廠商編號自動帶下來 (等SA確認如何調整)
  // 廠商編號第二家以後就不開放上方的下拉選擇
  // ----------------------------------------------------------------
  orgdataForm: any;
  dataForm = this.formBuilder.group({
    id: [{ value: 0, disabled: true }], // 主鍵ID;
    // POS2004 商品主檔
    // 基本資料 顯示畫面
    PLU_MagNo: ['', [Validators.required, Validators.maxLength(20)]], // 商品管理編號 自動取號
    PLU_Name: ['', [Validators.required, Validators.maxLength(60)]], // 商品中文名稱
    PLU_PrnName: ['', [Validators.maxLength(40)]], // 列印名稱 預設商品中文名稱 一樣
    VEN_No: ['', [Validators.required, Validators.maxLength(16)]], // 廠商編號 --0711新增 (填寫才能輸入POS2020表單) 必填

    PLU_EngName: ['', [Validators.maxLength(100)]], // 商品英文名稱
    PLU_OrgPLUNo: ['', [Validators.maxLength(30)]], // 廠商貨號 --廠商自編碼 廠商貨號
    // PLU_No: ['', [Validators.maxLength(20)]], // 國際條碼 可選擇帶入PLU_MagNo，新增模式以外加上 必填
    PLU_No: ['', [Validators.maxLength(20), this.validationService.noChineseValidator]], // 國際條碼 由輸入的POS2005內容帶入 (非必填，若有填寫就同步到2005)
    PLU_MinOrder: [1, [Validators.maxLength(8), Validators.max(99999999)]], // 最小訂購量 ---預設1，採購時，輸入的採購量必需為最小訂購量的倍數。
    PLU_Lable: ['', [Validators.maxLength(50)]], // 標籤名稱

    CAT_LNo: ['', [Validators.required, Validators.maxLength(6)]], // 大分類代碼 POS2003
    CAT_MNo: ['', [Validators.required, Validators.maxLength(6)]], // 中分類代碼 POS20031
    CAT_SNo: ['', [Validators.required, Validators.maxLength(6)]], // 小分類代碼 POS20032
    PLU_Reserve1: ['', [Validators.maxLength(400)]], // 說明

    // 商品規格 顯示畫面
    PLU_Attribute: ['1', [Validators.required, Validators.maxLength(1)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_StockTaxType: ['1', [Validators.required, Validators.maxLength(1)]], // 進價稅別 0免稅,1應稅， 預設 1應稅
    PLU_Unit: ['01', [Validators.required, Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔 --

    PLU_TaxType: ['1', [Validators.required, Validators.maxLength(1)]], // 售價稅別:0免稅,1應稅 預設 1應稅
    PLU_Type: ['1 ', [Validators.required, Validators.maxLength(2)]], // 商品類別:1一般商品,8專櫃,CC:專櫃商品 ,SC:特殊條碼 (注意: 這邊是兩碼，會有空白)

    PLU_BoxQty: [1, [Validators.maxLength(4), Validators.min(0), Validators.max(9999)]], // 包裝入數(裝箱入數) / --南紡 包裝入數
    PLU_Length: [0, [Validators.maxLength(10), Validators.min(0), Validators.max(99999999)]], //長度(cm)
    PLU_Weight: [0, [Validators.maxLength(10), Validators.min(0), Validators.max(99999999)]], //重量(g)
    PLU_Height: [0, [Validators.maxLength(10), Validators.min(0), Validators.max(99999999)]], //高度(cm)
    PLU_Volume: [0, [Validators.maxLength(10), Validators.min(0), Validators.max(99999999)]], //容量(ml)
    PLU_Width: [0, [Validators.maxLength(10), Validators.min(0), Validators.max(99999999)]], //寬度(cm)

    // 商品規格(二) 顯示畫面
    PLU_Reserve2: ['', [Validators.maxLength(400)]], // 規格說明
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列

    // 商品資訊 顯示畫面
    TLT_NO: ['', [Validators.required, Validators.maxLength(12), this.validationService.noChineseValidator]], // 專櫃編號
    LOGO_No: ['', [Validators.required, Validators.maxLength(4)]], // 品牌代碼 ---PLULOGO
    PLU_SalePrc: [0, [Validators.required, Validators.maxLength(10), Validators.min(0)]], // 商品售價
    STK_CurrentQty: [{ value: 0, disabled: true }], // 庫存量 讀POS2099 新增固定0 ---後端直接提供(不允許編輯)---
    PLU_OrderPrc: [{ value: 0, disabled: true }], // 標準進價 商品售價＊進貨折數/1.05 ，計算到小數點以下2位，必填 (不可編輯 新增遵循此規則)
    PLU_SafeQty: [{ value: 0, disabled: true }], // 安全存量

    //---
    // 系統日期-建檔日期 > 365天, 去年整年度銷售量/12個月*2個月 🡪取整數

    //                    系統日期-建檔日期 < 365天，自建檔日起至今的銷售量/計算月數*2個月
    //                    計算月數=(系統日期-建檔日期) / 30天 🡪不取整數，依小數計算
    //                    例:建檔日起至今的銷售量 10個，(系統日期-建檔日期) 15天/30天=0.5(計算月數)
    //                    安全庫存量= 10(銷售量) / 0.5(計算月數) * 2個月= 40

    //---
    PLU_OrderPrcRate: [{ value: 0, disabled: true }], // 進價折數 預設0 (依照品牌 PLULOGO)
    PLU_ECStatus: ['1', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    // 20251013: PLU_ECStatus從顯示移除
    // 20251030: 新增此下拉單選欄位於 品牌代碼後面，不用預設值，非必填
    PLU_Status: ['0', [Validators.required, Validators.maxLength(1)]], // 商品狀態:0一般 不顯示

    //---必填未列入(都是預設不可編輯)---
    PLU_OpenPrc: ['N', [Validators.required, Validators.maxLength(1)]], // 開放售價Y/N

    PLU_AccountType: ['2', [Validators.maxLength(1)]], // 結帳別
    PLU_IsStock: ['Y', [Validators.maxLength(1)]], // 是否計算庫存 Y:是 N:否
    PLU_ReadyDay: [0, [Validators.maxLength(4)]], // 備貨天數 預設0
    PLU_StockType: ['0', [Validators.maxLength(1)]], // 庫存類別 0:一般 1:標準用量 2:自動轉換(沒用到) 3:子母商品 4:手動轉換
    PLU_TaxRate: [0.05, [Validators.maxLength(7)]], // 稅率 預設0.05

    PLU_StopSale: ['N', [Validators.maxLength(1)]], // 停止銷售註記(Y/N)
    PLU_CalcSaleStock: ['N', [Validators.maxLength(1)]], // 計算庫存方式(N:依數量 Y:依金額)
    PLU_Disc: ['Y', [Validators.maxLength(1)]], // 是否可折扣(Y/N)
    PLU_OpenOrderPrc: ['N', [Validators.maxLength(1)]], // 開放進價(Y/N)
    //------------

  });
  // 基本資料dropdown
  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  pluLogoOption: any[] = [];  // 品牌代碼
  unitOptions: apiOption[] = [];  //商品單位
  statusOptions: option[] = this.dropDown51070.statusOptions; // 20251013: PLU_ECStatus 從顯示移除
  TLT_NO_Option: apiOption[] = []; //專櫃編號：資料讀 TLTTALENT
  vendorOptions: option[] = [];  //廠商編號: 資料讀 POS2013
  // ---商品規格dropdown---
  attributeOptions: option[] = this.dropDown51070.attributeOptions;  // 商品型態
  taxTypeOptions: option[] = this.dropDown51070.taxTypeOptions; // 稅別
  pluTypeOptions: option[] = this.dropDown51070.pluTypeOptions; // 商品類別
  // ---POS2020 dropdown區---
  transTypeOption: option[] = this.dropDown51070.transTypeOption;  //運輸方式
  purchaseTypeOption: option[] = this.dropDown51070.purchaseTypeOption;  // 採購狀態
  // ---POS2020 -------------
  pos2005Detail: POS2005Detail[] = [];
  pos2020Detail: POS2020Detail[] = [];
  img1001Detail: IMG1001Detail[] = [];
  //---暫存品牌資料---
  cachedBrand: any = null;
  // ---------國際條碼 (POS2005) 編輯表格 至少要一筆-------------------------------------------------------
  // #region POS2005定義
  // 國際條碼編號	下拉
  POS2005Data: POS2005Detail[] = [];
  orgPOS2005Data: POS2005Detail[] = []; // pos2005(備分)
  selectedPOS2005Items: POS2005Detail[] = [];
  // POS2005 展開式表格的欄位定義
  POS2005DataColumn: EditColumn[] = [
    { field: 'PLU_No', header: '國際條碼', type: 'input', width: '100%' },
  ];
  // ---------採購廠商 (POS2020) 編輯表格 至少要一筆-------------------------------------------------------
  // #region POS2020定義
  // 廠商編號	下拉
  POS2020Data: POS2020Detail[] = [];
  orgPOS2020Data: POS2020Detail[] = []; // pos2020(備分)
  selectedPOS2020Items: POS2020Detail[] = [];
  // 預設新項目模板
  defaultNew2020 = {
    id: 0, //新增
    PLU_MagNo: '',
    VEN_No: '',
    STO_No: this.authService.getUserInfo()?.SYS_StoreNo ?? '',
    PLU_OrderPrc: 0,

    PLU_Purchase: '1',
    PLU_TransType: '4',
    PLU_TransDay: null,
    Remark: null,
    VDP_LastStockDate: null,

    status: 'new'
  };

  // POS2020 展開式表格的欄位定義
  POS2020DataColumn: EditColumn[] = []; // 等廠商編號好了再寫入POS2020欄位(廠商下拉)
  // 預設 POS2020 新項目模板 (最後進價=POS2004的標準進價PLU_OrderPrc)
  createDefaultNew2020(pLU_MagNo: string, pLU_OrderPrc: number, ven_no?: string) {
    this.defaultNew2020 = {
      id: 0,
      PLU_MagNo: pLU_MagNo,
      VEN_No: ven_no || '',
      STO_No: this.authService.getUserInfo()?.SYS_StoreNo ?? '',
      PLU_OrderPrc: pLU_OrderPrc,

      PLU_Purchase: '1',
      PLU_TransType: '1',
      PLU_TransDay: null,
      Remark: null,
      VDP_LastStockDate: null,

      status: 'new'
    };

    // console.log('2020模板', this.defaultNew2020);
  }

  // ------圖檔設定主檔 (IMG1001) 編輯表格----------------------------
  // #region IMG1001定義
  //注意:
  // POS2004, pluMagno, '' 圖片不可以中文
  // ------
  files: File[] = [];        // 上傳的檔案
  img1001Data: IMG1001Detail[] = []; // 圖片List editable, readable
  orgImg1001Data: IMG1001Detail[] = []; // 圖片List editable, readable (備分)
  confirmDeleteImages: string[] = []; // 確定刪除的圖片

  constructor(
    private tls51060Service: Tls51060Service, //查詢品牌代碼檔
    private tls51070Service: Tls51070Service,
    private dropDown51070: dropDown51070, //下拉選單 (選項固定)
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51070', this.dataForm);

    // 進價類的都不可編輯
    if (this.crudstatus == CRUDStatus.Create) {
      this.dataForm.get('PLU_SalePrc')?.enable();  // 售價 (只有新增可編輯)
    } else {
      this.dataForm.get('PLU_SalePrc')?.disable();
      // 複製原始表單
      this.orgdataForm = this.dataForm.getRawValue();
      // console.log('原始表單備份成功',this.orgdataForm);
    }

    //導入下拉清單
    this.loadOptions();

    //初始導入所有大分類、中分類、小分類表單
    this.loadCATOptions();

    // #region 讀取明細檔
    if (this.crudstatus == CRUDStatus.Edit || this.crudstatus == CRUDStatus.Read) {
      //查詢明細檔案 (編輯模式)
      console.log('編輯模式，明細檔讀取中', this.dataForm.value);

      //讀取明細檔 並載入預設值 (商品管理編號、目前進價)
      this.isRefreshing = true;
      this.loadDetail(this.dataForm.get('PLU_MagNo')?.value || '', this.dataForm.get('PLU_OrderPrc')?.value || 0)
        .then(() => {
          this.isRefreshing = false; // ✅ 等 loadDetail 完成後再關
        })
        .catch(() => {
          this.isRefreshing = false;
        });
    }

    // #region valueChange

    // 觀察 大分類 是否為''
    this.dataForm.get('CAT_LNo')!.valueChanges.subscribe((newValue) => {
      this.dataForm.controls.CAT_MNo.setValue(null, { emitEvent: false });
      if (!newValue) {
        // 讀取整份 大分類、中分類、小分類 dropDown
        this.middleOption = [];
        this.smallOption = [];
      } else {
        this.tls51070Service
          .queryCAT_MNo_DropDownList({ CAT_LNo: [newValue] })
          .subscribe((res) => {
            this.middleOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));

            this.smallOption = [];
          });

        // 若大分類為空 禁用中分類、小分類
        this.dataForm.get('CAT_MNo')?.enable();
        this.dataForm.get('CAT_SNo')?.enable();
      }
    });

    //觀察表單 中分類變化
    this.dataForm.get('CAT_MNo')?.valueChanges.subscribe((mno) => {
      this.dataForm.controls.CAT_SNo.setValue(null, { emitEvent: false });

      const lno = this.dataForm.get('CAT_LNo')?.value;
      //新版api改成list傳送
      const requestPayload = {
        CATList: [
          {
            CAT_LNo: lno,
            CAT_MNo: mno
          }
        ]
      };

      if (lno && mno) {
        this.tls51070Service
          .queryCAT_SNo_DropDownList(requestPayload)
          .subscribe((res) => {
            this.smallOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
          });
      } else {
        this.smallOption = [];
      }
    });

    // 觀察 品牌代碼 是否為變更(更新 進價折數、 標準進價)
    this.dataForm.get('LOGO_No')!.valueChanges.subscribe((newValue) => {
      if (newValue) {
        // 找到符合的品牌資料 (依照newValue 找到pluLogoOption對應的No)
        const matched = this.pluLogoOption.find(item => item.No === newValue);
        console.log('監聽品牌代碼變化', newValue, matched);

        // 讀取整份 重新設置 進價折數、 標準進價
        if (matched) {
          // 暫存品牌資料
          this.cachedBrand = matched;

          // 設定進價折數
          this.dataForm.get('PLU_OrderPrcRate')?.setValue(matched.PLU_OrderPrcRate);

          // 試算標準進價
          const PLU_SalePrc = this.dataForm.get('PLU_SalePrc')?.value;
          const PLU_OrderPrcRate = matched.PLU_OrderPrcRate;
          if (PLU_SalePrc && PLU_OrderPrcRate) {
            const result = Number(((PLU_SalePrc * PLU_OrderPrcRate * 0.01) / 1.05).toFixed(2));
            this.dataForm.get('PLU_OrderPrc')?.setValue(result);
          }
        } else {
          // 若品牌代碼為空 不進行操作
          this.cachedBrand = null; // 若清空品牌代碼，也清空暫存
        }
      }
    });

    // 觀察 商品名稱(PLU_Name)發生變化時自動寫入給 PLU_Lable、PLU_PrnName
    this.dataForm.get('PLU_Name')?.valueChanges.subscribe(value => {
      const currentLabel = this.dataForm.get('PLU_Lable')?.value;
      if (value && value !== currentLabel) {
        this.dataForm.get('PLU_Lable')?.setValue(value);
        this.dataForm.get('PLU_PrnName')?.setValue(value);
      }
    });

    // 觀察 廠商編號(VEN_No)發生變化時確認 是否要寫入POS2020
    this.dataForm.get('VEN_No')?.valueChanges.subscribe(value => {
      if (value) {
        // [POS2020不存在] && [廠商編號在vendorOptions] 時才將POS2004 [廠商編號]自動寫入 POS2020Data
        const exists = this.POS2020Data.some(item => item.VEN_No === value);
        const isValidVendor = this.vendorOptions.some(item => item.value === value);

        // [POS2020不存在] && [廠商編號在vendorOptions]且長度為0
        if (!exists && isValidVendor && this.POS2020Data.length == 0) {
          this.messageService.infoBubble('POS2020表單無對應的廠商編號，已自動新增一筆');

          const pluMagno = this.dataForm.get('PLU_MagNo')?.value || '';
          const plu_OrderPrc = this.dataForm.get('PLU_OrderPrc')?.value || 0;

          // 1️⃣ 先產生預設物件
          const newItem = {
            id: 0,
            PLU_MagNo: pluMagno,
            VEN_No: value,
            STO_No: this.authService.getUserInfo()?.SYS_StoreNo ?? '',
            PLU_OrderPrc: plu_OrderPrc,

            PLU_Purchase: '1',
            PLU_TransType: '1',
            PLU_TransDay: null,
            Remark: null,
            VDP_LastStockDate: null,

            status: 'new'
          };

          // 2️⃣ 實際新增進 POS2020Data
          this.POS2020Data.push(newItem);

          // 3️⃣ （可選）若你要立即觸發畫面刷新：
          this.POS2020Data = [...this.POS2020Data];
        }

        console.log('廠商編號刷新', value, '更新專櫃清單');

        // 重新查詢 自營 專櫃編號選單(queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList)
        // this.tls51070Service.queryTLTTALENT_DropDownList({ "VEN_No": value }).pipe(untilDestroyed(this)).subscribe((response) => { //廠商編號 > 專櫃編號
        this.tls51070Service.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => { //自營(全帶入)
          // this.tls51070Service.queryTLTTALENT_ByStoreWay2AndApprove2WithVenNo_DropDownList({ "VEN_No": value }).pipe(untilDestroyed(this)).subscribe((response) => { //自營(廠商編號)
          this.TLT_NO_Option = response.Data.map((item: any) => ({
            No: item.No, // 專櫃編號代碼
            Label: item.No + '-' + item.Name, // 組合成顯示用的Label
          }));

          // this.messageService.infoBubble('廠商編號變更、已重新設定專櫃編號')
          console.log('專櫃編號代碼:', response.Data);

          //重製 專櫃編號 內容
          if (this.orgdataForm) {
            // this.dataForm.get('TLT_NO')?.setValue(this.orgdataForm.get('TLT_NO').value);
          } else {
            this.dataForm.get('TLT_NO')?.setValue(null);
          }
        });
      }
    });

    // 觀察 國際條碼(PLU_No) 變化 ----20251013 新增
    // POS2004 國際條碼 同步給 POS2005 國際條碼
    this.dataForm.get('PLU_No')?.valueChanges.subscribe(value => {
      // 若 POS2005Data 尚未存在，就初始化一筆空的
      if (this.POS2005Data.length == 0) {
        this.POS2005Data = [{
          id: 1,
          PLU_MagNo: this.dataForm.get('PLU_MagNo')?.value || '',
          PLU_No: value ? value : '',
        }];

        return;
      }

      if (this.POS2005Data && this.POS2005Data.length > 0) {
        // 若有值就同步並刷新第一筆
        this.POS2005Data[0].PLU_No = value ? value : '';
      }
    });

    //依照廠商暫存重新計算[標準進價]
    this.dataForm.get('PLU_SalePrc')!.valueChanges.subscribe(() => {
      if (this.crudstatus == CRUDStatus.Create && this.cachedBrand) {
        const PLU_SalePrc = this.dataForm.get('PLU_SalePrc')?.value;
        const PLU_OrderPrcRate = this.cachedBrand.PLU_OrderPrcRate;
        if (PLU_SalePrc != null && PLU_OrderPrcRate != null) {
          const result = Number(((PLU_SalePrc * PLU_OrderPrcRate * 0.01) / 1.05).toFixed(2));
          this.dataForm.get('PLU_OrderPrc')?.setValue(result);
        }

        if (this.orgdataForm) {
          // this.dataForm.get('PLU_SalePrc')?.setValue(this.orgdataForm.get('PLU_SalePrc').value);
        }
      }
    });

    //新增模式時如果 [標準進價] 發生變動就更新 自動更新 商品採購廠商的 [目前進價]  並更新所有2020資料(後蓋前)
    //編輯模式時如果 [標準進價] 發生變動就更新 更新 商品採購廠商的 [目前進價] 模板就好
    this.dataForm.get('PLU_OrderPrc')!.valueChanges.subscribe((newOrderPrc) => {
      const pluMagno = this.dataForm.get('PLU_MagNo')?.value || ''
      // 更新 2020 模板
      this.createDefaultNew2020(pluMagno, newOrderPrc ?? 0);
      // 更新 POS2020新項目的 目前進價 (新項目的id必定是0)
      this.POS2020Data.forEach(item => {
        if (item.status === 'new') {
          item.PLU_OrderPrc = newOrderPrc ?? 0;
        }
      });
      // console.log('已更新 POS2020 新項目的 目前進價', newOrderPrc);
    });
  }

  //根據新增/編輯 環境建立表單
  initializeForm(crudstatus: CRUDStatus) {
    if (crudstatus != CRUDStatus.Create) {
      this.dataForm.get('PLU_No')?.setValidators(Validators.required);
    }
  }

  // #region onSubmit
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    //---送出前的POS2004檢核---
    const invalidSections = new Set<string>();
    // 收集有錯誤的區塊
    Object.keys(this.dataForm.controls).forEach(key => {
      const control = this.dataForm.get(key);
      if (control && control.invalid) {
        // 使用 type assertion 告訴 TS key 是索引
        const section = (fieldSectionMap as any)[key] || '其他';
        invalidSections.add(section);
      }
    });

    if (invalidSections.size > 0) {
      this.messageService.errorBubble(
        Array.from(invalidSections).join('、') + ' 出現錯誤，請重新確認'
      );
    }

    // 重要：讓頁面上的輸入框顯示錯誤紅框
    this.dataForm.markAllAsTouched();


    // POS2004 國際條碼 和 POS2005國際條碼必須對應，且POS2004要在第一筆
    // 另外可以允許兩者都是null(此情況後端會自動依照商品編號設置)

    // 檢查 POS2004 的 PLU_No 是否存在於 POS2005，且必須為第一筆
    const dataform_PLU_No = this.dataForm.get('PLU_No')?.value;
    if (dataform_PLU_No) {  // 有填寫再進行檢核（未填寫由後端自動帶入）
      // 找出 POS2005 中第一筆的 PLU_No
      const firstPOS2005_PLU_No = this.POS2005Data[0]?.PLU_No;

      // 檢查是否出現在 POS2005 中
      const existsInPOS2005 = this.POS2005Data.some(item => item.PLU_No === dataform_PLU_No);

      if (!existsInPOS2005) {
        this.messageService.errorBubble('國際條碼未包含於 多筆國際條碼 明細中');
        this.messageService.unblockUi();
        return;
      }

      // 檢查是否為第一筆
      if (firstPOS2005_PLU_No !== dataform_PLU_No) {
        this.messageService.errorBubble('國際條碼必須為 多筆國際條碼 明細的第一筆');
        this.messageService.unblockUi();
        return;
      }
    }

    // 檢查 POS2020明細檔 是否輸入
    if (this.POS2020Data.length === 0) {
      this.messageService.errorBubble('未輸入商品採購廠商，請重新輸入');
      this.messageService.unblockUi();
      return;
    }

    // 檢查 POS2004廠商編號是否存在 POS2020明細檔
    const venNo = this.dataForm.get('VEN_No')?.value;
    if (venNo) {
      const exists = this.POS2020Data.some(item => item.VEN_No === venNo);
      if (!exists) {
        this.messageService.errorBubble('主檔廠商編號 必須與 商品採購廠商 資料一致，請重新輸入');
        this.messageService.unblockUi();
        return;
      }
    }

    // 修剪掉新增預設(table表單最後的新增項)
    this.POS2005Data = this.POS2005Data.filter(v => v.PLU_No !== null);
    this.POS2020Data = this.POS2020Data.filter(v => v.VEN_No !== '');

    console.log('POS2005Data', this.POS2005Data);

    // 驗證 POS2005 明細
    // --------------------------
    for (let i = 0; i < this.POS2005Data.length; i++) {
      const row = this.POS2005Data[i];
      const result = this.validate2005Row(row);
      if (!result.isValid) {
        this.messageService.unblockUi();
        this.messageService.errorBubble(`POS2005 第 ${i + 1} 筆錯誤: ${result.errorMessage}`);
        return;
      }
    }

    // 驗證 POS2020 明細
    // --------------------------
    for (let i = 0; i < this.POS2020Data.length; i++) {
      const row = this.POS2020Data[i];
      const result = this.validate2020Row(row);
      if (!result.isValid) {
        this.messageService.unblockUi();
        this.messageService.errorBubble(`POS2020 第 ${i + 1} 筆錯誤: ${result.errorMessage}`);
        return;
      }
    }

    //--檢查--
    // 商品管理編號：鍵值，自動編號，大分類編號(2碼)+10碼流水號+1碼檢查碼，檢查碼為EAN 檢查碼計算規則，流水號給號讀SER1001商品管理編號序號檔
    // 國際條碼：必填，沒有輸入國際條碼時，國際條碼=商品管理編號 (bubble跳出提示)。
    //                輸入國際條碼時，發現該條碼在資料庫中已有存在時，系統會提示【該國際條碼已存在，貨號為ｘｘｘ】
    //                系統會不允許輸入。此時，使用者透過貨號ｘｘｘ將該商品的國際條碼改為商品管理編號或清為空白後，即可新增該國際條碼。

    // ---0620規格更新---
    // 送出國條是POS2005，不用管2004的國條
    // ---0701規格更新---
    // 圖片更新修改另外處理，並緊接在POS2005、POS2020更新後進行

    // --------
    // 標籤名稱：在輸入商品中文名稱後會自動帶入標籤名稱欄位。
    // 多筆國際條碼：寫入POS2005，商品管理編號、國際條碼兩個欄位皆要寫入，國際條碼PLU_NO是鍵值。
    //--------
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('讀取表單', frm);
            const formValue = frm.getRawValue();
            // POS2005Data 中所有的 PLU_No
            // 沒有輸入國際條碼時，國際條碼=商品管理編號 (bubble跳出提示)
            if (!formValue.PLU_No || formValue.PLU_No.trim() === '') {
              formValue.PLU_No = formValue.PLU_MagNo; // 國際條碼=商品管理編號
              this.messageService.infoBubble('沒有輸入國際條碼，國際條碼已自動設為商品管理編號');
            }

            console.log('原始POS2005Data', this.POS2005Data);
            console.log('原始POS2020Data', this.POS2020Data);

            // 新增送出request比較簡潔
            const processedPOS2020 = this.POS2020Data.map(item => {
              return {
                VEN_No: item.VEN_No,
                STO_No: item.STO_No,
                PLU_Purchase: item.PLU_Purchase,
                PLU_TransType: item.PLU_TransType,
                PLU_TransDay: item.PLU_TransDay,
                Remark: item.Remark,
                VDP_LastStockDate: item.VDP_LastStockDate
              }
            });

            // POS2005Data 中所有的 PLU_No
            const POS2005PLUs = this.POS2005Data.map(item => item.PLU_No);
            // console.log('現有的 PLU_No 陣列:', POS2005PLUs);

            let requestBody = {}

            if (POS2005PLUs.length >= 1) {
              requestBody = {
                ...formValue,
                PLU_No: POS2005PLUs,
                POS2020_INFO: processedPOS2020,     // 使用處理過的資料
              }
            } else {
              requestBody = {
                ...formValue,
                PLU_No: [''], //無輸入POS2005送出空字串
                POS2020_INFO: processedPOS2020,     // 使用處理過的資料
              }
            }

            console.log('insert', requestBody);

            this.tls51070Service.insertTLS51070(requestBody).subscribe(async (response) => {
              this.messageService.successBubble('POS2004主檔新增成功');

              const newSeqNo = response?.Data; // 回傳的 IMG_SeqNo
              console.log('新增取號:', newSeqNo);

              // 進行圖片檔更新
              await this.createImage(newSeqNo, this.dataForm.get('LOGO_No')?.value || null); // 傳入圖片
              this.onCancel();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('讀取表單', frm);
            const formValue = frm.getRawValue();

            // POS2005Data 中所有的 PLU_No
            const POS2005PLUs = this.POS2005Data.map(item => item.PLU_No);
            console.log('現有的 PLU_No 陣列:', POS2005PLUs);
            console.log('原始POS2020Data', this.POS2020Data);

            //將新的資料id指定為0
            const processedPOS2020 = this.POS2020Data.map(item => {
              if (item.status === 'new') {
                return {
                  id: 0, // 把新項目的 id 改為 0
                  VEN_No: item.VEN_No || null,
                  STO_No: item.STO_No || null,
                  PLU_OrderPrc: item.PLU_OrderPrc || null,
                  PLU_Purchase: item.PLU_Purchase || null,
                  PLU_TransType: item.PLU_TransType || null,
                  PLU_TransDay: item.PLU_TransDay || null,
                  Remark: item.Remark || null,
                  VDP_LastStockDate: item.VDP_LastStockDate || null,

                  // status: item.status
                }
              }
              return {
                id: item.id, // 維持原始id
                VEN_No: item.VEN_No || null,
                STO_No: item.STO_No || null,
                PLU_OrderPrc: item.PLU_OrderPrc || null,
                PLU_Purchase: item.PLU_Purchase || null,
                PLU_TransType: item.PLU_TransType || null,
                PLU_TransDay: item.PLU_TransDay || null,
                Remark: item.Remark || null,
                VDP_LastStockDate: item.VDP_LastStockDate || null,

                // status: item.status
              }
            });

            const requestBody = {
              ...formValue,
              PLU_No: POS2005PLUs,
              "POS2020_INFO": processedPOS2020,
            };

            console.log('update', JSON.stringify(requestBody, null, 2));

            this.tls51070Service.updateTLS51070(requestBody).subscribe({
              next: async () => {
                // 用 this.img1001Data 裡的 IMG_SeqNo 呼叫 createImage
                const seqNo = this.dataForm.get('PLU_MagNo')?.value; //圖片編號抓商品管理碼
                if (!seqNo) {
                  console.log('IMGData', this.img1001Data);
                  console.warn('⚠️ 商品管理碼(PLU_MagNo)為空，無法更新圖片');
                  return;
                }
                await this.createImage(seqNo, this.dataForm.get('LOGO_No')?.value || null);
                await this.deleteImages();

                this.onCancel(); // 儲存後，會返回列表
              }
            });
          }
          break;
      }
    });

    this.messageService.unblockUi();
    this.submitted = false;
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  // #region dopropdown
  loadOptions() {
    //查詢 商品單位
    this.tls51070Service
      .queryPLUUNIT_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
        this.unitOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('商品單位:', this.unitOptions);
      });

    // 品牌代碼與折扣別
    this.tls51060Service.queryPLULOGO_OrderPrcRate_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.pluLogoOption = response.Data.map((item: any) => ({
        No: item.No, // 品牌代碼
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
        PLU_OrderPrcRate: item.PLU_OrderPrcRate, // 折扣別
      }));
      // console.log('品牌詳細代碼:', this.pluLogoOption);
    });

    // 查詢 專櫃編號 _1的情況重新篩選 _當response(有選到 廠商代碼 就刷新)
    this.tls51070Service.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.TLT_NO_Option = response.Data.map((item: any) => ({
        No: item.No, // 專櫃編號代碼
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      // console.log('專櫃編號代碼:', response.Data);
    });

    // 查詢 廠商代碼 (不確定怎麼帶 VEN_Flag) -- 20251013 更新(request 用專櫃編號 篩選，不要直接下拉) _當request
    this.tls51070Service
      .queryPOS2013_DropDownList({ "VEN_Flag": '1' }).pipe(untilDestroyed(this)).subscribe((response) => {
        this.vendorOptions = response.Data.map((item: any) => ({
          value: item.VEN_No,
          label: item.VEN_No + '-' + item.Name,
        }));

        // console.log('廠商代碼:', response.Data);

        // 等廠商編號好了再寫入POS2020欄位(廠商下拉)
        this.POS2020DataColumn = [
          // { field: 'PLU_MagNo', header: '商品管理編號', editable: false, type: 'text' },  //key1
          { field: 'VEN_No', header: '廠商編號', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'value', options: this.vendorOptions },

          { field: 'PLU_TransType', header: '運輸方式', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'value', options: this.transTypeOption },  // １＝自行送貨２＝貨運  ３＝快遞  ４＝其它。
          { field: 'PLU_TransDay', header: '送貨天數', type: 'inputNumber', width: '12rem', format: formatAmount },
          { field: 'PLU_Purchase', header: '採購狀態', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'value', options: this.purchaseTypeOption },  // １＝自行送貨２＝貨運  ３＝快遞  ４＝其它。
          { field: 'PLU_OrderPrc', header: '目前進價', width: '12rem', format: formatAmount }, // readonly: 目前進價 > 顯示 最後進價
          //readonly，商品新增時，最後進價=POS2004的標準進價PLU_OrderPrc，之後進價異動透過進價/售價變價作業(關帳作業、啟動變價時更新)

          { field: 'VDP_LastStockDate', header: '最後進貨日期', width: '12rem' }, //  readonly，商品新增時，不給值，進貨作業驗收更新
          { field: 'Remark', header: '備註', type: 'input', width: '12rem' },
        ];
      });

    //查詢 大分類
    this.tls51070Service.queryCAT_LNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.largeOption = response.Data.map((item: apiOption) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
      }));

      // console.log('大分類:', this.largeOption);
    });
  }

  //讀取 中、小 分類整份表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      // 新增模式(卡控)
      if (this.crudstatus == CRUDStatus.Create) {
        // 禁用中分類、小分類
        this.dataForm.get('CAT_MNo')?.disable();
        this.dataForm.get('CAT_SNo')?.disable();
      }

      //有大分類接續查詢 中分類、小分類
      if (this.dataForm.get('CAT_LNo')?.value) {
        //查詢 中分類
        this.tls51070Service
          .queryCAT_MNo_DropDownList({ CAT_LNo: [this.dataForm.get('CAT_LNo')?.value || ''] })
          .subscribe((response) => {
            this.middleOption = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
          });

        //查詢 小分類
        //新版api改成list傳送
        const requestPayload = {
          CATList: [
            {
              CAT_LNo: this.dataForm.get('CAT_LNo')?.value,
              CAT_MNo: this.dataForm.get('CAT_MNo')?.value
            }
          ]
        };

        this.tls51070Service
          .queryCAT_SNo_DropDownList(requestPayload)
          .subscribe((response) => {
            this.smallOption = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
          });
      }
    }
  }

  // #region 讀取明細檔案
  async loadDetail(pLU_MagNo: string, pLU_OrderPrc: number): Promise<void> {
    // console.log('接收pLU_MagNo'+ pLU_MagNo+ '接收pLU_OrderPrc' +pLU_OrderPrc)
    if (pLU_MagNo == '') {
      console.log('讀取pLU_MagNo', this.dataForm.value)
      if (this.crudstatus !== CRUDStatus.Create) {
        this.messageService.infoBubble('商品管理碼為空，不載入明細檔'); //編輯、查看模式如果沒有明細檔就跳出提示
      }
    } else {
      this.tls51070Service.queryTLS51070_Detail({ 'PLU_MagNo': pLU_MagNo }).pipe(untilDestroyed(this)).subscribe(async (response) => {
        this.pos2005Detail = response.Data[0].POS2005Detail;
        this.pos2020Detail = response.Data[0].POS2020Detail;
        const rawImages = response.Data[0].IMG1001Detail;

        // 圖片讀取時進行轉檔 將IMG1001Detail的IMG_File內容變更為_以後的內容
        const downloadPromises = rawImages.map(async (item: any) => {
          const path = item.IMG_Path.replace('~', '');
          const url = `${environment.ApiUrl}/${path}/${item.IMG_File}`.replace(/\/{2,}/g, '/');
          return {
            ...item,
            IMG_Path: url
          };
        });

        this.img1001Detail = await Promise.all(downloadPromises);

        this.POS2005Data = this.pos2005Detail;
        this.POS2020Data = this.pos2020Detail.map(item => ({
          id: item.id,
          PLU_MagNo: item.PLU_MagNo,
          PLU_OrderPrc: item.PLU_OrderPrc,

          VEN_No: item.VEN_No,
          STO_No: item.STO_No,
          PLU_Purchase: item.PLU_Purchase,
          PLU_TransType: item.PLU_TransType,
          PLU_TransDay: item.PLU_TransDay,
          Remark: item.Remark,
          VDP_LastStockDate: item.VDP_LastStockDate,
          status: 'old'
        }));
        this.img1001Data = [...this.img1001Detail];

        //建立項目模板
        this.createDefaultNew2020(pLU_MagNo, pLU_OrderPrc);

        console.log('明細 POS2005Data', this.POS2005Data);
        console.log('明細 POS2020Data', this.POS2020Data);
        console.log('明細 img1001Data', this.img1001Data);

        this.orgPOS2005Data = this.POS2005Data;
        this.orgPOS2020Data = this.POS2020Data;
        this.orgImg1001Data = [...this.img1001Data];
      });
    }
  }

  // #region 重製明細檔
  reset51070() {
    // 將明細檔重新刷新
    if (this.crudstatus == CRUDStatus.Create) {
      this.isRefreshing = true
      this.POS2005Data = [];
      this.POS2020Data = [];
      this.img1001Data = [];
      this.isRefreshing = false
    } else if (this.crudstatus == CRUDStatus.Edit) {
      if (this.orgdataForm) {
        this.isRefreshing = true;

        const magno = this.dataForm.get('PLU_MagNo')?.value;
        const orderPrc = this.dataForm.get('PLU_OrderPrc')?.value;

        this.loadDetail(magno || '', orderPrc ?? 0)
          .then(() => {
            console.log('編輯模式重製完成', this.dataForm.value);
            // 完成後重新讀取選項
            this.loadCATOptions();
            this.isRefreshing = false;
          })
          .catch(() => {
            this.isRefreshing = false;
          });

        // 重製明細檔
        this.POS2005Data = this.orgPOS2005Data;
        this.POS2020Data = this.orgPOS2020Data;
        this.img1001Data = this.orgImg1001Data;
      }
    } else {
      console.log('查看模式無須重製');
    }
  }

  //切換顯示Button
  switchButton(buttonNum: number) {
    this.buttonID = buttonNum;
  }

  // ---明細檔操作---

  // #region POS2005
  validate2005Row = (rowData: POS2005Detail): { isValid: boolean; errorMessage: string } => {
    const newPLUNo = rowData?.PLU_No?.trim();
    const currentId = rowData?.id;

    // 1. 檢查國際條碼是否為空
    if (!newPLUNo) {
      return { isValid: false, errorMessage: '國際條碼不可為空，請輸入有效的國際條碼。' };
    }

    // 2️ 檢查重複（包含新增中未有 id 的情況）
    const isDuplicate = this.POS2005Data.some((item, index, array) => {
      if (!item.PLU_No) return false;

      // 同筆資料不用比對（編輯情況）
      if (item.id && currentId && item.id === currentId) return false;

      // 若 id 都沒值（新增中），要用索引判斷是不是自己
      if (!item.id && !currentId) {
        const currentIndex = array.indexOf(rowData);
        return item.PLU_No === newPLUNo && array.indexOf(item) !== currentIndex;
      }

      // 其他一般情況
      return item.PLU_No === newPLUNo && item.id !== currentId;
    });

    if (isDuplicate) {
      return {
        isValid: false,
        errorMessage: `國際條碼 ${newPLUNo} 已存在，請使用其他條碼。`,
      };
    }

    return { isValid: true, errorMessage: '' };
  };
  // #region POS2020
  validate2020Row = (rowData: POS2020Detail): { isValid: boolean; errorMessage: string } => {
    const venNo = rowData?.VEN_No?.trim();
    const currentId = rowData?.id;

    //  檢查廠商編號是否為空
    if (!venNo) {
      return { isValid: false, errorMessage: '廠商編號不可為空，請輸入有效的廠商編號。' };
    }

    // 檢查重複（包含新增中未有 id 的情況）
    const isDuplicate = this.POS2020Data.some((item, _index, array) => {
      if (!item.VEN_No) return false;

      // 編輯同筆資料不用比對
      if (item.id && currentId && item.id === currentId) return false;

      // 新增中沒有 id，用索引判斷是不是自己
      if (!item.id && !currentId) {
        const currentIndex = array.indexOf(rowData);
        return item.VEN_No === venNo && array.indexOf(item) !== currentIndex;
      }

      // 其他一般情況
      return item.VEN_No === venNo && item.id !== currentId;
    });

    if (isDuplicate) {
      return {
        isValid: false,
        errorMessage: `廠商編號 ${venNo} 已存在，請使用其他編號。`,
      };
    }

    return { isValid: true, errorMessage: '' };
  };

  // #region 圖片更新
  async createImage(IMG_SeqNo: string, selected_Logo?: string | null) {
    // console.log('本地變更資料', this.files);

    if (!IMG_SeqNo) {
      console.warn('⚠️ 缺少圖片編號 IMG_SeqNo，無法上傳');
      return;
    }

    if (!this.files || this.files.length === 0) {
      console.info('⚠️ 沒有選擇要上傳的圖片');
      return;
    }

    if (!selected_Logo) {
      console.warn('⚠️ 缺少 LOGO_No，無法上傳圖片');
      return;
    }

    const formData = new FormData();

    // 取得必填欄位
    formData.append('IMG_Type', 'POS2004');
    formData.append('IMG_SeqNo', IMG_SeqNo);
    formData.append('IMG_Remark', '51070img');  // 備註先下空test
    formData.append('LOGO_No', selected_Logo);  // 20251218 規格新增，本作業 圖片匯入需要 品牌代號(必填)

    // 加入所有檔案（以 uuid 命名）
    // this.files.forEach(file => {
    //   const extension = file.name.split('.').pop(); // 保留副檔名
    //   const uuidFileName = `${uuidv4()}.${extension}`;
    //   formData.append('Files', file, uuidFileName);
    // });

    // --- 修改命名邏輯開始 ---
    // 取得目前現有的圖片數量作為起始 index
    const currentLength = this.img1001Detail ? this.img1001Detail.length : 0;
    const PLU_No = this.dataForm.get('PLU_No')?.value || '未知國條';

    // 加入所有檔案（改為 PLU_MagNo-序號 命名）
    this.files.forEach((file, index) => {
      const extension = file.name.split('.').pop(); // 保留副檔名

      // 計算新的編號：現有長度 + (目前 index + 1)
      const newIndex = currentLength + index + 1;
      const customFileName = `${PLU_No}-${newIndex}.${extension}`;

      formData.append('Files', file, customFileName);
    });
    // --- 修改命名邏輯結束 ---

    // 👉 檢查內容（只能用 FormData.entries() 迴圈看）
    console.log('📤 寄出的 FormData：');
    for (const [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        console.log(`🔹 ${key}: ${value.name} (${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`🔸 ${key}: ${value}`);
      }
    }

    try {
      await firstValueFrom(this.tls51070Service.uploadImages(formData));
      this.messageService.successBubble('圖片上傳成功');
    } catch (error) {
      console.error('❌ 圖片上傳失敗:', error);
      this.messageService.errorBubble('圖片上傳失敗');
    }
  }

  private async deleteImages() {
    if (!this.confirmDeleteImages || this.confirmDeleteImages.length === 0) {
      console.info('⚠️ 無需刪除圖片');
      return;
    }

    const tasks: Promise<any>[] = [];

    // ✅ 從目前 img1001Data 中，找出任一筆作為參考值（前提是該批圖片屬性都相同）
    console.log('img1001Detail目標', this.img1001Detail);
    console.log('img1001Data目標', this.img1001Data);
    const reference =
      this.img1001Data.find(img => img.IMG_Type && img.IMG_SeqNo) ||
      this.img1001Detail.find(img => img.IMG_Type && img.IMG_SeqNo);

    if (!reference) {
      console.warn('⚠️ 找不到任何參考圖片資料，無法補齊 request 參數');
      console.log('刪除目標', this.confirmDeleteImages);
      return;
    }

    const { IMG_SeqNo } = reference;

    for (const fileName of this.confirmDeleteImages) {
      const request = {
        'IMG_Type': 'POS2004',
        "IMG_SeqNo": IMG_SeqNo,
        "IMG_File": fileName,
      };

      console.log('📤 刪除圖片內容:', request);
      tasks.push(firstValueFrom(this.tls51070Service.deleteImage(request)));
    }

    try {
      const results = await Promise.allSettled(tasks);

      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          console.log(`✅ 圖片刪除 ${i + 1} 成功`);
        } else {
          console.error(`❌ 圖片刪除 ${i + 1} 失敗:`, res.reason);
        }
      });

      this.messageService.successBubble(`成功刪除 ${tasks.length} 張圖片`);
    } catch (err) {
      console.error('❌ 刪除圖片過程中發生錯誤:', err);
      this.messageService.errorBubble('圖片刪除失敗');
    }
  }
}
