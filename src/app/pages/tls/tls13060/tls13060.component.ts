import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLTTALENT_columns } from './tls13060.model';
import { VendorCategoryOptionsService } from '../../../service/API/dropdownservice/vendor-category-options.service';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { TLS13060ResponseItem, TLS13060Service } from '../../../service/api/tls/tls13060.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls13060',
  templateUrl: './tls13060.component.html',
})
export class TLS13060Component extends BasicQueryPageComponent<TLS13060ResponseItem> implements OnInit {
  queryForm = this.formBuilder.group({
    apply_no: ['', [Validators.maxLength(12)]], // 專櫃招募編號
    ven_uniform: [null], // 廠商統一編號
    tlt_no: ['', [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(100)]], // 櫃位名稱
    location_no: [null], // 位置編號
    tlt_openflagList: [null], // 營運狀況
    tlt_bdate_start: [null], // 契約起始日
    tlt_bdate_end: [null], // 契約起始日
    tlt_edate_start: [null], // 契約截止日
    tlt_edate_end: [null], // 契約截止日
    tlt_contract_bdate_start: [null], // 營運起始日
    tlt_contract_bdate_end: [null], // 營運起始日
    tlt_contract_edate_start: [null], // 營運截止日
    tlt_contract_edate_end: [null], // 營運截止日
    tlt_term_typeList: [null], // 抽成別
    paytype: [null], // 付款方式
    rece_yn: [null], // 是否開立業主發票
    pos_yn: [null], // 是否使用業主收銀機
    cash_yn: [null], // 是否為業主收現
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: TLS13060ResponseItem[] = [];
  columns: Column[] = TLTTALENT_columns;
  vandorCategoryOptions: { label: string, value: string }[] = [];
  locationOptions: { label: string, value: string }[] = [];
  tlt_openflagOptions = [{ label: '閉店/撤櫃', value: '0' }, { label: '營業中', value: '1' }, { label: '合約結束', value: '2' }, { label: '核准時合約尚未開始', value: '9' }];
  tlt_term_typeOptions = [
    { label: '固定租金', value: '1' },
    { label: '底租抽成取高者', value: '2' },
    { label: '一般抽成', value: '3' },
    { label: '包底抽成', value: '4' },
    { label: '階梯式抽成', value: '5' },
    { label: '包底加階梯', value: '6' }
  ]
  paytypeOptions = [{ label: '匯款', value: '1' }, { label: '支票', value: '2' }];
  yesNoOptions = [{ label: '是', value: 'Y' }, { label: '否', value: 'N' }];

  constructor(
    private vendorCategoryOptionsService: VendorCategoryOptionsService,
    private locationOptionsService: LocationOptionsService,
    private tLS13060Service: TLS13060Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13060', '/TLS/TLS13060CRU', this.queryForm, (form) => this.onSubmit(form));
    this.vendorCategoryOptionsService.getVendorCategoryOptions('1').subscribe((res) => {
      this.vandorCategoryOptions = res;
    });
    this.locationOptionsService.getLocationOptions().subscribe((res) => {
      this.locationOptions = res;
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tLS13060Service.queryTLS13060(frm.value).pipe(finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }
}
