import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { IndustryTypeService } from '../../../service/basic/industry-type.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sysb920',
  templateUrl: './sysb920.component.html',
  styleUrl: './sysb920.component.scss'
})
// 小分類維護作業
export class SYSB920Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    smallClassification: [, [Validators.maxLength(2)]], // 小分類
    smallClassificationName: ['', [Validators.maxLength(40)]], // 小分類名稱
    industryType: [[] as number[]], // 所屬業種
    productCategory: [[] as number[]], // 商品類別
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { isdelete: true, productCatCode: '00', productCatName: '綜合服飾', industryType: '物販', productCategory: '男女服飾' },
    { isdelete: true, productCatCode: '00', productCatName: '兒童資訊軟體', industryType: '物販', productCategory: '嬰童用品' },
    { isdelete: true, productCatCode: '00', productCatName: '其他', industryType: '服務', productCategory: '綜合服務' },
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'productCatCode', header: '商品類別碼', visible: true },
    { field: 'productCatName', header: '商品類別名稱', visible: true },
    { field: 'industryType', header: '所屬業種', visible: true },
    { field: 'productCategory', header: '商品類別', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private industryTypeService: IndustryTypeService,
    private productCategoryService: ProductCategoryService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410009';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryTypeOptions = data;

      // let industryTypeValues = this.industryTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   industryType: industryTypeValues
      // });
    });

    this.productCategoryService.getSystemTypes().subscribe(data => {
      this.productTypeOptions = data;

      // let productTypeValues = this.productTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   productCategory: productTypeValues
      // });
    });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/SYSB000/SYSB920CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      this.router.navigate(['/SYSB000/SYSB920CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/SYSB000/SYSB920CRU'], extras);
  }

}
