import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { POS2004 } from '../../../shared/models/tls/tls000.model';
import { Tls51070Service } from '../../../service/API/tls/tls51070.service';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { POS2005Detail, POS2020Detail, IMG1001Detail } from './tls51070-cru.module';
import { detail2005HandlerService } from './detail2005HandlerService';
import { detail2020HandlerService } from './detail2020HandlerService';
import { dropDown51070 } from './dropDown51070';
import { Tls51060Service } from '../../../service/API/tls/tls51060.service';

// 2.5.1.7  商品基本資料 CRU
@Component({
  selector: 'app-tls51070-cru',
  templateUrl: './tls51070-cru.component.html',
  styleUrl: './tls51070-cru.component.scss'
})
export class TLS51070CRUComponent extends BasicCruPageComponent<POS2004> implements OnInit {
  // 在父組件中聲明
  @ViewChild('pos2005Table') pos2005Table!: ExpandableEditTableComponent;
  @ViewChild('pos2020Table') pos2020Table!: ExpandableEditTableComponent;

  //目前標籤列
  buttonID = 1; //預設在 基本資料標籤
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [{ value: 0, disabled: true }], // 主鍵ID;
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
    PLU_ECStatus: ['1', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Status: ['0', [Validators.required, Validators.maxLength(1)]], // 商品狀態:0一般 不顯示

    //---必填未列入(都是預設不可編輯)---
    PLU_OpenPrc: ['Y', [Validators.required, Validators.maxLength(1)]], // 開放售價Y/N
    PLU_Type: ['1', [Validators.required, Validators.maxLength(1)]], // 商品類別 1一般商品,2生鮮商品,6組合商品,8專櫃,B禮券,F:折讓

    PLU_AccountType: ['2', [Validators.maxLength(1)]], // 結帳別
    PLU_IsStock: ['Y', [Validators.maxLength(1)]], // 是否計算庫存 Y:是 N:否
    PLU_ReadyDay: [0, [Validators.maxLength(4)]], // 備貨天數 預設0
    PLU_StockType: ['0', [Validators.maxLength(1)]], // 庫存類別 0:一般 1:標準用量 2:自動轉換(沒用到) 3:子母商品 4:手動轉換
    PLU_TaxRate: [0, [Validators.maxLength(7)]], // 稅率 預設0

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
  statusOptions: option[] = this.dropDown51070.statusOptions;//商品狀態
  counterOptions: apiOption[] = []; //專櫃編號：資料讀 TLTTALENT 
  vendorOptions: option[] = [];  //廠商編號: 資料讀 POS2013 
  // ---商品規格dropdown---
  attributeOptions: option[] = this.dropDown51070.attributeOptions;  // 商品型態
  taxTypeOptions: option[] = this.dropDown51070.taxTypeOptions; // 稅別
  // ---POS2020 dropdown區---
  transTypeOption: option[] = this.dropDown51070.transTypeOption;  //運輸方式
  purchaseTypeOption: option[] = this.dropDown51070.purchaseTypeOption;  // 採購狀態
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
    { field: 'PLU_No', header: '國際條碼', editable: true, type: 'text' }, //key2
  ];
  // 預設新項目模板
  defaultNew2005 = {
    PLU_MagNo: '',
    PLU_No: '', // 國際條碼
  };
  // 預設 POS2020 新項目模板
  createDefaultNew2005(pLU_MagNo: string) {
    this.defaultNew2005 = {
      PLU_MagNo: pLU_MagNo,
      PLU_No: '', // 國際條碼
    };
  }

  // 展開式表格的載入狀態
  expand2005Loading = false;
  // ---------採購廠商 (POS2020) 編輯表格 至少要一筆-------------------------------------------------------
  // 廠商編號	下拉
  POS2020Data: POS2020Detail[] = [];
  // 預設新項目模板
  defaultNew2020 = {
    id: 0, //新增
    PLU_MagNo: '',
    VEN_No: '',
    STO_No: '10',
    PLU_OrderPrc: 0,

    PLU_Purchase: '1',
    PLU_TransType: '1',
    PLU_TransDay: 0,
    Remark: '',
    VDP_LastStockDate: null,
  };

  // POS2020 展開式表格的欄位定義
  POS2020DataColumn: ColumnDef[] = [

  ];
  // 展開式表格的載入狀態
  expand2020Loading = false;

  // 預設 POS2020 新項目模板
  createDefaultNew2020(pLU_MagNo: string) {
    this.defaultNew2020 = {
      id: 0,
      PLU_MagNo: pLU_MagNo,
      VEN_No: '',
      STO_No: '10',
      PLU_OrderPrc: 0,

      PLU_Purchase: '1',
      PLU_TransType: '1',
      PLU_TransDay: 0,
      Remark: '',
      VDP_LastStockDate: null,
    };
  }

  // ------圖檔設定主檔 (IMG1001) 編輯表格----------------------------
  files: File[] = [];        // 上傳的檔案
  img1001Data: IMG1001Detail[] = []; // 圖片List editable, readable
  confirmDeleteImages: string[] = []; // 確定刪除的圖片
  // ----------------------------------------------------------------

  // isRowSelectable(rowData: POS2004): boolean {
  //   // return rowData.isdelete;
  // }
  // ----------------------------------------------------------------

  constructor(
    private tls51060Service: Tls51060Service, //查詢品牌代碼檔
    private tls51070Service: Tls51070Service,
    private dropDown51070: dropDown51070, //下拉選單
    private detail2005Handler: detail2005HandlerService,// POS2005 table明細處理
    private detail2020Handler: detail2020HandlerService, // POS2020 table明細處理
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

    if (this.crudstatus == CRUDStatus.Edit || CRUDStatus.Read) {
      //查詢明細檔案 (編輯模式)
      console.log('編輯模式，讀取表單', this.dataForm.value);

      //讀取明細檔
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
        // 找到符合的品牌資料 (依照newValue 找到pluLogoOption對應的No)
        const matched = this.pluLogoOption.find(item => item.No === newValue);
        console.log('監聽品牌編號變化', newValue, matched);

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

    // ---0620規格更新---
    // 送出國條是POS2005，不用管2004的國條

    // --------
    // 標籤名稱：在輸入商品中文名稱後會自動帶入標籤名稱欄位。
    // 多筆國際條碼：寫入POS2005，商品管理編號、國際條碼兩個欄位皆要寫入，國際條碼PLU_NO是鍵值。
    //--------
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('讀取表單', frm);
          const formValue = frm.getRawValue();

          // 沒有輸入國際條碼時，國際條碼=商品管理編號 (bubble跳出提示)
          if (!formValue.PLU_No || formValue.PLU_No.trim() === '') {
            formValue.PLU_No = formValue.PLU_MagNo; // 國際條碼=商品管理編號
            this.messageService.infoBubble('沒有輸入國際條碼，國際條碼已自動設為商品管理編號');
          }

          const simplifiedFiles = this.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }));
          console.log('上傳 IMG :', JSON.stringify(simplifiedFiles, null, 2));
          console.log('現有的 IMG1001 :', JSON.stringify(this.img1001Data, null, 2));

          // 將所有 file 都轉為新資料項目（id: 0）
          const newIMGEntries: Partial<IMG1001Detail>[] = this.files.map(file => ({
            id: 0,
            IMG_File: file.name,
            IMG_Remark: ''
          }));

          // 合併原本資料 + 所有新 file
          const mergedIMG1001: (IMG1001Detail | Partial<IMG1001Detail>)[] = [
            ...this.img1001Data,
            ...newIMGEntries
          ];


          const requestBody = {
            ...formValue,
            PLU_No: [frm.get('PLU_No')?.value], //用[]包
            "POS2020_INFO": this.POS2020Data,
            "IMG1001_INFO": mergedIMG1001,
          }
          console.log('insert', requestBody);

          this.tls51070Service.insertTLS51070(requestBody).subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.onCancel(); // 儲存後，會返回列表
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
          const simplifiedFiles = this.files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          }));
          console.log('上傳 IMG :', JSON.stringify(simplifiedFiles, null, 2));
          console.log('現有的 IMG1001 :', JSON.stringify(this.img1001Data, null, 2));

          // 將所有 file 都轉為新資料項目（id: 0）
          const newIMGEntries: Partial<IMG1001Detail>[] = this.files.map(file => ({
            id: 0,
            IMG_File: file.name,
            IMG_Remark: ''
          }));

          // 合併原本資料 + 所有新 file
          const mergedIMG1001: (IMG1001Detail | Partial<IMG1001Detail>)[] = [
            ...this.img1001Data,
            ...newIMGEntries
          ];

          const requestBody = {
            ...formValue,
            PLU_No: POS2005PLUs,
            // 如果IMG_File也有資料，就合併進去IMG1001
            "IMG1001_INFO": mergedIMG1001,
            "POS2020_INFO": this.POS2020Data,
          };

          console.log('update', requestBody);

          this.tls51070Service.updateTLS51070(requestBody).subscribe({
            next: () => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 儲存後，會返回列表
            }
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

    // 品牌編號與折扣別
    this.tls51060Service.queryPLULOGO_OrderPrcRate_DropDownList({}).subscribe((response) => {
      this.pluLogoOption = response.Data.map((item: any) => ({
        No: item.No, // 品牌代碼
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
        PLU_OrderPrcRate: item.PLU_OrderPrcRate, // 折扣別
      }));
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
          { field: 'STO_No', header: '分店編號', editable: true, type: 'text' },

          { field: 'PLU_TransType', header: '運輸方式', editable: true, type: 'dropdown', options: this.transTypeOption }, // １＝自行送貨２＝貨運  ３＝快遞  ４＝其它。
          { field: 'PLU_TransDay', header: '送貨天數', editable: true, type: 'number' },
          { field: 'PLU_Purchase', header: '採購狀態', editable: true, type: 'dropdown', options: this.purchaseTypeOption }, // １＝正常採購（預設） ２＝停止採購
          { field: 'PLU_OrderPrc', header: '目前進價', editable: false, type: 'number' }, //目前進價 > 顯示 最後進價
          //readonly，商品新增時，最後進價=POS2004的標準進價PLU_OrderPrc，之後進價異動透過進價/售價變價作業(關帳作業、啟動變價時更新)

          { field: 'VDP_LastStockDate', header: '最後進貨日期', editable: false, type: 'date' }, //  readonly，商品新增時，不給值，進貨作業驗收更新
          { field: 'Remark', header: '備註', editable: true, type: 'text' },
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
        // this.img1001Detail = response.Data[0].IMG1001Detail.map((item: { IMG_Path: string; IMG_File: File; }) => ({ ...item, IMG_Path: `${environment.ApiUrl}/${item.IMG_Path.replace('~', '')}/${item.IMG_File}` }));

        this.pos2005Detail = response.Data[0].POS2005Detail;
        this.pos2020Detail = response.Data[0].POS2020Detail;

        // 圖片讀取時進行轉檔 將IMG1001Detail的IMG_File內容變更為_以後的內容
        this.img1001Detail = response.Data[0].IMG1001Detail.map((item: { IMG_File: string; }) => {
          return {
            ...item,
            IMG_File: item.IMG_File.split('_').slice(1).join('_'),
          };
        });

        this.POS2005Data = this.pos2005Detail;
        this.POS2020Data = this.pos2020Detail;
        this.img1001Data = this.img1001Detail;

        //建立項目模板
        this.createDefaultNew2005(pLU_MagNo);
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

  // ---明細檔操作---

  //---POS2005表格編輯事件---
  onRowSavePOS2005(event: any) {
    const newPLUNo = event.newData?.PLU_No;
    const currentId = event.newData?.id;

    // 檢查國際條碼是否為空（放在最前面）
    if (newPLUNo === undefined || newPLUNo === null || newPLUNo.trim() === '') {
      this.messageService.errorBubble('國際條碼不可為空，請輸入有效的國際條碼。');
      event.newData.PLU_No = event.oldData.PLU_No;
      return;
    }

    if (!newPLUNo || !currentId) return;

    // 比對 POS2005Data（最新畫面資料），排除自己那筆
    const isDuplicate = this.POS2005Data.some(item =>
      item.PLU_No === newPLUNo && item.id !== currentId
    );

    // 檢查是否有重複的國際條碼
    if (isDuplicate) {
      this.messageService.errorBubble(`國際條碼 ${newPLUNo} 已存在，請使用其他條碼。`);
      // 還原為舊值
      event.newData.PLU_No = event.oldData.PLU_No;
      return;
    }

    // 通過驗證，處理儲存
    this.detail2005Handler.handleRowSave(event);
  }
  onRowCancelPOS2005(event: any) {
    this.detail2005Handler.handleRowCancel(event);
  }
  // 新增 POS2005
  onAddPOS2005() {
    this.detail2005Handler.addPOS2005(this.POS2005Data, this.defaultNew2005, this.pos2005Table);
  }
  // 批次刪除 POS2005
  onBatchDelete2005(selectedItems: POS2005Detail[]): void {
    this.detail2005Handler.deletePOS2005(selectedItems, this.POS2005Data, this.pos2005Table);
  }

  //---POS2020表格編輯事件---
  onRowSavePOS2020(event: any) {
    // 通過驗證，處理儲存
    this.detail2020Handler.handleRowSave(event);

  }
  onRowCancelPOS2020(event: any) {
    this.detail2020Handler.handleRowCancel(event);
  }
  // 新增 POS2020
  onAddPOS2020() {
    this.detail2020Handler.addPOS2020(this.POS2020Data, this.defaultNew2020, this.pos2020Table);
  }

  // 批次刪除 POS2020
  onBatchDelete2020(selectedItems: any[]): void {
    this.detail2020Handler.deletePOS2020(selectedItems, this.POS2020Data, this.pos2020Table);
  }
}
