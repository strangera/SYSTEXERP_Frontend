import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin11060Service } from '@service/api/fin/fin11060.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { option } from '../../../shared/models/sys/sysb000.model';

export interface InvoiceBase {
  id: number;
  TXN_Time: Date; // 發票日期
  MIG_Time: Date; // 上傳日期
  CF0401_9000: number; // 一般交易_正常
  CF0501_9000: number; // 作廢交易_正常
  CF0701_9000: number; // 發票註銷_正常
  DG0401_9000: number; // 跨期折讓_正常
  DG0501_9000: number; // 跨期折讓作廢_正常
  CF0401_9001: number; // 一般交易_異常
  CF0501_9001: number; // 作廢交易_異常
  CF0701_9001: number; // 發票註銷_異常
  DG0401_9001: number; // 跨期折讓_異常
  DG0501_9001: number; // 跨期折讓作廢_異常
}

export interface InvoiceType1 extends InvoiceBase {
  TXN_No: string; // 交易序號
  TXN_GUINO: string; // 發票號碼
}

export interface InvoiceType2 extends InvoiceBase {
  ECR_No: string; // 收銀機號
}

export interface InvoiceType3 extends InvoiceBase {
  TXN_Date: Date; // 交易日期
}

type InvoiceRecord = InvoiceType1 | InvoiceType2 | InvoiceType3; //聯合型別

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-fin11060',
  templateUrl: './fin11060.component.html',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ButtonComponent, InputTextRangeComponent, RadiobuttonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, TranslateModule, TableReportComponent]
})

// 電子發票上送狀況表
export class FIN11060Component extends BasicQueryPageComponent<InvoiceRecord> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 先建立表單，還不確定POS8011H內容
    MID: [null as number | null, [Validators.required]], // MID (local storage)
    SYS_StoreNo: ["", [Validators.required]], // 店號 (local storage)
    Sale_DateStart: [yesterday, [Validators.required]],  // 銷售日期_起始日(必填_預設昨天)
    Sale_DateEnd: [yesterday, [Validators.required]],  // 銷售日期_終止日(必填_預設昨天)
    Gen_DateStart: [null],  // 產檔日期_起始日
    Gen_DateEnd: [null],  // 產檔日期_終止日
    TXN_GUINoStart: [null, [Validators.maxLength(10), Validators.minLength(10)]], // 發票起始號碼
    TXN_GUINoEnd: [null, [Validators.maxLength(10), Validators.minLength(10)]], // 發票結束號碼
    ECR_NoStart: [null, [Validators.maxLength(8)]], // 收銀機代號(起)
    ECR_NoEnd: [null, [Validators.maxLength(8)]], // 收銀機代號(迄)
    Query_Cond: ['2', Validators.required],  // 條件依據 送出 (銷售日期/收銀機號/收銀機號) SA: [查詢條件依據]的預設值設定為為"收銀機號"
    Is_ShowErr: ['N', [Validators.required]], //  是否只顯示異常

    //分頁查詢
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'TXN_Time', order: 1 }, { field: 'MIG_Time', order: 1 }]],
  });
  // 表格
  // ----------------------------------------------------------------
  lastQueryBody: any;
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  contact_type_Option: option[] = [
    { label: '銷售日期', value: '1' },
    { label: '收銀機號', value: '2' },
    { label: '交易序號', value: '3' },
  ];
  show_error_Option: option[] = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];

  POS_NOSOptions: any = []; // 收銀機號


  data: InvoiceRecord[] = [];
  key = 'TXN_GUINo';
  footerData: Record<string, number> = {};
  columns: ReportColumn[] = []; //顯示的column
  columnsType1: ReportColumn[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
    { field: 'TXN_Time', header: '發票日期', visible: true, format: formatDate },
    { field: 'MIG_Time', header: '上傳日期', visible: true, format: formatDate },
    // { field: 'TXN_No', header: '交易序號', visible: true },
    // { field: 'TXN_GUINO', header: '發票號碼', visible: true },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true, isTotal: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true, isTotal: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true, isTotal: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true, isTotal: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true, isTotal: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true, isTotal: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true, isTotal: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true, isTotal: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true, isTotal: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true, isTotal: true },
    // { field: 'ECR_No', header: '收銀機號', visible: true },
  ];

  columnsType2: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_Time', header: '發票日期', visible: true, format: formatDate },
    { field: 'MIG_Time', header: '上傳日期', visible: true, format: formatDate },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true, isTotal: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true, isTotal: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true, isTotal: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true, isTotal: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true, isTotal: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true, isTotal: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true, isTotal: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true, isTotal: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true, isTotal: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true, isTotal: true },
    // { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
  ];

  columnsType3: ReportColumn[] = [
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '發票日期', visible: true, format: formatDate },
    { field: 'MIG_Time', header: '上傳日期', visible: true, format: formatDate },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true, isTotal: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true, isTotal: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true, isTotal: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true, isTotal: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true, isTotal: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true, isTotal: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true, isTotal: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true, isTotal: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true, isTotal: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true, isTotal: true },
    // { field: 'ECR_No', header: '收銀機號', visible: true },
    // { field: 'TXN_Date', header: '交易日期', visible: true, format: formatDate },
  ];

  selectedItems: InvoiceRecord[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    public readonly fin11060Service: Fin11060Service,
    private readonly dropdownApiService: DropdownApiService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11060', 'FIN/FIN11060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();

    //依據 起始產檔日期 自動寫入迄號(迄號必須是null)
    this.queryForm.get('Gen_DateStart')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (this.queryForm.get('Gen_DateEnd')?.value == null) {
        this.queryForm.get('Gen_DateEnd')?.setValue(value); // 自動設置迄號
      }
    });

    //依據 起始發票號碼 自動寫入迄號(迄號必須是null)
    this.queryForm.get('TXN_GUINoStart')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      const TXN_GUINoStart = this.queryForm.get('TXN_GUINoStart')?.value as unknown as string
      const TXN_GUINoEnd = this.queryForm.get('TXN_GUINoEnd')?.value
      if (TXN_GUINoStart.length == 10 && TXN_GUINoEnd == null) { //這邊用 起號長度 + 終止為空 控制
        this.queryForm.get('TXN_GUINoEnd')?.setValue(value); // 自動設置迄號
      }
    });

    //依據 起始收銀機號 自動寫入迄號(迄號必須是null)
    this.queryForm.get('ECR_NoStart')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (this.queryForm.get('ECR_NoEnd')?.value == null) {
        this.queryForm.get('ECR_NoEnd')?.setValue(value); // 自動設置迄號
      }
    });

    // 改成同步更新，不用 setTimeout
    this.queryForm.get('Query_Cond')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.data = [];
      this.totalRecords = 0;
      this.updateColumnsByCondition(value);
      this.cdr.detectChanges();
    });

    // 初始欄位
    this.updateColumnsByCondition(this.queryForm.get('Query_Cond')?.value || '1');
  }

  onSubmit(frm: FormGroup) {
    // 設定登入資訊
    this.queryForm.patchValue({
      SYS_StoreNo: this.authService.getUserInfo()?.SYS_StoreNo ?? '',
      MID: Number(this.authService.getUserInfo()?.mid ?? 0),
    }, { emitEvent: false });

    console.log('查詢條件', frm.value);

    this.loading = true;
    this.messageService.blockUi(); // 假設這是顯示 loading 遮罩

    // 測試: 2025/01/0-2025/12/31
    this.fin11060Service.queryFIN11060(frm.value)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
          // this.cdr.markForCheck(); // 觸發畫面更新
        })
      )
      .subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = frm.value;
            this.data = response.Data ?? [];
            this.totalRecords = response.TotalCount ?? this.data.length;
            this.footerData = this.computeFooterData();
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            console.log('Result', this.data);
          } else {
            console.error('API error:', response.Status, response.Message);
            this.messageService.errorBubble(response.Message || '查詢失敗');
          }
        },
        error: (err) => {
          console.error('API error:', err);
          this.messageService.errorBubble('API 呼叫失敗');
        }
      });
  }

  //顯示欄位(初始為條件1)
  updateColumnsByCondition(value: string | string[] | null): void {
    const type = Array.isArray(value) ? value[0] : value;
    switch (type) {
      case '1':
        this.columns = [...this.columnsType1];
        this.key = 'TXN_No'
        console.log('切換為欄位1', this.columns);
        break;
      case '2':
        this.columns = [...this.columnsType2];
        this.key = 'ECR_No'
        console.log('切換為欄位2', this.columns);
        break;
      case '3':
        this.columns = [...this.columnsType3];
        this.key = 'TXN_Date'
        console.log('切換為欄位3', this.columns);
        break;
      default:
        this.columns = [];
    }
  }

  // 計算 isTotal 欄位的總計列 (取代 app-table 原本的 [showTotal] 自動加總)
  private computeFooterData(): Record<string, number> {
    const totals: Record<string, number> = {};
    for (const col of this.columns) {
      if (!col.isTotal) continue;
      totals[col.field] = this.data.reduce((sum, row) => sum + (Number((row as any)[col.field]) || 0), 0);
    }
    return totals;
  }

  loadOptions() {
    // 查 收銀機號
    this.dropdownApiService.queryPos1002().pipe(untilDestroyed(this)).subscribe(data => this.POS_NOSOptions = data?.map((item: { value: string; label: string; }) => ({ ...item, label: `${item.label}` })));
  }
}
