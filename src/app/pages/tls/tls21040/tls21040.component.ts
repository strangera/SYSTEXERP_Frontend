import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup } from '@angular/forms';
import { Column } from '../../../shared/componentkit/table/table.model';


@Component({
  selector: 'app-tls21040',
  templateUrl: './tls21040.component.html',
})
export class TLS21040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    bank: [],
    cardType: [],
    cardCategory: [],
    bin: [],
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'bankCode', header: '銀行代碼', visible: true },
    { field: 'bankName', header: '銀行名稱', visible: true },
    { field: 'cardType', header: '卡種', visible: true },
    { field: 'cardCategory', header: '卡別', visible: true },
    { field: 'ntRetrieve', header: '第NT聯取聯', visible: true },
    { field: 'retrieve', header: '取NT聯', visible: true },
    { field: 'cardIdentifier', header: '卡種識別碼', visible: true },
  ];
  cardTypeOptions: any[] = [
    { value: 'V', label: 'VISA' },
    { value: 'M', label: 'MASTER' },
    { value: 'J', label: 'JCB' },
    { value: 'A', label: 'AE' },
    { value: 'D', label: 'DINVER' },
    { value: 'S', label: '銀聯卡' },
  ];
  cardCategoryOptions: any[] = [
    { value: 1, label: '普卡' },
    { value: 2, label: '金卡' },
    { value: 3, label: '白金卡' },
  ];
  bankOptions: any[] = [
    { value: 1, label: '中國信託' },
    { value: 2, label: '玉山銀行' },
    { value: 3, label: '星展銀行' },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', 'TLS/TLS21040CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
