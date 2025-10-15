import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Button } from 'primeng/button';
import { TLS2E100Service } from '@service/api/tls/tls2e100.service';

@Component({
  selector: 'app-tls2e100',
  templateUrl: './tls2e100.component.html',
  styleUrl: './tls2e100.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    Button,
    TableReportComponent,
    AccordionModule,
    MultiSelectComponent,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
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
    ...createPaginationConfig([{ field: 'apply_no', order: 1 }]),
  });

  columns: any[] = [
    { field: 'apply_no', header: '招募編號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ven_no', header: '廠商編號', visible: true },
    { field: 'tlt_id', header: '類別代號', visible: true },
    { field: 'tlt_id_desc', header: '類別名稱', visible: true },
    { field: 'Jan', header: '一月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Feb', header: '二月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Mar', header: '三月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Apr', header: '四月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'May', header: '五月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Jun', header: '六月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Jul', header: '七月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Aug', header: '八月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Sep', header: '九月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Oct', header: '十月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Nov', header: '十一月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'Dec', header: '十二月', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'tlt_id_count', header: '類別小計', visible: true, format: formatAmount, isTotal: true, isSubTotal: true },
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
    private locationOptionsService: LocationOptionsService,
    public readonly tls2e100Service: TLS2E100Service
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
            label: `${item.No} ${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name,
          }));
        }
      });

    // 樓層
    this.locationOptionsService.getFloorOptions()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.floorOptions = res.map((item: any) => ({
          label: item.name || item.FLOOR_NAME || item.label,
          value: item.code || item.FLOOR_NO || item.value,
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
      const ymValue = frm.value.sad_date
        ? new Date(frm.value.sad_date).getFullYear().toString()
        : '';

      const payload = {
        ...frm.value,
        sad_date: ymValue,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [{ field: 'apply_no', order: 1 }]
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
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `年度對帳單_${new Date().toISOString().slice(0, 10)}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
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
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `年度對帳單_${new Date().toISOString().slice(0, 10)}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        complete: () => this.pdfBtnLoading = false,
      });
  }

}
