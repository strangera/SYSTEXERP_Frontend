import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Bas1000Service } from '../../../service/api/sys/bas1000.service';

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
  CanDel?: boolean;
}

@Component({
  selector: 'app-sysb800.cru',
  templateUrl: './sysb800.cru.component.html',
  styleUrl: './sysb800.cru.component.scss'
})
// 大分類基本資料維護作業 CRU
export class SYSB800CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 大分類代號
    bus_type_name: ['', [Validators.required, Validators.maxLength(40)]], // 大分類名稱
    bus_type_desc: ['',], // 備註
  });

  // 修正：判斷是否可以編輯大分類代碼
  // CanDel = true：可刪除項目（返回 false）
  // CanDel = false：不可刪除項目（返回 true）
  get isDisabled(): boolean {
    return this.crudstatus === CRUDStatus.Read ||
      (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false);
  }

  constructor(
    private translate: TranslateService,
    private apiService: Bas1000Service,
    //
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // this.ProgNo = '410007';
    this.initializePage('SYSB800', this.dataForm);

    // 新增：在初始化後立即設置大分類代碼的禁用狀態
    this.updateDisabledState();
  }

  // 修正：更新大分類代碼欄位的禁用狀態
  private updateDisabledState(): void {
    const field = this.dataForm.get('bus_type');
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
    const control = this.dataForm.get('bus_type');
    const isDisabled = control?.disabled || false;  // 新增：檢查是否被禁用
    const current = control?.value;

    this.dataForm.reset();

    // 修正：只有在欄位被禁用且有值時才恢復
    if (isDisabled && current) {
      this.dataForm.patchValue({
        bus_type: current,
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
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB800(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB800(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
