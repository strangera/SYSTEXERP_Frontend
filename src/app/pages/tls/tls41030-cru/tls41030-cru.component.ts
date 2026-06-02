import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Tls41030Service } from './../../../service/api/tls/tls41030.service';

interface POS2001 {
  id: number;
  USR_No: string;
  USR_Name: string;
  USR_Passwd: string;
  USR_Level: string;
  USR_Auth: string;
  USR_JobStatus: string;
  USR_Class: string;
  USR_RegType: string;
  USR_TLT_No: string;
  USR_TLT_Name: string;
  USR_OnJobDate: string;
  USR_QuitDate: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean;
}

@Component({
  selector: 'app-tls41030-cru',
  templateUrl: './tls41030-cru.component.html',
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
export class TLS41030CRUComponent extends BasicCruPageComponent<POS2001> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [null],
    USR_No: ['', [Validators.required, Validators.maxLength(8), this.validationService.numberValidator]],
    USR_Name: ['', [Validators.required, Validators.maxLength(20)]],
    USR_Passwd: ['', [Validators.required, Validators.maxLength(20), this.validationService.englishNumberSymbolValidator]],
    USR_Level: ['0', [Validators.required, Validators.maxLength(6), this.validationService.alphanumericValidator]],
    USR_Auth: [0, [Validators.required, Validators.maxLength(6), this.validationService.numberValidator]],
    USR_JobStatus: ['J', [Validators.required, Validators.maxLength(2)]],
    USR_Class: ['R', [Validators.required, Validators.maxLength(2)]],
    USR_RegType: ['2', [Validators.required, Validators.maxLength(2)]],
    USR_TLT_No: ['', [Validators.maxLength(20)]],
    USR_TLT_Name: ['', [Validators.maxLength(60)]],
    USR_OnJobDate: [null],
    USR_QuitDate: [null],
  });

  // 註：依據你 HTML 使用的變數，把這裡的 jobStatusOption 註解打開，避免 HTML 編譯錯誤
  jobStatusOption: option[] = [
    { value: 'J', label: '在職' },
    { value: 'Q', label: '離職' },
  ];

  classOption: option[] = [
    { value: 'R', label: '一般' },
    { value: 'M', label: '店長' },
    { value: 'S', label: '系統管理者' }
  ];

  regTypeOption: option[] = [
    { value: '2', label: '獨立收銀' },
    { value: '1', label: '集中收銀' },
  ];

  TLTOption: apiOption[] = [];

  constructor(
    private tls41030Service: Tls41030Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41030', this.dataForm);
    this.loadOptions();
    console.log('讀取資料', this.dataForm.value);

    if (this.crudstatus !== CRUDStatus.Create) {
      this.dataForm.get('USR_No')?.disable();
    }

    // 【修改需求 ②】收銀員編號輸入後，自動複製到密碼並在末端加一個 0 (僅限新增模式)
    this.dataForm.get('USR_No')?.valueChanges.subscribe(usrNo => {
      if (this.crudstatus === CRUDStatus.Create) {
        if (usrNo) {
          this.dataForm.get('USR_Passwd')?.setValue(`${usrNo}0`);
        } else {
          this.dataForm.get('USR_Passwd')?.setValue('');
        }
      }
    });

    // 【修改需求 ①】櫃號選完後，自動將「櫃名」帶入【收銀員姓名】與【專櫃名稱】欄位
    this.dataForm.get('USR_TLT_No')?.valueChanges.subscribe(selectedNo => {
      const matched = this.TLTOption.find(opt => opt.No === selectedNo);
      if (matched) {
        this.dataForm.get('USR_TLT_Name')?.setValue(matched.Name);

        // 僅在新增模式下，幫忙預帶收銀員姓名，避免編輯舊資料時去動到
        if (this.crudstatus === CRUDStatus.Create) {
          this.dataForm.get('USR_Name')?.setValue(matched.Name);
        }
      } else {
        this.dataForm.get('USR_TLT_Name')?.setValue('');
        if (this.crudstatus === CRUDStatus.Create) {
          this.dataForm.get('USR_Name')?.setValue('');
        }
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
    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.tls41030Service.insertTLS41030(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset();
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
            this.onCancel();
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
    this.dataForm.reset();
  }

  loadOptions() {
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
