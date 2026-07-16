import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/components/input-textarea/input-textarea.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Sysb800DropdownService } from './../../../service/api/sys/sysb800-dropdown.service';

interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_type_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel?: boolean; // 新增 CanDel 屬性
}

@Component({
    selector: 'app-sysb900.cru',
    templateUrl: './sysb900.cru.component.html',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputTextareaComponent, NgIf, TranslateModule]
})
// 中分類維護作業 CRU
export class SYSB900CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 中分類代碼
    bus_class_name: ['', [Validators.required, Validators.maxLength(40)]], // 中分類名稱
    bus_type: ['', [Validators.required]], // 所屬大分類
    bus_class_desc: ['',], // 備註
  });

  // 修正：判斷是否可以編輯大分類代碼
  // CanDel = true：可刪除項目（返回 false）
  // CanDel = false：不可刪除項目（返回 true）
  get isDisabled(): boolean {
    return this.crudstatus === CRUDStatus.Read ||
      (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false);
  }


  option: any[] = [];

  constructor(
    private translate: TranslateService,
    private Sysb800DropdownService: Sysb800DropdownService,
    private apiService: Bas1000Service,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    // this.ProgNo = '410008';
    this.initializePage('SYSB900', this.dataForm);
    // 新增：在初始化後立即設置大分類代碼的禁用狀態
    this.updateDisabledState();
    this.Sysb800DropdownService.getSystemTypes().subscribe({
      next: (response) => {
        this.option = response;
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });
  }

  // 修正：更新大分類代碼欄位的禁用狀態
  private updateDisabledState(): void {
    const field = this.dataForm.get('bus_class');
    if (field) {
      // 編輯模式且 CanDel = false 時才禁用
      if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false) {
        field.disable();
      } else {
        field.enable();
      }
    }
  }

  // 新增：自定義清空方法，保留大分類代碼
  clearFormExcept(): void {
    const control = this.dataForm.get('bus_class');
    const isDisabled = control?.disabled || false;  // 新增：檢查是否被禁用
    const current = control?.value;

    this.dataForm.reset();

    // 修正：只有在欄位被禁用且有值時才恢復
    if (isDisabled && current) {
      this.dataForm.patchValue({
        bus_class: current,
        id: 0
      });
    } else {
      this.dataForm.patchValue({
        id: 0
      });
    }

    this.updateDisabledState();
  }


  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB900(formValue).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB900(formValue).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU
}
