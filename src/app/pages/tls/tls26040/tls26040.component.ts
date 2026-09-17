import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { TLS26040Data, TLS26040QueryRequest, TLS26040Service } from '../../../service/api/tls/tls26040.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { AddButton, Column, createPaginationConfig, formatAmount, formatDate, formatToSixDigits } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-tls26040',
  templateUrl: './tls26040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent,
    ButtonModule
  ]
})
export class TLS26040Component extends BasicQueryPageComponent<TLS26040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    sad_date_start: [''],                           // 預售日期_起
    sad_date_end: [''],                             // 預售日期_迄
    tlt_noList: [[]],                                 // 專櫃編號(多選)
    sad_preorder_date_start: [null],                  // 結帳日期_起
    sad_preorder_date_end: [null],                    // 結帳日期_迄
    batch_no: ['', [Validators.maxLength(12)]],       // 批號
    ...createPaginationConfig([{ field: 'sad_date', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26040Data[] = [];
  selectedItems: TLS26040Data[] = [];
  lastQueryBody: TLS26040QueryRequest | null = null;

  addButton: AddButton[] = [
    {
      label: '認列還原',
      displayText: '認列還原',
      icon: '',
      action: (rowData: TLS26040Data) => { this.onRestore(rowData); },
      disabled: (rowData: TLS26040Data) => rowData.isClose === 'Y',
    }
  ];

  columns: Column[] = [
    { field: 'id', header: 'ID', visible: false },
    { field: 'sad_date', header: '預售日期', visible: true, format: formatDate },
    { field: 'sad_preorder_date', header: '結帳日期', visible: true, format: formatDate },
    { field: 'tlt_no', header: '櫃別編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'batch_no', header: '批號', visible: true },
    { field: 'TXN_TotSaleAmt', header: '金額', visible: true, format: formatAmount, align: 'right' },
  ];

  // 展開詳細資料的欄位定義
  expansionColumns: Column[] = [
    { field: 'TXN_Date', header: '預售日期', visible: true, format: formatDate },
    { field: 'TLT_No', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: formatToSixDigits },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount, align: 'right' },
  ];

  // 專櫃編號選項
  tltNoOptions: any = [];

  isNotltNoOptions = [
    { label: '包含所選的專櫃', value: 'Y' },
    { label: '排除所選的專櫃', value: 'N' }
  ];

  // 列印按鈕載入狀態
  exportPdfLoading = false;
  exportExcelLoading = false;

  constructor(
    private tls26040Service: TLS26040Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26040', 'tls/tls26040cru', this.queryForm, (form) => this.onSubmit(form));
    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList().subscribe((data) => {
      this.tltNoOptions = data.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = frm.getRawValue() as TLS26040QueryRequest;
      this.tls26040Service.queryTLS26040(frm.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          this.lastQueryBody = body;
        });
    });
  }

  loadDetails = (rowData: TLS26040Data): Observable<any> => {
    return this.tls26040Service.queryTLS26040Detail({
      sad_date: rowData.sad_date,
      tlt_no: rowData.tlt_no
    })
  };

  onRestore(rowData: TLS26040Data) {
    const updData = {
      id: rowData.id,
      sad_date: this.datePipe.transform(rowData.sad_date, 'yyyy-MM-dd') ?? '',
      talent_id: rowData.talent_id,
      tlt_no: rowData.tlt_no,
    };
    this.messageService.confirm({
      header: `是否確認還原？`,
      accept: () => {
        this.tls26040Service.revertTLS26040(updData)
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('還原成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }


  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26040Service.exportExcelTLS26040({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26040Service.exportPDFTLS26040({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }
}
