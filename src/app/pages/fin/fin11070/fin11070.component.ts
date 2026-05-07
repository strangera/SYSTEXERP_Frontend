import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN11070Data, FIN11070Service } from '@service/api/fin/fin11070.service';
import { SortOption } from '@shared/models/api/base-api.interface';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin11070',
  templateUrl: './fin11070.component.html',
  styleUrl: './fin11070.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule,
    YearMonthComponent
  ]
})
export class FIN11070Component extends BasicQueryPageComponent<FIN11070Data> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM: ['', [Validators.required]],    // 申報年月
    ...createPaginationConfig([])
  });

  readonly tableData = signal<FIN11070Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: { GUI_YYMM: string; pageSize?: number; pageIndex?: number; SortBy?: unknown };

  readonly columns: ReportColumn[] = [
    {
      field: 'SYS_StoreNo',
      header: '分店編號',
      visible: true,
    },
    {
      field: 'TXN_No',
      header: '發票年月',
      visible: true,
    },
    {
      field: 'TXN_Time',
      header: '預計處理時間',
      visible: true,
      format: formatDate
    },
    {
      field: 'TXN_ProcStatus',
      header: '處理狀態',
      visible: true,
      format: (value: string) => value === 'Y' ? '已處理' : value === 'X' ? '過期' : '待處理'
    },
    {
      field: 'TXN_RspnTime',
      header: '實際處理時間',
      visible: true,
      format: formatDate
    },
    {
      field: 'TXN_RspnCode',
      header: '回應代碼',
      visible: true,
    },
    {
      field: 'TXN_RspnMsg',
      header: '回應訊息',
      visible: true,
    }
  ];

  constructor(
    private fin11070Service: FIN11070Service,
    private datePipe: DatePipe,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11070', 'fin/fin11070cru', this.queryForm, (form) => this.onSubmit(form));
  }

  queryFunction = (body: Record<string, unknown>) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = (body['pageSize'] ?? body['PageSize'] ?? 30) as number;
    const pageIndex = (body['pageIndex'] ?? body['PageIndex'] ?? 1) as number;
    const payload = {
      MID: 0,
      SYS_StoreNo: '10',
      GUI_YYMM: raw.GUI_YYMM ?? '',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body['SortBy'] as SortOption[] | undefined
    };
    return this.fin11070Service.queryFIN11070(payload);
  };

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        GUI_YYMM: raw.GUI_YYMM ?? '',
        pageSize: raw.pageSize ?? 30,
        pageIndex: raw.pageIndex ?? 1
      };
      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody!)
        .pipe(untilDestroyed(this), finalize(() => { this.tableLoading.set(false); this.loading = false; }))
        .subscribe(response => {
          this.tableData.set(response.Data);
          this.totalRecords.set(response.TotalCount);
        });
    });
  }

  downloadFIN11070() {
    // 檢查必填欄位
    if (this.queryForm.controls['GUI_YYMM'].invalid) {
      this.queryForm.controls['GUI_YYMM'].markAsDirty();
      this.submitted = true;
      return;
    }
    const requestData = {
      MID: 0,
      STO_No: '10',
      GUI_YYMM: this.queryForm.value.GUI_YYMM!,
    };

    this.fin11070Service.downloadFIN11070(requestData)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        // 預設檔名
        let filename = 'download.txt';

        // 嘗試從 Content-Disposition 取檔名
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const matches =
            /filename\*?=['"]?UTF-8''?([^;\n]*)/i.exec(contentDisposition) ||
            /filename="?([^;\n"]*)"?/i.exec(contentDisposition);

          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1]);
          }
        }

        // 建立 Blob
        const blob = new Blob([response.body!], { type: 'text/plain;charset=utf-8' });

        // 用 <a> 動態下載
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // 清理
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  insertFIN11070() {
    // 檢查必填欄位
    if (this.queryForm.controls['GUI_YYMM'].invalid) {
      this.queryForm.controls['GUI_YYMM'].markAsDirty();
      this.submitted = true;
      return;
    }
    const requestData = {
      MID: 0,
      SYS_StoreNo: '10',
      GUI_YYMM: this.queryForm.value.GUI_YYMM!,
    };

    this.fin11070Service.insertFIN11070(requestData)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        if (response.Data[0].Status === '0') {
          this.messageService.errorBubble(response.Data[0].Errormsg);
        } else {
          this.messageService.successBubble('寫入產製空白發票成功');
          this.onSubmit(this.queryForm);
        }
      });
  }
}