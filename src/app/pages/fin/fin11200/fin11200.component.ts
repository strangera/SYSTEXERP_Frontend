import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { finalize } from 'rxjs';
import { Fin11200Service } from '../../../service/api/fin/fin11200.service';
import { columns, monthOptions, Pos1018 } from './fin11200.model';
import { AddButton, Column } from '../../../shared/componentkit/table/table.model';
import { CalendarYearChangeEvent } from 'primeng/calendar';

@Component({
  selector: 'app-fin11200',
  templateUrl: './fin11200.component.html',
})

//FIN11100電子發票配號作業
export class FIN11200Component extends BasicQueryPageComponent<Pos1018> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YY: [null, [Validators.required]], // 發票年月
    GUI_MM: [null, [Validators.required]], // 發票年月
    POS_NOS: [null], // 收銀機編號
  });
  totalRecords = 0;
  monthOptions = monthOptions;
  POS_NOSOptions: { ECR_No: string, ECR_Name: string }[] = [];
  data: Pos1018[] = [
    {
      guiYymm: '202506', // 發票年月 (YYYYMM)
      posNos: '000001', // 收銀機號
      serNos: '000001', // 發票號碼序號
      status: '01', // 使用狀態 '01':使用中
      guiTrack: 'AB', // 發票字軌
      guiSnos: '12345678', // 發票起始號
      guiEnos: '12345778', // 發票終止號
      nextSnos: '12345680', // 下一個發票號碼
      usedNos: 2, // 已用張數
      totNos: 100, // 全部張數
      freeNos: 98, // 未用張數
      remark: '測試資料', // 備註
      creDate: new Date('2025-06-17T10:00:00'), // 建檔日期
      updDate: new Date('2025-06-17T11:30:00'), // 異動日期
      updUser: 'ADMIN', // 異動者
      guiOpenYn: 'Y', // 跨月開立旗標
      stoNo: 'S001', // 分店編號
      guiOverBegDate: new Date('2025-06-01T00:00:00'), // 跨月開立起始日期
      guiOverEndDate: new Date('2025-07-31T23:59:59'), // 跨月開立終止日期
      einvFlag: 'Y', // 電子發票註記
    }
  ];
  selectedRows: Pos1018[] = [];
  columns: Column[] = columns;
  addButton: AddButton[] = [{
    label: '停用', icon: 'pi pi-ban text-red-500', action: (rowData: Pos1018) => { this.onStop(rowData); },
  }]
  disabledMonthDates: Date[] = [];

  constructor(
    private fin11200Service: Fin11200Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', '/FIN/FIN11200CRU', this.queryForm, (form) => this.onSubmit(form));
    this.generateDisabledMonths();
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11200Service.queryFIN11200(frm.value).pipe(finalize(() => this.loading = false)).subscribe((response) => {
        this.data = response.Data.map((item: Pos1018) => ({
          ...item,
          guiYymm: this.convertYYYYMMToDate(item.guiYymm)
        }));
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
  onStop(rowData: any) {
    // this.fin11200Service.stop(rowData).pipe(finalize(() => this.loading = false)).subscribe((response) => {
    //   this.data = response.Data.map((item: Pos1018) => ({
    //     ...item,
    //     guiYymm: this.convertYYYYMMToDate(item.guiYymm)
    //   }));
    //   this.totalRecords = response.TotalCount;
    //   this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    // });
  }

  onUpload() {

  }
  generateDisabledMonths(year?: number): void {
    this.disabledMonthDates = [];
    const currentYear = year || new Date().getFullYear();

    for (let m = 0; m < 12; m++) { // 0-11 for months
      // 如果是偶數月份 (0=Jan, 1=Feb...)
      if ((m + 1) % 2 === 0) { // Check if (m+1) is an even number (Feb, Apr, Jun, Aug, Oct, Dec)
        const firstDayOfMonth = new Date(currentYear, m, 1);
        const lastDayOfMonth = new Date(currentYear, m + 1, 0); // Get last day of the month

        // 遍歷該月份的所有天數並禁用
        for (let d = firstDayOfMonth.getDate(); d <= lastDayOfMonth.getDate(); d++) {
          this.disabledMonthDates.push(new Date(currentYear, m, d));
        }
      }
    }
  }
  onCalendarYearChange(event: CalendarYearChangeEvent): void {
    this.generateDisabledMonths(event.year);
  }
}
