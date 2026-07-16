import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52070Service } from '@service/api/fin/fin52070.service';
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

export interface GLS1005 {
  ClassNo: string, // 三碼代號
  ClassCName: string, // 三碼名稱
  ClassEname: string, // 三碼英文名稱
  ParentClass: string, // 中類代碼

  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

// 科目中類GLS1003 格式
export interface ClassAttr {
  ClassNo: string, // 大類代碼
  ClassCName: string, // 大類代碼
  Label?: string, // 編輯頁顯示內容
}

@Component({
  selector: 'app-fin52070-cru',
  templateUrl: './fin52070-cru.component.html',
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
// 科目三碼代號維護
export class FIN52070CRUComponent extends BasicCruPageComponent<GLS1005> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // 科目三碼代號維護
    ClassNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], //  三碼代號
    ClassCName: ['', [Validators.required, Validators.maxLength(100)]], // 三碼名稱
    ClassEname: ['', [Validators.maxLength(100), this.validationService.noChineseValidator]], // 三碼英文名稱 (非必填)
    ParentClass: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], //  中類代碼
  });

  ClassAttr_Option: ClassAttr[] = []; //中類代碼

  constructor(
    private fin52070Service: Fin52070Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52070', this.dataForm);
    this.loadOption();
    if (!this.isFormCreateable) {
      this.dataForm.get('ClassNo')?.disable(); // Detail/Update 時 disable typecode
      this.dataForm.get('ParentClass')?.disable(); // Detail/Update 時 disable typecode
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 9/9 SA註明: 該作業不可修改/刪除
    // 送出前檢查 大+中+三碼 不可重複
    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          this.fin52070Service.insertFIN52070(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.fin52070Service.updateFIN52070(formValue).subscribe(() => {
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
    this.fin52070Service.queryParentClassDropdown({}).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.ClassAttr_Option = response.Data.map((item: any) => ({
          ...item,
          Label: item.ClassNo + '-' + item.ClassCName, // 組合成顯示用的Label
        }));

        console.log('中類 下拉', this.ClassAttr_Option);
      },
      error: () => { this.loading = false; },
    });
  }
}
