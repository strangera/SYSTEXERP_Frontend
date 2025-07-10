import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ITLS52050Data, Tls52050Service } from '../../../service/api/tls/tls52050.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs';

@Component({
  selector: 'app-tls52050-cru',
  templateUrl: './tls52050-cru.component.html',
})
export class TLS52050CRUComponent extends BasicCruPageComponent<ITLS52050Data> implements OnInit {
  dataForm = this.formBuilder.group({
    MAM_No: [{ value: '系統自動產生', disabled: true }],  // 變價單號
    VEN_No: ['', Validators.required], // 廠商代號
    LOGO_No: ['', Validators.required], // 品牌代號
    MAM_InvDesc: ['', Validators.required], // 進價變價單說明
    MAM_Method: [null, Validators.required], // 是否為永久變價
    MAM_BegDate: [null, Validators.required], // 生效起始日期
    MAM_EndDate: [{ value: null as Date | null, disabled: true }], // 生效結束日期
    APPLY_USR_No: [{ value: null as string | null, disabled: true }], // 申請人
    APPLY_Date: [{ value: new Date(), disabled: true }], // 申請日期
  });
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員
  data: any[] = [
    { projectNumber: '001', projectName: '專櫃A', activity: '促銷活動', startDate: '2023-01-01', endDate: '2023-01-31', executionStartDate: '2023-01-01', executionEndDate: '2023-01-31' },
    { projectNumber: '002', projectName: '專櫃B', activity: '新品發布', startDate: '2023-02-01', endDate: '2023-02-28', executionStartDate: '2023-02-01', executionEndDate: '2023-02-28' }
  ];
  columns: Column[] = [
    { field: 'projectNumber', header: '專櫃編號', visible: true },
    { field: 'projectName', header: '櫃位名稱', visible: true },
    { field: 'activity', header: '活動', visible: true },
    { field: 'startDate', header: '開始起始日', visible: true },
    { field: 'endDate', header: '開始終止日', visible: true },
    { field: 'executionStartDate', header: '營運起始日', visible: true },
    { field: 'executionEndDate', header: '營運終止日', visible: true }
  ];
  constructor(
    private dropDownListService: DropDownListService,
    private tls52050Service: Tls52050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS52050', this.dataForm);
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandOptions = response.Data.map(brand => ({
        ...brand,
        label: `${brand.No} - ${brand.Name}`,
      }));
    });
    // 廠商編號 (VEN_No)
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(vendor => ({
        ...vendor,
        label: `${vendor.VEN_No} - ${vendor.Name}`,
      }));
    });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
