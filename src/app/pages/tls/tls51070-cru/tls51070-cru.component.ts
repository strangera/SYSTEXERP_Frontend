import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { POS2004 } from '../../../shared/models/tls/tls000.model';
import { Tls51070Service } from '../../../service/API/tls/tls51070.service';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';

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
  "VDP_LastStockDate": Date,
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
    // 基本資料顯示畫面
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

    LOGO_No: ['', [Validators.maxLength(4)]], // 品牌代碼

    PLU_Attribute: ['1', [Validators.maxLength(16)]], // 商品型態 1一般、2進口、3買斷、4試銷、5寄賣*/ --南紡 商品型態 1一般、2進口、3買斷、4試銷、5寄賣
    PLU_Unit: ['', [Validators.maxLength(2)]], // 單位代碼 --讀PLUUNIT  商品單位設定檔
    PLU_ECStatus: ['0', [Validators.maxLength(1)]], // EC商品狀態: 1.正常2.停用3.停進4,下架 For EC (備註: 原來的 商品狀態(PLU_Status) 改為 EC商品狀態(PLU_ECStatus))
    PLU_Reserve3: ['', [Validators.maxLength(400)]], // 系列
  });
  //
  largeOption: apiOption[] = [];
  middleOption: apiOption[] = [];
  smallOption: apiOption[] = [];
  brandOption: apiOption[] = [];  // 品牌代碼
  attributeOptions: option[] = [ // 商品型態
    { value: '1', label: '一般' },
    { value: '2', label: '進口' },
    { value: '3', label: '買斷' },
    { value: '4', label: '試銷' },
    { value: '5', label: '寄賣' },
  ];
  unitOptions: apiOption[] = [];  //商品單位
  statusOptions: option[] = [  //商品狀態
    { value: '1', label: '正常' },
    { value: '2', label: '停用' },
    { value: '3', label: '停進' },
    { value: '4', label: '下架' },
  ];
  counterOptions: apiOption[] = []; //專櫃編號：資料讀 TLTTALENT 
  vendorOptions: apiOption[] = [];  //廠商編號: 資料讀 POS2013 

  pos2005Detail: POS2005Detail[] = [];
  pos2020Detail: POS2020Detail[] = [];
  img1001Detail: IMG1001Detail[] = [];
  // ---------採購廠商 (POS2020) 編輯表格 至少要一筆-------------------------------------------------------
  // 廠商編號	下拉
  POS2020Data: POS2020Detail[] = [];
  // 預設新項目模板
  defaultNew2020 = {
    PLU_MagNo: this.dataForm.get('PLU_MagNo')?.value || '',
    VEN_No: '',
    STO_No: '',
    PLU_OrderPrc: 0,

    PLU_Purchase: '',
    PLU_TransType: '',
    PLU_TransDay: 0,
    Remark: '',
    VDP_LastStockDate: new Date(),
  };

  // 展開式表格的欄位定義
  POS2020DataColumn: ColumnDef[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', editable: false, type: 'text' },  //key1
    { field: 'VEN_No', header: '廠商編號', editable: true, type: 'dropdown' }, //key2
    // { field: 'STO_No', header: '分店編號', editable: true, type: 'text' },

    { field: 'PLU_TransType', header: '運輸方式', editable: true, type: 'text' },
    { field: 'PLU_TransDay', header: '送貨天數', editable: true, type: 'number' },
    { field: 'PLU_Purchase', header: '採購狀態', editable: true, type: 'text' },
    { field: 'PLU_OrderPrc', header: '目前進價', editable: true, type: 'number' }, //顯示 最後進價，是這個嗎?
    { field: 'VDP_LastStockDate', header: '最後進貨日期', editable: true, type: 'date' },
    { field: 'Remark', header: '單向備註', editable: true, type: 'text' },

  ];

  // 展開式表格的載入狀態
  expandLoading = false;

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
      VDP_LastStockDate: new Date(),
    };
  }

  // isRowSelectable(rowData: POS2020Detail): boolean {
  //   // return rowData.isdelete;
  // }
  // ----------------------------------------------------------------

  constructor(
    private tls51070Service: Tls51070Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS51070', this.dataForm);

    //國際條碼 新增可空白、其他狀況必填
    if (this.crudstatus !== CRUDStatus.Create) {
      this.dataForm.get('PLU_No')?.setValidators(Validators.required);
    } else {
      console.log('新增模式，國條可非必填')
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
    // 標籤名稱：在輸入商品中文名稱後會自動帶入標籤名稱欄位。
    // 多筆國際條碼：寫入POS2005，商品管理編號、國際條碼兩個欄位皆要寫入，國際條碼PLU_NO是鍵值。
    //--------
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', frm.value);
          this.tls51070Service.insertTLS51070(frm.value).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', frm.value);
          this.tls51070Service.updateTLS51070(frm.value).subscribe(() => {
            // this.messageService.successBubble('更新成功');
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

  //設定國際條碼(pluNo)為商品管理編號(pluMagno)
  //新增時可選擇pluNo與pluMagno相同，此情況pluNo可為
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

    // 查詢 品牌代碼
    this.tls51070Service
      .queryPLULOGO_DropDownList({})
      .subscribe((response) => {
        this.brandOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('品牌代碼:', this.brandOption);
      });

    // 查詢 廠商代碼 (不確定怎麼帶 VEN_Flag)
    // this.tls51070Service
    //   .queryPOS2013_DropDownList({ "VEN_Flag": '' })
    //   .subscribe((response) => {
    //     this.vendorOptions = response.Data.map((item: apiOption) => ({
    //       No: item.No,
    //       Name: item.Name,
    //       Label: item.No + '-' + item.Name,
    //     }));

    //     console.log('廠商代碼:', this.brandOption);
    //   });
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
        this.img1001Detail = response.Data[0].IMG1001Detail;
        this.pos2005Detail = response.Data[0].POS2005Detail;
        this.pos2020Detail = response.Data[0].POS2020Detail;

        //建立項目模板
        this.createDefaultNew2020(pLU_MagNo);

        console.log('pos2005Detail', this.pos2005Detail);
        console.log('pos2020Detail', this.pos2020Detail);
        console.log('img1001Detail', this.img1001Detail);
      });
    }
  }

  //切換顯示Button
  switchButton(buttonNum: number) {
    this.buttonID = buttonNum;
  }

  //---新增表格編輯事件---
  // 展開式表格的事件處理方法 - 修正為正確的參數類型
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

  // 新增人員事件 (新增)
  onAddPerson() {
    const newPerson = {
      ...this.defaultNew2020,
      id: this.generatePersonId(),
    };

    console.log('新項目', newPerson);

    this.POS2020Data.push(newPerson);

    // 自動進入編輯模式
    setTimeout(() => {
      const index = this.POS2020Data.indexOf(newPerson);
      if (index >= 0) {
        this.expandableTable.onRowEditInit(newPerson, index);
      }
    }, 0);
  }

  // 生成新人員ID (新增)
  generatePersonId(): number {
    const maxId = Math.max(...this.POS2020Data.map(p => p.id), 0);
    return maxId + 1;
  }

  //--表格事件--
}
