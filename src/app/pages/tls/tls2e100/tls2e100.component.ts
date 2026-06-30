import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2E100Service } from '@service/api/tls/tls2e100.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls2e100',
  templateUrl: './tls2e100.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    Button,
    TableReportComponent,
    AccordionModule,
    MultiSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    ButtonComponent,
    TranslateModule
  ]
})
export class TLS2E100Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    sad_date: [new Date()],
    tlt_floorList: [[]],
    tlt_noList: [[]],
    tlt_buildingList: [[]],
    org_idList: [[]],
    ven_no: [''],
    // 分頁欄位
    pageIndex: [1],
    pageSize: [1000],
    SortBy: [[{ field: 'apply_no,tlt_id', order: 1 }]],
  });

  columns: any[] = [
    { field: 'apply_no', header: '招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'tlt_id', header: '類別代號', visible: true },
    { field: 'tlt_id_desc', header: '類別名稱', visible: true },
    { field: 'Jan', header: '一月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Feb', header: '二月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Mar', header: '三月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Apr', header: '四月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'May', header: '五月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Jun', header: '六月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Jul', header: '七月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Aug', header: '八月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Sep', header: '九月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Oct', header: '十月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Nov', header: '十一月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'Dec', header: '十二月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
    { field: 'tlt_id_count', header: '類別小計', visible: true, format: formatAmount, isTotal: true, isSubTotal: true, align: 'right' },
  ];
  groupRowsBy = 'apply_no';
  org_id_Option: IDropdownItem[] = [];
  tltNoOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  floorOptions: any[] = [];
  footerData: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  excelBtnLoading = false;
  pdfBtnLoading = false;

  constructor(
    private dropDownListService: DropDownListService,
    private readonly dropDown: DropdownApiService,
    public readonly tls2e100Service: TLS2E100Service,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E100', 'TLS/TLS2E100cru');

    // 組織下拉
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Option = res.Data.map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
        }));
      });

    // 專櫃編號
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No}-${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name,
          }));
        }
      });

    // 樓層
    this.dropDown.querySys3900()
      .pipe(untilDestroyed(this))
      .subscribe((res: any) => {
        this.floorOptions = res.map((item: any) => ({
          label: item.Name,
          value: item.No,
        }));
      });

    // 館別
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.buildingNoOptions = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No,
        }));
      });
  }

  /** 查詢 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const ymValue = frm.value.sad_date ? this.datePipe.transform(frm.value.sad_date, 'yyyy') ?? '' : '';
      const payload = {
        ...frm.value,
        sad_date: ymValue,
      };
      this.tls2e100Service.queryTLS2E100(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            console.log('查詢回傳:', res);
            this.data = res.Data || [];
            this.footerData = res.footerData || [];
            this.totalRecords = res.TotalCount || 0;
            this.lastQueryBody = payload;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          },
          complete: () => (this.loading = false),
        });
    });
  }

  /** 匯出 Excel */
  onExportExcel() {
    if (!this.lastQueryBody) return;
    this.excelBtnLoading = true;

    this.tls2e100Service.exportTLS2E100(this.lastQueryBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `年度對帳單_${new Date().toISOString().slice(0, 10)}.xlsx`;
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },
        complete: () => this.excelBtnLoading = false,
      });
  }

  /** 匯出 PDF */
  onExportPDF() {
    if (!this.lastQueryBody) return;
    this.pdfBtnLoading = true;

    this.tls2e100Service.exportTLS2E100PDF(this.lastQueryBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          const url = globalThis.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `年度對帳單_${new Date().toISOString().slice(0, 10)}.pdf`;
          a.click();
          globalThis.URL.revokeObjectURL(url);
        },
        complete: () => this.pdfBtnLoading = false,
      });
  }

}
