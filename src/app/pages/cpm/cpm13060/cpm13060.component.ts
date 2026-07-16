import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm13060Service } from '@service/api/cpm/cpm13060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cpm13060',
  templateUrl: './cpm13060.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    TableReportComponent,
    CalendarRangeComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MultiSelectComponent,
  ],
  providers: [DatePipe]
})
export class CPM13060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_BDATE: [new Date(), [Validators.required]],
    TXN_EDATE: [new Date(), [Validators.required]],
    PKG_disc_rule_name: [[] as string[]],
    ...createPaginationConfig([{ field: 'building_desc', order: 1 }]),
  });

  PKG_disc_rule_name_Options: { label: string; value: string }[] = [];

  totalRecords = 0;
  data: any[] = [];
  footerData: any = {}; // 對應 SumData
  subTotalData: any[] = [];
  groupRowsBy = 'ECR_No';
  historyRequestBody: any = null;
  btnLoading = false;
  btnLoading2 = false;

  columns: ReportColumn[] = [
    { field: 'building_desc', header: '館別', visible: true, showSort: true },
    { field: 'floor_desc', header: '樓層', visible: true, showSort: true },
    { field: 'ECR_No', header: '繳費機編號', visible: true, showSort: true },
    // { field: 'ECR_SubGroup', header: '區域', visible: true, showSort: true },
    { field: 'PKG_disc_rule_name', header: '折扣規則', visible: true, showSort: true },
    { field: 'Total_Fee', header: '金額', visible: true, showSort: true, align: 'right', format: formatAmount, isSubTotal: true },
    { field: 'Total_Time', header: '時數', visible: true, showSort: true, align: 'right', format: formatAmount, isSubTotal: true },
    { field: 'CNT', header: '筆數', visible: true, showSort: true, align: 'right', format: formatAmount, isSubTotal: true },
  ];

  constructor(
    public readonly cpm13060Service: Cpm13060Service,
    private readonly dropDownListService: DropDownListService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM13060', '/CPM/CPM13060cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.dropDownListService.queryCPM13050_RuleNameDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          this.PKG_disc_rule_name_Options = res.Data.map(item => ({
            label: item.Name,
            value: item.No
          }));
        }
      });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const requestBody = {
        PageSize: 30,
        PageIndex: 1,
        OrderBy: '',
        Offset: 0,
        SortBy: [{ field: 'building_desc', order: 1 }],
        TXN_BDATE: formValue.TXN_BDATE
          ? this.datePipe.transform(formValue.TXN_BDATE, 'yyyy-MM-dd')!
          : undefined,
        TXN_EDATE: formValue.TXN_EDATE
          ? this.datePipe.transform(formValue.TXN_EDATE, 'yyyy-MM-dd')!
          : undefined,
        rule_nameList: formValue.PKG_disc_rule_name ?? [],
      };

      this.loading = true;
      this.historyRequestBody = requestBody;

      this.cpm13060Service
        .queryCPM13060(requestBody)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Data?.Datas?.length > 0) {
              this.data = res.Data.Datas;
              this.footerData = res.Data.SumData ?? {};
              this.subTotalData = res.Data.DetailSumData ?? [];
              this.totalRecords = res.TotalCount ?? this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, frm.value);
            } else {
              this.data = [];
              this.footerData = {};
              this.subTotalData = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }
  /** 匯出 PDF */
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢再匯出。');
      return;
    }

    this.btnLoading = true;
    this.cpm13060Service
      .exportCPM13060PDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          const blob = res.body; // HttpResponse<Blob>，取出 body
          if (!blob || blob.size === 0) {
            this.messageService.warnBubble('無可匯出的資料。');
            return;
          }

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `APS停車抵扣報表_${new Date().toISOString().slice(0, 10)}.pdf`;
          document.body.appendChild(a);
          a.click();
          globalThis.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
      });
  }

  /** 匯出 Excel */
  onExportExcel(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢再匯出。');
      return;
    }

    this.btnLoading = true;
    this.cpm13060Service
      .exportCPM13060(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          const blob = res.body;
          if (!blob || blob.size === 0) {
            this.messageService.warnBubble('無可匯出的資料。');
            return;
          }

          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `APS停車抵扣報表_${new Date().toISOString().slice(0, 10)}.xlsx`;
          document.body.appendChild(a);
          a.click();
          globalThis.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
      });
  }



  /** 通用下載方法 */
  private downloadFile(blob: Blob, filename: string): void {
    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('無可匯出的資料。');
      return;
    }
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    globalThis.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
