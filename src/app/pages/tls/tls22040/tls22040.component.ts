import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';
import { Tls22040Service } from '../../../service/api/tls/tls22040.service';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls22040',
  templateUrl: './tls22040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    ...createPaginationConfig([{ field: 'PAY_Name', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;

  columnGroup4 = [
    { field: '111', header: '開立電子發票' },
    { field: '222', header: '上送到Tumkey目錄' },
    { field: '333', header: 'Tumkey DB 回覆時間' }
  ];

  columns: Column[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, groupField: '111' },
    { field: 'MIG_Type', header: '發票類型', visible: true, groupField: '111' },
    { field: 'MIG_Type_Name', header: '發票類型名稱', visible: false },
    { field: 'InvoiceNum', header: '發票張數', visible: true, groupField: '111' },
    { field: 'UpMaxNum', header: '上傳大平台筆數', visible: true, groupField: '333' },
    { field: 'LastBagTime', header: '最後打包時間', visible: true, groupField: '222' },
    { field: 'LastUpTime', header: '最後上傳大平台筆數', visible: true, groupField: '333' },
    { field: 'DiffNum', header: '差異筆數', visible: true },
  ];


  constructor(private tls22040Service: Tls22040Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22040', 'TLS/TLS22040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // 格式化函式
  private formatToYMD(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {

      const parts = dateStr.split(' ')[0].replace(/\//g, '/'); // "2025-08-02"
      return parts;
    }
    return d.toISOString().split('T')[0]; // "2025-08-02"
  }

  /** 查詢主表 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.submitted = true;
      if (frm.invalid) return;
      this.loading = true;
      const raw = frm.value;

      // 日期轉換 yyyy/MM/dd
      const formatDate = (d: any) =>
        d ? new Date(d).toISOString().split('T')[0].replace(/-/g, '/') : '';

      const payload = {
        PageSize: 0,
        PageIndex: 0,
        OrderBy: 'PAY_Name',
        Offset: 0,
        SortBy: [], // 後端不接受帶值，送空陣列
        TXN_DateStart: formatDate(raw.TXN_DateStart),
        TXN_DateEnd: formatDate(raw.TXN_DateEnd),
      };

      this.tls22040Service.queryTLS22040(payload).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((x: any) => ({
            ...x,
            TXN_Date: this.formatToYMD(x.TXN_Date),
            // LastBagTime: this.formatToYMD(x.LastBagTime),
            // LastUpTime: this.formatToYMD(x.LastUpTime),
          }));
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;
        },
        error: (err) => {
          console.error('查詢 TLS22040 失敗:', err);
          this.loading = false;
        },
      });
    });
  }
  override onDetail(row: any): void {
    console.log('電子發票上送筆數檢核表 被點擊:', row);

    const formatDateForDetail = (dateStr: string) =>
      dateStr ? dateStr.replace(/-/g, '/') : '';

    // 打明細 API
    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: 'TXN_Date',
      Offset: 0,
      SortBy: [],
      TXN_Date: formatDateForDetail(row.TXN_Date), // 轉回 yyyy/MM/dd
      MIG_Type: row.MIG_Type
    };

    this.tls22040Service.queryTLS22040_Detail(payload).subscribe({
      next: (res) => {
        const detailData = res?.Data ?? [];

        const rowdataWithDetail = {
          ...row,
          details: detailData
        };

        this.navigateWithState(CRUDStatus.Edit, rowdataWithDetail);
      },
      error: (err) => {
        console.error('查詢 TLS22040 明細失敗:', err);
      }
    });
  }



}
