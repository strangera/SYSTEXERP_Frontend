import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { VendorService } from '../../../service/basic/vendor.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { PriceChangeStatusService } from '../../../service/basic/price-change-status.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
@Component({
  selector: 'app-tls52050',
  templateUrl: './tls52050.component.html',
})
export class TLS52050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    priceChangeOrderNumber: [],  // New field for 變價單號
    vendorCode: [],
    brandCode: [],
    priceChangeStatus: [],
    paperStatus: [],
    applicantCode: [],
    approverCode: [],
    startDate: [],
    endDate: [],
    approvalStartDate: [],
    approvalEndDate: [],
  });
  vendorOptions: any[] = [];
  brandCodeOptions: any[] = [];
  priceChangeStatusOptions: any[] = [];
  paperStatusOptions: any[] = [];
  userCodeOptions: any[] = [];
  managementIdOptions: any[] = [];
  data: any[] = [];
  columns: Column[] = [
    { field: 'priceChangeOrderNumber', header: '變價單號', visible: true },
    { field: 'brandCode', header: '品牌編碼', visible: true },
    { field: 'useDate', header: '啟用日期', visible: true },
    { field: 'storeCode', header: '嚴商編號', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'applicant', header: '申請人', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'approver', header: '審核人', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
  ];

  constructor(
    private vendorService: VendorService,
    private brandCodeService: BrandCodeService,
    private priceChangeStatusService: PriceChangeStatusService,
    private userCodeService: UserCodeService,
    private managementIdService: ManagementIDService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52050', 'tls/tls52050cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.vendorService.getVendors().subscribe(data => this.vendorOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.priceChangeStatusService.getPriceChangeStatusOptions().subscribe(data => this.priceChangeStatusOptions = data);
    this.userCodeService.getUserCode().subscribe(data => this.userCodeOptions = data);
    this.managementIdService.getSystemTypes().subscribe(data => this.managementIdOptions = data);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
}
