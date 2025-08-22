import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FIN13020Service } from '../../../service/api/fin/fin13020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-fin13020',
  templateUrl: './fin13020.component.html',
  styleUrls: ['./fin13020.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextRangeComponent, InputTextComponent, CalendarRangeComponent, DropdownComponent, QueryYearMonthComponent, TableComponent, TranslateModule]
})
export class FIN13020Component extends BasicQueryPageComponent<any> {

  taxNumberOptions: any[] = [
    { value: '701702007', label: '701702007' },
    { value: '703902223', label: '703902223' },
  ];
  PUR_VoucherTypeOptions: any[] = [
    { value: '23', label: '三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
  ];

  queryForm = this.formBuilder.group({


    TXN_Ret_NoStart: [null], // 退出/折讓單號(起)
    TXN_Ret_NoEnd: [null],   // 退出/折讓單號(迄)
    GUI_Track: [null], // 字軌
    InvoiceNumberStart: [null],
    InvoiceNumberEnd: [null],
    InvoiceDateStart: [null], // 領用日期(起)
    InvoiceDateEnd: [null],   // 領用日期(迄)
    InvoiceType: [null], // 發票狀態
    INV_DeclareYM: [null], // 發票年月
    Source_Doc_NoStart: [], // 憑證單號(起)
    Source_Doc_NoEnd: [],   // 憑證單號(迄)
    Voucher_NoStart: [], // 發票起始號碼
    Voucher_NoEnd: [],   // 發票結束號碼
    ...createPaginationConfig
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'PUR_GUINo', header: '字軌', visible: true }, //
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },//
    { field: 'PUR_GUIDate', header: '退出/折讓日期', visible: true, format: this.formatDateFromBackend },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    { field: 'Credit_Type', header: '區別', visible: true, format: this.formatCreditType },  //折讓/退出
    {
      field: 'PUR_RepYYYYMM', header: '申報年月', visible: true,
      format: this.formatRepYYYYMM
    },
    { field: 'PUR_Net', header: '退回/折讓金額', visible: true },
    { field: 'PUR_Tax', header: '退回/折讓稅額', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
  ];

  constructor(private fin13020Service: FIN13020Service) {
    super();
  }
  formatCreditType(value: string): string {
    switch (value) {
      case 'C': return '折讓';
      case 'R': return '退出';
      default: return value;
    }
  }
  formatDateFromBackend(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ''; // 無效日期處理
    return `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  formatRepYYYYMM(value: string): string {
    if (!value || value.length !== 6) return value;
    return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
  }



  ngOnInit(): void {
    this.initializePage('FIN13020', '/FIN/FIN13020CRU', this.queryForm);

  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13020Service.queryFIN13020(payload).subscribe({
      next: (res) => {

        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);


      },
      //       next: (res) => {
      //   if (res.Status === '0000') {
      //     this.data = res.Data || [];
      //     this.totalRecords = res.TotalCount || this.data.length;
      //     this.queryStateService.setQueryState(this.ProgNo, payload);
      
      //   } else {
      //     this.messageService.errorBubble('查詢失敗');
      //     this.loading = false;
      //   }
      // },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }



  onClearForm(): void {
    this.queryForm.reset();
  }



}
