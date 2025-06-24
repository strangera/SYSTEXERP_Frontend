import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
const day = new Date();

interface TLS22040 {
  id: 0,
  Role_No: "string",
  Role_Name: "string",
  Description: "string",
  CRT_Date: "2025-06-18T15:37:00.263Z",
  CRT_USR_No: "string",
  CRT_USR_Name: "string",
  UPD_Date: "2025-06-18T15:37:00.263Z",
  UPD_USR_No: "string",
  UPD_USR_Name: "string"
}

@Component({
  selector: 'app-tls22040',
  templateUrl: './tls22040.component.html',
  styleUrl: './tls22040.component.scss'
})
export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  // 查詢表單
  queryForm = this.formBuilder.group({
    fileDate: [day, [Validators.required]], // 產檔日期*
    saleDateRange: [null, []], // 銷售日期
  });
  // 表格資料
  data: any[] = [];
  columns: Column[] = [
    { field: 'salesDate', header: 'IMS應上送筆數-銷售日期', visible: true },
    { field: 'invoiceTypeIMS', header: 'IMS應上送筆數-發票類型', visible: true },
    { field: 'invoiceAmountIMS', header: 'IMS應上送筆數-發票金額', visible: true },
    { field: 'invoiceCountIMS', header: 'IMS應上送筆數-發票筆數', visible: true },
    { field: 'creationTimeIMS', header: 'IMS應上送筆數-建立時間', visible: true },
    { field: 'fileDate', header: 'Turnkey上送資訊-產檔日期', visible: true },
    { field: 'invoiceTypeTurnkey', header: 'Turnkey上送資訊-發票類型', visible: true },
    { field: 'invoiceCountTurnkey', header: 'Turnkey上送資訊-發票筆數', visible: true }
  ];

  constructor() {
    super()
  }

  ngOnInit(): void {
    // 初始一定要下initializePage
    this.initializePage('TLS22040', '/TLS/TLS22040CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // 打API
    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
