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
    ENG_Date: ['' as string | Date], // 本次抄錶日
    ENG_CurrentReading: [0, [Validators.max(9999999999)]], // 本次抄錶度數 (最多小數後4位)
    ENG_Amount: [0, [Validators.max(9999999999)]], // 本次結算金額
    CRT_Date: [''], // 建立日期
    CRT_USR_No: [''], // 建立人員代碼 (隱藏)
    CRT_USR_Name: [''], // 建立人員姓名 (隱藏)
    UPD_Date: [''], // 變更日期 (隱藏)
    UPD_USR_No: [''], // 變更人員代碼 (隱藏)
    UPD_USR_Name: [''], // 變更人員姓名 (隱藏)
    ENG_LastReadingDate: [null as string | Date | null], // 上次抄錶日
    ENG_CurrentReading_Last: [0, [Validators.max(9999999999)]], // 上次抄錶度數
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
    this.setupMeterNoListener(); // 設置錶號監聽

    console.log('取得資料', this.dataForm.value);
  }

  // 監聽錶號變更,自動帶入上次抄表資料
  setupMeterNoListener() {
    this.dataForm.controls.ENG_MeterNo.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(meterNo => {
        if (meterNo) {
          if (this.crudstatus === CRUDStatus.Create) {
            // 新增模式: 取得最新一筆
            this.fetchLatestReading(meterNo);
          } else if (this.crudstatus === CRUDStatus.Edit) {
            // 編輯模式: 取得上一期
            this.fetchPreviousReading(meterNo);
          }
        } else {
          // 清空錶號時，也清空上次抄表資料
          this.dataForm.patchValue({
            ENG_LastReadingDate: null,
            ENG_CurrentReading_Last: 0
          });
        }
      });

    // 監聽能源類型變更，如果已選擇錶號則重新取得資料
    this.dataForm.controls.ENG_Type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const meterNo = this.dataForm.controls.ENG_MeterNo.value;
        if (meterNo) {
          if (this.crudstatus === CRUDStatus.Create) {
            this.fetchLatestReading(meterNo);
          } else if (this.crudstatus === CRUDStatus.Edit) {
            this.fetchPreviousReading(meterNo);
          }
        }
      });

    // 監聽結算年月變更，如果是編輯模式且已選擇錶號則重新取得資料
    this.dataForm.controls.ENG_YYMM.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (this.crudstatus === CRUDStatus.Edit) {
          const meterNo = this.dataForm.controls.ENG_MeterNo.value;
          if (meterNo) {
            this.fetchPreviousReading(meterNo);
          }
        }
      });
  }

  // 取得最新抄表記錄 (新增時使用)
  fetchLatestReading(meterNo: string) {
    const mid = this.dataForm.controls.Mid.value;
    const engType = this.dataForm.controls.ENG_Type.value;

    // 確保有必要的參數
    if (!engType) {
      this.messageService.warnBubble('請先選擇能源類型');
      return;
    }

    const requestBody = {
      Mid: mid,
      ENG_Type: engType,
      ENG_MeterNo: meterNo
    };

    this.ass21030Service.getLatestReading(requestBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data) {
            // 自動帶入最新抄表資料
            this.dataForm.patchValue({
              ENG_LastReadingDate: response.Data.ENG_LastReadingDate,
              ENG_CurrentReading_Last: response.Data.ENG_LastReading
            });
            console.log('已自動帶入最新抄表記錄:', response.Data);
          } else {
            // 沒有歷史記錄,清空欄位
            this.dataForm.patchValue({
              ENG_LastReadingDate: null,
              ENG_CurrentReading_Last: 0
            });
            console.log('查無該錶號的歷史抄表記錄');
          }
        },
        error: (error) => {
          console.error('取得最新抄表記錄失敗:', error);
          // 清空欄位
          this.dataForm.patchValue({
            ENG_LastReadingDate: null,
            ENG_CurrentReading_Last: 0
          });
        }
      });
  }

  // 取得上一期抄表記錄 (編輯時使用)
  fetchPreviousReading(meterNo: string) {
    const mid = this.dataForm.controls.Mid.value;
    const engType = this.dataForm.controls.ENG_Type.value;
    const engYYMM = this.dataForm.controls.ENG_YYMM.value;

    // 確保有必要的參數
    if (!engType || !engYYMM || engYYMM === '') {
      console.log('缺少必要參數');
      return;
    }

    // 將 Date 物件轉換為 YYYYMM 格式字串
    let formattedYYMM = '';
    if (engYYMM instanceof Date) {
      const year = engYYMM.getFullYear();
      const month = String(engYYMM.getMonth() + 1).padStart(2, '0');
      formattedYYMM = `${year}${month}`;
    } else if (typeof engYYMM === 'string') {
      formattedYYMM = engYYMM;
    }

    const requestBody = {
      Mid: mid,
      ENG_Type: engType,
      ENG_MeterNo: meterNo,
      CurrentYYMM: formattedYYMM
    };

    this.ass21030Service.getPreviousReading(requestBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data) {
            // 自動帶入上一期抄表資料
            this.dataForm.patchValue({
              ENG_LastReadingDate: response.Data.ENG_PreviousReadingDate,
              ENG_CurrentReading_Last: response.Data.ENG_PreviousReading
            });
            console.log('已自動帶入上一期抄表記錄:', response.Data);
          } else {
            // 沒有上一期記錄,清空欄位
            this.dataForm.patchValue({
              ENG_LastReadingDate: null,
              ENG_CurrentReading_Last: 0
            });
            console.log('查無上一期抄表記錄');
          }
        },
        error: (error) => {
          console.error('取得上一期抄表記錄失敗:', error);
          // 清空欄位
          this.dataForm.patchValue({
            ENG_LastReadingDate: null,
            ENG_CurrentReading_Last: 0
          });
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 新增模式下的額外驗證
    if (this.crudstatus === CRUDStatus.Create) {
      // 驗證本次抄表度數不可小於上次抄表度數
      const currentReading = this.dataForm.controls.ENG_CurrentReading.value;
      const lastReading = this.dataForm.controls.ENG_CurrentReading_Last.value;
      if (currentReading < lastReading) {
        this.messageService.warnBubble('本次抄表度數不可小於上次抄表度數');
        this.messageService.unblockUi();
        return;
      }

      // 驗證本次抄表日期不可小於上次抄表日期
      const currentDate = this.dataForm.controls.ENG_Date.value;
      const lastDate = this.dataForm.controls.ENG_LastReadingDate.value;
      if (currentDate && lastDate) {
        const currentDateTime = currentDate instanceof Date ? currentDate.getTime() : new Date(currentDate).getTime();
        const lastDateTime = lastDate instanceof Date ? lastDate.getTime() : new Date(lastDate).getTime();

        if (currentDateTime < lastDateTime) {
          this.messageService.warnBubble('本次抄表日期不可小於上次抄表日期');
          this.messageService.unblockUi();
          return;
        }
      }
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
    this.ass21030Service.queryENG1001_ENG_MeterNo_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.ENG_MeterNo_Option = response.Data.map((item: any) => ({
        No: item.ENG_MeterNo, // 能源表號
        Name: item.ENG_MeterNo,
      }));
      console.log('能源表號代號:', response.Data);
    });
  }
}
