import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { IndustryTypeService } from '../../../service/basic/industry-type.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Bas1000Service } from '../../../service/API/SYS0000/bas1000.service';

// 資料模型：分類項目
interface CategoryItem {
  id: number;
  bus_type: string; //大分類代碼
  bus_type_name: string; //大分類名稱
  bus_class: string; //中分類(商品類別)代碼
  bus_class_name: string; //中分類(商品類別)名稱
  bus_sclass: string; //小分類代碼
  bus_sclass_name: string; //小分類名稱
  bus_sclass_desc: string; //備註
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

@Component({
  selector: 'app-sysb920.cru',
  templateUrl: './sysb920.cru.component.html',
  styleUrl: './sysb920.cru.component.scss'
})
// 小分類維護作業 CRU
export class SYSB920CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    bus_sclass: ['', [Validators.maxLength(2)]], // 小分類代碼
    bus_sclass_name: ['', [Validators.maxLength(40)]], // 小分類名稱
    bus_type: [[] as number[]], // 大分類代碼
    bus_class: [[] as number[]], // 中分類代碼
  });
  //
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];
  // ----------------------------------------------------------------
  constructor(
    private translate: TranslateService,
    private industryTypeService: IndustryTypeService,
    private productCategoryService: ProductCategoryService,
    private apiService: Bas1000Service,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // this.ProgNo = '410009';
    this.initializePage('410009', this.dataForm);

    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryTypeOptions = data;
    });

    this.productCategoryService.getSystemTypes().subscribe(data => {
      this.productTypeOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 待實現：調用 API 進行新增
            this.apiService.insertSYSB920(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('新增成功');
              this.onCancel(); // 新增成功後返回查詢頁面
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 待實現：調用 API 進行更新
            this.apiService.updateSYSB920(frm.value).subscribe((response: any) => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  // 修改：submitForm 調用父類 handleSubmit
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
