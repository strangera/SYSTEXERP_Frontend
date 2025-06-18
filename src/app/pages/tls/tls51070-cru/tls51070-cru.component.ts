import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { PluLogo, POS2004 } from '../../../shared/models/tls/tls000.model';
import { Tls51070Service } from '../../../service/API/tls/tls51070.service';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Tls51060Service } from '../../../service/API/tls/tls51060.service';
import { environment } from '../../../../environments/environment';

export interface POS2005Detail {
  "id": number,
  "PLU_MagNo": string,
  "PLU_No": string
  "CRT_Date": Date,
  "CRT_USR_No": string,
  "CRT_USR_Name": string,
  "UPD_Date": Date,
  "UPD_USR_No": string,
  "UPD_USR_Name": string,
}

export interface POS2020Detail {
  "id": number,
  "PLU_MagNo": string,
  "VEN_No": string,
  "STO_No": string,
  "PLU_OrderPrc": number,
  "PLU_Purchase": string,
  "PLU_TransType": string,
  "PLU_TransDay": number,
  "Remark": string,
  "VDP_LastStockDate": string, //型別Date 先用 string 因為新增不能編輯
  "CRT_Date"?: Date,
  "CRT_USR_No"?: string,
  "CRT_USR_Name"?: string,
  "UPD_Date"?: Date,
  "UPD_USR_No"?: string,
  "UPD_USR_Name"?: string,
}

export interface IMG1001Detail {
  "id": number,
  "IMG_Type": string,
  "IMG_SeqNo": string,
  "IMG_Path": string,
  "IMG_File": string,
  "IMG_Remark": string
  "CRT_Date": Date,
  "CRT_USR_No": string,
  "CRT_USR_Name": string,
  "UPD_Date": Date,
  "UPD_USR_No": string,
  "UPD_USR_Name": string,
}

export interface IMG1001 {
  ID: number;             // 圖檔ID
  IMG_Type: string;       // 圖檔類別 - 'POS2004'
  IMG_SeqNo: string;      // 圖檔序號 - POS2004.PLU_MagNo
  IMG_Path: string;       // 圖檔路徑
  IMG_File: string;       // 圖檔檔名 - YYMMDDHHNNSSZZZ_檔案名稱
  IMG_Remark?: string;    // 備註
  base64String?: string; // 圖檔base64
  CRT_Date?: string;      // 建立日期
  CRT_USR_No?: string;    // 建立人員
  CRT_USR_Name?: string;  // 建立人員姓名
  UPD_Date?: string;      // 變更日期
  UPD_USR_No?: string;    // 變更人員
  UPD_USR_Name?: string;  // 變更人員姓名
}

// 2.5.1.7  商品基本資料 CRU
@Component({
  selector: 'app-tls51070-cru',
  templateUrl: './tls51070-cru.component.html',
  styleUrl: './tls51070-cru.component.scss'
})
export class TLS51070CRUComponent extends BasicCruPageComponent<POS2004> implements OnInit {
  // 在父組件中聲明
  @ViewChild(ExpandableEditTableComponent) expandableTable!: ExpandableEditTableComponent;

  //目前標籤列
  buttonID = 1; //預設在 基本資料標籤
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // POS2004 商品主檔
    // 基本資料 顯示畫面
    PLU_MagNo: ['', [Validators.required, Validators.maxLength(20)]], // 商品管理編號
    PLU_Name: ['', [Validators.required, Validators.maxLength(60)]], // 商品中文名稱

    PLU_EngName: ['', [Validators.maxLength(100)]], // 商品英文名稱
    PLU_OrgPLUNo: ['', [Validators.maxLength(30)]], // 廠商貨號 --廠商自編碼 廠商貨號 
    PLU_No: ['', [Validators.maxLength(20)]], // 國際條碼 可選擇帶入PLU_MagNo，新增模式以外加上 必填
    PLU_MinOrder: [1, [Validators.maxLength(8)]], // 最小訂購量 ---預設1，採購時，輸入的採購量必需為最小訂購量的倍數。
    PLU_Lable: ['', [Validators.maxLength(50)]], // 標籤名稱

    CAT_LNo: ['', [Validators.required, Validators.maxLength(6)]], // 大分類代碼 POS2003
    CAT_MNo: ['', [Validators.required, Validators.maxLength(6)]], // 中分類代碼 POS20031
    CAT_SNo: ['', [Validators.required, Validators.maxLength(6)]], // 小分類代碼 POS20032
    PLU_Reserve1: ['', [Validators.maxLength(400)]], // 說明

    // 商品規格 顯示畫面
    PLU_Attribute: ['1', [Validators.required, Validators.maxLength(1)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_StockTaxType: ['1', [Validators.required, Validators.maxLength(1)]], // 進價稅別 0免稅,1應稅， 預設 1應稅
    PLU_Unit: ['', [Validators.required, Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔

    PLU_TaxType: ['1', [Validators.required, Validators.maxLength(1)]], // 售價稅別:0免稅,1應稅 預設 1應稅
    PLU_BoxQty: [0, [Validators.maxLength(4)]], // 包裝入數(裝箱入數) / --南紡 包裝入數
    PLU_Length: [0, [Validators.maxLength(10)]], //長度cm
    PLU_Weight: [0, [Validators.maxLength(10)]], //重量(g)
    PLU_Height: [0, [Validators.maxLength(10)]], //高度(cm)
    PLU_Volume: [0, [Validators.maxLength(10)]], //容量(ml)
    PLU_Width: [0, [Validators.maxLength(10)]], //寬度(cm)


    // 商品規格(二) 顯示畫面
    PLU_Reserve2: ['', [Validators.maxLength(400)]], // 規格說明
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列

    // 商品資訊 顯示畫面
    LOGO_No: ['', [Validators.maxLength(4)]], // 品牌代碼 ---PLULOGO
    PLU_SalePrc: [0, [Validators.required, Validators.maxLength(10)]], // 商品售價
    stock: [0, [Validators.maxLength(10)]], // 庫存量 讀POS2099 新增固定0 ---未確認---
    PLU_OrderPrc: [0, [Validators.required, Validators.maxLength(10)]], // 標準進價 商品售價＊進貨折數/1.05 ，計算到小數點以下2位，必填 (不可編輯 新增遵循此規則)
    PLU_SafeQty: [0, [Validators.maxLength(10)]], // 安全存量

    //---
    // 系統日期-建檔日期 > 365天, 去年整年度銷售量/12個月*2個月 🡪取整數

    //                    系統日期-建檔日期 < 365天，自建檔日起至今的銷售量/計算月數*2個月
    //                    計算月數=(系統日期-建檔日期) / 30天 🡪不取整數，依小數計算
    //                    例:建檔日起至今的銷售量 10個，(系統日期-建檔日期) 15天/30天=0.5(計算月數)
    //                    安全庫存量= 10(銷售量) / 0.5(計算月數) * 2個月= 40

    //---
    PLU_OrderPrcRate: [0, [Validators.required, Validators.maxLength(10)]], // 進價折數 預設0 (依照品牌 PLULOGO)
    PLU_ECStatus: ['0', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Status: [0, [Validators.required, Validators.maxLength(1)]], // 商品狀態:0一般 不顯示

    //---必填未列入(都是預設不可編輯)---
    PLU_OpenPrc: ['Y', [Validators.required, Validators.maxLength(1)]], // 開放售價Y/N
    PLU_Type: ['1', [Validators.required, Validators.maxLength(1)]], // 商品類別 1一般商品,2生鮮商品,6組合商品,8專櫃,B禮券,F:折讓

    // PLU_PrnName: ['', [Validators.maxLength(40)]], // 列印名稱
    // VEN_No: ['', [Validators.maxLength(16)]], // 廠商編號
    // PLU_Spec: ['', [Validators.maxLength(30)]], // 規格
    // PLU_FixPrc: [null, [Validators.maxLength(10)]], // 定價
    // PLU_MemPrc: [null, [Validators.maxLength(10)]], // 會員價
    // PLU_BatPrc: [null, [Validators.maxLength(10)]], // 批發
    // PLU_Cost: [null, [Validators.maxLength(12)]], // 成本
    // PLU_LocNo: [null, [Validators.maxLength(4)]], // 棚割序號
    // PLU_LastStockDate: [null], // 最後進貨日期
    // PLU_Reserve4: ['', [Validators.maxLength(400)]], // 保留
    // PLU_Reserve5: ['', [Validators.maxLength(400)]], // 保留
    // PLU_StopSale: ['N', [Validators.maxLength(1)]], // 停止銷售註記(Y/N)
    // PLU_CalcSaleStock: ['N', [Validators.maxLength(1)]], // 計算庫存方式(N:依數量 Y:依金額)
    // PLU_Disc: ['Y', [Validators.maxLength(1)]], // 是否可折扣(Y/N)
    // PLU_OpenOrderPrc: ['1', [Validators.maxLength(1)]], // 開放進價(Y/N)
    // PLU_LastSaleDate: [null], // 最後銷售日期
    // PLU_LastUpdSalePrc: [null], // 最後銷售日期
    // PLU_LastUpdOrderPrc: [null], // 最後修改進價日期
    //------------

  });
  // 基本資料dropdown
  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  pluLogoOption: PluLogo[] = [];  // 品牌代碼
  unitOptions: apiOption[] = [];  //商品單位
  statusOptions: option[] = [  //商品狀態
    { value: '1', label: '正常' },
    { value: '2', label: '停用' },
    { value: '3', label: '停進' },
    { value: '4', label: '下架' },
  ];
  counterOptions: apiOption[] = []; //專櫃編號：資料讀 TLTTALENT 
  vendorOptions: option[] = [
    { value: '1', label: 'test' }
  ];  //廠商編號: 資料讀 POS2013 

  // ---商品規格dropdown---
  attributeOptions: option[] = [ // 商品型態
    { value: '1', label: '一般' },
    { value: '2', label: '進口' },
    { value: '3', label: '買斷' },
    { value: '4', label: '試銷' },
    { value: '5', label: '寄賣' },
  ];
  taxTypeOptions: option[] = [ // 稅別
    { value: '0', label: '免稅' },
    { value: '1', label: '應稅' },
  ];

  // ---POS2020 dropdown區---
  transTypeOption: option[] = [  //運輸方式
    { value: '1', label: '自行送貨' },
    { value: '2', label: '貨運' },
    { value: '3', label: '快遞' },
    { value: '4', label: '其它' },
  ];

  purchaseTypeOption: option[] = [  // 採購狀態
    { value: '1', label: '正常採購' }, // 預設
    { value: '2', label: '停止採購' },
  ];
  // ---POS2020 -------------
  pos2005Detail: POS2005Detail[] = [];
  pos2020Detail: POS2020Detail[] = [];
  img1001Detail: IMG1001Detail[] = [];
  // ---------國際條碼 (POS2005) 編輯表格 至少要一筆-------------------------------------------------------
  // 國際條碼編號	下拉
  POS2005Data: POS2005Detail[] = [];
  // POS2005 展開式表格的欄位定義
  POS2005DataColumn: ColumnDef[] = [
    // { field: 'PLU_MagNo', header: '商品管理編號', editable: false, type: 'text' },  //key1
    { field: 'PLU_No', header: '國際條碼', editable: false, type: 'dropdown' }, //key2
  ];
  // 展開式表格的載入狀態
  expand2005Loading = false;
  // ---------採購廠商 (POS2020) 編輯表格 至少要一筆-------------------------------------------------------
  // 廠商編號	下拉
  POS2020Data: POS2020Detail[] = [];
  // 預設新項目模板
  defaultNew2020 = {
    PLU_MagNo: this.dataForm.get('PLU_MagNo')?.value || '',
    VEN_No: '',
    STO_No: '',
    PLU_OrderPrc: 0,

    PLU_Purchase: '1',
    PLU_TransType: '1',
    PLU_TransDay: 0,
    Remark: '',
    VDP_LastStockDate: '',
  };

  // POS2020 展開式表格的欄位定義
  POS2020DataColumn: ColumnDef[] = [];
  // 展開式表格的載入狀態
  expand2020Loading = false;

  // 預設 POS2020 新項目模板
  createDefaultNew2020(pLU_MagNo: string) {
    this.defaultNew2020 = {
      PLU_MagNo: pLU_MagNo,
      VEN_No: '',
      STO_No: '',
      PLU_OrderPrc: 0,

      PLU_Purchase: '',
      PLU_TransType: '',
      PLU_TransDay: 0,
      Remark: '',
      VDP_LastStockDate: '',
    };
  }

  // ------圖檔設定主檔 (IMG1001) 編輯表格----------------------------
  files: File[] = [];        // 上傳的檔案
  img1001Data: IMG1001Detail[] = []; // 圖片List editable, readable
  confirmDeleteImages: string[] = []; // 確定刪除的圖片
  // ----------------------------------------------------------------

  // isRowSelectable(rowData: POS2020Detail): boolean {
  //   // return rowData.isdelete;
  // }
  // ----------------------------------------------------------------

  constructor(
    private tls51060Service: Tls51060Service, // 查詢 品牌下拉
    private tls51070Service: Tls51070Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51070', this.dataForm);

    console.log('大大大表單', this.dataForm.value);

    // 進價類的都不可編輯
    if (this.crudstatus == CRUDStatus.Create) {
      this.dataForm.get('PLU_SalePrc')?.enable();  // 售價 (只有新增可編輯)
    } else {
      this.dataForm.get('PLU_SalePrc')?.disable();
    }
    this.dataForm.get('PLU_SafeQty')?.disable();  // 安全存量
    this.dataForm.get('PLU_OrderPrc')?.disable();  // 標準進價
    this.dataForm.get('PLU_OrderPrc')?.disable();  // 標準進價
    this.dataForm.get('PLU_OrderPrcRate')?.disable();  // 進價折數

    //國際條碼 新增可空白、其他狀況必填
    if (this.crudstatus !== CRUDStatus.Create) {
      this.dataForm.get('PLU_No')?.setValidators(Validators.required);
    } else {
      console.log('新增模式，國條可非必填');
      this.dataForm.get('stock')?.disable();  //新增模式 庫存只能是0 且不可編輯
    }

    //導入下拉清單
    this.loadOptions();

    //初始導入所有大分類、中分類、小分類表單
    this.loadCATOptions();

    if (this.crudstatus == CRUDStatus.Edit) {
      //查詢明細檔案 (編輯模式)
      this.loadDetail(this.dataForm.get('PLU_MagNo')?.value || '');
    }

    // 監聽 大分類 是否為''
    this.dataForm.get('CAT_LNo')!.valueChanges.subscribe((newValue) => {
      // console.log('大分類變更為:', newValue);
      if (!newValue) {
        // 讀取整份 大分類、中分類、小分類 dropDown
        this.loadCATOptions();
      } else {
        // 若大分類為空 禁用中分類、小分類
        this.dataForm.get('CAT_MNo')?.enable();
        this.dataForm.get('CAT_SNo')?.enable();
      }
    });

    //觀察表單 中分類變化
    this.dataForm.get('CAT_LNo')?.valueChanges.subscribe((lno) => {
      if (lno) {
        console.log('觀察中分類變化', lno);
        this.tls51070Service
          .queryCAT_MNo_DropDownList({ CAT_LNo: [lno] })
          .subscribe((res) => {
            this.middleOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
            this.dataForm.get('CAT_MNo')?.setValue('');
            this.dataForm.get('CAT_SNo')?.setValue('');
            this.smallOption = [];
          });
      } else {
        this.middleOption = [];
        this.smallOption = [];
        this.dataForm.get('CAT_MNo')?.setValue('');
        this.dataForm.get('CAT_SNo')?.setValue('');
      }
    });
    //觀察表單 小分類變化
    this.dataForm.get('CAT_MNo')?.valueChanges.subscribe((mno) => {
      const lno = this.dataForm.get('CAT_LNo')?.value;
      if (lno && mno) {
        this.tls51070Service
          .queryCAT_SNo_DropDownList({ CAT_LNo: [lno], CAT_MNo: [mno] })
          .subscribe((res) => {
            this.smallOption = res.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
            this.dataForm.get('CAT_SNo')?.setValue('');
          });
      } else {
        this.smallOption = [];
        this.dataForm.get('CAT_SNo')?.setValue('');
      }
    });

    // 監聽 品牌編號 是否為變更(更新 進價折數、 標準進價)
    this.dataForm.get('LOGO_No')!.valueChanges.subscribe((newValue) => {

      if (newValue) {
        // 找到符合的品牌資料
        const matched = this.pluLogoOption.find(item => item.LOGO_No === newValue);

        // 讀取整份 重新設置 進價折數、 標準進價
        if (matched) {
          this.dataForm.get('PLU_OrderPrcRate')?.setValue(matched.PLU_OrderPrcRate);

          const PLU_SalePrc = this.dataForm.get('PLU_SalePrc')?.value;
          const PLU_OrderPrcRate = this.dataForm.get('PLU_OrderPrcRate')?.value;
          if (PLU_SalePrc && PLU_OrderPrcRate) {
            this.dataForm.get('PLU_OrderPrc')?.setValue(PLU_SalePrc * PLU_OrderPrcRate * 0.01 / 1.05);
          }
        }
      } else {
        // 若品牌編號為空 不進行操作
      }
    });
  }

  //根據新增/編輯 環境建立表單
  initializeForm(crudstatus: CRUDStatus) {
    if (crudstatus != CRUDStatus.Create) {
      this.dataForm.get('PLU_No')?.setValidators(Validators.required);
    }
  }


  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //--檢查--
    // 商品管理編號：鍵值，自動編號，大分類編號(2碼)+10碼流水號+1碼檢查碼，檢查碼為EAN 檢查碼計算規則，流水號給號讀SER1001商品管理編號序號檔
    // 國際條碼：必填，沒有輸入國際條碼時，國際條碼=商品管理編號 (bubble跳出提示)。
    //                輸入國際條碼時，發現該條碼在資料庫中已有存在時，系統會提示【該國際條碼已存在，貨號為ｘｘｘ】
    //                系統會不允許輸入。此時，使用者透過貨號ｘｘｘ將該商品的國際條碼改為商品管理編號或清為空白後，即可新增該國際條碼。

    // ---怪---
    // 目前後端更新邏輯 國條 是2004抓2005的第一筆
    // 然後複製2004複製管理馬給國條 > 要怎麼改動2005 (改動後就不是第一筆了)

    // --------
    // 標籤名稱：在輸入商品中文名稱後會自動帶入標籤名稱欄位。
    // 多筆國際條碼：寫入POS2005，商品管理編號、國際條碼兩個欄位皆要寫入，國際條碼PLU_NO是鍵值。
    //--------
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          const requestBody = {
            ...frm.value,
            "IMG1001_INFO": this.img1001Data,
            // "POS2005_INFO": [this.POS2005Data],
            "POS2020_INFO": this.POS2020Data,
          }
          console.log('insert', requestBody);
          this.tls51070Service.insertTLS51070(requestBody).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          const requestBody = {
            ...frm.value,
            "IMG1001_INFO": this.img1001Data,
            // "POS2005_INFO": [this.POS2005Data],
            "POS2020_INFO": this.POS2020Data,
          }
          console.log('update', requestBody);

          this.tls51070Service.updateTLS51070(requestBody).subscribe(() => {
            this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  //複製商品管理編號(pluMagno) 到 國際條碼(pluNo)
  //新增時可選擇pluNo與pluMagno相同，此情況pluNo可為''
  setNoToMagNo() {
    const pluMagNo = this.dataForm.get('PLU_MagNo')?.value || '';
    if (pluMagNo !== '') {
      this.dataForm.get('PLU_No')?.setValue(pluMagNo);
      console.log('國際條碼已複製', pluMagNo);
    }
  }

  // 讀取dopropdown選項
  loadOptions() {
    //查詢 商品單位
    this.tls51070Service
      .queryPLUUNIT_DropDownList({})
      .subscribe((response) => {
        this.unitOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('商品單位:', this.unitOptions);
      });

    // 查詢 所有 品牌代碼
    const pluLogoQuery = {
      "PageSize": 1000,
      "PageIndex": 1,
      "Offset": 0,
      "LOGO_No": "",
      "LOGO_CH_NAME": "",
      "LOGO_EN_NAME": "",
      "LOGO_Remark": "",
      "HOS_No": [""],
    }
    this.tls51060Service.queryTLS51060(pluLogoQuery)
      .subscribe((response) => {
        this.pluLogoOption = response.Data.map((item: { LOGO_No: any; LOGO_CH_NAME: any; }) => ({
          ...item,
          Label: `${item.LOGO_No}-${item.LOGO_CH_NAME}`
        }));;

        console.log('品牌詳細代碼:', this.pluLogoOption);
      });

    // 查詢 廠商代碼 (不確定怎麼帶 VEN_Flag)
    this.tls51070Service
      .queryPOS2013_DropDownList({ "VEN_Flag": '1' })
      .subscribe((response) => {
        this.vendorOptions = response.Data.map((item: apiOption) => ({
          value: item.No,
          label: item.No + '-' + item.Name,
        }));

        console.log('廠商代碼:', this.vendorOptions);

        // 等廠商編號好了再寫入POS2020欄位(廠商下拉)
        this.POS2020DataColumn = [
          // { field: 'PLU_MagNo', header: '商品管理編號', editable: false, type: 'text' },  //key1
          { field: 'VEN_No', header: '廠商編號', editable: true, type: 'dropdown', options: this.vendorOptions }, //key2
          // { field: 'STO_No', header: '分店編號', editable: true, type: 'text' },

          { field: 'PLU_TransType', header: '運輸方式', editable: true, type: 'dropdown', options: this.transTypeOption }, // １＝自行送貨２＝貨運  ３＝快遞  ４＝其它。
          { field: 'PLU_TransDay', header: '送貨天數', editable: true, type: 'number' },
          { field: 'PLU_Purchase', header: '採購狀態', editable: true, type: 'dropdown', options: this.purchaseTypeOption }, // １＝正常採購（預設） ２＝停止採購
          { field: 'PLU_OrderPrc', header: '最後進價', editable: false, type: 'number' }, //目前進價 > 顯示 最後進價
          //readonly，商品新增時，最後進價=POS2004的標準進價PLU_OrderPrc，之後進價異動透過進價/售價變價作業(關帳作業、啟動變價時更新)

          { field: 'VDP_LastStockDate', header: '最後進貨日期', editable: false, type: 'date' }, //  readonly，商品新增時，不給值，進貨作業驗收更新
          { field: 'Remark', header: '單項備註', editable: true, type: 'text' },
        ];
      });
  }

  //讀取大、中、小 分類整份表單 (該情況禁止 中小下拉選擇)
  loadCATOptions() {
    {
      //查詢 大分類
      this.tls51070Service
        .queryCAT_LNo_DropDownList({})
        .subscribe((response) => {
          this.largeOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('大分類:', this.largeOption);
        });
      //查詢 中分類
      this.tls51070Service
        .queryCAT_MNo_DropDownList({ CAT_LNo: [this.dataForm.get('CAT_LNo')?.value || ''] })
        .subscribe((response) => {
          this.middleOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('中分類:', this.largeOption);
        });
      //查詢 小分類
      this.tls51070Service
        .queryCAT_SNo_DropDownList({ CAT_LNo: [this.dataForm.get('CAT_LNo')?.value || ''], CAT_MNo: [this.dataForm.get('CAT_MNo')?.value || ''] })
        .subscribe((response) => {
          this.smallOption = response.Data.map((item: apiOption) => ({
            No: item.No,
            Name: item.Name,
            Label: item.No + '-' + item.Name,
          }));

          console.log('小分類:', this.largeOption);
        });
    }
  }

  //讀取明細檔案
  loadDetail(pLU_MagNo: string) {
    if (pLU_MagNo == '') {
      this.messageService.errorBubble('錯誤: 讀取明細為空');
    } else {
      this.tls51070Service.queryTLS51070_Detail({ 'PLU_MagNo': pLU_MagNo }).subscribe((response) => {
        this.img1001Detail = response.Data[0].IMG1001Detail.map((item: { IMG_Path: string; IMG_File: File; }) => ({ ...item, IMG_Path: `${environment.ApiUrl}/${item.IMG_Path.replace('~', '')}/${item.IMG_File}` }));;
        this.pos2005Detail = response.Data[0].POS2005Detail;
        this.pos2020Detail = response.Data[0].POS2020Detail;

        this.POS2020Data = this.pos2020Detail;
        this.POS2005Data = this.pos2005Detail;
        this.img1001Data = this.img1001Detail;

        //建立項目模板
        this.createDefaultNew2020(pLU_MagNo);

        console.log('POS2005Data', this.POS2005Data);
        console.log('POS2020Data', this.POS2020Data);
        console.log('img1001Detail', this.img1001Detail);
      });
    }
  }

  //切換顯示Button
  switchButton(buttonNum: number) {
    this.buttonID = buttonNum;
  }

  //---新增表格編輯事件---
  // 注意：這些方法需要明確接收正確的事件類型
  onRowSave(event: any) {
    // 確認事件對象有預期的屬性
    if (event && 'oldData' in event && 'newData' in event) {
      console.log('儲存主表格行:', event);
      // 這裡可以加入實際的API儲存邏輯
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onRowCancel(event: any) {
    console.log('取消主表格編輯:', event);
  }

  // 新增 POS2020 (新增)
  onAddPOS2020() {
    const newPerson = {
      ...this.defaultNew2020,
      id: this.generate2020Id(),
    };

    console.log('新2020項目', newPerson);

    this.POS2020Data.push(newPerson);

    // 自動進入編輯模式
    setTimeout(() => {
      const index = this.POS2020Data.indexOf(newPerson);
      if (index >= 0) {
        this.expandableTable.onRowEditInit(newPerson, index);
      }
    }, 0);
  }

  // 生成 POS2020 ID (新增)
  generate2020Id(): number {
    const maxId = Math.max(...this.POS2020Data.map(p => p.id), 0);
    return maxId + 1;
  }
  //--表格事件--
}
