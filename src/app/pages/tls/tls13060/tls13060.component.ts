import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ITLTTALENT, TLTTALENT_columns } from './tls13060.model';
import { VendorCategoryOptionsService } from '../../../service/API/dropdownservice/vendor-category-options.service';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';

@Component({
  selector: 'app-tls13060',
  templateUrl: './tls13060.component.html',
  styleUrls: ['./tls13060.component.scss'],
})
export class TLS13060Component extends BasicQueryPageComponent<ITLTTALENT> implements OnInit {
  queryForm = this.formBuilder.group({
    apply_no: ['', [Validators.maxLength(12)]], // 專櫃招募編號
    ven_uniform: [null], // 廠商統一編號
    tlt_no: ['', [Validators.maxLength(12)]], // 專櫃編號
    tlt_name: ['', [Validators.maxLength(100)]], // 櫃位名稱
    locationCode: [null], // 位置編號
    tlt_openflag: [null], // 營運狀況
    tlt_bdate: [null], // 契約起始日
    tlt_edate: [null], // 契約截止日
    tlt_contract_bdate: [null], // 營運起始日
    tlt_contract_edate: [null], // 營運截止日
    tlt_term_type: [null], // 抽成別
    paytype: [null], // 付款方式
    rece_yn: [null], // 是否開立業主發票
    pos_yn: [null], // 是否使用業主收銀機
    cash_yn: [null], // 是否為業主收現
  });
  data: ITLTTALENT[] = [];
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
    private locationOptionsService: LocationOptionsService
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
    });
  }
}
