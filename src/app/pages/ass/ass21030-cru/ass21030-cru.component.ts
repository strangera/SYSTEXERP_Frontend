// --Commonly used imports--
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';


import { untilDestroyed } from '@ngneat/until-destroy';
import { ASS21030Service } from '@service/api/ass/ass21030.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { apiOption } from '@shared/models/tls/tls000.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { option } from '../../../shared/models/sys/sysb000.model';

// ENG2001 抄錶明細檔
export interface ENG2001 {
  ID: number; // 主鍵，自動編號,
  ENG_Type: string, // 能源類型：水錶G01、電錶G02、瓦斯錶G03
  ENG_MeterNo: string, // 錶號
  Location_No: string, // 設備位置編號，對應 POS2002.LOCATION_No
  TLT_No: string, // 專櫃編號，對應 POS2002.TLT_No
  ENG_YYMM: string, // 結算年月
  ENG_CurrentReading_Last: number, // 上次抄錶度數
  ENG_CurrentReading: number, // 本次抄錶度數
  UsageAmount: number; // 用量
  ENG_Date: Date; // 本次抄錶日
  ENG_ImpFileName?: string; // 匯入檔案名稱
  ENG_Remark?: string; // 備註

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No?: string; // 建立人員代碼
  CRT_USR_Name?: string; // 建立人員姓名
  UPD_Date?: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No?: string; // 變更人員代碼
  UPD_USR_Name?: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
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
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    MenubarComponent,
    MultiSelectComponent
  ]
})

// 能源抄表作業
export class ASS21030CRUComponent extends BasicCruPageComponent<ENG2001> implements OnInit {
  // ----------------------------------------------------------------
  ENG_MeterNo_Option: apiOption[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    // ENG1001 能源錶號明細檔 + ENG2001 抄錶明細檔
    ID: [''], // ID (隱藏)
    Mid: [Number(this.authService.getUserInfo()?.mid)], // Mid (隱藏)
    // SYS_StoreNo: ['', [Validators.maxLength(10)]], // 分店編號
    ENG_YYMM: ['', [Validators.required, Validators.maxLength(6)]], // 結算年月
    ENG_Type: ['', [Validators.required, Validators.maxLength(3)]], // 能源類型
    ENG_MeterNo: ['', [Validators.required, Validators.maxLength(5)]], // 錶號
    ENG_Date: [''], // 本次抄錶日
    ENG_CurrentReading: [0, [Validators.max(9999999999)]], // 本次抄錶度數 (最多小數後4位)
    ENG_Amount: [0, [Validators.max(9999999999)]], // 本次結算金額
    CRT_Date: [''], // 建立日期
    CRT_USR_No: [''], // 建立人員代碼 (隱藏)
    CRT_USR_Name: [''], // 建立人員姓名 (隱藏)
    UPD_Date: [''], // 變更日期 (隱藏)
    UPD_USR_No: [''], // 變更人員代碼 (隱藏)
    UPD_USR_Name: [''], // 變更人員姓名 (隱藏)
  });

  //
  ENG_Type_Option: option[] = [ // 能源類型選項
    { value: 'G01', label: '水錶' },
    { value: 'G02', label: '電錶' },
    { value: 'G03', label: '瓦斯錶' }
  ];
  ENG_Status_Option: option[] = [ // 抄錶狀態選項
    { value: '0', label: '未結算' },
    { value: '1', label: '已結算' }
  ];

  // ----------------------------------------------------------------
  constructor(private ass21030Service: ASS21030Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS21030', this.dataForm);
    this.loadOptions();

    console.log('取得資料', this.dataForm.value);
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();

    // 清理空字串,轉換為 null (符合後端 Nullable 型別)
    const cleanedData = this.cleanFormData(formValue);

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert:', JSON.stringify(cleanedData, null, 2));
          this.ass21030Service.updateASS21030(cleanedData).subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset();
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update:', JSON.stringify(cleanedData, null, 2));
          this.ass21030Service.updateASS21030(cleanedData).subscribe(() => {
            this.messageService.successBubble('更新成功');
            this.onCancel();
          });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 新增一個清理方法
  private cleanFormData(data: any): any {
    const cleaned = { ...data };

    // 將空字串轉換為 null
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '') {
        cleaned[key] = null;
      }
    });

    return cleaned;
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
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo, // 能源表號
        Name: item.ENG_MeterNo,
      }));
      console.log('能源表號代號:', response.Data);
    });
  }
}
