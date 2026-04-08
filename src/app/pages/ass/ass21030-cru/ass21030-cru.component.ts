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
    ENG_YYMM: ['' as string | Date, [Validators.required, Validators.maxLength(6)]], // 結算年月
    ENG_Type: ['', [Validators.required, Validators.maxLength(3)]], // 能源類型
    ENG_MeterNo: ['', [Validators.required, Validators.maxLength(5)]], // 錶號
    ENG_Date: ['' as string | Date], // 抄表日期
    UsageAmount: [0, [Validators.max(9999999999)]], // 使用度數 (最多小數後4位)
    ENG_Amount: [0, [Validators.max(9999999999)]], // 結算金額
    ENG_ImpFileName: [''], // 匯入檔案名稱
    ENG_Status: ['0'], // 結算狀態 (預設為 0:未結算)
    CRT_Date: [''], // 建立日期 (預設當前日期)
    CRT_USR_No: [''], // 建立人員代碼
    CRT_USR_Name: [''], // 建立人員姓名
    UPD_Date: [''], // 變更日期
    UPD_USR_No: [''], // 變更人員代碼
    UPD_USR_Name: [''], // 變更人員姓名
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
    this.setupEditPermissions(); // 設置編輯權限
    this.setDefaultValues(); // 設置預設值
    this.formatDateFields(); // 格式化日期欄位
    this.setupFieldLocking(); // 鎖定除了使用度數和結算金額以外的欄位

    console.log('🔍 CRU 初始化 - 原始 rowdata:', this.rowdata);
    console.log('🔍 CRU 初始化 - 表單值:', this.dataForm.value);
    console.log('🔍 ENG_Type 值:', this.dataForm.controls.ENG_Type.value);
  }

  // 設置預設值 (僅新增模式)
  setDefaultValues() {
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.patchValue({
        CRT_Date: this.getCurrentDateString(),
        CRT_USR_No: this.authService.currentUserValue?.user_No || '',
        CRT_USR_Name: this.authService.currentUserValue?.user_Name || ''
      });
    }
  }

  // 格式化日期欄位為 YYYY/MM/DD 格式
  formatDateFields() {
    const crtDate = this.dataForm.controls.CRT_Date.value;
    const updDate = this.dataForm.controls.UPD_Date.value;

    if (crtDate && typeof crtDate === 'string' && crtDate.includes('-')) {
      this.dataForm.controls.CRT_Date.setValue(this.formatDateStringToDisplay(crtDate));
    }

    if (updDate && typeof updDate === 'string' && updDate.includes('-')) {
      this.dataForm.controls.UPD_Date.setValue(this.formatDateStringToDisplay(updDate));
    }
  }

  // 取得當前日期字串 (YYYY/MM/DD)
  private getCurrentDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  // 將 ISO 日期字串或 datetime 字串轉換為 YYYY/MM/DD 格式
  private formatDateStringToDisplay(dateStr: string): string {
    if (!dateStr) return '';

    // 處理可能的格式: "2021-05-29", "2021-05-29 20:09:31", "2021-05-29T20:09:31"
    const datePart = dateStr.split(' ')[0].split('T')[0]; // 取得日期部分
    const [year, month, day] = datePart.split('-');

    return `${year}/${month}/${day}`;
  }

  // 設置編輯權限：僅結算狀態=0時允許修改使用度數和結算金額
  setupEditPermissions() {
    // 監聽結算狀態變更
    this.dataForm.controls.ENG_Status.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(status => {
        this.updateFieldPermissions(status);
      });
  }

  // 根據結算狀態更新欄位權限
  updateFieldPermissions(status: string) {
    const isSettled = status === '1'; // 已結算

    if (this.crudstatus === CRUDStatus.Edit) {
      if (isSettled) {
        // 已結算時，禁用編輯
        this.dataForm.controls.UsageAmount.disable();
        this.dataForm.controls.ENG_Amount.disable();
      } else {
        // 未結算時，允許編輯
        this.dataForm.controls.UsageAmount.enable();
        this.dataForm.controls.ENG_Amount.enable();
      }
    }
  }

  // 鎖定除了使用度數和結算金額以外的所有欄位（僅在編輯模式）
  setupFieldLocking() {
    if (this.crudstatus === CRUDStatus.Edit) {
      // 鎖定所有欄位，除了 UsageAmount 和 ENG_Amount
      this.dataForm.controls.ENG_YYMM.disable();
      this.dataForm.controls.ENG_Type.disable();
      this.dataForm.controls.ENG_MeterNo.disable();
      this.dataForm.controls.ENG_Date.disable();
      // UsageAmount 和 ENG_Amount 根據結算狀態決定
      // 在 updateFieldPermissions 中處理

      // 觸發一次權限更新（根據當前結算狀態）
      const currentStatus = this.dataForm.controls.ENG_Status.value;
      this.updateFieldPermissions(currentStatus);
    }
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

    // 如果 ENG_Type 是中文，轉換回代碼
    if (cleaned.ENG_Type) {
      const typeOption = this.ENG_Type_Option.find(opt => opt.label === cleaned.ENG_Type);
      if (typeOption) {
        cleaned.ENG_Type = typeOption.value;
      }
    }

    // 如果 ENG_Status 是中文，轉換回代碼
    if (cleaned.ENG_Status) {
      const statusOption = this.ENG_Status_Option.find(opt => opt.label === cleaned.ENG_Status);
      if (statusOption) {
        cleaned.ENG_Status = statusOption.value;
      }
    }

    // 將 UsageAmount 轉換為 ENG_CurrentReading (後端接收的參數名稱)
    if (cleaned.UsageAmount !== undefined) {
      cleaned.ENG_CurrentReading = cleaned.UsageAmount;
      delete cleaned.UsageAmount;
    }

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
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo, // 能源表號
        Name: item.ENG_MeterNo,
      }));
      console.log('能源表號代號:', response.Data);
    });
  }

}
