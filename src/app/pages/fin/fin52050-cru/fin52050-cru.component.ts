import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52050Service } from '@service/api/fin/fin52050.service';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

export interface GLS1003 {
  ClassAttr: string, // 大類代碼
  ClassAttrCName: string, // 大類名稱
  ClassAttrEname: string, // 大類英文名稱

  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}


@Component({
  selector: 'app-fin52050-cru',
  templateUrl: './fin52050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TranslateModule,
  ]
})
export class FIN52050CRUComponent extends BasicCruPageComponent<GLS1003> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    ClassAttr: ['', [Validators.required, Validators.maxLength(1), this.validationService.numberValidator]], //  大類代碼
    ClassAttrCName: ['', [Validators.required, Validators.maxLength(100)]], // 大類名稱
    ClassAttrEname: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 大類英文名稱 (非必填)
  });

  constructor(
    private fin52050Service: Fin52050Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52050', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('ClassAttr')?.disable(); // Detail/Update 時 disable typecode
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // SA註明: 該作業不可修改/刪除
    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.fin52050Service.insertFIN52050(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.fin52050Service.updateFIN52050(formValue).subscribe(() => {
            this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            //this.dataForm.reset(); // 重置表單
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
}
