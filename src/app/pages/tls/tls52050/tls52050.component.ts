import { ITLS52050Data, Tls52050Service } from './../../../service/api/tls/tls52050.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs';
import { MAM_StatusOptions, POS2008M_COLUMNS } from './tls52050.model';
@Component({
  selector: 'app-tls52050',
  templateUrl: './tls52050.component.html',
})
export class TLS52050Component extends BasicQueryPageComponent<ITLS52050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    MAM_No: ['', [Validators.maxLength(16)]],// 變價單號
    VEN_No: [null],              // 廠商代號
    LOGO_No: [null],             // 品牌代號
    MAM_Status: [null, [Validators.required]],// 進價變價單狀態
    APPLY_USR_No: [null],        // 申請人
    APRV_USR_No: [null],         // 審核人
    APPLY_Date_Start: [null],  // 申請日期起
    APPLY_Date_End: [null],    // 申請日期迄
    APRV_Date_Start: [null],   // 審核日期起
    APRV_Date_End: [null],     // 審核日期迄
    showReturnPriceOrdersOnly: [false],
    ...createPaginationConfig([{ field: 'MAM_No', order: 1 }]),
  });
  totalRecords = 0;
  MAM_StatusOptions = MAM_StatusOptions; // 進價變價單狀態選項
  brandOptions: IDropdownItem[] = []; // 品牌代碼
  vendorOptions: IDropdownItem[] = []; // 廠商編號
  userOptions: { label: string, value: string }[] = []; // 申請人員、審核人員、結案人員
  data: ITLS52050Data[] = [];
  columns: Column[] = POS2008M_COLUMNS;

  constructor(
    private dropDownListService: DropDownListService,
    private tls52050Service: Tls52050Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS52050', 'tls/tls52050cru', this.queryForm, (frm) => this.onSubmit(frm));
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
      this.tls52050Service.queryTLS52050(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
