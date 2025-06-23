import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

interface SalesRecord {
  paymentTool: string;
  actualShortfallAmount: number;
  preAuditShortfallAmount: number;
  receiptTotal: number;
  systemTotal: number;
  compareCD: '✔️' | '❌';
  compareAB: '✔️' | '❌';
}

@Component({
  selector: 'app-tls2a030',
  templateUrl: './tls2a030.component.html'
})
export class TLS2A030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_bdate_start: [null, Validators.required],
    tlt_bdate_end: [null, Validators.required],
    tlt_no: [''],
    tlt_no_end: [''],
    ...createPaginationConfig([{ field: 'paymentTool', order: 1 }])
  });

  data: SalesRecord[] = [];
  totalRecords = 0;
  selectedItems: SalesRecord[] = [];

  // 表格欄位
  columns = [
    { field: 'paymentTool', header: '支付工具' },
    { field: 'actualShortfallAmount', header: '實際淨欠總額 (A)' },
    { field: 'preAuditShortfallAmount', header: '審核前淨欠總額 (B = C - D)' },
    { field: 'receiptTotal', header: '實收總額 (C)' },
    { field: 'systemTotal', header: '系統帳 (D)' },
    { field: 'compareCD', header: '(C) 與 (D) 比較' },
    { field: 'compareAB', header: '(A) 與 (B) 比較' }
  ];

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ecrNoService: ECRNoService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A030', undefined, this.queryForm, this.onSubmit.bind(this));
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;

    // 假資料，實際應從 API 抓資料
    const rawData = [
      {
        paymentTool: '現金',
        actualShortfallAmount: -74760642,
        receiptTotal: 1175669391,
        systemTotal: 1250430033
      },
      {
        paymentTool: '聯合信用卡',
        actualShortfallAmount: 1412153,
        receiptTotal: 1128433256,
        systemTotal: 1127021103
      }
    ];

    this.data = rawData.map(item => {
      const preAudit = item.receiptTotal - item.systemTotal;
      return {
        ...item,
        preAuditShortfallAmount: preAudit,
        compareCD: this.compareValues(item.receiptTotal, item.systemTotal),
        compareAB: this.compareValues(item.actualShortfallAmount, preAudit)
      };
    });

    this.totalRecords = this.data.length;
    this.loading = false;
  }

  compareValues(a: number, b: number): '✔️' | '❌' {
    return a === b ? '✔️' : '❌';
  }

}
