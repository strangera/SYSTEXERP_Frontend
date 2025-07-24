import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { Tls12010Service } from '../../../service/api/tls/tls12010.service';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Tls12010DetailService } from './tls12010-detail.service';

export interface Potential_Customer {
  ID: number; // 主鍵，自動編號

  contact_USR_No: string; // 接洽人員代碼
  contact_USR_Name: string; // 接洽人員姓名
  cus_type: string; // 廠商類型：1=統編、2=身份證字號、3=員工ID
  cus_uniform_id: string; // 廠商統一編號 (根據類型不同有不同意義)
  VEN_Name: string; // 廠商名稱
  VEN_EngName?: string; // 廠商英文名稱
  bus_type?: string; // 業種-大分類代碼
  tlt_name?: string; // 品牌（專櫃名稱）
  tlt_EngName?: string; // 品牌英文（專櫃名稱）
  VEN_Boss: string; // 廠商聯絡人
  VEN_BossTel: string; // 廠商聯絡人電話
  VEN_BossTitle?: string; // 廠商聯絡人頭銜
  VEN_BossFax?: string; // 廠商聯絡人傳真
  VEN_BossMobile?: string; // 廠商聯絡人行動電話
  VEN_BossEmail?: string; // 廠商聯絡人電子郵件
  VEN_Addr?: string; // 公司通訊地址
  VEN_PersonInCharge?: string; // 公司負責人
  business_type?: string; // 經營方式
  demanded_area?: number; // 需求面積 (小數，預設 0)
  country_of_origin?: string; // 商品出產地
  remarks?: string; // 備註 (HTML 格式)

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名
}

// Potential_Customer_Detail 潛在客戶其他資料明細檔
export interface Potential_Customer_Detail {
  ID: number; // 主鍵，自動編號
  PC_id: number; // 潛在客戶ID (Potential_Customer 的 ID)
  other_shop: string; // 其他商場
  shop_area: number; // 面積 (小數，預設 0)
  total_amt: number; // 營業額 (整數，預設 0)  

  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

// 暫存廠商資料
export interface CachedVendorData {
  cus_uniform_id: string;
  VEN_Name: string;
  VEN_EngName: string;
}

export interface POS2013{
  No: string,
  Name: string,
  ShortName: string,
  VEN_No: string,
  VEN_EngName: string,

  Label: string,
}

// 2.1.2.1 潛在客戶資料維護CRU
@Component({
    selector: 'app-tls12010-cru',
    templateUrl: './tls12010-cru.component.html',
    styleUrl: './tls12010-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, EditorTextComponent, ExpandableEditTableComponent,InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS12010CRUComponent extends BasicCruPageComponent<Potential_Customer> implements OnInit {
  @ViewChild('detailTable') detailTable!: ExpandableEditTableComponent;
  //
  private skipValueChanges = true;
  private cachedVendorData: CachedVendorData = {
    cus_uniform_id: '',
    VEN_Name: '',
    VEN_EngName: ''
  };
  // ----------------------------------------------------------------
    dataForm = this.formBuilder.nonNullable.group({
        // Potential_Customer 潛在客戶主檔
        ID: [{value: null, disabled: true}], // 主鍵，自動編號
        contact_USR_No: ['', [Validators.required, Validators.maxLength(16)]],  // 接洽人員代碼
        contact_USR_Name: ['', [Validators.required, Validators.maxLength(20)]],  // 接洽人員姓名
        cus_type: ['1', [Validators.required, Validators.maxLength(1)]], // 廠商類型（1=統編、2=身份證、3=員工ID）
        cus_uniform_id: ['', [Validators.required, Validators.maxLength(16)]], // 廠商統一編號(pos2013)
        // /*若廠商類型為1=統編, 為廠商統編 (pos2013.ven_uniform) */
	         /*若廠商 類型為2=身份證字號, 進行身份證檢查碼檢查 */
	         /*若廠商類型為3=員工ID, 檢查 tblUser.user_no */ 
        VEN_Name: ['', [Validators.required, Validators.maxLength(100)]], // 廠商名稱
        /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
	      /*若廠商類型為3=員工ID, tblUser.user_name */
        // 有資料可以用 [烘焙坊] 輸入測試試試
        VEN_EngName: ['', [Validators.maxLength(100)]], // 廠商英文名稱
        /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
	      /*若廠商類型為3=員工ID, 由使用者自行輸入 */
        bus_type: ['', [Validators.maxLength(2)]], // 業種-大分類代碼(tltbustype)
        tlt_name: ['', [Validators.maxLength(100)]],  // 品牌(專櫃名稱)
        tlt_EngName: ['', [Validators.maxLength(100)]], // 品牌英文(專櫃名稱)
        VEN_Boss: ['', [Validators.required, Validators.maxLength(20)]], // 廠商聯絡人
        VEN_BossTel: ['', [Validators.required, Validators.maxLength(20)]], // 廠商聯絡人電話
        VEN_BossTitle: ['', [Validators.maxLength(20)]], // 廠商聯絡人頭銜
        VEN_BossFax: ['', [Validators.maxLength(20)]], // 廠商聯絡人傳真
        VEN_BossMobile: ['', [Validators.maxLength(20)]], // 廠商聯絡人行動電話
        VEN_BossEmail: ['', [Validators.maxLength(60)]], // 廠商聯絡人電子郵件
        VEN_Addr: ['', [Validators.maxLength(100)]], // 公司通訊地址
        VEN_PersonInCharge: ['', [Validators.maxLength(20)]], // 公司負責人
        business_type: ['', [Validators.maxLength(1)]], // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）

        demanded_area: [0, [Validators.maxLength(7),Validators.min(0), Validators.max(9999999)]], // 需求面積（數字，小數點後3位）
        country_of_origin: ['', [Validators.maxLength(20)]], // 商品出產地
        remarks: [''],  // 備註（HTML 格式

        CRT_Date: [{ value: null, disabled: true }], // 建立日期
    });

    // ---Potential_Customer_Detail 潛在客戶其他資料明細檔---
    potentialDetail: Potential_Customer_Detail[] = [];
    //欄位資訊
    Potential_Customer_Detail_Columns: ColumnDef[] = [
        { field: 'other_shop', header: '其他商場', type: 'text', editable: true, autoWidth: true },
        { field: 'shop_area', header: '面積', type: 'number', allowDecimal: true, decimalPlaces: 3, editable: true, autoWidth: true },
        { field: 'total_amt', header: '營業額', type: 'number', allowDecimal: true, editable: true, autoWidth: true }
    ];
    // 預設新項目模板
    defaultNewDetail: { PC_id: number | null; other_shop: string; shop_area: number; total_amt: number; status: string } = {
      PC_id: null, // 潛在客戶ID (Potential_Customer 的 ID)
      other_shop: '', // 其他商場
      shop_area: 0, // 面積
      total_amt: 0, // 營業額

      status: 'new' // 新增狀態
    };
    // 預設 POS2005 新項目模板
    createDefaultNew(PC_id: number) {
      this.defaultNewDetail = {
        PC_id: PC_id,
        other_shop: '', // 其他商場
        shop_area: 0, // 面積
        total_amt: 0, // 營業額

        status: 'new' // 新增狀態
      };
    }
    // 展開式表格的載入狀態
    expandDetailLoading = false;
    // ------

    //
    cus_type_Option: option[] = [ // 廠商類型（1=統編、2=身份證、3=員工ID）
      {value: '1', label: '統編'},
      {value: '2', label: '身份證'},
      {value: '3', label: '員工ID'}
    ];
  
    business_type_Option: apiOption[] = []; // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）
    bus_type_Option: apiOption[] = []; // 業種-大分類代碼
    tlt_name_Option: apiOption[] = []; //品牌
    cus_uniform_Option: POS2013[] = []; // 廠商統一編號(pos2013)
    contact_USR_Option: apiOption[] = [];  // 接洽人員代碼/名稱
    // ----------------------------------------------------------------
    constructor(
      private validationService: ValidationService,
      private tls12010Service: Tls12010Service,
      private tls12010DetailService: Tls12010DetailService) {
      super(); // 呼叫父類建構子
    }
  
    ngOnInit(): void {
      this.initializePage('TLS12010', this.dataForm);
      this.loadOptions();

      const PC_id = this.dataForm.get('ID')?.value;
      if (PC_id) {
        this.loadDetailData(PC_id);
        this.createDefaultNew(PC_id);

        //確認是否為統編，設定暫存資料給cachedVendorData
       if (this.dataForm.get('cus_type')?.value === '1') {
          this.cachedVendorData = {
            cus_uniform_id: this.dataForm.get('cus_uniform_id')?.value || '',
            VEN_Name: this.dataForm.get('VEN_Name')?.value || '',
            VEN_EngName: this.dataForm.get('VEN_EngName')?.value || ''
          };
          console.log('暫存廠商資料:', this.cachedVendorData);
        }
      } else {
        console.warn('無法讀取明細資料，因為沒有提供PC_id');
      }

       // ✅ 加入判斷，初始化時也跳過這個 onCusTypeChange
      if (!this.skipValueChanges) {
        this.onCusTypeChange(this.dataForm.get('cus_type')?.value || '1');
      }

      // 訂閱 valueChanges
      this.dataForm.get('cus_type')?.valueChanges.subscribe(value => {
        if (this.skipValueChanges) return;
        this.onCusTypeChange(value);
      });

      this.dataForm.get('cus_uniform_id')?.valueChanges.subscribe(value => {
        if (this.skipValueChanges) return;
        if (this.dataForm.get('cus_type')?.value === '1') {
          const match = this.cus_uniform_Option.find(opt => opt.No === value);
          if (match) {
            this.dataForm.get('VEN_Name')?.disable();
            this.dataForm.get('VEN_EngName')?.disable();
            this.dataForm.get('VEN_Name')?.setValue(match.Name);
            this.dataForm.get('VEN_EngName')?.setValue(match.VEN_EngName);
          } else {
            this.dataForm.get('VEN_Name')?.setValue('');
            this.dataForm.get('VEN_EngName')?.setValue('');
            // this.messageService.errorBubble('無該廠商名稱資料');
          }
        }
      });

      console.log('讀取資料', this.dataForm.value);

      // ✅ 最後設為 false，代表資料已匯入完成，之後就會開始觸發 valueChanges
      this.skipValueChanges = false;
    }
  
    onSubmit(frm: FormGroup) {
      this.messageService.blockUi();
      this.submitted = true;
  
      if (this.dataForm.invalid) {
        this.messageService.unblockUi();
        return;
      }

      //將新的資料ID指定為null
      const processedDetail = this.potentialDetail.map(item => {
        // 刪除 key 為空字串的欄位
        if ("" in item) {
          delete item[""];
        }

        if (item.status === 'new') {
          return { ...item, ID: null}; // 把新項目的 ID, PC_id 改為 null
        }
        return item; // 其他不變
      });
  
      const formValue = frm.getRawValue();
      const body = {
        ...formValue,
        Detail: processedDetail, // 將明細資料加入請求體
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('insert:', JSON.stringify(body, null, 2));
            console.log('detail', this.potentialDetail);
            this.tls12010Service.insertTLS12010(body).subscribe(() => {
              this.messageService.successBubble('新增成功');
              // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
              this.dataForm.reset(); // 重置表單
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('update:', JSON.stringify(body, null, 2));
            console.log('detail', this.potentialDetail);
            this.tls12010Service.updateTLS12010(body).subscribe(() => {
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
      console.log('提交');
      this.onSubmit(frm);
    }
  
    onClearForm() {
      this.dataForm.reset(); // 重置表單
    }
  
    // 讀取dopropdown選項
    loadOptions() {
        // 查 大分類(專櫃)
        this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).subscribe((response) => {
          this.bus_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 大分類(專櫃) 號
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('大分類代號:', this.bus_type_Option);
        });

        // 查 品牌
        this.tls12010Service.queryPLULOGO_DropDownList({}).subscribe((response) => {
          this.tlt_name_Option = response.Data.map((item: any) => ({
            No: item.No, // 專櫃主代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('品牌代號:', this.tlt_name_Option);
        });

        // 查 統編
        this.tls12010Service.queryPOS2013_DropDownList({"VEN_Flag": '1'}).subscribe((response) => {
          // 去除重複的 No，只保留第一筆
          const uniqueMap = new Map<string, any>();
          response.Data.forEach((item: any) => {
            if (!uniqueMap.has(item.No)) {
              uniqueMap.set(item.No, item);
            }
          });

          // 建立 dropdown options
          this.cus_uniform_Option = Array.from(uniqueMap.values()).map((item: any) => ({
            No: item.No,
            Name: item.Name,
            ShortName: item.ShortName,
            VEN_No: item.VEN_No,
            VEN_EngName: item.VEN_EngName,
            Label: item.No + '/' + item.Name,
          }));

          console.log('統編代號(去重):', this.cus_uniform_Option);
        });

        // 查 經營方式
         this.tls12010Service.querySYS1000_DropDownList({"SYS_Type": 'T117'}).subscribe((response) => {
          this.business_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 經營方式 代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('經營方式代號:', this.business_type_Option);
        });

        // 查詢 接待人員
        this.tls12010Service.queryTLS12010_DropDownList({}).subscribe((response) => {
          this.contact_USR_Option = response.Data.map((item: any) => ({
            No: item.contact_USR_No, // 接待人員 代碼
            Name: item.contact_USR_Name, // 接待人員 名稱
            Label: item.contact_USR_No + '/' + item.contact_USR_Name, // 組合成顯示用的Label
          }));
          console.log('接待人員代號:', this.contact_USR_Option);
        });
    }

    // 讀取明細資料
    async loadDetailData(PC_id: string): Promise<void> {
      console.log('要求PC_id資料:', PC_id);
      this.tls12010Service.queryTLS12010_Detail({"PC_id": PC_id}).subscribe((response) => {
        if (response.Status === '0000') {
          this.potentialDetail = response.Data.map((item: any) => ({
            ...item,
            status: 'original', // 有明細資料，讀取明細狀態設定為 'original';
          }));
          console.log('取得明細資料:', this.potentialDetail);
        } else {
          this.messageService.errorBubble(`讀取失敗: ${response.Message}`);
        }
      });
    }

    //接待人員變化
    onUSR_NoChange(id: string): void{
      // contact_USR_Option 有對應的No 就將Name寫入 contact_USR_Name
       const selectedUSR = this.contact_USR_Option.find(item => item.No === id);
        if (selectedUSR) {
          this.dataForm.get('contact_USR_Name')?.setValue(selectedUSR.Name);
        } else {
          // 若找不到，清空欄位或保留原值，看你的需求
          this.dataForm.get('contact_USR_Name')?.setValue('');
        }
    }

    // 廠商類型 radio button 連動的驗證器變化
    onCusTypeChange(type: string): void {
      const cus_uniform_id = this.dataForm.get('cus_uniform_id');
      const VEN_Name = this.dataForm.get('VEN_Name');
      const VEN_EngName = this.dataForm.get('VEN_EngName');

      if (!cus_uniform_id || !VEN_Name || !VEN_EngName) return;

      switch (type) {
        case '1': // 統編
          cus_uniform_id.setValidators([Validators.required, Validators.maxLength(16)]);
          VEN_Name.setValidators([Validators.required, Validators.maxLength(100)]);
          VEN_EngName.setValidators([Validators.maxLength(100)]);

          //內容重設
          // 如果有資料就設定為快取廠商資料
          if (this.cachedVendorData.cus_uniform_id) {
            cus_uniform_id.setValue(this.cachedVendorData.cus_uniform_id);
            VEN_Name.setValue(this.cachedVendorData.VEN_Name);
            VEN_EngName.setValue(this.cachedVendorData.VEN_EngName);
          } else {
            cus_uniform_id.setValue('');
            VEN_Name.setValue('');
            VEN_EngName.setValue('');
          }
          break;

        case '2': // 身份證字號
          cus_uniform_id.setValidators([
            Validators.required,
            Validators.maxLength(10),
            (control) => this.validationService.identityValidator(control) // 套用 身份證字號 驗證
          ]);
          VEN_Name.setValidators([Validators.required, Validators.maxLength(100)]);
          VEN_EngName.setValidators([Validators.maxLength(100)]);

          //內容重設
          cus_uniform_id.enable();
          VEN_Name.enable();
          VEN_EngName.enable();

          cus_uniform_id.setValue('');
          VEN_Name.setValue('');
          VEN_EngName.setValue('');

          break;

        case '3': // 員工ID
          { cus_uniform_id.setValidators([
            Validators.required,
            Validators.maxLength(16),
          ]);
          VEN_Name.setValidators([Validators.required, Validators.maxLength(100)]);
          VEN_EngName.setValidators([Validators.maxLength(100)]);

          // VEN_Name 直接套用token的 tblUser.user_name 給員工ID
          const userNo = this.authService.getUserInfo()?.user_No ?? ''
          const userName = this.authService.getUserInfo()?.user_Name ?? ''
          if(userNo && userName){ //有用戶名不允許編輯
            // console.log('用戶資料',userNo,"/", userName);
            cus_uniform_id.disable();
            cus_uniform_id.setValue(userNo);
            VEN_Name.disable();
            VEN_Name.setValue(userName);

            VEN_EngName.setValue('');
          }else{
            this.messageService.errorBubble('錯誤: 無法取得用戶資訊');
          }
          break; }
        default:
          console.log('error');
          break;  
      }

      // 重設狀態並更新驗證器
      cus_uniform_id.updateValueAndValidity();
      VEN_Name.updateValueAndValidity();
      VEN_EngName.updateValueAndValidity();
    }

    // ---明細檔操作---
    //HTML 顯示的明細資料
    get filteredDetail(): Potential_Customer_Detail[] {
      return this.potentialDetail.filter(item => item.status !== 'deleted');
    }
    
    //---Potential_Customer_Detail 表格編輯事件---
    onRowSaveDetail(event: any) {
      this.tls12010DetailService.handleRowSave(event);
    }

    onRowCancelDetail(event: any) {
      this.tls12010DetailService.handleRowCancel(event);
    }
    // 新增 Potential_Customer_Detail
    onAddPotentialCustomerDetail() {
      this.tls12010DetailService.addPotentialCustomerDetail(this.potentialDetail, this.defaultNewDetail, this.detailTable);
    }
    // 批次刪除  Potential_Customer_Detail
    onBatchDeleteDetail(selectedItems: Potential_Customer_Detail[]): void {
      this.tls12010DetailService.deletePotentialCustomerDetail(selectedItems, this.potentialDetail);
    }      
    
}
