import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { FIN73030Data, FIN73030Option, FIN73030Query } from '@pages/fin/fin73030/fin73030.model';

@Injectable({ providedIn: 'root' })
export class FIN73030Service {
  private readonly mockData: FIN73030Data[] = [
    {
      dataKey: 'TC201502060005-1',
      paymentRequestNo: 'TC201502060005',
      createDate: '2015/02/06',
      status: '已完成',
      printSignOff: true,
      title: '零用金撥補：TC201502060005',
      contentName: '零用金撥補：TC201502060005',
      unit: '',
      quantity: null,
      unitPrice: null,
      totalPrice: 22597,
    },
    {
      dataKey: 'TC201502060005-2',
      paymentRequestNo: 'TC201502060005',
      createDate: '2015/02/06',
      status: '已完成',
      printSignOff: true,
      title: '零用金撥補：TC201502060005',
      contentName: '',
      unit: '',
      quantity: null,
      unitPrice: null,
      totalPrice: 0,
    },
    {
      dataKey: 'TC201502060006-1',
      paymentRequestNo: 'TC201502060006',
      createDate: '2015/02/08',
      status: '草稿',
      printSignOff: false,
      title: '零用金撥補：TC201502060006',
      contentName: '零用金撥補：TC201502060006',
      unit: '',
      quantity: null,
      unitPrice: null,
      totalPrice: 18500,
    },
  ];

  constructor() {}

  public queryFIN73030(query: FIN73030Query): Observable<BaseQueryResponse<FIN73030Data>> {
    return of(this.mockData).pipe(
      delay(200),
      map((data): BaseQueryResponse<FIN73030Data> => {
        let filtered = [...data];

        if (query.paymentRequestNo) {
          filtered = filtered.filter(x => x.paymentRequestNo === query.paymentRequestNo);
        }

        if (query.status) {
          filtered = filtered.filter(x => x.status === query.status);
        }

        if (query.printSignOff !== null && query.printSignOff !== undefined) {
          filtered = filtered.filter(x => x.printSignOff === query.printSignOff);
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

  public getPaymentRequestNoOptions(): Observable<FIN73030Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: 'TC201502060005', value: 'TC201502060005' },
      { label: 'TC201502060006', value: 'TC201502060006' },
    ]);
  }

  public getStatusOptions(): Observable<FIN73030Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '已完成', value: '已完成' },
      { label: '草稿', value: '草稿' },
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