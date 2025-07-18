import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
//
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

export interface Potential_Customer {
  id: number; // 主鍵，自動編號

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

// 2.1.2.1 潛在客戶資料維護CRU
@Component({
    selector: 'app-tls12010-cru',
    templateUrl: './tls12010-cru.component.html',
    styleUrl: './tls12010-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, EditorTextComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS12010CRUComponent extends BasicCruPageComponent<Potential_Customer> implements OnInit {
  // ----------------------------------------------------------------
    dataForm = this.formBuilder.nonNullable.group({
        // Potential_Customer 潛在客戶主檔
        // id: number; // 主鍵，自動編號
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

        //---以下為 Potential_Customer_Detail 潛在客戶其他資料明細檔(先用欄位，晚點換成一張table)---
        other_shop: ['',[Validators.required, Validators.maxLength(30)]],  // 其他商場
        shop_area: [0,[Validators.required, Validators.maxLength(7)]],  // 面積
        total_amt: [0,[Validators.required, Validators.min(0)]],  // 營業額

        CRT_Date: [{ value: null, disabled: true }], // 建立日期
    });
    //
    cus_type_Option: option[] = [ // 廠商類型（1=統編、2=身份證、3=員工ID）
      {value: '1', label: '統編'},
      {value: '2', label: '身份證'},
      {value: '3', label: '員工ID'}
    ];
  
    business_type_Option: apiOption[] = []; // 經營方式(SYS1000.T117)（長度1，1=生產者、2=代理商、3=經銷商、4=其它）
    bus_type_Option: apiOption[] = []; // 業種-大分類代碼
    tlt_name_Option: apiOption[] = []; //品牌
    cus_uniform_Option: apiOption[] = []; // 廠商統一編號(pos2013)  -- 等候端提供 (必須包含No、Name、EName)
    contact_USR_Option: apiOption[] = [  // 接洽人員代碼/名稱 -- 等候端提供
      {No: '123',Name:'張三',Label: '123-張三'}
    ];
    // ----------------------------------------------------------------
    constructor(
      private validationService: ValidationService,
      private tls12010Service: Tls12010Service) {
      super(); // 呼叫父類建構子
    }
  
    ngOnInit(): void {
      this.initializePage('TLS12010', this.dataForm);
      this.loadOptions();
      this.onCusTypeChange(this.dataForm.get('cus_type')?.value || '1'); // 廠商類型radio button的檢核

      // 觀察 廠商類型（cus_type) 改變
      this.dataForm.get('cus_type')?.valueChanges.subscribe(value => {
        this.onCusTypeChange(value);
      });

      // 在統邊模式(cus_type == '1')時，觀察 廠商統一編號 下拉 （cus_type) 改變
      this.dataForm.get('cus_uniform_id')?.valueChanges.subscribe(value => {
      if (this.dataForm.get('cus_type')?.value === '1') {
        // 找到 cus_uniform_Option 中符合的項目
        const match = this.cus_uniform_Option.find(opt => opt.No === value);

        if (match) {
          // 自動帶入名稱
          this.dataForm.get('VEN_Name')?.disable();
          this.dataForm.get('VEN_Name')?.setValue(match.Label ? (match.Label.split('/')[1] || '') : '');
        } else {
          // 若找不到對應選項，清空 VEN_Name，並跳出警告
          this.dataForm.get('VEN_Name')?.setValue('');
          // this.messageService.errorBubble('無該廠商名稱資料');
        }
      }
    });

      
      console.log('讀取資料', this.dataForm.value);
    }
  
    onSubmit(frm: FormGroup) {
      this.messageService.blockUi();
      this.submitted = true;
  
      if (this.dataForm.invalid) {
        this.messageService.unblockUi();
        return;
      }
  
      const formValue = frm.getRawValue();
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('insert', frm.value);
            // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            //   this.dataForm.reset(); // 重置表單
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('update', formValue);
            // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
            //   // this.messageService.successBubble('更新成功');
            //   this.onCancel(); // 儲存後，會返回列表
            // });
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
      // 查 大分類
        this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).subscribe((response) => {
          this.bus_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 收銀機號
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
        this.tls12010Service.queryPOS2013_DropDownList({}).subscribe((response) => {
          this.cus_uniform_Option = response.Data.map((item: any) => ({
            No: item.No, // 統編代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('統編代號:', response.Data);
        });
        // 查 經營方式
         this.tls12010Service.querySYS1000_DropDownList({"SYS_Type": 'T117'}).subscribe((response) => {
          this.business_type_Option = response.Data.map((item: any) => ({
            No: item.No, // 經營方式 代碼
            Label: item.No + '/' + item.Name, // 組合成顯示用的Label
          }));
          console.log('經營方式代號:', this.business_type_Option);
        });
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
          cus_uniform_id.enable();
          VEN_Name.enable();

          cus_uniform_id.setValue('');
          VEN_Name.setValue('');
          VEN_EngName.setValue('');

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
}
