import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { Tls51010DropDownListService } from '../../../service/api/tls/tls51010-dropdown.service';

// 新增：定義數據接口
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
  CanDel?: boolean; // 新增 CanDel 屬性
}

// 2.5.1.2 中分類維護作業 CRU
@Component({
  selector: 'app-tls51020-cru',
  templateUrl: './tls51020-cru.component.html',
  styleUrl: './tls51020-cru.component.scss'
})
export class TLS51020CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    CAT_MNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], // Input serial number
    CAT_MName: ['', [Validators.required, Validators.maxLength(32)]], // Input Text
    CAT_LNo: ['', [Validators.required]], // DropDown
    CAT_MRemark: [''], // editor text
  });
  showConfirm: boolean = false;

  // 修正：判斷是否可以編輯中分類代碼
  // CanDel = true：可刪除項目，大分類代碼可以編輯（返回 false）
  // CanDel = false：不可刪除項目，大分類代碼不能編輯（返回 true）
  get isCATMNoDisabled(): boolean {
    return this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false;
  }

  // ----------------------------------------------------------------
  bigCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
    private dropdownListService: Tls51010DropDownListService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51020', this.dataForm);
    this.dropdownListService.getSystemTypes().subscribe(data => {
      this.bigCategoryOptions = data;
      console.log('bigCategoryOptions:', this.bigCategoryOptions); // 調試用
    });
  }

  // 修正：更新大分類代碼欄位的禁用狀態
  private updateCATMNoDisabledState(): void {
    const catLNoControl = this.dataForm.get('CAT_MNo');
    if (catLNoControl) {
      // 編輯模式且 CanDel = false 時才禁用大分類代碼
      if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false) {
        catLNoControl.disable();
      } else {
        catLNoControl.enable();
      }
    }
  }

  // 新增：自定義清空方法，保留中分類代碼
  clearFormExceptCATMNo(): void {
    const catMNoControl = this.dataForm.get('CAT_MNo');
    const isCAT_MNoDisabled = catMNoControl?.disabled || false;  // 新增：檢查是否被禁用
    const currentCATMNo = catMNoControl?.value;

    this.dataForm.reset();

    // 修正：只有在欄位被禁用且有值時才恢復
    if (isCAT_MNoDisabled && currentCATMNo) {
      this.dataForm.patchValue({
        CAT_MNo: currentCATMNo,
        id: 0
      });
    } else {
      this.dataForm.patchValue({
        id: 0
      });
    }

    this.updateCATMNoDisabledState();
  }


  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertTLS51020(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateTLS51020(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
