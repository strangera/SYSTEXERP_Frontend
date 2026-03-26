import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { FIN73010Data, FIN73010Option, FIN73010Query } from '@pages/fin/fin73010/fin73010.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';

@Injectable({ providedIn: 'root' })
export class FIN73010Service {
  private readonly mockData: FIN73010Data[] = [
    {
      dataKey: 'C201407170001-2014051401',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicantNo: '2014000044',
      applicantName: '王小明',
      applicantDept: '104200-營運部',
      custodianNo: '2014000044',
      custodianName: '王小明',
      custodianDept: '104200-營運部',
      status: '撥補',
      expenseAccountNo: '620401',
      expenseAccountName: '室內雜項費',
      expenseDeptNo: '101000',
      expenseDeptName: '總營企管部(停用)',
      subjectSummary: '10305-5/14出差-腳手架',
      detailCategory: '收據',
      invoiceReceiptNo: '2014051401',
      expenseDate: '2014/05/14',
      amountUntaxed: 1410,
      tax: 70,
      total: 1480,
    },
    {
      dataKey: 'C201407170001-2014051402',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicantNo: '2014000044',
      applicantName: '王小明',
      applicantDept: '104200-營運部',
      custodianNo: '2014000044',
      custodianName: '王小明',
      custodianDept: '104200-營運部',
      status: '撥補',
      expenseAccountNo: '620401',
      expenseAccountName: '室內雜項費',
      expenseDeptNo: '101000',
      expenseDeptName: '總營企管部(停用)',
      subjectSummary: '10305-5/14出差-腳手架',
      detailCategory: '收據',
      invoiceReceiptNo: '2014051402',
      expenseDate: '2014/05/14',
      amountUntaxed: 1367,
      tax: 68,
      total: 1435,
    },
    {
      dataKey: 'C201407170001-NA-1',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicantNo: '2014000044',
      applicantName: '王小明',
      applicantDept: '104200-營運部',
      custodianNo: '2014000044',
      custodianName: '王小明',
      custodianDept: '104200-營運部',
      status: '撥補',
      expenseAccountNo: '620401',
      expenseAccountName: '室內雜項費',
      expenseDeptNo: '101000',
      expenseDeptName: '總營企管部(停用)',
      subjectSummary: '10305-5/14出差-腳手架',
      detailCategory: '不扣抵憑證',
      invoiceReceiptNo: '',
      expenseDate: '2014/05/14',
      amountUntaxed: 440,
      tax: 0,
      total: 440,
    },
    {
      dataKey: 'C201407170001-NA-2',
      pettyCashNo: 'C201407170001',
      applyDate: '2014/07/10',
      applicantNo: '2014000044',
      applicantName: '王小明',
      applicantDept: '104200-營運部',
      custodianNo: '2014000044',
      custodianName: '王小明',
      custodianDept: '104200-營運部',
      status: '撥補',
      expenseAccountNo: '622201',
      expenseAccountName: '文康費-招待費',
      expenseDeptNo: '101000',
      expenseDeptName: '總營企管部(停用)',
      subjectSummary: '10305-招商會議餐-餐券',
      detailCategory: '不扣抵憑證',
      invoiceReceiptNo: '',
      expenseDate: '2014/05/14',
      amountUntaxed: 2074,
      tax: 0,
      total: 2074,
    },
  ];

  constructor() { }

  public queryFIN73010(query: FIN73010Query): Observable<BaseQueryResponse<FIN73010Data>> {
    return of(this.mockData).pipe(
      delay(200),
      map((data): BaseQueryResponse<FIN73010Data> => {
        let filtered = [...data];

        if (query.pettyCashNo) {
          filtered = filtered.filter(x => x.pettyCashNo === query.pettyCashNo);
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
          filtered = filtered.filter(x => x.custodianDept.startsWith(query.custodianDeptNo!));
        }

        if (query.applyDateStart) {
          filtered = filtered.filter(x => this.normalizeDate(x.applyDate) >= query.applyDateStart!);
        }

        if (query.applyDateEnd) {
          filtered = filtered.filter(x => this.normalizeDate(x.applyDate) <= query.applyDateEnd!);
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

  public getPettyCashNoOptions(): Observable<FIN73010Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: 'C201407170001', value: 'C201407170001' },
      { label: 'C201407170002', value: 'C201407170002' },
    ]);
  }

  public getApplicantOptions(): Observable<FIN73010Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '2014000044-王小明', value: '2014000044' },
      { label: '2014000088-陳小華', value: '2014000088' },
    ]);
  }

  public getCustodianOptions(): Observable<FIN73010Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '2014000044-王小明', value: '2014000044' },
      { label: '2014000099-林小芳', value: '2014000099' },
    ]);
  }

  public getStatusOptions(): Observable<FIN73010Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '撥補', value: '撥補' },
      { label: '未撥補', value: '未撥補' },
      { label: '作廢', value: '作廢' },
    ]);
  }

  public getCustodianDeptOptions(): Observable<FIN73010Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '104200-營運部', value: '104200' },
      { label: '101000-總營企管部', value: '101000' },
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