import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
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
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { finalize, forkJoin } from 'rxjs'; // 引入 forkJoin
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls55050',
  templateUrl: './tls55050.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [DatePipe, ButtonModule, NgFor, NgIf, DividerModule, AsyncPipe, DropdownComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55050Component extends BasicQueryPageComponent<Tls55050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    cls_Month: [new Date(), [Validators.required]],
    VEN_No: [null],
  });

  VEN_NoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });

  // 上半部資料 (Up)
  data: Tls55050Data[] = [];
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'ACP_YYYYMM', header: '結帳年月' },
    { field: 'VEN_No', header: '廠商編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'LOGO_CH_NAME', header: '品牌名稱' },
    { field: 'OTA_Status', header: '狀態' },
  ];
  lastQueryBody: Tls55050Body | null = null;

  // 下半部資料 (Down)
  data2: Tls55050Data[] = [];
  totalRecords2 = 0;
  columns2: ReportColumn[] = [
    { field: 'VouNo', header: '傳票編號' },
    { field: 'VouType', header: '傳票種類', format: (value) => getSYS1000('VouType', value) },
    { field: 'VouDate', header: '傳票日期', format: formatDate },
    { field: 'PostFlag', header: '傳票狀態', format: (value) => getSYS1000('PostFlag', value) },
    { field: 'Remark', header: '傳票摘要' },
  ];
  lastQueryBody2: Tls55050Body | null = null;

  constructor(
    public readonly tls55050Service: Tls55050Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55050', 'tls/tls55050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }

  /**
   * 修正後的 onSubmit：同時打 Up 與 Down API
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: Tls55050Body = {
        ...frm.value,
        cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM') ?? ''
      };

      // 使用 forkJoin 同時執行兩個非同步請求
      forkJoin({
        up: this.tls55050Service.queryTLS55050_Up(body),
        down: this.tls55050Service.queryTLS55050_Down(body)
      })
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(({ up, down }) => {
          // 處理上半部資料
          this.data = up.Data;
          this.totalRecords = up.TotalCount;

          // 處理下半部資料
          this.data2 = down.Data;
          this.totalRecords2 = down.TotalCount;

          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  private executeAction(frm: FormGroup, apiCall: (body: Tls55050Body) => any, successMsg: string, confirmConfig?: any) {
    this.handleSubmit(frm, () => {
      const body: Tls55050Body = {
        ...frm.value,
        cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM') ?? ''
      };

      const runRequest = () => {
        apiCall(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res: any) => {
          this.messageService.successBubble(res.Message || successMsg);
          this.onSubmit(frm); // 執行完動作後重新查詢上下兩表
        });
      };

      if (confirmConfig) {
        this.messageService.confirm({ ...confirmConfig, accept: runRequest, reject: () => this.loading = false });
      } else {
        runRequest();
      }
    });
  }

  get ym() { return this.datePipe.transform(this.queryForm.value.cls_Month, 'yyyy/MM'); }
  settleErrors: any[] = [];
  onSettle(frm: FormGroup) {
    this.settleErrors = [];
    this.handleSubmit(frm, () => {
      const body: Tls55050Body = {
        ...frm.value,
        cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM') ?? ''
      };
      this.messageService.confirm({
        header: '執行月結作業',
        message: `您確定要執行 ${this.ym} 的月結作業嗎？`,
        icon: 'pi pi-check-square',
        acceptLabel: '開始結帳',
        accept: () => {
          this.tls55050Service.insertTLS55050(body)
            .pipe(finalize(() => this.loading = false), untilDestroyed(this))
            .subscribe((res) => {
              // --- 修正重點：先判斷是否為陣列 ---
              const isArrayData = Array.isArray(res.Data);
              const hasError = isArrayData && res.Data.some((d: any) => d.CanClose === 'NG');

              if (hasError) {
                // 失敗情境：Data 是 Array 且包含 NG
                this.settleErrors = res.Data.filter((d: any) => d.CanClose === 'NG');
                this.messageService.errorBubble('結帳檢查未通過，請查看下方說明');
              } else {
                // 成功情境：Data 可能為 true 或不包含 NG 的 Array
                this.messageService.successBubble(res.Message || '月結成功');
                this.onSubmit(frm);
              }
            });
        },
        reject: () => { this.loading = false; }
      });
    });
  }

  onUnSettle(frm: FormGroup) {
    this.executeAction(frm, b => this.tls55050Service.reinsertTLS55050(b), '反結帳成功', {
      header: '反結帳確認',
      message: `將還原 ${this.ym} 狀態並刪除暫存傳票。`,
      icon: 'pi pi-undo',
      acceptLabel: '執行反結帳'
    });
  }

  onLock(frm: FormGroup) {
    this.executeAction(frm, b => this.tls55050Service.lockTLS55050(b), '鎖定成功', {
      header: '月結鎖定',
      message: `確定要鎖定 ${this.ym} 嗎？`,
      icon: 'pi pi-lock',
      acceptLabel: '確認鎖定'
    });
  }

  onUnlock(frm: FormGroup) {
    this.executeAction(frm, b => this.tls55050Service.unLockTLS55050(b), '解除鎖定成功', {
      header: '解除月結鎖定',
      message: `確定要解除 ${this.ym} 的鎖定狀態嗎？`,
      icon: 'pi pi-lock-open',
      acceptLabel: '解除鎖定'
    });
  }
}
