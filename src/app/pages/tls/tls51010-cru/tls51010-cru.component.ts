import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 新增：定義數據接口
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 2.5.1.1 大分類維護作業 CRU
@Component({
  selector: 'app-tls51010-cru',
  templateUrl: './tls51010-cru.component.html',
  styleUrl: './tls51010-cru.component.scss'
})
export class TLS51010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    CAT_LNo: ['', [Validators.required, Validators.maxLength(2), this.validationService.numberValidator]], // Input serial number
    CAT_LName: ['', [Validators.required, Validators.maxLength(32)]], // Input Text
    CAT_LRemark: [''], // editor text
    CRT_USR_No: [''],
    CRT_USR_Name: ['']
  });

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51010', this.dataForm);
  }



  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertTLS51010(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateTLS51010(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              // this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }
}
