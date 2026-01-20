/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
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
import { Table2Component } from '../../../shared/componentkit/table2/table2.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
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
  ]
})
export class FIN13010Component extends BasicQueryPageComponent<any> {

PUR_VoucherTypeOptions: any[] = [
  { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
  { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
  { value: '23', label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
  { value: '24', label: '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
  { value: '25', label: '25-進項三聯式收銀機統一發票' },
  { value: '26', label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票' },
  { value: '27', label: '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
  { value: '28', label: '28-進項海關代徵營業稅繳納證' },
  { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
];
  queryForm = this.formBuilder.group({
    TXN_Ret_NoStart: [null, [Validators.maxLength(20)]], // 退出/折讓單號(起)
    TXN_Ret_NoEnd: [null, [Validators.maxLength(20)]],   // 退出/折讓單號(迄)
    GUI_Track: [null, [Validators.maxLength(2)]],        // 字軌
    PUR_GUINoStart: [null, [Validators.maxLength(10)]],
    PUR_GUINoEnd: [null, [Validators.maxLength(10)]],
    PUR_GUIDateStart: [null],                            // 領用日期(起)
    PUR_GUIDateEnd: [null],                              // 領用日期(迄)
    PUR_VoucherType: [null],                             // 發票狀態
    PUR_RepYYYYMM: [null],                               // 發票年月
    Source_Doc_NoStart: [null, [Validators.maxLength(16)]], // 憑證單號(起)
    Source_Doc_NoEnd: [null, [Validators.maxLength(16)]],   // 憑證單號(迄)
    Voucher_NoStart: [null, [Validators.maxLength(16)]],    // 發票起始號碼
    Voucher_NoEnd: [null, [Validators.maxLength(16)]],      // 發票結束號碼

    ...createPaginationConfig([{ field: 'id', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  // 若你有勾選刪除，可以用這個存選取列（可選）
  selectedItems: any[] = [];

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'PUR_GUINo', header: '發票號碼', visible: true },

    // 發票日期：Swagger 裡是 PUR_GUIDate
    {
      field: 'PUR_GUIDate',
      header: '發票日期',
      visible: true,
      format: this.formatDateFromBackend
    },

    // 憑證類別 / 發票格式
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },

    // 區別 C/R
    {
      field: 'Credit_Type',
      header: '區別',
      visible: true,
      format: this.formatCreditType
    },

    // 申報年月
    {
      field: 'PUR_RepYYYYMM',
      header: '申報年月',
      visible: true,
      format: this.formatRepYYYYMM
    },

    // 銷售額：用 PUR_Amt（含稅金額）
    {
      field: 'PUR_Amt',
      header: '銷售額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2'
    },

    // 稅額：用 PUR_Tax
    {
      field: 'PUR_Tax',
      header: '稅額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2'
    },

    // 退回/折讓金額：這裡就看後端有沒有專門欄位
    // 目前 swagger 只有 PUR_Net/PUR_Tax/PUR_Amt，
    // 若 FIN13010 是折讓紀錄本身，那 PUR_Net/PUR_Tax/PUR_Amt 就是「這張折讓的金額」
    {
      field: 'PUR_Net',
      header: '退回/折讓金額',
      visible: true,
      format: (v: number) => this.money(v),
      exportFormat: 'number:comma2'
    },
    {
      field: 'Source_Doc_No',
      header: '憑證單號',
      visible: true
    },
    {
      field: 'Voucher_No',
      header: '傳票編號',
      visible: true
    }
  ];

  constructor(
    private fin13010Service: FIN13010Service,
    private validationService: ValidationService,
    
  ) {
    super();
  }

  /* ----------------- 格式處理 ----------------- */

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

  money(v: number): string {
    return Number(v ?? 0).toLocaleString('en-US');
  }

  /* ----------------- Init：加上還原條件 ----------------- */

  ngOnInit(): void {
    this.initializePage('FIN13010', '/FIN/FIN13010CRU', this.queryForm);

    // 還原上一筆查詢條件
    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    if (saved) {
      this.queryForm.patchValue(saved, { emitEvent: false });
      // 自動再查一次
      this.onSubmit(this.queryForm);
    }
  }

  /* ----------------- 查詢 ----------------- */

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload: any = { ...form.value };

    // 先把字串欄位修剪
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    // ★ 把月曆值轉成六碼 YYYYMM
    payload.PUR_RepYYYYMM = this.toYYYYMM(payload.PUR_RepYYYYMM);

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.queryFIN13010(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;

        // ⬅️ 存「表單值」，讓還原條件時可以還原月曆/輸入框
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      },
      error: () => {
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
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    // 先處理常見字串：'2025/05'、'2025-05-01T00:00:00'
    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, ''); // 拿掉所有非數字
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6); // '202505'
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

    // 其他型別就試著 new Date 看看
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  /* ----------------- 刪除：有傳票號碼不能選也不能刪 ----------------- */

  /** 判斷這一列是否可以被勾選（有 Voucher_No 的一律不能勾） */
  isRowSelectable = (row: any): boolean => {
    const v = row?.Voucher_No ?? row?.voucher_No ?? row?.VOUCHER_NO;
    // 沒填傳票 → 可以選
    if (v == null) return true;
    return String(v).trim() === '';
  };

  /**
   * TableComponent 的 deleteRow(selectedItems) 會把「選到的列陣列」丟進來。
   * 這裡把裡面的 id 抽出來組成 idList，呼叫後端刪除。
   * 同時再防呆一次：有 Voucher_No 的就完全不送刪除。
   */
  Delete(selectedRows: any[]): void {
    // 沒有選任何列
    if (!selectedRows || !selectedRows.length) {
      this.messageService.warnBubble('請先選取要刪除的資料');
      return;
    }

    // 先濾掉有傳票號碼的資料
    const deletableRows = selectedRows.filter(r => this.isRowSelectable(r));
    const blockedRows = selectedRows.length - deletableRows.length;

    if (!deletableRows.length) {
      this.messageService.warnBubble('已拋轉有傳票號碼的資料不可刪除');
      return;
    }

    if (blockedRows > 0) {
      this.messageService.infoBubble(`已忽略 ${blockedRows} 筆有傳票號碼的資料，僅刪除其餘未拋轉資料`);
    }

    // 從每筆 row 裡面抓出 id（或 ID / Id，看後端回傳欄位）
    const idList = deletableRows
      .map(r => Number(r.id ?? r.ID ?? r.Id))
      .filter(id => Number.isFinite(id) && id > 0);

    if (!idList.length) {
      this.messageService.warnBubble('找不到可刪除的資料主鍵（id）。');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.deleteFIN13010(idList).subscribe({
      next: (res) => {
        console.log('刪除成功:', res);
        // 刪除成功後重新查詢
        this.onSubmit(this.queryForm);
      },
      error: (err) => {
        console.error('刪除失敗:', err);
        this.loading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }

 

}
