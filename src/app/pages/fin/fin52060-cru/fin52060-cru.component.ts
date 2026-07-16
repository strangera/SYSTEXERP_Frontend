import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52060Service } from '@service/api/fin/fin52060.service';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { TableComponent } from '@others/component/table/table.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

export interface GLS1004 {
  ClassNo: string, // 中類代碼
  ClassCName: string, // 中類名稱
  ClassEname: string, // 中類英文名稱
  ClassAttr: string, // 大類代碼

  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

// 科目大類GLS1003 格式
export interface ClassAttr {
  ClassAttr: string, // 大類代碼
  ClassAttrCName: string, // 大類代碼
  Label: string, // 顯示
}

@Component({
  selector: 'app-fin52060-cru',
  templateUrl: './fin52060-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    DialogComponent,
    NgIf,
    TranslateModule,
    TableComponent
  ]
})
export class FIN52060CRUComponent extends BasicCruPageComponent<GLS1004> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    ClassNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], //  中類代碼
    ClassCName: ['', [Validators.required, Validators.maxLength(100)]], // 中類名稱
    ClassEname: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 中類英文名稱 (非必填)
    ClassAttr: ['', [Validators.maxLength(2), this.validationService.numberValidator]], //  大類代碼
  });

  ClassAttr_Option: ClassAttr[] = []; //大分類選單

  constructor(
    private fin52060Service: Fin52060Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52060', this.dataForm);
    this.loadOption();
    console.log(this.isFormCreateable)
    if (!this.isFormCreateable) {
      this.dataForm.get('ClassNo')?.disable(); // Detail/Update 時 disable typecode
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 送出前檢查 RefCode(對象別代碼) 不可重複
    // 9/9 SA註明: 該作業不可修改/刪除
    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.fin52060Service.insertFIN52060(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.fin52060Service.updateFIN52060(formValue).subscribe(() => {
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

  //讀取下拉
  loadOption() {
    this.fin52060Service.queryClassAttrDropdown({}).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        console.log('大類下拉 response', response);
        this.ClassAttr_Option = response.Data.map((item: ClassAttr) => ({
          ...item,
          Label: item.ClassAttr + '-' + item.ClassAttrCName,
        }));
      },
      error: () => { this.loading = false; },
    });
  }
}
