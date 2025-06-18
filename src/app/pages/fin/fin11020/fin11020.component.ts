import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, MainInvoiceData, subColumns } from './fin11020.model';
import { Fin11020Service } from '../../../service/api/fin/fin11020.service';
import { FileSelectEvent } from 'primeng/fileupload';

//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  styleUrls: ['./fin11020.component.scss']
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [null, [Validators.required]], // 發票年月
    GUI_YYMM_end: [null, [Validators.required]], // 發票年月
    GUI_Track: ['', [Validators.maxLength(2)]], // 字軌
    GUI_No_start: [null, [Validators.maxLength(8), Validators.max(99999999)]], // 發票號碼(起)
    GUI_No_end: [null, [Validators.maxLength(8), Validators.max(99999999)]], // 發票號碼(迄)
    ...createPaginationConfig([{ field: 'ID', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: MainInvoiceData[] = [];
  selectedRows: MainInvoiceData[] = [];
  columns: Column[] = columns;
  subColumns: Column[] = subColumns;
  constructor(
    private fin11020Service: Fin11020Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11020', '/FIN/FIN11020CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11020Service.queryFIN11020(frm.value).subscribe({
        next: (response) => {
          this.data = response.Data.map((item: MainInvoiceData) => ({
            ...item,
            GUI_YYMM: this.convertYYYYMMToDate(item.GUI_YYMM)
          }));
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    });
  }

  // 將 "YYYYMM" 轉為 Date 物件
  private convertYYYYMMToDate(yyyymm: string): Date | null {
    if (!/^\d{6}$/.test(yyyymm)) return null;
    const year = Number(yyyymm.substring(0, 4));
    const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
    return new Date(year, month, 1);
  }

  onDelete(selectedRows: MainInvoiceData[]) {
    const ids = selectedRows.map(row => row.ID);
    this.fin11020Service.deleteFIN11020(ids).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    this.fin11020Service.uploadFIN11020(file).subscribe({
      next: (res) => {
        if (res.Data) {
          this.onSubmit(this.queryForm);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  isRowSelectable(row: MainInvoiceData) {
    return row.GUI_AssignQty === 0;
  }

  editDisabled(rowdata: MainInvoiceData) {
    return rowdata.GUI_AssignQty > 0;
  }
}
