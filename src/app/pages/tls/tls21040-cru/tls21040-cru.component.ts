import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';


@Component({
  selector: 'app-tls21040-cru',
  templateUrl: './tls21040-cru.component.html',
})
export class TLS21040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    bankCode: [],
    bankName: [],
    cardType: [],
    cardCategory: [],
    ntRetrieve: [],
    retrieve: [],
    cardIdentifier: [],
  });
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
    this.initializePage('TLS21040', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
