import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { option } from '../../../shared/models/sys/sysb000.module';
import { ValidationService } from '../../../shared/service/validation.service';

export interface POS1002 {
  ID: number; // decimal(19,0)

  SYS_StoreNo: string; // 門市店號
  ECR_No: string;      // 收銀機號
  ECR_Name: string;    // 收銀機名稱
  ECR_Type: string;    // 機台類型（1=集中、2=專櫃、5=離線、7=它社）

  ECR_TLT_No?: string;     // 所屬專櫃編號（可選）
  ECR_TLT_Name?: string;   // 所屬專櫃名稱（可選）
  ECR_USR_No?: string;     // 所屬收銀員（可選）
  ECR_USR_Name?: string;   // 收銀員姓名（可選）

  ECR_ActiveDate?: Date;   // 啟用日期（可選）
  ECR_ExpireDate?: Date;   // 到期日期（可選）
  ECR_CloseDate?: Date;    // 停用日期（可選）

  ECR_Status?: string;     // 狀態：A=啟用、C=停用、S=強制停用、T=訓練（可選）
  ECR_GUI_Type: string;    // 發票使用類別：00/03/07

  ECR_GUI_PeriodQty?: number; // 每期電子發票配號數量（可選）
  ECR_GUI_MinQty?: number;    // 最小安全存量（可選）

  CRT_Date?: Date;        // 建立日期（可選）
  CRT_USR_No?: string;    // 建立人員（可選）
  CRT_USR_Name?: string;  // 建立人員姓名（可選）

  UPD_Date?: Date;        // 變更日期（可選）
  UPD_USR_No?: string;    // 變更人員（可選）
  UPD_USR_Name?: string;  // 變更人員姓名（可選）
}

// 2.4.1.5 發票訊息維護作業 CRU
@Component({
  selector: 'app-tls41050-cru',
  templateUrl: './tls41050-cru.component.html',
  styleUrl: './tls41050-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarComponent, DropdownComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, InputNumberComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS41050CRUComponent extends BasicCruPageComponent<POS1002>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 主鍵，decimal(19,0)
    SYS_StoreNo: [{ value: '', disabled: true }, [Validators.required]], // 收銀機所屬門市店號（不可新增/修改）
    ECR_No: [{ value: '', disabled: true }, [Validators.required]], // 收銀機號（不可新增/修改）
    ECR_Name: [{ value: '', disabled: true }, [Validators.required]], // 收銀機名稱（不可新增/修改）
    ECR_Type: [{ value: '', disabled: true }, [Validators.required]], // 機台類型（不可新增/修改）
    ECR_TLT_No: [{ value: '', disabled: true }], // 所屬專櫃編號（可為空，僅專櫃機台需填）
    ECR_TLT_Name: [{ value: '', disabled: true }], // 專櫃名稱
    ECR_USR_No: [{ value: '', disabled: true }], // 收銀員編號
    ECR_USR_Name: [{ value: '', disabled: true }], // 收銀員姓名
    ECR_ActiveDate: [{ value: null, disabled: true }], // 啟用日期
    ECR_ExpireDate: [{ value: null, disabled: true }], // 到期日期
    ECR_CloseDate: [{ value: null, disabled: true }], // 停用日期
    ECR_Status: [{ value: '', disabled: true }], // 收銀機狀態，A=啟用(預設值)、C=停用、S=強制停用、T=訓練
    ECR_GUI_Type: [{ value: '', disabled: true }, [Validators.required]], // 發票使用類別（不可新增/修改）
    ECR_GUI_PeriodQty: [ // 每期預設配號數（必須為50倍數）
      50, [this.validationService.optionalMultipleOfFiftyValidator, Validators.min(50), Validators.max(99999999)]
    ],
    ECR_GUI_MinQty: [ // 最小安全存量（必須為50倍數)
      50, [this.validationService.optionalMultipleOfFiftyValidator, Validators.min(50), Validators.max(99999999)]
    ],
  });
  //
  ECR_Type_Option: option[] = [ // 機台類型 1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)
        {value: '1', label: '集中機台(統收)'},
        {value: '2', label: '專櫃機台(自收)'},
        {value: '5', label: '離線機台(不開立業主發票、不使用業主機台)'},
        {value: '7', label: '它社機台(開立業主發票、不使用業主機台)'}
      ];
  
      ECR_Status_Option: option[] = [ // 收銀機狀態 A=啟用(預設值)、C=停用、S=強制停用、T=訓練
        {value: 'A', label: '啟用'},
        {value: 'C', label: '停用'},
        {value: 'S', label: '強制停用'},
        {value: 'T', label: '訓練'}
      ]
  
      ECR_GUI_Type_Option: option[] = [ // 發票使用類別，00=不開發票、03=二聯式收銀機發票、07=電子發票(預設值)
        {value: '00', label: '不開發票'},
        {value: '03', label: '二聯式收銀機發票'},
        {value: '07', label: '電子發票'}
      ]
  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS41050', this.dataForm);
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
          console.log('insert', formValue);
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
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
