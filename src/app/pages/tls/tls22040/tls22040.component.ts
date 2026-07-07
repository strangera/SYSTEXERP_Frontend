import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { map, Observable } from 'rxjs';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { AddButton, formatDate, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls22040',
  templateUrl: './tls22040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  multiSortMeta = [{ field: 'TXN_Date', order: 1 }];
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    MIG_TypeList: [[] as string[]],
    ...createPaginationConfig(this.multiSortMeta),
    pageSize: [30],
  });

  migTypeOptions = getSYS1000Options('MIG_Type_TLS22040');

  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;
  columnGroup4 = [
    { field: '開立電子發票', header: '開立電子發票' },
    { field: '上送到Tumkey目錄', header: '上送到Tumkey目錄' },
    { field: 'Tumkey DB 回覆時間', header: 'Tumkey DB 回覆時間' }
  ];

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, groupField: '開立電子發票', format: formatDate },
    { field: 'MIG_Type_Name', header: '發票類型', visible: true, groupField: '開立電子發票' },
    { field: 'InvoiceNum', header: '發票張數', visible: true, groupField: '開立電子發票' },
    { field: 'LastBagTime', header: '最後打包時間', visible: true, groupField: '上送到Tumkey目錄' },
    { field: 'UpMaxNum', header: '上傳大平台筆數', visible: true, groupField: 'Tumkey DB 回覆時間' },
    { field: 'LastUpTime', header: '最後上傳大平台時間', visible: true, groupField: 'Tumkey DB 回覆時間' },
    { field: 'DiffNum', header: '差異筆數', visible: true },
  ];

  constructor(private tls22040Service: Tls22040Service) {
    super();
  }

  canShowDetail = (rowData: any): boolean => {
    return !!rowData.DiffNum && rowData.DiffNum > 0;
  };

  addButton: AddButton[] = [
    {
      label: '查看明細',
      icon: 'pi pi-eye',
      action: (rowData: any) => this.onDetail(rowData),
      disabled: (rowData: any) => !this.canShowDetail(rowData)
    }
  ];

  /** table-report 滾動載入/排序用：補上與 onSubmit 相同的資料整形 */
  tableQueryFunction = (body: any): Observable<any> =>
    this.tls22040Service.queryTLS22040(body).pipe(
      map((res: any) => ({ ...res, Data: this.mapRows(res?.Data) }))
    );

  ngOnInit(): void {
    this.initializePage('TLS22040', 'TLS/TLS22040cru', this.queryForm, (form) => this.onSubmit(form));

    // 若有已存在的查詢狀態，優先還原完整狀態（包含 pageIndex）
    const saved = this.queryStateService.getQueryStateValue('TLS22040');
    if (saved) {
      this.formStatusService.waitForReady(this.ProgNo).subscribe(() => {
        this.queryForm.patchValue(saved);
        // 重新送出查詢以確保畫面與資料一致
        this.onSubmit(this.queryForm);
      });
    }
  }

  private formatDate(d: any): string {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }

  private formatToYMD(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split(' ')[0];
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private mapRows(rows: any[] | null | undefined): any[] {
    return (rows ?? []).map((x: any) => ({
      ...x,
      TXN_Date: this.formatToYMD(x.TXN_Date),
      RowKey: `${this.formatToYMD(x.TXN_Date)}_${x.MIG_Type}`,
      canDetail: !!x.DiffNum && x.DiffNum > 0,
    }));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.submitted = true;
      if (frm.invalid) return;
      this.loading = true;
      const raw = frm.value;

      const payload = {
        pageSize: raw.pageSize || 30,
        pageIndex: 1,
        SortBy: raw.SortBy?.length ? raw.SortBy : this.multiSortMeta,
        TXN_DateStart: this.formatDate(raw.TXN_DateStart),
        TXN_DateEnd: this.formatDate(raw.TXN_DateEnd),
        MIG_TypeList: raw.MIG_TypeList ?? [],
      };

      this.tls22040Service.queryTLS22040(payload).subscribe({
        next: (res) => {
          this.data = this.mapRows(res?.Data);
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.lastQueryBody = payload;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    });
  }

  override onDetail(row: any): void {
    if (!row.canDetail) {
      this.messageService?.warnBubble?.('此筆差異為 0，無法查看明細');
      return;
    }

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: 'TXN_Date',
      Offset: 0,
      SortBy: [],
      TXN_Date: this.formatDate(row.TXN_Date),
      MIG_Type: row.MIG_Type,
    };

    this.tls22040Service.queryTLS22040_Detail(payload).subscribe({
      next: (res) => {
        const detailData = res?.Data ?? [];
        const rowdataWithDetail = { ...row, details: detailData };
        this.navigateWithState(CRUDStatus.Edit, rowdataWithDetail, this.queryForm.getRawValue());
      },
    });
  }

}
