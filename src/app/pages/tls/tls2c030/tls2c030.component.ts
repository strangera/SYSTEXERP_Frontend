import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2C010Service } from '@service/api/tls/tls2-c010.service';
import { TLS2C030Data, TLS2C030Service } from '@service/api/tls/tls2-c030.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { Column, createPaginationConfig, formatDate, formatDateTime } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls2c030',
  templateUrl: './tls2c030.component.html',
  styleUrl: './tls2c030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, TableComponent]
})
export class TLS2C030Component extends BasicQueryPageComponent<TLS2C030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    onedatedd: ['', Validators.required], // 結帳日期
    ...createPaginationConfig([{ field: 'cls_date', order: -1 }]) // 分頁和排序參數
  });

  closeDate = ''; // 最近關帳日期

  data: TLS2C030Data[] = [];
  selectedItems: TLS2C030Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'id', header: 'ID', hidden: true },
    { field: 'mid', header: 'MID', hidden: true },
    { field: 'cls_date', header: '關帳日期', visible: true, format: formatDate },
    { field: 'day_lock_date', header: '日關帳鎖定日期', visible: true, format: formatDateTime },
    { field: 'day_USR_No', header: '日關帳鎖定人員', visible: true },
    { field: 'day_USR_Name', header: '日關帳鎖定人員姓名', visible: true },
  ];

  constructor(
    private datePipe: DatePipe,
    private tls2c030Service: TLS2C030Service,
    private tls2c010Service: TLS2C010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C030', 'tls/tls2c030cru', this.queryForm, (form) => this.onSubmit(form));

    // 取得最近關帳日期
    this.tls2c010Service.getTLS2C010Date()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.closeDate = response.Data.CLS_DATE || '';
        // cls_date 為 closeDate - 1 天
        const nextDate = new Date(this.closeDate);
        nextDate.setDate(nextDate.getDate() - 1);
        this.queryForm.patchValue({ onedatedd: this.datePipe.transform(nextDate, 'yyyy/MM/dd') || '' });
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls2c030Service.queryTLS2C030(
        {
          ...frm.getRawValue(),
          onedatedd: this.datePipe.transform(frm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || ''
        })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  defineDateCheckout() {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    // 檢查是否小於等於最後關帳日期
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (selectedDate && this.closeDate) {
      const selected = new Date(selectedDate);
      const lastClose = new Date(this.closeDate);

      if (selected <= lastClose) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    // 呼叫 definedatecheckoutTLS2C030
    this.tls2c030Service.definedatecheckoutTLS2C030(this.params)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // 處理回應
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm); // 重新查詢資料
      });
  }

  undefineDateCheckout() {
    if (this.queryForm.invalid) {
      this.submitted = true;
      return;
    }

    // 檢查是否小於等於最後關帳日期
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (selectedDate && this.closeDate) {
      const selected = new Date(selectedDate);
      const lastClose = new Date(this.closeDate);

      if (selected <= lastClose) {
        this.messageService.warnBubble('已關帳，無法進行調整。');
        return;
      }
    }

    // 進行反日結的邏輯
    this.tls2c030Service.undefinedatecheckoutTLS2C030(this.params)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // 處理回應
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm); // 重新查詢資料
      });
  }

  get params() {
    return {
      onedatedd: this.datePipe.transform(this.queryForm.get('onedatedd')?.value, 'yyyy-MM-ddTHH:mm:ss') || ''
    };
  }

  get isDateClosed(): boolean {
    const selectedDate = this.queryForm.get('onedatedd')?.value;
    if (!selectedDate || !this.closeDate) {
      return false;
    }

    const selected = new Date(selectedDate);
    const lastClose = new Date(this.closeDate);
    return selected <= lastClose;
  }
}
