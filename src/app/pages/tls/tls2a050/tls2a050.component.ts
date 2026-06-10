import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, ReportColumn, formatAmount, formatDate as reportFormatYMD } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { finalize, map } from 'rxjs';
import { Tls2A050Service } from 'src/app/service/api/tls/tls2a050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls2a050',
  templateUrl: './tls2a050.component.html',
  styleUrls: ['./tls2a050.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownModule,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    MultiSelectComponent
  ],
})
export class TLS2A050Component extends BasicQueryPageComponent<any> implements OnInit {
  // 總計列型別：key 為欄位名稱，value 為數值或顯示文字
  private static readonly emptyFooter: Record<string, number | string | null> = { TXN_Date: null };

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  queryForm = this.formBuilder.group({
    POS_TypeList: [[] as string[]],
    salesDate: [new Date()],
    TXN_DateStart: [yesterday],
    TXN_DateEnd: [yesterday],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
    pageSize: [1000],
  });

  data: any[] = [];
  totalRecords = 0;
  POS_TypeListOptions = [
    { label: '一般', value: '' },
    { label: '停管', value: 'PKNG' },
  ];

  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  sumData: Record<string, number> = {};   // 存放後端的總計資料
  footerData: Record<string, number | string | null> | null = null; // app-table-report 總計列資料
  lastQueryBody: any = null; // 給 app-table-report lazy 載入使用
  exportExcelLoading = false;

  constructor(
    private tls2A050Service: Tls2A050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2A050', 'TLS/TLS2A050cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.get('salesDate')?.valueChanges.subscribe((val) => {
      if (val) {
        const selected = new Date(val);
        const year = selected.getFullYear();
        const month = selected.getMonth();
        this.salesMinDate = new Date(year, month, 1);
        this.salesMaxDate = new Date(year, month + 1, 0);

        this.queryForm.patchValue({
          TXN_DateStart: this.salesMinDate,
          TXN_DateEnd: this.salesMaxDate,
        });
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      // 儲存查詢條件給 app-table-report 做 lazy 載入
      this.lastQueryBody = {
        ...raw,
        pageIndex: 1,
        pageSize: raw.pageSize ?? 1000,
      };

      const params = {
        pageIndex: this.lastQueryBody.pageSize,
        pageSize: this.lastQueryBody.pageIndex,
        SortBy: this.lastQueryBody.SortBy ?? [],
        TXN_DateStart: this.lastQueryBody.TXN_DateStart ? this.formatDate(this.lastQueryBody.TXN_DateStart) : null,
        TXN_DateEnd: this.lastQueryBody.TXN_DateEnd ? this.formatDate(this.lastQueryBody.TXN_DateEnd) : null,
        POS_TypeList: this.lastQueryBody.POS_TypeList?.includes('all') ? [] : this.lastQueryBody.POS_TypeList
      };

      this.tls2A050Service.queryTLS2A050(params).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (res) => {
          const { flatData, payNames } = this.buildFlatData(res);
          const { columns, columnGroup } = this.buildColumnsAndGroups(payNames);

          this.columns = columns;
          this.columnGroup = columnGroup;
          this.data = flatData;

          this.sumData = res.Data?.SumData ?? {};

          // 依照動態欄位與 SumData 建立總計列資料，給 app-table-report 顯示 footer
          this.footerData = this.buildFooterData(payNames, this.sumData);

          this.totalRecords = res.TotalCount ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        },
      });
    });
  }

  /**
   * 將後端回傳的 QueryData 攤平成 table-report 需要的 flat 資料 + 支付名稱清單
   */
  private buildFlatData(res: any): { flatData: any[]; payNames: string[] } {
    const flatData: any[] = [];
    const payNameSet = new Set<string>();

    (res.Data?.QueryData ?? []).forEach((entry: any) => {
      const row: any = { TXN_Date: entry.TXN_Date };

      (entry._DetailList ?? []).forEach((detail: any, index: number) => {
        const name = detail.PAY_Name;
        payNameSet.add(name);
        const formattedAmt = formatAmount(detail.OVER_PayAmt);
        row[`${index}_BOOK_PayCnt`] = detail.BOOK_PayCnt;
        row[`${index}_ACT_PayCnt`] = detail.ACT_PayCnt;
        row[`${index}_BOOK_PayAmt`] = detail.BOOK_PayAmt;
        row[`${index}_ACT_PayAmt`] = detail.ACT_PayAmt;
        row[`${index}_OVER_PayAmt`] =
          detail.OVER_PayAmt !== 0
            ? `<span class="OVER_PayAmt_RED">${formattedAmt}</span>`
            : `<span>${formattedAmt}</span>`;
      });

      flatData.push(row);
    });

    const payNames = Array.from(payNameSet);
    return { flatData, payNames };
  }

  /**
   * 依支付名稱清單建立動態欄位與群組表頭
   */
  private buildColumnsAndGroups(payNames: string[]): { columns: ReportColumn[]; columnGroup: ColumnGroup[] } {
    const columns: ReportColumn[] = [{ field: 'TXN_Date', header: '交易日期', visible: true, format: reportFormatYMD }];
    const columnGroup: ColumnGroup[] = [];

    payNames.forEach((name, index) => {
      columns.push(
        { field: `${index}_BOOK_PayCnt`, header: '系統筆數', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_ACT_PayCnt`, header: '實收筆數', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_BOOK_PayAmt`, header: '系統金額', visible: true, groupField: name, format: formatAmount, align: 'right' },
        { field: `${index}_ACT_PayAmt`, header: '實收金額', visible: true, groupField: name, format: formatAmount, align: 'right' },
        {
          field: `${index}_OVER_PayAmt`,
          header: '帳差 (實收-系統)',
          visible: true,
          groupField: name,
          format: formatAmount,
          align: 'right',
          type: 'html',
        },
      );
      columnGroup.push({ field: name, header: `[${name}] 行動支付` });
    });

    return { columns, columnGroup };
  }

  /**
   * 將後端回傳的 SumData 轉成 app-table-report 需要的 footerData 結構
   * key 需對應到 columns 裡的 field
   */
  private buildFooterData(payNames: string[], sumData: Record<string, number>): Record<string, number | string | null> | null {
    if (!sumData) {
      return null;
    }

    const footer: Record<string, number | string | null> = { ...TLS2A050Component.emptyFooter };

    payNames.forEach((name, index) => {
      footer[`${index}_BOOK_PayCnt`] = sumData[`BOOK_PayCnt_${name}`] ?? 0;
      footer[`${index}_ACT_PayCnt`] = sumData[`ACT_PayCnt_${name}`] ?? 0;
      footer[`${index}_BOOK_PayAmt`] = sumData[`BOOK_PayAmt_${name}`] ?? 0;
      footer[`${index}_ACT_PayAmt`] = sumData[`ACT_PayAmt_${name}`] ?? 0;
      footer[`${index}_OVER_PayAmt`] = sumData[`OVER_PayAmt_${name}`] ?? 0;
    });

    return footer;
  }

  /**
   * 給 app-table-report 做 lazy 載入 / 重新排序 使用的查詢函式
   */
  public queryTLS2A050ForReport = (body: any) =>
    this.tls2A050Service
      .queryTLS2A050({
        pageSize: body.pageSize ?? 1000,
        pageIndex: body.pageIndex ?? 1,
        SortBy: body.SortBy ?? [],
        TXN_DateStart: body.TXN_DateStart ? this.formatDate(body.TXN_DateStart) : null,
        TXN_DateEnd: body.TXN_DateEnd ? this.formatDate(body.TXN_DateEnd) : null,
        POS_TypeList: body.POS_TypeList?.includes('all') ? [] : body.POS_TypeList
      })
      .pipe(
        map((res) => {
          const { flatData, payNames } = this.buildFlatData(res);
          const totalCount = res.TotalCount ?? flatData.length;

          // 只有第一頁時更新 columns / footerData，避免無限捲動時一直重算
          const isFirstPage = !body?.pageIndex || Number(body.pageIndex) === 1;
          if (isFirstPage) {
            const { columns, columnGroup } = this.buildColumnsAndGroups(payNames);
            this.columns = columns;
            this.columnGroup = columnGroup;
            this.sumData = res.Data?.SumData ?? {};
            this.footerData = this.buildFooterData(payNames, this.sumData);
          }

          return {
            Data: flatData,
            TotalCount: totalCount,
          };
        })
      );


  exportReport = () => {
    const raw = this.queryForm.getRawValue();

    // === 修正開始 ===
    const now = new Date();
    const dateString =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const payload = {
      FileName: `Report_${dateString}.xlsx`,
      ReportTitle: "第三方支付帳差報表",
      queryTLS2A050Request: {
        ...raw,
        TXN_DateStart: raw.TXN_DateStart
          ? `${raw.TXN_DateStart.getFullYear()}/${(raw.TXN_DateStart.getMonth() + 1).toString().padStart(2, '0')}/${raw.TXN_DateStart.getDate().toString().padStart(2, '0')}`
          : null,
        TXN_DateEnd: raw.TXN_DateEnd
          ? `${raw.TXN_DateEnd.getFullYear()}/${(raw.TXN_DateEnd.getMonth() + 1).toString().padStart(2, '0')}/${raw.TXN_DateEnd.getDate().toString().padStart(2, '0')}`
          : null,
      },
    }

    this.exportExcelLoading = true;
    this.tls2A050Service.exportTLS2A050(payload).subscribe({
      next: (res: HttpResponse<Blob>) => {
        if (res.body) {
          const contentDisposition = res.headers.get('content-disposition');
          let filename = `unknown.xlsx`; // 副檔名改為 .xlsx
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob([res.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, filename);
        } else {
          console.error("Response body is empty!");
        }
        this.exportExcelLoading = false;
      },
    });
  };
}
