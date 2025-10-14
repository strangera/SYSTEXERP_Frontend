import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS57110Service } from '@service/api/tls/tls57110.service';
import { ButtonModule } from 'primeng/button';
import { formatDate } from '@angular/common';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
@Component({
  selector: 'app-tls57110',
  templateUrl: './tls57110.component.html',
  styleUrl: './tls57110.component.scss',
  standalone: true,

  imports: [MenubarComponent, TableReportComponent, ButtonModule, MultiSelectComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarComponent, InputNumberComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS57110Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ShowType: ['M', [Validators.required]],
    ODM_No: [null],
    HOS_NOList: [[]],
    LOGO_NoList: [[]],
    STK_YM: ['', [Validators.required]],
    // pgSize: [20, [Validators.required]],
  });

  pdfBtnLoading = false;
  excelBtnLoading = false;
  data: any[] = [];
  totalRecords = 0;
  footerData: any = null;
  lastQueryBody: any;

  columns: ReportColumn[] = [
    { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
    { field: 'STK_PRIORQTY', header: '期初存貨', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_STOCKQTY', header: '進貨量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_REJECTQTY', header: '進退量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_SALEQTY', header: '銷貨量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_MOVEINQTY', header: '撥入量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_MOVEOUTQTY', header: '撥出量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_DIFFQTY', header: '盤點量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_SCRAPQTY', header: '報廢量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_TAKEQTY', header: '領用量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_RETAKEQTY', header: '領用退回量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_TRDINQTY', header: '同業調入量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_TRDOUTQTY', header: '同業調出量', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'STK_CURRENTQTY', header: '期末存貨', visible: true, format: formatAmount, isSubTotal: true },
  ];
  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57110Service: TLS57110Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57110', 'tls/tls57110cru');
    // this.queryFunction = (body) => this.tls57110Service.queryTLS57110(body);
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, No: item.No }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, No: item.No }));
    });
  }
  isTotal = 0;
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const ymValue = frm.value.STK_YM ? formatDate(frm.value.STK_YM, 'yyyyMM', 'en-US') : '';
      const payload = {
        ...frm.value,
        STK_YM: ymValue,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'LOGO_No', order: 1 }],
      };


      this.tls57110Service.queryTLS57110(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            this.isTotal += res.Data.reduce((a: number, b: any) => a + (b.STK_CURRENTQTY ?? 0), 0);
            console.log(this.isTotal);
            this.data = res.Data;
            this.totalRecords = res.TotalCount;
            this.footerData = res.footerData;
            this.lastQueryBody = payload;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          },
          complete: () => (this.loading = false),
        });
    });
  }
  onExportXLSX() {
    if (!this.lastQueryBody) return;
    this.excelBtnLoading = true;

    this.tls57110Service.exportTLS57110(this.lastQueryBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `庫存月結存貨表_${this.lastQueryBody.STK_YM}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        complete: () => this.excelBtnLoading = false,
      });
  }

  onExportPDF() {
    if (!this.lastQueryBody) return;
    this.pdfBtnLoading = true;

    this.tls57110Service.exportTLS57110PDF(this.lastQueryBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `庫存月結存貨表_${this.lastQueryBody.STK_YM}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        complete: () => this.pdfBtnLoading = false,
      });
  }
}
