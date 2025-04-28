import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
//
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MidCategoryService } from '../../../service/basic/mid-category.service';

// 新增：定義數據接口
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 2.5.1.2 中分類維護作業 CRU
@Component({
  selector: 'app-tls51030-cru',
  templateUrl: './tls51030-cru.component.html',
  styleUrl: './tls51030-cru.component.scss'
})
export class TLS51030CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // ID
    CAT_SNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]], // Input serial number
    CAT_SName: ['', [Validators.required, Validators.maxLength(32)]], // Input Text
    CAT_LNo: ['', [Validators.required]], // DropDown
    CAT_MNo: ['', [Validators.required]], // DropDown
    CAT_SRemark: ['',], // editor text
  });
  bigCategoryOptions: any[] = [];
  middleCategoryOptions: any[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
    private bigCategoryCodeService: BigCategoryCodeService,
    private middleCategoryCodeService: MidCategoryService,) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('250003', this.dataForm);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.bigCategoryOptions = data;
      console.log('bigCategoryOptions:', this.bigCategoryOptions); // 調試用
    });
    this.middleCategoryCodeService.getSubCategories().subscribe(data => {
      this.middleCategoryOptions = data;
      console.log('middleCategoryOptions:', this.middleCategoryOptions); // 調試用
    });
  }

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
            this.apiService.insertTLS51030(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateTLS51030(frm.value).subscribe((response: any) => {
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
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS5000/TLS51030']);
  }
}
