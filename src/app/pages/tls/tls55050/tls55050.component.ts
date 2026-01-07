import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55050Body, Tls55050Data, Tls55050Service } from '@service/api/tls/tls55050.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls55050',
  templateUrl: './tls55050.component.html',
  standalone: true,
  imports: [DividerModule, AsyncPipe, DropdownComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55050Component extends BasicQueryPageComponent<Tls55050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    cls_Month: [new Date(), [Validators.required]],
    VEN_No: [null],
  });
  VEN_NoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' })
  data: Tls55050Data[] = [];
  lastQueryBody: Tls55050Body | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'ACP_YYYYMM', header: '結帳年月' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'LOGO_CH_NAME', header: '品牌名稱' },
    { field: 'OTA_Status', header: '狀態' },
    { field: 'TotalCount', header: '總筆數' },
  ];
  data2: any[] = [];
  lastQueryBody2: Tls55050Body | null = null;
  totalRecords2 = 0;
  columns2: ReportColumn[] = [
    { field: '', header: '應收(付)明細暫存資料' },
    { field: 'VouNo', header: '傳票編號' },
    { field: 'VouType', header: '傳票種類', format: (value) => getSYS1000('VouType', value) },
    { field: 'VouDate', header: '傳票日期' },
    { field: 'PostFlag', header: '傳票狀態', format: (value) => getSYS1000('PostFlag', value) },
    { field: 'Remark', header: '傳票摘要' },
  ]
  constructor(
    public readonly tls55050Service: Tls55050Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55050', 'tls/tls55050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
      }
      this.tls55050Service.queryTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
  get ym() {
    return this.datePipe.transform(this.queryForm.value.cls_Month, 'yyyy/MM');
  }
  // 結帳
  onSettle(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.messageService.confirm({
        header: '執行月結作業',
        message: `您確定要執行 ${this.ym} 的月結作業嗎？<br><br>` +
          `<div class="text-sm text-gray-600">系統將執行以下程序：<br>` +
          `1. 檢查日結鎖定與確帳狀態<br>` +
          `2. 計算月結存貨成本<br>` +
          `3. 產生廠商請款與存貨暫存傳票(WT)<br>` +
          `4. 更新廠商請款狀態為【已結帳】</div>`,
        icon: 'pi pi-check-square',
        acceptLabel: '開始結帳',
        rejectLabel: '取消',
        accept: () => {
          const body = {
            ...frm.value,
            cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
          }
          this.tls55050Service.insertTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '執行月結作業成功');
            this.onSubmit(frm);
          })
        },
        reject: () => { this.loading = false; }
      });
    });
  }

  // 反結帳
  onUnSettle(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.messageService.confirm({
        header: '反結帳確認',
        message: `<span class="text-red-500 font-bold">警告：執行反結帳將會：</span><br><br>` +
          `1. 清除 ${this.ym} 廠商請款及折讓的傳票編號<br>` +
          `2. 將狀態還原為【未結帳】<br>` +
          `3. <b class="text-red-600">刪除</b> 已產生的 WT 暫存傳票<br><br>` +
          `是否確定執行？`,
        icon: 'pi pi-undo',
        acceptLabel: '執行反結帳',
        rejectLabel: '暫不執行',
        accept: () => {
          const body = {
            ...frm.value,
            cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
          }
          this.tls55050Service.reinsertTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '執行反結帳成功');
            this.onSubmit(frm);
          })
        },
        reject: () => { this.loading = false; }
      });
    });
  }

  // 月結鎖定
  onLock(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.messageService.confirm({
        header: '月結鎖定 (確帳)',
        message: `您確定要鎖定 ${this.ym} 的帳務資料嗎？<br><br>` +
          `<div class="p-3 bg-yellow-50 border-round">` +
          `<i class="pi pi-exclamation-triangle text-yellow-600 mr-2"></i>` +
          `鎖定後將無法進行「結帳」與「反結帳」操作。` +
          `</div>`,
        icon: 'pi pi-lock',
        acceptLabel: '確認鎖定',
        rejectLabel: '取消',
        accept: () => {
          const body = {
            ...frm.value,
            cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
          }
          this.tls55050Service.lockTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '執行月結鎖定成功');
            this.onSubmit(frm);
          })
        },
        reject: () => { this.loading = false; }
      });
    });
  }

  // 月結反鎖定
  onUnlock(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.messageService.confirm({
        header: '解除月結鎖定',
        message: `確定要解除 ${this.ym} 的鎖定狀態嗎？<br><br>` +
          `解除後將恢復「反結帳」與「結帳」的操作權限，請謹慎操作。`,
        icon: 'pi pi-lock-open',
        acceptLabel: '解除鎖定',
        rejectLabel: '放棄',
        accept: () => {
          const body = {
            ...frm.value,
            cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
          }
          this.tls55050Service.unLockTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
            this.messageService.successBubble(res.Message || '解除月結鎖定成功');
            this.onSubmit(frm);
          })
        },
        reject: () => { this.loading = false; }
      });
    });
  }
}
