import { ValidationService } from '@shared/service/validation.service';
import { Tls41030Service } from './../../../service/api/tls/tls41030.service';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

interface POS2001 {
  id: number;
  USR_No: string; // 收銀員編號
  USR_Name: string; //收銀員姓名
  USR_Passwd: string; // 密碼
  USR_Level: string; // 收銀鍵盤等級(編號)
  USR_Auth: string; // 收銀員授權等級，預設值為0
  USR_JobStatus: string; // 收銀員(在職)狀態，J=在職(預設值)、Q=離職
  USR_Class: string; // 收銀員等級，R=一般(預設值)、M=店長、S=系統管理者
  USR_RegType: string; // 收銀員區分，2=獨立收銀(預設值)、1=集中收銀
  USR_TLT_No: string; // 收銀員所屬櫃編
  USR_TLT_Name: string; // 收銀員所屬專櫃名稱
  USR_OnJobDate: string; // 啟用(到職)日期
  USR_QuitDate: string; // 停用(離職)日期
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: Date; // 變更日期
  UPD_USR_No: string; // 變更人員
  UPD_USR_Name: string; // 變更人員姓名

  CanDel: boolean; //能否刪除 僅顯示
}


// 2.4.1.3 收銀專櫃人員資料維護作業 CRU
@Component({
  selector: 'app-tls41030-cru',
  templateUrl: './tls41030-cru.component.html',
  styleUrl: './tls41030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TranslateModule,
  ]
})
export class TLS41030CRUComponent extends BasicCruPageComponent<POS2001>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // decimal(19, 0)
    USR_No: ['', [Validators.required, Validators.maxLength(8), this.validationService.numberValidator]], // 收銀員編號
    USR_Name: ['', [Validators.required, Validators.maxLength(20)]], // 收銀員姓名
    USR_Passwd: ['', [Validators.required, Validators.maxLength(20), this.validationService.englishNumberSymbolValidator]], // 密碼 (要顯示嗎，待確認) //只能輸入半形英文、數字和特殊符號
    USR_Level: ['0', [Validators.required, Validators.maxLength(6), this.validationService.alphanumericValidator]], // 收銀鍵盤等級(編號)，預設值為0 //只能輸入半形英文、數字
    USR_Auth: [0, [Validators.required, Validators.maxLength(6), this.validationService.numberValidator]], // 收銀員授權等級，預設值為0

    USR_JobStatus: ['J', [Validators.required, Validators.maxLength(2)]], // 收銀員在職狀態
    USR_Class: ['R', [Validators.required, Validators.maxLength(2)]], // 收銀員等級
    USR_RegType: ['2', [Validators.required, Validators.maxLength(2)]], // 收銀員區分
    USR_TLT_No: ['', [Validators.maxLength(20)]], // 所屬櫃編（可選）
    USR_TLT_Name: ['', [Validators.maxLength(60)]], // 所屬專櫃名稱（可選) ---目前沒有顯示在畫面，當櫃編變化後會重新寫入
    USR_OnJobDate: [null], // 到職日（可選）
    USR_QuitDate: [null], // 離職日（可選
  });
  //
  jobStatusOption: option[] = [ // 收銀員(在職)狀態 選單
    { value: 'J', label: '在職' }, // 預設值
    { value: 'Q', label: '離職' },
  ];

  classOption: option[] = [ // 收銀員等級 選單
    { value: 'R', label: '一般' }, // 預設值
    { value: 'M', label: '店長' },
    { value: 'S', label: '系統管理者' }
  ];

  regTypeOption: option[] = [ // 收銀員區分 選單
    { value: '2', label: '獨立收銀' }, // 預設值
    { value: '1', label: '集中收銀' },
  ];

  TLTOption: apiOption[] = []; //專櫃下拉選單
  // ----------------------------------------------------------------
  constructor(
    private tls41030Service: Tls41030Service,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS41030', this.dataForm);
    this.loadOptions();
    console.log('讀取資料', this.dataForm.value);

    if (this.crudstatus !== CRUDStatus.Create) { //非編輯模式不可變更 收銀員編號
      this.dataForm.get('USR_No')?.disable();
    }

    // 專櫃選單變更時，更新專櫃名稱欄位
    this.dataForm.get('USR_TLT_No')?.valueChanges.subscribe(selectedNo => {
      const matched = this.TLTOption.find(opt => opt.No === selectedNo);
      if (matched) {
        this.dataForm.get('USR_TLT_Name')?.setValue(matched.Name);
      } else {
        this.dataForm.get('USR_TLT_Name')?.setValue('');
      }
    });
  }

  //---0710規格更新--
  // 密碼都明碼
  // 支援明碼查詢
  //-----
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
          console.log('insert', formValue);
          this.tls41030Service.insertTLS41030(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        } else {
          console.log('沒有權限');
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.tls41030Service.updateTLS41030(formValue).subscribe(() => {
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

  loadOptions() {
    //查詢 專櫃主檔 下拉選單
    this.tls41030Service
      .queryTLTTALENT_DropDownList({})
      .subscribe((response) => {
        this.TLTOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('專櫃主檔:', this.TLTOption);
      });
  }
}
