import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { Tls12010Service } from '../../../service/api/tls/tls12010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/components/editor-text/editor-text.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../others/component/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Tls12010DetailService } from './tls12010-detail.service';


export interface Potential_Customer {
  id: number; // 主鍵，自動編號

  contact_USR_No: string; // 接洽人員代碼
  contact_USR_Name: string; // 接洽人員姓名
  cus_type: string; // 廠商類型：1=統編、2=身份證字號、3=員工id
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
  VEN_Addr?: string; // 郵寄地址
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
  id: number; // 主鍵，自動編號
  PC_id: number; // 潛在客戶id (Potential_Customer 的 id)
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

export interface POS2013 {
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
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, CommonModule, DropdownComponent, RadiobuttonComponent, EditorTextComponent, ExpandableEditTableComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonComponent, NgIf, TranslateModule, ButtonModule]
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
    id: [{ value: null, disabled: true }], // 主鍵，自動編號
    contact_USR_No: ['', [Validators.required, Validators.maxLength(16)]],  // 接洽人員代碼
    contact_USR_Name: ['', [Validators.required, Validators.maxLength(20)]],  // 接洽人員姓名
    cus_type: ['1', [Validators.required, Validators.maxLength(1)]], // 廠商類型（1=統編、2=身分證、3=員工id）
    cus_uniform_id: ['', [Validators.required, Validators.maxLength(16)]], // 廠商統一編號(pos2013)
    // /*若廠商類型為1=統編, 為廠商統編 (pos2013.ven_uniform) */
    /*若廠商 類型為2=身份證字號, 進行身份證檢查碼檢查 */
    /*若廠商類型為3=員工id, 檢查 tblUser.user_no */
    VEN_Name: ['', [Validators.required, Validators.maxLength(100)]], // 廠商名稱
    /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
    /*若廠商類型為3=員工id, tblUser.user_name */
    VEN_EngName: ['', [Validators.maxLength(100), this.validationService.englishNumberSpaceSymbolValidator]], // 廠商英文名稱
    /*若廠商類型為2=身份證字號, 由使用者自行輸入 */
    /*若廠商類型為3=員工id, 由使用者自行輸入 */
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 業種-大分類代碼(tltbustype)
    tlt_name: ['', [Validators.maxLength(100)]],  // 品牌(專櫃名稱) --- 20251007: 品牌名稱(中文)應為文字輸入欄位，目前下拉選單取到自營的品牌資料，改為純文字，不卡控
    tlt_EngName: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 品牌英文(專櫃名稱)
    VEN_Boss: ['', [Validators.required, Validators.maxLength(12)]], // 廠商聯絡人
    VEN_BossTel: ['', [Validators.required, Validators.maxLength(20), this.validationService.phoneNumberValidator]], // 廠商聯絡人電話
    VEN_BossTitle: ['', [Validators.maxLength(20)]], // 廠商聯絡人頭銜
    VEN_BossFax: ['', [Validators.maxLength(20), this.validationService.phoneNumberValidator]], // 廠商聯絡人傳真
    VEN_BossMobile: ['', [Validators.maxLength(20), this.validationService.phoneNumberValidator]], // 廠商聯絡人行動電話
    VEN_BossEmail: ['', [Validators.maxLength(60), this.validationService.noChineseValidator]], // 廠商聯絡人電子郵件
    VEN_Addr: ['', [Validators.maxLength(100)]], // 郵寄地址
    VEN_Address: ['', [Validators.maxLength(100)]], // 公司營登地址
    VEN_PersonInCharge: ['', [Validators.maxLength(20)]], // 公司負責人
    business_type: [null, [Validators.maxLength(1)]], // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）

    demanded_area: [0, [Validators.maxLength(7), Validators.min(0), Validators.max(9999999), this.validationService.numberValidator]], // 需求面積（數字，小數點後3位）
    country_of_origin: ['', [Validators.maxLength(20)]], // 商品出產地
    remarks: [''],  // 備註（HTML 格式

    CRT_Date: [{ value: null, disabled: true }], // 建立日期
  });

  // ---Potential_Customer_Detail 潛在客戶其他資料明細檔---
  potentialDetail: Potential_Customer_Detail[] = [];
  org_potentialDetail: Potential_Customer_Detail[] = []; // 備份
  //欄位資訊
  Potential_Customer_Detail_Columns: ColumnDef[] = [
    { field: 'other_shop', header: '其他商場', type: 'text', editable: true, autoWidth: true, style: 'width: 40%; min-width: 200px' },
    { field: 'shop_area', header: '面積', type: 'number', allowDecimal: true, decimalPlaces: 3, editable: true, autoWidth: true, style: 'width: 30%; min-width: 100px' },
    { field: 'total_amt', header: '營業額', type: 'number', allowDecimal: true, editable: true, autoWidth: true, style: 'width: 30%; min-width: 100px' }
  ];
  // 預設新項目模板
  defaultNewDetail: { id: number, PC_id: number | null; other_shop: string; shop_area: number; total_amt: number; status: string } = {
    id: 0,
    PC_id: null, // 潛在客戶id (Potential_Customer 的 id)
    other_shop: '', // 其他商場
    shop_area: 0, // 面積
    total_amt: 0, // 營業額

    status: 'new' // 新增狀態
  };
  // 預設 POS2005 新項目模板
  createDefaultNew(PC_id: number) {
    this.defaultNewDetail = {
      id: 0,
      PC_id: PC_id,
      other_shop: '', // 其他商場
      shop_area: 0, // 面積
      total_amt: 0, // 營業額

      status: 'new' // 新增狀態
    };
  }
  // 展開式表格的載入狀態
  expandDetailLoading = false;

  cus_type_Option: option[] = [ // 廠商類型（1=統編、2=身分證、3=員工id）
    { value: '1', label: '統編' },
    { value: '2', label: '身分證' },
    { value: '3', label: '員工ID' }
  ];

  business_type_Option: apiOption[] = []; // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）
  bus_type_Option: apiOption[] = []; // 業種-大分類代碼
  tlt_name_Option: any[] = []; //品牌
  // cus_uniform_Option: POS2013[] = []; // 廠商統一編號(pos2013) // 20250926更新: 不採用，並非合約裡的統一編號
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

    const PC_id = this.dataForm.get('id')?.value;
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
      if (this.crudstatus != CRUDStatus.Create)
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
    console.log('讀取資料', this.dataForm.value);

    // 訂閱 cus_uniform_id 有應到的POS2013就填寫其他欄位
    this.dataForm.get('cus_uniform_id')?.valueChanges.pipe(
      untilDestroyed(this)
    ).subscribe(value => {
      if (this.skipValueChanges) return;
      const cusType = this.dataForm.get('cus_type')?.value;

      // 身分證：自動將首碼轉大寫
      if (cusType === '2' && value && typeof value === 'string' && value[0] !== value[0]?.toUpperCase()) {
        this.dataForm.get('cus_uniform_id')?.setValue(value[0].toUpperCase() + value.slice(1), { emitEvent: false });
        return;
      }

      // 統編：查詢廠商資料
      if (cusType !== '1') return;
      if (value && value.length >= 8) {
        this.fetchVendorData(value);
      }
    });

    // 最後設為 false，代表資料已匯入完成，之後就會開始觸發 valueChanges
    this.skipValueChanges = false;
    // 依目前 cus_type 補上正確的 validator（Edit 模式不會觸發 valueChanges，需手動初始化）
    this.applyCusTypeValidators(this.dataForm.get('cus_type')?.value || '1');
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 有輸入明細就必須輸入其他商場(other_shop): 防止user誤輸入
    if (this.potentialDetail.length > 0) {
      // 找出是否有空白的其他商場欄位
      const hasEmptyOtherShop = this.potentialDetail.some(
        d => !d.other_shop || d.other_shop.trim() === ''
      );

      if (hasEmptyOtherShop) {
        this.messageService.errorBubble('不允許輸入空的 其他商場 名稱');
        return;
      }
    }

    //將新的資料id指定為null
    const processedDetail = this.potentialDetail.map(item => {
      // 刪除 key 為空字串的欄位
      if ("" in item) {
        delete item[""];
      }

      if (item.status === 'new') {
        return { ...item, id: null }; // 把新項目的 id, PC_id 改為 null
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
          this.tls12010Service.insertTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
            this.potentialDetail = []; // 清除明細
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update:', JSON.stringify(body, null, 2));
          console.log('detail', this.potentialDetail);
          this.tls12010Service.updateTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
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
    if (this.crudstatus == CRUDStatus.Create)
      this.potentialDetail = []; // 清除明細
    if (this.crudstatus == CRUDStatus.Edit) {
      console.log('還原明細', this.org_potentialDetail);
      // ✅ 修改這裡：確保還原回去的是全新的物件複本
      this.potentialDetail = JSON.parse(JSON.stringify(this.org_potentialDetail));
    }
  }

  // 讀取dopropdown選項
  loadOptions() {
    // 查詢 接待人員
    this.tls12010Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 名稱
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '-' + item.Name //標籤
      }));
      console.log('接待人員代號:', this.contact_USR_Option);

      //2025/10/30: 加入規則: 新增模式 將接洽人員自動帶入登入者
      if (this.crudstatus == CRUDStatus.Create) {
        const userInfo = this.authService?.getUserInfo?.();
        console.log('登入用戶', userInfo);
        if (this.contact_USR_Option && userInfo) { //接待人員清單存在就自動帶入
          // 找出登入者在下拉選項中的對應值
          const matchedUser = this.contact_USR_Option.find(
            (u: apiOption) =>
              u.No === userInfo.user_No || u.Name === userInfo.user_Name
          );

          if (matchedUser) {
            this.dataForm.get('contact_USR_No')?.setValue(matchedUser.No);
            this.dataForm.get('contact_USR_Name')?.setValue(matchedUser.Name);
            console.log('自動帶入接洽人員:', matchedUser);
          } else {
            console.log('登入者不在接洽人員清單中:');
          }
        }
      }
    });

    // 查 大分類(專櫃)
    this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.bus_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 大分類(專櫃) 號
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('大分類代號:', this.bus_type_Option);
    });

    // 查 品牌
    this.tls12010Service.queryPLULOGO_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.tlt_name_Option = response.Data.map((item: any) => ({
        No: item.No, // 品牌主代碼
        Name: item.Name, //品牌名稱
        LOGO_EN_NAME: item.LOGO_EN_NAME, // 品牌英文名稱
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
      console.log('品牌代碼:', this.tlt_name_Option);
    });

    // 查 經營方式
    this.tls12010Service.querySYS1000_DropDownList({ "SYS_Type": 'T117' }).pipe(untilDestroyed(this)).subscribe((response) => {
      this.business_type_Option = response.Data.map((item: any) => ({
        No: item.No, // 經營方式 代碼
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('經營方式代號:', this.business_type_Option);
    });

    // 查詢 接待人員
    this.tls12010Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 代碼
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('接洽人員代號:', this.contact_USR_Option);
    });

    // 統一編號下拉目前 CRU 頁未使用，保留呼叫供未來擴充
  }

  // 讀取明細資料
  async loadDetailData(PC_id: string): Promise<void> {
    console.log('要求PC_id資料:', PC_id);
    this.tls12010Service.queryTLS12010_Detail({ "PC_id": PC_id }).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === '0000') {
        const data = response.Data.map((item: any) => ({
          ...item,
          status: 'original',
        }));
        this.potentialDetail = data;

        // ✅ 修改這裡：使用深拷貝備份，避免物件引用連動
        this.org_potentialDetail = JSON.parse(JSON.stringify(data));

        console.log('取得明細資料:', this.potentialDetail);
      } else {
        this.messageService.errorBubble(`讀取失敗: ${response.Message}`);
      }
    });
  }

  //接待人員變化
  onUSR_NoChange(id: string): void {
    // contact_USR_Option 有對應的No 就將Name寫入 contact_USR_Name
    const selectedUSR = this.contact_USR_Option.find(item => item.No === id);
    if (selectedUSR) {
      this.dataForm.get('contact_USR_Name')?.setValue(selectedUSR.Name);
    } else {
      // 若找不到，清空欄位或保留原值，看你的需求
      this.dataForm.get('contact_USR_Name')?.setValue('');
    }
  }

  // 統編變化
  fetchVendorData(uniformId: string) {
    const body = {
      VEN_Flag: "1",
      VEN_Uniform: uniformId
    };

    this.tls12010Service.queryTLS12010_POS2013(body).pipe(
      untilDestroyed(this)
    ).subscribe({
      next: (response) => {
        // Assuming the API returns a list and we take the first match
        if (response && response.Data && response.Data.length > 0) {
          const vendor = response.Data[0];

          console.log('統編變化查詢結果', response.Data);

          // 將 API 結果寫入表單對應欄位
          this.dataForm.patchValue({
            VEN_Name: vendor.VEN_Name || null, // 廠商名稱(中文) 
            VEN_EngName: vendor.VEN_EngName || null, // 廠商名稱(英文)

            VEN_BossTel: vendor.VEN_Tel || null,         // 廠商聯絡人電話 (對應 API 的公司電話)
            VEN_BossTitle: vendor.CHARGE_TITLE || null,         // 廠商聯絡人頭銜
            VEN_BossFax: vendor.VEN_Fax || null,         // 廠商聯絡人傳真
            VEN_BossEmail: vendor.VEN_Email || null,     // 廠商聯絡人電子郵件

            VEN_Addr: vendor.VEN_GUIAddr || null,    // 郵寄地址
            VEN_Address: vendor.VEN_Address || null, // 公司營登地址

          }, { emitEvent: false }); // 使用 emitEvent: false 避免觸發其他連動

          // 更新快取，確保在切換類型時能還原資料
          this.cachedVendorData = {
            cus_uniform_id: uniformId,
            VEN_Name: vendor.VEN_Name || '',
            VEN_EngName: vendor.VEN_EngName || ''
          };
        }
      },
      error: (err) => {
        console.error('Failed to fetch vendor data', err);
      }
    });
  }

  // 只設 validator，不 reset 值；供 init 和 onCusTypeChange 共用
  private applyCusTypeValidators(type: string): void {
    const cus_uniform_id = this.dataForm.get('cus_uniform_id');
    const VEN_Name = this.dataForm.get('VEN_Name');
    const VEN_EngName = this.dataForm.get('VEN_EngName');
    if (!cus_uniform_id || !VEN_Name || !VEN_EngName) return;

    switch (type) {
      case '1':
        cus_uniform_id.setValidators([Validators.required, Validators.maxLength(8), (ctrl) => this.validationService.companyIdValidator(ctrl)]);
        break;
      case '2':
        cus_uniform_id.setValidators([Validators.required, Validators.maxLength(10), (ctrl) => this.validationService.idCardValidator(ctrl, true)]);
        break;
      default:
        cus_uniform_id.setValidators([Validators.required, Validators.maxLength(16)]);
        break;
    }
    VEN_Name.setValidators([Validators.required, Validators.maxLength(100)]);
    VEN_EngName.setValidators([Validators.maxLength(100)]);
    cus_uniform_id.updateValueAndValidity();
    VEN_Name.updateValueAndValidity();
    VEN_EngName.updateValueAndValidity();
  }

  // 廠商類型 radio button 連動的驗證器變化
  onCusTypeChange(type: string): void {
    const cus_uniform_id = this.dataForm.get('cus_uniform_id');
    const VEN_Name = this.dataForm.get('VEN_Name');
    const VEN_EngName = this.dataForm.get('VEN_EngName');

    if (!cus_uniform_id || !VEN_Name || !VEN_EngName) return;

    this.applyCusTypeValidators(type);

    switch (type) {
      case '1': // 統編
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
        cus_uniform_id.setValue('');
        VEN_Name.setValue('');
        VEN_EngName.setValue('');
        break;

      case '3': // 員工id
        {
          const userNo = this.authService.getUserInfo()?.user_No ?? ''
          const userName = this.authService.getUserInfo()?.user_Name ?? ''
          if (userNo && userName) {
            cus_uniform_id.enable();
            cus_uniform_id.setValue(userNo);
            VEN_Name.setValue(userName);
            VEN_EngName.setValue('');
          } else {
            this.messageService.errorBubble('錯誤: 無法取得用戶資訊');
          }
          break;
        }
      default:
        break;
    }
  }

  // --潛在明細檔 操作---
  //HTML 顯示的明細資料
  get filteredDetail(): Potential_Customer_Detail[] {
    return this.potentialDetail.filter(item => item.status !== 'deleted');
  }
  //---potential明細編輯事件---
  onRowSaveDetail(event: any) {
    this.tls12010DetailService.handleRowSave(event);
  }
  onRowCancelDetail(event: any) {
    this.tls12010DetailService.handleRowCancel(event);
  }
  // 新增 潛在明細檔
  onAddDetail() {
    this.tls12010DetailService.addPotential(this.potentialDetail, this.defaultNewDetail, this.detailTable);
  }

  // 批次刪除 潛在明細檔
  onBatchDeleteDetail(selectedItems: any[]): void {
    // this.tls12010DetailService.deletePotential(selectedItems, this.potentialDetail);
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選欲刪除的項目');
      return;
    }

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除選中的 ${selectedItems.length} 個其他商場項目？`,
      accept: () => {
        // 呼叫 Service 執行刪除邏輯（將狀態改為 deleted 或從陣列移除）
        this.tls12010DetailService.deletePotential(selectedItems, this.potentialDetail);

        // 刪除成功後提示 (選用)
        this.messageService.successBubble('已刪除');
      },
    });
  }
}
