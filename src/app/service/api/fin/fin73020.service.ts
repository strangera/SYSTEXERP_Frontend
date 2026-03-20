import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { FIN73020Data, FIN73020Option, FIN73020Query } from '@pages/fin/fin73020/fin73020.model';

@Injectable({ providedIn: 'root' })
export class FIN73020Service {
  private readonly mockData: FIN73020Data[] = [
    {
      dataKey: 'TC201407170001-2014051402',
      paymentRequestNo: 'TC201407170001',
      createDate: '2014/07/17',
      status: '撥補',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicant: '2018000396-李小美',
      applicantDept: '105500-裝修管理Team',
      custodian: '2016000268-謝小欣',
      expenseAccount: '620799/修繕費-其他',
      expenseDept: '105500-裝修管理Team',
      subjectSummary: '10307-停管設備修理',
      detailCategory: '收據',
      receiptNo: '2014051402',
      expenseDate: '2014/05/14',
      amountUntaxed: 1000,
      tax: 50,
      total: 1050,
      voucherNo: '20140710003',
      applicantNo: '2018000396',
      custodianNo: '2016000268',
      custodianDeptNo: '105500',
    },
    {
      dataKey: 'TC201407170001-2014051401',
      paymentRequestNo: 'TC201407170001-2',
      createDate: '2014/07/17',
      status: '撥補',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicant: '2018000396-李小美',
      applicantDept: '105500-裝修管理Team',
      custodian: '2016000268-謝小欣',
      expenseAccount: '620799/修繕費-其他',
      expenseDept: '105500-裝修管理Team',
      subjectSummary: '10307-停管設備修理',
      detailCategory: '收據',
      receiptNo: '2014051401',
      expenseDate: '2014/05/14',
      amountUntaxed: 2000,
      tax: 100,
      total: 2100,
      voucherNo: '',
      applicantNo: '2018000396',
      custodianNo: '2016000268',
      custodianDeptNo: '105500',
    },
  ];

  constructor() {}

  public queryFIN73020(query: FIN73020Query): Observable<BaseQueryResponse<FIN73020Data>> {
    return of(this.mockData).pipe(
      delay(200),
      map((data): BaseQueryResponse<FIN73020Data> => {
        let filtered = [...data];

        if (query.paymentRequestNo) {
          filtered = filtered.filter(x => x.paymentRequestNo === query.paymentRequestNo);
        }

        if (query.applicantNo) {
          filtered = filtered.filter(x => x.applicantNo === query.applicantNo);
        }

        if (query.custodianNo) {
          filtered = filtered.filter(x => x.custodianNo === query.custodianNo);
        }

        if (query.status) {
          filtered = filtered.filter(x => x.status === query.status);
        }

        if (query.custodianDeptNo) {
          filtered = filtered.filter(x => x.custodianDeptNo === query.custodianDeptNo);
        }

        if (query.createDateStart) {
          filtered = filtered.filter(x => this.normalizeDate(x.createDate) >= query.createDateStart!);
        }

        if (query.createDateEnd) {
          filtered = filtered.filter(x => this.normalizeDate(x.createDate) <= query.createDateEnd!);
        }

        const totalCount = filtered.length;
        const pageIndex = query.pageIndex || 1;
        const pageSize = query.pageSize || 10;
        const start = (pageIndex - 1) * pageSize;
        const pageData = filtered.slice(start, start + pageSize);

        return {
          Status: 'success',
          Message: 'Success',
          Data: pageData,
          TotalCount: totalCount,
          TotalPage: Math.ceil(totalCount / pageSize),
        };
      })
    );
  }

  public getPaymentRequestNoOptions(): Observable<FIN73020Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: 'TC201407170001', value: 'TC201407170001' },
      { label: 'TC201407170001-2', value: 'TC201407170001-2' },
    ]);
  }

  public getApplicantOptions(): Observable<FIN73020Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '2018000396-李小美', value: '2018000396' },
      { label: '2018000555-陳小華', value: '2018000555' },
    ]);
  }

  public getCustodianOptions(): Observable<FIN73020Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '2016000268-謝小欣', value: '2016000268' },
      { label: '2016000999-林小文', value: '2016000999' },
    ]);
  }

  public getStatusOptions(): Observable<FIN73020Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '撥補', value: '撥補' },
      { label: '未撥補', value: '未撥補' },
      { label: '作廢', value: '作廢' },
    ]);
  }

  private normalizeDate(value: Date | string): string {
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    return (value || '').replace(/\D/g, '');
  }
}