import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15080Service } from '@service/api/fin/fin15080.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FIN15060Data, FIN15060PrintRequest, FIN15060QueryRequest, FIN15060Service } from '../../../service/api/fin/fin15060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin15060',
  templateUrl: './fin15060.component.html',
  styleUrl: './fin15060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    CalendarComponent,
    ButtonModule,
    YearMonthComponent,
    DropdownComponent
  ]
})
export class FIN15060Component extends BasicQueryPageComponent<FIN15060Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_YM: ['', [Validators.required]],           // 申報年月
    STO_TaxNo: [null, [Validators.required]], // 稅籍編號
    ...createPaginationConfig([{ field: 'INV_GUIDate', order: -1 }])
  });

  totalRecords = 0;
  data: FIN15060Data[] = [];
  selectedItems: FIN15060Data[] = [];
  pdfBtnLoding = false;
  stoTaxNoOptions: any[] = [];

  columns: Column[] = [
    { field: 'INV_DeclareYM', header: '所屬年月份', visible: true },
    { field: 'INV_GUIDate', header: '開立發票日期', visible: true, format: formatDate },
    { field: 'INV_GUINo', header: '字軌號碼', visible: true },
    { field: 'INV_Name', header: '買受人名稱', visible: true },
    { field: 'TXN_Uniform', header: '買受人統一編號', visible: true },
    { field: 'GoodsOrServicesName', header: '貨物或勞務名稱', visible: true },
    { field: 'GoodsQty', header: '數量', visible: true },
    { field: 'ExportMethod', header: '外銷方式', visible: true },
    { field: 'INV_DocName', header: '證明文件名稱', visible: true },
    { field: 'INV_DocNo', header: '證明文件號碼', visible: true },
    { field: 'NonCustomsExportAmt', header: '非經海關出口金額', visible: true },
    { field: 'INV_ExportType', header: '出口報單類別', visible: true },
    { field: 'INV_ExportNo', header: '出口報單號碼', visible: true },
    { field: 'CustomsExportAmt', header: '經海關出口金額', visible: true },
    { field: 'ExportDate', header: '輸出或結匯日期', visible: true, format: formatDate }
  ];

  constructor(
    private fin15060Service: FIN15060Service,
    private datePipe: DatePipe,
    private fin15080Service: FIN15080Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15060', 'fin/fin15060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadStoTaxNoOptions(); // 載入稅籍選單
    // 設定INV_YM預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.queryForm.get('INV_YM')?.setValue(this.datePipe.transform((currentDate), 'yyyyMM'));
  }

  /** 載入稅籍下拉 */
  private loadStoTaxNoOptions(): void {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';
    const mid = this.authService.currentUserValue?.mid || 0;

    this.fin15080Service.getStoTaxNoOptions({ mid, STO_No: storeNo }).subscribe({
      next: (opts) => {
        this.stoTaxNoOptions = opts.filter(x => x.STO_Status === '1');
      },
      error: (err) => {
        console.error('取得稅籍下拉失敗：', err);
        this.stoTaxNoOptions = [];
        this.messageService.errorBubble('稅籍清單取得失敗');
      },
    });
  }

  onSubmit(frm: FormGroup) {
    const fin15060QueryRequest: FIN15060QueryRequest = {
      ...frm.value,
    };
    this.handleSubmit(frm, () => {
      this.fin15060Service.queryFIN15060(fin15060QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExportPdf() {
    this.pdfBtnLoding = true;
    const payload: FIN15060PrintRequest = {
      INV_YM: this.queryForm.value.INV_YM!,
      STO_TaxNo: this.queryForm.value.STO_TaxNo!
    }
    this.fin15060Service.printFIN15060(payload)
      .pipe(finalize(() => this.pdfBtnLoding = false))
      .subscribe(response => {
        this.openDownloadWindow(response.Data.Print_URL);
      });
  }

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    window.open(downloadUrl, '_blank');
  }
}
