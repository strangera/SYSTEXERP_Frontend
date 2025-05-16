import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
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
}

@Component({
  selector: 'app-sysb900.cru',
  templateUrl: './sysb900.cru.component.html',
  styleUrl: './sysb900.cru.component.scss'
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
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB900(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB900(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
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
