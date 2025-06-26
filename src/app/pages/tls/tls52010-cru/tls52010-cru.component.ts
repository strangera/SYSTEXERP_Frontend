import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { BrandCodeService } from './../../../service/basic/brand-code.service';
import { ManagementIDService } from './../../../service/basic/management-id.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 2.5.2.1  採購單維護作業 CRU
@Component({
  selector: 'app-tls52010-cru',
  templateUrl: './tls52010-cru.component.html',
})
export class TLS52010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  storageOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandIDOptions: any[] = [];
  vendorIDOptions: any[] = [];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    purchaseOrder: [, [this.validationService.numberValidator]], // 採購單號
    storage: [, [Validators.required]], // 倉別
    brandID: [, [Validators.required]], // 品牌編號
    vendorID: [, [Validators.required]], // 廠商編號
    applicant: [''], // 申請人
    applicantdate: [], // 申請日期
    cost: [0, [this.validationService.numberValidator]], // 採購金額
    tax: [0, [this.validationService.numberValidator]], // 稅額
    totalCost: [0, [this.validationService.numberValidator]], // 合計金額
    totalSales: [0, [this.validationService.numberValidator]], // 售價總計
    editortext: [,], // 採購單說明
  });
  constructor(
    private validationService: ValidationService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private managementIDService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private vendorService: VendorService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS52010', this.dataForm);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => {
      this.storageOptions = data;
    });
    this.managementIDService.getSystemTypes().subscribe(data => {
      this.managementIDOptions = data;
    });
    this.brandCodeService.getSystemTypes().subscribe(data => {
      this.brandIDOptions = data;
    });
    this.vendorService.getVendors().subscribe(data => {
      this.vendorIDOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
