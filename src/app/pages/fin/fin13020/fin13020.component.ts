/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { Table2Component } from '../../../shared/componentkit/table2/table2.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin13020',
  templateUrl: './fin13020.component.html',
  styleUrls: ['./fin13020.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    Table2Component,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN13020Component extends BasicQueryPageComponent<any> {
  PUR_VoucherTypeOptions: any[] = [
    { value: '33', label: '33-銷項三聯式銷貨退回或折讓證明單' },
    { value: '34', label: '34-銷項二聯式銷貨退回或折讓證明單' },
  ];

  queryForm = this.formBuilder.group({
    TXN_Ret_NoStart: [null, [Validators.maxLength(20)]], // 退出/折讓單號(起)
    TXN_Ret_NoEnd: [null, [Validators.maxLength(20)]],   // 退出/折讓單號(迄)
    GUI_Track: [null, [Validators.maxLength(2)]],        // 字軌
    InvoiceNumberStart: [null, [Validators.maxLength(10)]],
    InvoiceNumberEnd: [null, [Validators.maxLength(10)]],
    InvoiceDateStart: [null],                            // 退出/折讓日期(起)
    InvoiceDateEnd: [null],                              // 退出/折讓日期(迄)
    InvoiceType: [null],                                 // 發票格式
    INV_DeclareYM: [
      null,
 
    ],                                                   // 申報年月
    Source_Doc_NoStart: [null, [Validators.maxLength(16)]], // 憑證單號(起)
    Source_Doc_NoEnd: [null, [Validators.maxLength(16)]],   // 憑證單號(迄)
    Voucher_NoStart: [null, [Validators.maxLength(16)]],    // 傳票編號(起)
    Voucher_NoEnd: [null, [Validators.maxLength(16)]],      // 傳票編號(迄)
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'PUR_GUINo', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    {
      field: 'PUR_GUIDate',
      header: '退出/折讓日期',
      visible: true,
      format: this.formatDateFromBackend,
    },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    {
      field: 'Credit_Type',
      header: '區別',
      visible: true,
      format: this.formatCreditType,
    },
    {
      field: 'PUR_RepYYYYMM',
      header: '申報年月',
      visible: true,
      format: this.formatRepYYYYMM,
    },
    {
      field: 'PUR_Net',
      header: '退回/折讓金額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2',
    },
    {
      field: 'PUR_Tax',
      header: '退回/折讓稅額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2',
    },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
  ];

  constructor(
    private fin13020Service: FIN13020Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13020', '/FIN/FIN13020CRU', this.queryForm);

    // 🔙 還原查詢條件（修掉 BehaviorSubject 型別錯誤）
    const savedAny: any = this.queryStateService.getQueryState(this.ProgNo) as any;
    const savedValue = savedAny?.value ?? savedAny; // 如果是 BehaviorSubject 就用 .value

    if (savedValue) {
      this.queryForm.patchValue(savedValue as any);
      this.onSubmit(this.queryForm);
    }
  }

  formatCreditType(value: string): string {
    switch (value) {
      case 'C':
        return '折讓';
      case 'R':
        return '退出';
      default:
        return value;
    }
  }

  formatDateFromBackend(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  formatRepYYYYMM(value: string): string {
    if (!value || value.length !== 6) return value;
    return `${value.substring(0, 4)}/${value.substring(4, 6)}`;
  }

  // 數字加千分位，兩位小數
  money(v: number): string {
    if (v === null || v === undefined) return '';
    const n = Number(v);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload: any = { ...form.value };

    // 字串欄位 trim + 空字串 => null
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    // 申報年月轉 YYYYMM
    payload.INV_DeclareYM = this.toYYYYMM(payload.INV_DeclareYM);

    this.loading = true;
    this.messageService.blockUi();

    this.fin13020Service.queryFIN13020(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;

        // 儲存查詢條件（含 INV_DeclareYM=YYYYMM）
        this.queryStateService.setQueryState(this.ProgNo, payload);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
    this.data = [];
    this.totalRecords = 0;
    // 如果有提供清除方法就一起清掉
    (this.queryStateService as any).clearQueryState?.(this.ProgNo);
  }

  // 🔥 批次刪除 / 單筆刪除
  onDelete(event: any): void {
    const rows = Array.isArray(event) ? event : [event];
    const idList = rows
      .map((r) => r.id)
      .filter((id) => id !== null && id !== undefined);

    if (!idList.length) {
      this.messageService.warnBubble('請先勾選要刪除的資料');
      return;
    }

    this.fin13020Service.deleteFIN13020(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗');
      },
    });
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    // 字串：'2025/05'、'2025-05-01T00:00:00'、'202505'
    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6);
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      }
      return null;
    }

    // Date 物件
    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    // 其他型別也試著 new Date
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }
}
