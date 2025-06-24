import { UserCodeService } from './../../../service/basic/user-code.service';
import { PaperStatusService } from './../../../service/basic/paper-status.service';
import { VendorService } from './../../../service/basic/vendor.service';
import { BrandCodeService } from './../../../service/basic/brand-code.service';
import { ManagementIDService } from './../../../service/basic/management-id.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ITLS52010Data } from '../../../service/api/tls/tls52010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// 2.5.2.1  採購單維護作業
@Component({
  selector: 'app-tls52010',
  templateUrl: './tls52010.component.html',
})
export class TLS52010Component extends BasicQueryPageComponent<ITLS52010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PO_No: [], // 採購單編號 input
    HOS_No: [], // 倉庫代碼 multi-select
    LOGO_No: [], // 品牌代碼 multi-select
    VEN_No: [], // 廠商編號 multi-select
    PO_Status: [], // 採購單狀態 multi-select
    APPLY_USR: [], // 申請人員 multi-select
    APPLY_Date_Start: [], // 申請日期 起 calendar-range
    APPLY_Date_End: [], // 申請日期 迄
    APRV_USR: [], // 審核人員 multi-select
    APRV_Date_Start: [], // 審核日期 起 calendar-range
    APRV_Date_End: [], // 審核日期 迄
    CLOS_USR: [], // 強制結案人員 multi-select
    CLOS_Date_Start: [], // 強制結案日期 起 calendar-range
    CLOS_Date_End: [], // 強制結案日期 迄
    ...createPaginationConfig([{ field: 'PO_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: ITLS52010Data[] = [];
  columns: Column[] = [
    { field: 'contactPerson', header: '採購單號', visible: true },
    { field: 'contactDate', header: '品牌編號', visible: true },
    { field: 'UID', header: '廠商編號', visible: true },
    { field: 'industryType', header: '採購單總成本(未稅)', visible: true },
    { field: 'category', header: '單據狀態', visible: true },
    { field: 'version', header: '申請人', visible: true },
    { field: 'rentNumber', header: '申請日期', visible: true },
    { field: 'progress', header: '審核人	', visible: true },
    { field: 'col1', header: '審核日期	', visible: true },
    { field: 'col2', header: '倉別	', visible: true },
  ];
  storageOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandIDOptions: any[] = [];
  vendorIDOptions: any[] = [];
  paperStatusOptions: any[] = [];
  applicantOptions: any[] = [];

  constructor(
    private bigCategoryCodeService: BigCategoryCodeService,
    private managementIDService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private vendorService: VendorService,
    private paperStatusService: PaperStatusService,
    private userCodeService: UserCodeService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52010', 'TLS/TLS52010CRU', this.queryForm, (form) => this.onSubmit(form));
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
    this.userCodeService.getUserCode().subscribe(data => {
      this.applicantOptions = data;
    });
    this.paperStatusService.getSystemTypes().subscribe(data => {
      this.paperStatusOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
