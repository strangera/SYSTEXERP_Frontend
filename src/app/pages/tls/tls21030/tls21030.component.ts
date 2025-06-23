import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-tls21030',
  templateUrl: './tls21030.component.html',
})
export class TLS21030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    settlementMethod: [null],       // 結帳方式
    accountingPeriod: [null],       // 帳次
    useOwnerInvoice: [null],        // 是否使用業主發票
    description1: [''],           // 說明1
    description2: [''],           // 說明2
    description3: [''],           // 說明3
    counterID: [''],              // 專櫃編號
  });
  totalRecords = 0;
  data: any[] = [];
  columns: any[] = [
    { field: 'settlementMethod', header: '結帳方式', visible: true },
    { field: 'account', header: '帳次', visible: true },
    { field: 'useBizReceipt', header: '是否使用業主發票', visible: true },
    { field: 'remark1', header: '說明1', visible: true },
    { field: 'remark2', header: '說明2', visible: true },
    { field: 'remark3', header: '說明3', visible: true },
    { field: 'counterID', header: '專櫃編號', visible: true }
  ];
  settlementMethodOptions = [
    { value: 1, label: '十日結' },
    { value: 2, label: '半月結' },
    { value: 3, label: '月結' },
  ];
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];
  useOwnerInvoiceOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21030', 'TLS/TLS21030CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    })
  }
}
