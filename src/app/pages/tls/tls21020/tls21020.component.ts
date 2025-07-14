import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';


@Component({
  selector: 'app-tls21020',
  templateUrl: './tls21020.component.html',
})
export class TLS21020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    voucherType: [null],  // 控制名稱
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'itemName', header: '項目名稱', visible: true },
    { field: 'accountingSubject', header: '會計科目', visible: true },
    { field: 'organizationCode', header: '組織代碼', visible: true },
    { field: 'invoiceNote', header: '傳票備註', visible: true },
    { field: 'contractAffiliatedOrg', header: '是否依合約拆立組織', visible: true },
    { field: 'relatedPartyDept', header: '區分關係人會科', visible: true },
    { field: 'creditor', header: '應收廠商', visible: true },
    { field: 'paymentDays', header: '付款天數', visible: true }
  ];
  voucherTypeOptions: any[] = [
    { value: 1, label: 'SD銷售日傳票' },
    { value: 2, label: 'MR租金傳票' },
    { value: 3, label: 'MD代扣傳票' },
    { value: 4, label: 'PR抽成傳票' },
    { value: 5, label: 'PN進貨帳款-暫估應付' },
    { value: 6, label: 'PN進貨帳款-成本結轉' },
    { value: 7, label: 'PT進貨請款' },
  ];

  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21020', 'TLS/TLS21020cru', this.queryForm, (form) => this.onSubmit(form));
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    });
  }
}
