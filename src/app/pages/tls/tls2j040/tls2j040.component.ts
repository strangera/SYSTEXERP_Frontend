import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject,finalize } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TLS2J040Request, TLS2j040Service } from '@service/api/tls/tls2j040.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';

import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDateTime,formatAmount } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls2j040',
  templateUrl: './tls2j040.component.html',
  styleUrl: './tls2j040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, TranslateModule, CalendarComponent, CommonModule,
    TableComponent
  ]
})
export class TLS2J040Component extends BasicQueryPageComponent<any> implements OnInit {
  
  // Updated form group to match the fields in TLS2J040Request
  queryForm = this.formBuilder.group({
    TxnDate: ['', Validators.required],               // 換開日期 (TxnDate)
    TxnGUINo: ['', [Validators.maxLength(20)]],        // 三聯式發票號碼 (TxnGUINo)
    TxnUniform: ['', [Validators.maxLength(8)]],       // 買受人統一編號 (TxnUniform)
     ...createPaginationConfig([{ field: 'TxnGUINo', order: 1 }]),
  });

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  constructor(
    private readonly service: TLS2j040Service,
    private readonly validationService: ValidationService,
    private readonly datePipe: DatePipe,
    private sanitizer: DomSanitizer
  ) {
    super();
  }
   totalRecords = 0;// 分頁和排序參數 // 排序需要
    data: any[] = [];
    selectedRows: any[] = [];


  columns: Column[] = [
      { field: 'InvoiceCreateDate', header: '換開日期', visible: true, format: this.formatDateOnly },  


  { field: 'InvoiceNumber', header: '發票號碼', visible: true },

    { field: 'BuyerUniform', header: '統一編號', visible: true },

  { field: 'AmountNTax', header: '金額', visible: true, format: formatAmount },

  { field: 'TotalTax', header: '稅額', visible: true },

  // TaxType 已在後端轉中文，所以直接顯示
  { field: 'TaxType', header: '稅別', visible: true }
];

formatDateOnly(value: any): string {
  if (!value) return '';
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}
  selectedRows$ = new BehaviorSubject<any[]>([]);

setSelectedRows(rows: any[]) {
  this.selectedRows$.next(rows);
  this.selectedRows = rows; 
}
// 點 row 事件
onRowClick(row: any) {
   this.setSelectedRows([row]);

  const payload: TLS2J040Request = {
    TxnDate: row.InvoiceCreateDate,  // 換開日期
    TxnGUINo: row.InvoiceNumber,      // 三聯式發票號碼
    TxnUniform: row.BuyerUniform      // 買受人統一編號
  };

  this.service.print(payload)
    .pipe(untilDestroyed(this))
    .subscribe(response => {
      if (response.Status === '0000' && response.Data?.Print_URL) {
        let rawUrl = response.Data.Print_URL.startsWith('http')
          ? response.Data.Print_URL
          : `${environment.BaseUrl}${response.Data.Print_URL}`;
        rawUrl = decodeURIComponent(rawUrl);

        // 開新分頁
        window.open(rawUrl, '_blank');
      } else {
        this.messageService.errorBubble(response.Message);
      }
    });
}



  ngOnInit(): void {
    this.initializePage('TLS2J040', '/TLS/TLS2J040', this.queryForm, (form) => this.onSubmit(form));


    this.selectedRows$.subscribe(rows => {
    if (rows.length > 0) {
      const row = rows[0];

      //this.print(row);  // 自動觸發
    }
    
  });
  }

   onSubmit(form: FormGroup) {
     
    this.handleSubmit(form, () => {
      this.loading = true;
      this.service.queryTLS2J040(form.value)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.value);
        });
    });
  }

  print(row: any): void {
  if (!row) {
    this.messageService.errorBubble('請先選擇資料！');
    return;
  }

  const payload: TLS2J040Request = {
    TxnDate: row.InvoiceCreateDate,   // 發票開立日期
    TxnGUINo: row.InvoiceNumber,      // 發票號碼
    TxnUniform: row.BuyerUniform,     // 買方統一編號
  };

  this.loading = true;

  this.service.print(payload)
    .pipe(untilDestroyed(this), finalize(() => this.loading = false))
    .subscribe(response => {

      if (response.Status === '0000' && response.Data?.Print_URL) {
        let rawUrl = response.Data.Print_URL.startsWith('http')
          ? response.Data.Print_URL
          : `${environment.BaseUrl}${response.Data.Print_URL}`;
        rawUrl = decodeURIComponent(rawUrl);
        console.log('rawUrl', rawUrl);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      } else {
        this.messageService.errorBubble(response.Message);
      }

    });
}

}
