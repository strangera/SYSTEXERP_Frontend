import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Fin11040Service } from '../../../service/api/fin/fin11040.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, TDS1008Data } from './fin11040.model';
import { untilDestroyed } from '@ngneat/until-destroy';
@Component({
  selector: 'app-fin11040',
  templateUrl: './fin11040.component.html',
})
//1.1.1.4 銷項品項資料設定
export class FIN11040Component extends BasicQueryPageComponent<TDS1008Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_ItemNo: ['', [Validators.maxLength(2)]], // 品項代號
    INV_ItemName: ['', [Validators.maxLength(30)]], // 品項名稱
    ...createPaginationConfig([{ field: 'ID', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: TDS1008Data[] = [];
  selectedRows: TDS1008Data[] = [];
  columns = columns;
  constructor(
    private fin11040Service: Fin11040Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11040', '/FIN/FIN11040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.fin11040Service.queryFIN11040(frm.value).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    });
  }

  onDelete(selectedRows: TDS1008Data[]) {
    const idList = selectedRows.map(row => row.ID);
    this.fin11040Service.deleteFIN11040({ idList }).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }
}
