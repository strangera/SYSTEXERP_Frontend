/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// UI
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
  selector: 'app-fin13010',
  templateUrl: './fin13010.component.html',
  styleUrls: ['./fin13010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    YearMonthComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    Table2Component,
    TranslateModule,
  ],
})
export class FIN13010Component extends BasicQueryPageComponent<any> {
  PUR_VoucherTypeOptions: any[] = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    {
      value: '23',
      label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單',
    },
    {
      value: '24',
      label:
        '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單',
    },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    {
      value: '26',
      label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  queryForm = this.formBuilder.group({
    TXN_Ret_NoStart: [null, [Validators.maxLength(20)]], // 退出/折讓單號(起)
    TXN_Ret_NoEnd: [null, [Validators.maxLength(20)]], // 退出/折讓單號(迄)
    GUI_Track: [null, [Validators.maxLength(2)]], // 字軌
    PUR_GUINoStart: [null, [Validators.maxLength(10)]],
    PUR_GUINoEnd: [null, [Validators.maxLength(10)]],
    PUR_GUIDateStart: [null], // 退出/折讓日期(起)
    PUR_GUIDateEnd: [null], // 退出/折讓日期(迄)
    PUR_VoucherType: [null], // 發票格式
    PUR_RepYYYYMM: [null as string | null], // 申報年月
    Source_Doc_NoStart: [null, [Validators.maxLength(16)]], // 憑證單號(起)
    Source_Doc_NoEnd: [null, [Validators.maxLength(16)]], // 憑證單號(迄)
    Voucher_NoStart: [null, [Validators.maxLength(16)]], // 傳票編號(起)
    Voucher_NoEnd: [null, [Validators.maxLength(16)]], // 傳票編號(迄)
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'PUR_GUINo', header: '發票號碼', visible: true },
    {
      field: 'PUR_GUIDate',
      header: '發票日期',
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
      field: 'PUR_Amt',
      header: '銷售額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2',
    },
    {
      field: 'PUR_Tax',
      header: '稅額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2',
    },
    {
      field: 'PUR_Net',
      header: '退回/折讓金額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2',
    },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
  ];

  constructor(
    private fin13010Service: FIN13010Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  /* ---------- 顯示用格式 ---------- */

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

  money(v: number): string {
    return Number(v ?? 0).toLocaleString('en-US');
  }

  /* ---------- Init：只從 CRU 回來才還原 ---------- */

  ngOnInit(): void {
    // 第二個參數是 CRU 路徑，照你原本的寫法
    this.initializePage('FIN13010', '/FIN/FIN13010CRU');

    const fromCru = !!(history.state && history.state['fromCru']);
    if (fromCru) {
      // ✅ 只有從 CRU 回來才還原 + 自動查詢
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) =>
        this.onSubmit(f),
      );
    } else {
      // ✅ 其他情況使用預設值：申報年月帶今天所在的期間
      this.setDefaultRepYYYYMMByToday();
    }
  }

  /** 預設申報年月：依現在日期計算 YYYYMM（你之前的雙月邏輯保留） */
  private setDefaultRepYYYYMMByToday(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 雙月邏輯：用偶數月代表申報期間
    let evenMonth = month % 2 === 0 ? month : month + 1;
    if (evenMonth > 12) {
      evenMonth = 12;
    }
    const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;

    this.queryForm.patchValue(
      {
        PUR_RepYYYYMM: repYYYYMM,
      },
      { emitEvent: false },
    );
  }

  /* ---------- 查詢 ---------- */

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload: any = { ...form.value };

    // 字串欄位 trim & 空白轉 null
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    // 申報年月轉成六碼 YYYYMM
    payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.queryFIN13010(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;

        // 存「查詢用原始值」給之後從 CRU 回來還原
        this.queryStateService.setQueryState(
          this.ProgNo,
          this.queryForm.getRawValue(),
        );
      },
      error: () => {
        this.loading = false;
        this.messageService.unblockUi();
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
    this.selectedItems = [];
    // 清空後也重新帶一次預設申報年月
    this.setDefaultRepYYYYMMByToday();
    // 清除查詢還原狀態
    this.queryStateService.clearQueryState(this.ProgNo);
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

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

    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  /* ---------- 刪除：已有傳票編號不可刪 ---------- */

  isRowSelectable = (row: any): boolean => {
    const v = row?.Voucher_No ?? row?.voucher_No ?? row?.VOUCHER_NO;
    if (v == null) return true;
    return String(v).trim() === '';
  };

  Delete(selectedRows: any[]): void {
    if (!selectedRows || !selectedRows.length) {
      this.messageService.warnBubble('請先選取要刪除的資料');
      return;
    }

    const deletableRows = selectedRows.filter((r) => this.isRowSelectable(r));
    const blockedRows = selectedRows.length - deletableRows.length;

    if (!deletableRows.length) {
      this.messageService.warnBubble('已拋轉有傳票號碼的資料不可刪除');
      return;
    }

    if (blockedRows > 0) {
      this.messageService.infoBubble(
        `已忽略 ${blockedRows} 筆有傳票號碼的資料，僅刪除其餘未拋轉資料`,
      );
    }

    const idList = deletableRows
      .map((r) => Number(r.id ?? r.ID ?? r.Id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (!idList.length) {
      this.messageService.warnBubble('找不到可刪除的資料主鍵（id）。');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.deleteFIN13010(idList).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
      },
      error: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
}
