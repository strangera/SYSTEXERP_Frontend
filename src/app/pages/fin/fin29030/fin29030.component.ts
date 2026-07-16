import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FIN29030Detail, Fin29030Service } from './../../../service/api/fin/fin29030.service';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
// Shared
import { CommonModule } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, createPaginationConfig, formatAmount, formatDate, } from '@others/component/table/table.model';
import { option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableSubheaderComponent } from '../fin42010/fin42010-table/fin42010-table.component';

//1.2.9.3 開票明細表
@Component({
  selector: 'app-fin29030',
  templateUrl: './fin29030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    ButtonModule,
    TableReportComponent,
    TableSubheaderComponent,
    TranslateModule,
    InputTextRangeComponent,
    InputNumberRangeComponent,
    MultiSelectComponent,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent
  ]
})
export class FIN29030Component extends BasicQueryPageComponent<FIN29030Detail> implements OnInit {
  //
  queryForm = this.formBuilder.group({
    IssueDateFrom: [], // 開票日期
    IssueDateTo: [], // 開票日期
    BNK_No: [], // 銀行代號
    CHK_NoFrom: [null], // 支票號碼
    CHK_NoTo: [null], // 支票號碼
    VEN_No: [], // 廠客代號
    ExpireDate: [], // 到期日
    CHK_Status: [null], // 票據狀態

    //分頁查詢
    ...createPaginationConfig([{ field: 'PAM_No', order: 1 }]), // 分頁和排序參數
  });
  lastQueryBody = null;
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  BNK_No_Options: option[] = []; // 銀行代號 下拉
  VEN_No_Options: option[] = []; // 廠客代號 下拉
  // ０＝作廢，１＝未異動，２＝到期，３＝兌現，４＝撤票，５＝退票
  CHK_Status_Options =  // 票據狀態 下拉
    [
      { value: '0', label: '作廢' },
      { value: '1', label: '未異動' },
      { value: '2', label: '到期' },
      { value: '3', label: '兌現' },
      { value: '4', label: '撤票' },
      { value: '5', label: '退票' }
    ];

  selectedItems: FIN29030Detail[] = [];
  data: FIN29030Detail[] = [];
  footerData: any | null = null;
  subtotalData: any | null = null;
  filteredData = [...this.data];
  columns: Column[] = [
    { field: 'PAM_No', header: '付款編號', visible: true },
    { field: 'CHK_No', header: '支票號碼', visible: true },
    { field: 'TicketStatusName', header: '票據狀態', visible: true },
    { field: 'PaymentBank', header: '付款銀行', visible: true },
    { field: 'IssueDate', header: '開票日期', visible: true, format: formatDate },
    { field: 'ExpireDate', header: '到期日', visible: true, format: formatDate },
    { field: 'VenNo', header: '廠客代號', visible: true },
    { field: 'VenName', header: '廠客名稱', visible: true },
    { field: 'TicketAmt', header: '票面金額', visible: true, format: formatAmount, isSubTotal: true },
  ];

  // 控制變數
  btnLoading = false;

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    public fin29030Service: Fin29030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29030', 'fin/fin29030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log('開票request:', JSON.stringify(frm.value, null, 2));
    this.handleSubmit(frm, () => {
      this.fin29030Service.queryFIN29030(frm.value).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.lastQueryBody = frm.value;
        this.data = response.Data;
        this.footerData = response.Totals;
        this.subtotalData = response.SubTotals;
        this.totalRecords = response.TotalCount ?? this.data.length;
      });
    });
  }

  btnPDFLoading = false;
  btnExcelLoading = false;
  onReport(frm: FormGroup, PDFType: string) {
    if (PDFType === 'PDF') { // 匯出發票建檔作業PDF
      this.btnPDFLoading = true;
      this.fin29030Service
        .exportPDFFIN29030(frm.value)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.btnPDFLoading = false)
        )
        .subscribe(blob => {
          if (blob) {
            this.downloadBlob(blob, `開票明細檔_${this.getTimestamp()}`);
          }
        });
    } else {
      this.btnExcelLoading = true;
      this.fin29030Service
        .exportExcelFIN29030(frm.value)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.btnExcelLoading = false)
        )
        .subscribe(blob => {
          if (blob) {
            this.downloadBlob(blob, `開票明細檔_${this.getTimestamp()}`);
          }
        });
    }
  }

  //讀取下拉  
  loadOptions() {
    // 銀行代號 下拉 (queryAPS1002_DropDownList())
    this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BNK_No_Options = list.map((item: any) => ({
        value: item.BNK_DepositAccNo, // 公司銀行科目 代號
        label: item.BNK_DepositAccNo + '-' + item.ACCCNAME, // 代碼+名稱
      }));
      // console.log('銀行代號 下拉:', response);
    });
    // 廠客代號 下拉
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(response => {
      const list = Array.isArray(response) ? response : [];
      this.VEN_No_Options = list.map((item: any) => ({
        value: item.VEN_No, // 公司銀行科目 代號
        label: item.label, // 代碼+名稱
      }));
      // console.log('廠客代號 下拉', response);
    });
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }
}
