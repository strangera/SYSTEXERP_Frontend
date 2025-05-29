// tls51010-cru.component.ts 修改版本

import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
  CanDel?: boolean; // 新增 CanDel 屬性
}

@Component({
  selector: 'app-tls51010-cru',
  templateUrl: './tls51010-cru.component.html',
  styleUrl: './tls51010-cru.component.scss'
})
export class TLS51010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    CAT_LNo: ['', [Validators.required, Validators.maxLength(2), this.validationService.numberValidator]],
    CAT_LName: ['', [Validators.required, Validators.maxLength(32)]],
    CAT_LRemark: [''],
    CRT_USR_No: [''],
    CRT_USR_Name: ['']
  });

  // 修正：判斷是否可以編輯大分類代碼
  // CanDel = true：可刪除項目，大分類代碼可以編輯（返回 false）
  // CanDel = false：不可刪除項目，大分類代碼不能編輯（返回 true）
  get isCATLNoDisabled(): boolean {
    return this.crudstatus === CRUDStatus.Read ||
      (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false);
  }

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51010', this.dataForm);

    // 新增：在初始化後立即設置大分類代碼的禁用狀態
    this.updateCATLNoDisabledState();
  }

  // 修正：更新大分類代碼欄位的禁用狀態
  private updateCATLNoDisabledState(): void {
    const field = this.dataForm.get('CAT_LNo');
    if (field) {
      // 編輯模式且 CanDel = false 時才禁用大分類代碼
      if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false) {
        field.disable();
      } else {
        field.enable();
      }
    }
  }

  // 新增：自定義清空方法，保留大分類代碼
  clearFormExceptCATLNo(): void {
    const catLNoControl = this.dataForm.get('CAT_LNo');
    const isCAT_LNoDisabled = catLNoControl?.disabled || false;  // 新增：檢查是否被禁用
    const currentCATLNo = catLNoControl?.value;

    this.dataForm.reset();

    // 修正：只有在欄位被禁用且有值時才恢復
    if (isCAT_LNoDisabled && currentCATLNo) {
      this.dataForm.patchValue({
        CAT_LNo: currentCATLNo,
        id: 0
      });
    } else {
      this.dataForm.patchValue({
        id: 0
      });
    }

    this.updateCATLNoDisabledState();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 新增：在提交前確保編輯模式下包含 CAT_LNo 值
      const formValue = { ...frm.value };
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.apiService.insertTLS51010(formValue).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.apiService.updateTLS51010(formValue).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
