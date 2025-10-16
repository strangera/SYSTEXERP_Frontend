import { saveAs } from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2A050Service } from 'src/app/service/api/tls/tls2a050.service';
import { ColumnGroup } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { yesterday } from '@shared/models/system/query-form.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { formatAmount } from '@shared/componentkit/table2/table2.model';
import { HttpResponse } from '@angular/common/http';

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
    TableComponent,
    TranslateModule,
    ButtonModule,
    MultiSelectComponent
  ],
})
export class TLS2A050Component extends BasicQueryPageComponent<any> implements OnInit {
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  queryForm = this.formBuilder.group({
    POS_TypeList: [[] as string[]],
    salesDate: [new Date()],
    TXN_DateStart: [yesterday],
    TXN_DateEnd: [yesterday],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),

  });

  data: any[] = [];
  totalRecords = 0;
  POS_TypeListOptions = [
    { label: '一般', value: '' },
    { label: '停管', value: 'PKNG' },
  ];

  salesMinDate: Date | null = null;
  salesMaxDate: Date | null = null;
  columns: any[] = [];
  columnGroup: ColumnGroup[] = [];
  sumData: any = {};   // 🔹 新增: 存放後端的總計資料
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
      const params = {
        PageSize: raw.pageSize ?? 20,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy ?? [],
        TXN_DateStart: raw.TXN_DateStart ? this.formatDate(raw.TXN_DateStart) : null,
        TXN_DateEnd: raw.TXN_DateEnd ? this.formatDate(raw.TXN_DateEnd) : null,
        POS_TypeList: raw.POS_TypeList?.includes('all') ? [] : raw.POS_TypeList
      };

      this.tls2A050Service.queryTLS2A050(params).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe({
        next: (res) => {
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
          const columns: any[] = [{ field: 'TXN_Date', header: '交易日期', visible: true }];
          const columnGroup: ColumnGroup[] = [];

          payNames.forEach((name, index) => {
            columns.push(
              { field: `${index}_BOOK_PayCnt`, header: '系統筆數', visible: true, groupField: name, format: formatAmount },
              { field: `${index}_ACT_PayCnt`, header: '實收筆數', visible: true, groupField: name, format: formatAmount },
              { field: `${index}_BOOK_PayAmt`, header: '系統金額', visible: true, groupField: name, format: formatAmount },
              { field: `${index}_ACT_PayAmt`, header: '實收金額', visible: true, groupField: name, format: formatAmount },
              {
                field: `${index}_OVER_PayAmt`, header: '帳差 (實收-系統)', visible: true, groupField: name, htmlFormat: true,
              },
            );
            columnGroup.push({ field: name, header: `[${name}] 行動支付` });
          });

          this.columns = [...columns];
          this.columnGroup = columnGroup;
          this.data = flatData;

          this.sumData = res.Data?.SumData ?? {};

          this.totalRecords = res.TotalCount ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        },
      });
    });
  }


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
          ? `${raw.TXN_DateStart.getFullYear()}-${(raw.TXN_DateStart.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateStart.getDate().toString().padStart(2, '0')}`
          : null,
        TXN_DateEnd: raw.TXN_DateEnd
          ? `${raw.TXN_DateEnd.getFullYear()}-${(raw.TXN_DateEnd.getMonth() + 1).toString().padStart(2, '0')}-${raw.TXN_DateEnd.getDate().toString().padStart(2, '0')}`
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
