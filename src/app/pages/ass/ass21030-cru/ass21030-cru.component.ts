import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { option } from '../../../shared/models/sys/sysb000.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

// ENG2001 抄錶明細檔
export interface ENG2001 {
  id: number; // 主鍵，自動編號,
  mid: number,  // 外鍵，對應 ENG2001.id
  SYS_StoreNo: string, // 分店編號
  ENG_YYMM: string, // 結算年月
  ENG_Type: string, // 能源類型：水錶G01、電錶G02、瓦斯錶G03
  ENG_MeterNo: string, // 錶號
  ENG_Date: Date; // 本次抄錶日
  ENG_CurrentReading: number; // 本次抄錶度數
  ENG_Amount: number; // 本次結算金額
  ENG_Status: string; // 抄錶狀態：0=未抄錶、1=已抄錶、2=已結算
  ENG_ImpFileName?: string; // 匯入檔案名稱

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
}

// ENG1001 能源錶號明細檔
export interface ENG1001 {
  id: number; // 主鍵，自動編號,
  mid: number,  // 外鍵，對應 ENG2001.id
  SYS_StoreNo: string, // 分店編號
  ENG_Type: string, // 能源類型：水錶G01、電錶G02、瓦斯錶G03
  ENG_MeterNo: string, // 錶號
  Location_No: string; // 設備位置編號，對應 POS2002.LOCATION_No
  ENG_Remarks?: string; // 備註

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名
}

@Component({
  selector: 'app-ass21030-cru',
  templateUrl: './ass21030-cru.component.html',
  styleUrl: './ass21030-cru.component.scss',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CalendarComponent,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ]
})
export class ASS21030CRUComponent extends BasicCruPageComponent<ENG1001|ENG2001> implements OnInit {
    // ----------------------------------------------------------------
    dataForm = this.formBuilder.nonNullable.group({
      // ENG1001 能源錶號明細檔 + ENG2001 抄錶明細檔
      ID: [{value: null, label:''}], // ID (隱藏)
      ENG_YYMM: ['', [Validators.required, Validators.maxLength(6)]], // 結算年月
      ENG_Type: ['', [Validators.required, Validators.maxLength(3)]], // 能源類型
      ENG_MeterNo: ['', [Validators.required, Validators.maxLength(5)]], // 錶號
      ENG_Date: ['', []], // 抄表日期
      ENG_CurrentReading: [0], // 本期抄錶度
      ENG_Amount: [0], // 本期抄錶金額
      SYS_StoreNo: ['', []], // 分店編號
      Mid: ['', []], // 外鍵

      CRT_Date: ['', []], // 建立日期
      CRT_USR_No: ['', []], // 建立人員代碼 (隱藏)
      CRT_USR_Name: ['', []], // 建立人員姓名 (隱藏)
      UPD_Date: ['', []], // 變更日期 (隱藏)
      UPD_USR_No: ['', []], // 變更人員代碼 (隱藏)
      UPD_USR_Name: ['', []], // 變更人員姓名 (隱藏)
    });
  
    //
    ENG_Type_Option: option[] = [ // 能源類型選項
      { value: 'G01', label: '水錶' },
      { value: 'G02', label: '電錶' },
      { value: 'G03', label: '瓦斯錶' }
    ];
    ENG_Status_Option: option[] = [ // 抄錶狀態選項
      { value: '0', label: '未抄錶' },
      { value: '1', label: '已抄錶' },
      { value: '2', label: '已結算' }
    ];
  
    // ----------------------------------------------------------------
    constructor(
      private validationService: ValidationService,
      private ass21030Service: ASS21030Service,
    ) {
      super(); // 呼叫父類建構子
    }
  
    ngOnInit(): void {
      this.initializePage('ASS21030', this.dataForm);
      this.loadOptions();

      console.log('取得資料',this.dataForm.value);
    }
  
    onSubmit(frm: FormGroup) {
      this.messageService.blockUi();
      this.submitted = true;
  
      if (this.dataForm.invalid) {
        this.messageService.unblockUi();
        return;
      }
  
      //都用匯入(import excel)的方式進行編輯
      const formValue = frm.getRawValue();
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('insert:', JSON.stringify(formValue, null, 2));
            // this.ass21030Service.insertASS21030(formValue).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            //   this.dataForm.reset(); // 重置表單
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('update:', JSON.stringify(formValue, null, 2));
            // this.ass21030Service.updateASS21030(formValue).subscribe(() => {
            //   this.messageService.successBubble('更新成功');
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
      // 查詢 接待人員
      // this.tls12010Service.queryTBLUSER_DropDownList({}).subscribe((response) => {
      //   this.contact_USR_Option = response.Data.map((item: any) => ({
      //     No: item.No, // 接待人員 代碼
      //     Name: item.Name, // 接待人員 名稱
      //     Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      //   }));
      //   console.log('接待人員代號:', this.contact_USR_Option);
      // });
    }
}
