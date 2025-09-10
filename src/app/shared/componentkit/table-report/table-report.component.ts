import { NgFor } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [TableModule, NgFor],
  templateUrl: './table-report.component.html'
})
export class TableReportComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() totalRecords = 0;
  @Input() columns: any = [];

  private lastQueryBody: any;
  private isFirstLoadAfterSubmit = true;
  private loading = true;
  virtualData: any = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.virtualData = Array(this.totalRecords).fill(null);
      setTimeout(() => {
        this.virtualData.splice(0, this.data.length, ...this.data);
      })
    }
  }

  loadDataLazy(event: TableLazyLoadEvent) {
    if (this.isFirstLoadAfterSubmit || !this.lastQueryBody || this.totalRecords === 0) {
      this.isFirstLoadAfterSubmit = false;
      return;
    }
    const last = (event.first ?? 0) + (event.rows ?? 30);
    const pageSize = (last === this.totalRecords) ? this.totalRecords % (event.rows ?? 30) : (event.rows ?? 30);
    const start = (last === this.totalRecords) ? this.totalRecords - pageSize : (event.first ?? 0);
    const end = start + pageSize;
    const cachedDataSlice = this.data.slice(start, Math.min(end, this.data.length));
    if (cachedDataSlice.length > 0 && cachedDataSlice.every(item => item !== null && item !== undefined)) {
      const newVirtualData = [...this.virtualData];
      newVirtualData.splice(start, cachedDataSlice.length, ...cachedDataSlice);
      this.virtualData = newVirtualData;
      return;
    }
    const pageIndex = Math.ceil(start / pageSize + 1);
    const body = {
      ...this.lastQueryBody,
      pageIndex: pageIndex,
      pageSize: pageSize,
    };
    this.fin21020Service.queryFIN21020(body).pipe(finalize(() => this.loading = false)).subscribe(res => {
      if (this.totalRecords !== res.TotalCount) {
        this.totalRecords = res.TotalCount;
        this.data = [];
        this.virtualData = Array(this.totalRecords).fill(null);
      }
      this.data.splice(start, res.Data.length, ...res.Data);
      const newVirtualData = [...this.virtualData];
      newVirtualData.splice(start, res.Data.length, ...res.Data);
      this.virtualData = newVirtualData;
    });
  }
}
