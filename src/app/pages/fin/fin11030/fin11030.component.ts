import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { APS2001Data, SAL_GUIPaperOptions } from './fin11030.model';
import { Fin11030Service } from '../../../service/api/fin/fin11030.service';

@Component({
  selector: 'app-fin11030',
  templateUrl: './fin11030.component.html',
})
//1.1.1.3 銷項品項資料設定
export class FIN11030Component extends BasicQueryPageComponent<APS2001Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SAL_GUIYYYYMM_start: [null, [Validators.required]],
    SAL_GUIYYYYMM_end: [null, [Validators.required]],
    SAL_GUITrack: ['', [Validators.maxLength(2)]],
    SAL_GUIBegNo: ['', [Validators.maxLength(8), Validators.max(99999999)]],
    SAL_GUIEndNo: ['', [Validators.maxLength(8), Validators.max(99999999)]],
    SAL_GUIPaper: [null],
    ...createPaginationConfig([{ field: 'id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  SAL_GUIPaperOptions = SAL_GUIPaperOptions;     // 發票類別選項
  data: APS2001Data[] = [];
  selectedRows: APS2001Data[] = [];
  columns: Column[] = [
    { field: 'index', header: '序號', visible: true },
    { field: 'SAL_GUIYYYYMM', header: '發票年月', visible: true },
    { field: 'SAL_GUITrack', header: '字軌', visible: true },
    { field: 'SAL_GUIBegNo', header: '發票號碼(起)', visible: true },
    { field: 'SAL_GUIEndNo', header: '發票號碼(迄)', visible: true },
    { field: 'SAL_Type', header: '發票類別', visible: true },
    { field: 'GUI_DingType', header: '是否為丁種發票', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];

  constructor(private fin11030Service: Fin11030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', '/FIN/FIN11030CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onDelete(selectedRows: APS2001Data[]) {
    const ids = selectedRows.map(row => row.id);
    this.fin11030Service.deleteFIN11030(ids).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.fin11030Service.queryFIN11030(frm.value).subscribe((response) => {
        this.data = response.Data.map((item: APS2001Data) => ({
          ...item,
          SAL_GUIYYYYMM: this.convertYYYYMMToDate(item.SAL_GUIYYYYMM)
        }));
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
        this.loading = false;
      });

      this.loading = false;
    });
  }
  // 將 "YYYYMM" 轉為 Date 物件
  private convertYYYYMMToDate(yyyymm: string): Date | null {
    if (!/^\d{6}$/.test(yyyymm)) return null;
    const year = Number(yyyymm.substring(0, 4));
    const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
    return new Date(year, month, 1);
  }
}
