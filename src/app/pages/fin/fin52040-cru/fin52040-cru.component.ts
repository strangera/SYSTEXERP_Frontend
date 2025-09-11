import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';

/** GLS1016 對象別設定檔 */
export interface GLS1016 {
  CompNo: string, // VARCHAR(06)      Not null, /*公司代號*/
  RefCode: string, // VARCHAR(20)     not null, /*對象別代碼*/
  RefName: string, // VARCHAR(30)     not null, /*對象別名稱*/
  SubRefName: string, // VARCHAR(30)      null, /*代送商名稱*/

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}


@Component({
    selector: 'app-fin52040-cru',
    templateUrl: './fin52040-cru.component.html',
    styleUrl: './fin52040-cru.component.scss',
    standalone: true,
    imports: [
      MenubarComponent,
      ButtonComponent,
      PanelModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextComponent,
      DropdownComponent,
      NgIf, 
      TranslateModule
    ]
})
// 對象及對帳維護作業 CRU
export class FIN52040CRUComponent extends BasicCruPageComponent<GLS1016> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    CompNo: ['', [Validators.required, Validators.maxLength(6)]], //  公司代號
    // RefCode: ['', [Validators.required, Validators.maxLength(20)]], // 對象別代碼
    RefCode: [{ value: '自動帶入', disabled: true }], // 對象別代碼
    RefName: ['', [Validators.required, Validators.maxLength(30)]], // 對象別名稱 (可編輯)
    SubRefName: ['', [Validators.maxLength(30)]], // 代送商名稱

    CRT_USR_Name: ['', [Validators.maxLength(20)]], //  建立人員姓名
    UPD_USR_Name: ['', [Validators.maxLength(20)]], //  變更人員姓名
  });
  //
  GLS1001_Options: apiOption[] = [
    {No: 'CompNo1', Name: '公司代號1'},
    {No: 'CompNo2', Name: '公司代號2'},
    {No: 'CompNo3', Name: '公司代號3'}
  ];
  building_noOptions: apiOption[] = [];
  STO_NoOptions: apiOption[] = [];
  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52040', this.dataForm);
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
