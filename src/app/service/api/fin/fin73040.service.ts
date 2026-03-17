import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { FIN73040Data, FIN73040Option, FIN73040Query } from '@pages/fin/fin73040/fin73040.model';

@Injectable({ providedIn: 'root' })
export class FIN73040Service {
  private readonly mockData: FIN73040Data[] = [
    {
      dataKey: 'TC201407280003-1',
      custodianDept: '102000-營運部',
      custodian: '2014000016-楊小彥',
      applyDate: '2014/07/22',
      paymentRequestNo: 'TC201407280003',
      paymentDate: '2014/07/28',
      replenishDate: '',
      replenishAmount: 777,
      unpaidAmount: 0,
      custodianNo: '2014000016',
      custodianDeptNo: '102000',
    },
    {
      dataKey: 'TC201407280003-2',
      custodianDept: '102000-營運部',
      custodian: '2014000016-楊小彥',
      applyDate: '2014/07/22',
      paymentRequestNo: 'TC201407280003',
      paymentDate: '2014/07/28',
      replenishDate: '',
      replenishAmount: 2000,
      unpaidAmount: 0,
      custodianNo: '2014000016',
      custodianDeptNo: '102000',
    },
    {
      dataKey: 'TC201407280003-3',
      custodianDept: '102000-營運部',
      custodian: '2014000016-楊小彥',
      applyDate: '2014/07/22',
      paymentRequestNo: 'TC201407280003',
      paymentDate: '2014/07/28',
      replenishDate: '',
      replenishAmount: 150,
      unpaidAmount: 0,
      custodianNo: '2014000016',
      custodianDeptNo: '102000',
    },
    {
      dataKey: 'TC201407280003-4',
      custodianDept: '102000-營運部',
      custodian: '2014000016-楊小彥',
      applyDate: '2014/07/22',
      paymentRequestNo: 'TC201407280003',
      paymentDate: '2014/07/28',
      replenishDate: '',
      replenishAmount: 150,
      unpaidAmount: 0,
      custodianNo: '2014000016',
      custodianDeptNo: '102000',
    },
    {
      dataKey: 'TC201407280003-5',
      custodianDept: '102000-營運部',
      custodian: '2014000016-楊小彥',
      applyDate: '2014/07/22',
      paymentRequestNo: 'TC201407280003',
      paymentDate: '2014/07/28',
      replenishDate: '',
      replenishAmount: 1445,
      unpaidAmount: 0,
      custodianNo: '2014000016',
      custodianDeptNo: '102000',
    },
  ];

  constructor() {}

  public queryFIN73040(query: FIN73040Query): Observable<BaseQueryResponse<FIN73040Data>> {
    return of(this.mockData).pipe(
      delay(200),
      map((data): BaseQueryResponse<FIN73040Data> => {
        let filtered = [...data];

        if (query.paymentRequestNo) {
          filtered = filtered.filter(x => x.paymentRequestNo === query.paymentRequestNo);
        }

        if (query.custodianNo) {
          filtered = filtered.filter(x => x.custodianNo === query.custodianNo);
        }

        if (query.custodianDeptNo) {
          filtered = filtered.filter(x => x.custodianDeptNo === query.custodianDeptNo);
        }

        if (query.applyDateStart) {
          filtered = filtered.filter(x => this.normalizeDate(x.applyDate) >= query.applyDateStart!);
        }

        if (query.applyDateEnd) {
          filtered = filtered.filter(x => this.normalizeDate(x.applyDate) <= query.applyDateEnd!);
        }

        if (query.paymentDateStart) {
          filtered = filtered.filter(x => this.normalizeDate(x.paymentDate) >= query.paymentDateStart!);
        }

        if (query.paymentDateEnd) {
          filtered = filtered.filter(x => this.normalizeDate(x.paymentDate) <= query.paymentDateEnd!);
        }

        if (query.replenishDateStart) {
          filtered = filtered.filter(x => this.normalizeDate(x.replenishDate) >= query.replenishDateStart!);
        }

        if (query.replenishDateEnd) {
          filtered = filtered.filter(x => this.normalizeDate(x.replenishDate) <= query.replenishDateEnd!);
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

  public getPaymentRequestNoOptions(): Observable<FIN73040Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: 'TC201407280003', value: 'TC201407280003' },
      { label: 'TC201407280004', value: 'TC201407280004' },
    ]);
  }

  public getCustodianOptions(): Observable<FIN73040Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '2014000016-楊小彥', value: '2014000016' },
      { label: '2014000099-林小華', value: '2014000099' },
    ]);
  }

  private normalizeDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    return String(value).replace(/\D/g, '');
  }
}