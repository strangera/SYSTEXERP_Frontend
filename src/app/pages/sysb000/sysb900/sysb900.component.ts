import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { IndustryTypeService } from '../../../service/basic/industry-type.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-sysb900',
  templateUrl: './sysb900.component.html',
  styleUrl: './sysb900.component.scss'
})
// 商品類別維護作業
export class SYSB900Component extends BasicQpageComponent implements OnInit {
  // 查詢
  // ----------------------------------------------------------------
  queryForm = this.formBuilder.group({
    productCatCode: [, [Validators.maxLength(2)]], // 商品類別碼
    productCatName: ['', [Validators.maxLength(40)]], // 商品類別名稱
    industryType: [[] as number[]], // 所屬業種
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { productCatCode: '00', productCatName: '複合店',industryTypeCode: '10', industryTypeName: '物販'},
    { productCatCode: '01', productCatName: '男女服飾', industryTypeCode: '10', industryTypeName: '物販'},
    { productCatCode: '01', productCatName: '餐廳', industryTypeCode: '20', industryTypeName: '餐飲'},
    { productCatCode: '01', productCatName: '主題樂園', industryTypeCode: '30', industryTypeName: '娛樂'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'productCatCode', header: '商品類別碼', visible: true },
    { field: 'productCatName', header: '商品類別名稱', visible: true },
    { field: 'industryTypeCode', header: '所屬業種代碼', visible: true },
    { field: 'industryTypeName', header: '所屬業種名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  industryTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private industryTypeService: IndustryTypeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410008';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    // this.industryTypeService.getSystemTypes().subscribe(data => {
    //   this.industryTypeOptions = data;
    // });
    //
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryTypeOptions = data;

      // let allSystemValues = this.industryTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   industryType: allSystemValues
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
      this.router.navigate(['/SYSB000/SYSB900CRU'], extras);
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

      this.router.navigate(['/SYSB000/SYSB900CRU'], extras);
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

    this.router.navigate(['/SYSB000/SYSB900CRU'], extras);
  }
}
