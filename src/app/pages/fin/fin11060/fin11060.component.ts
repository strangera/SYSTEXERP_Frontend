import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { Tls12060Service } from '@service/api/tls/tls12060.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { ReportTableGroupComponent } from '@shared/componentkit/report-table-group/report-table-group.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ECRNoService } from '@service/basic/ECRNo.service';
import { Fin11060Service } from '@service/api/fin/fin11060.service';

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
  styleUrl: './fin11060.component.scss',
  standalone: true,
  imports: [CommonModule, MenubarComponent, ButtonComponent, InputTextRangeComponent,  RadiobuttonComponent,  AccordionModule, FormsModule, ReactiveFormsModule,  CalendarRangeQuickComponent, DropdownComponent,  ReportTableGroupComponent, TranslateModule]
})

// 電子發票上送狀況表
export class FIN11060Component extends BasicQueryPageComponent<InvoiceRecord> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 先建立表單，還不確定POS8011H內容
    MID: [null as number| null, [Validators.required]], // MID (local storage)
    SYS_StoreNo: ["", [Validators.required]], // 店號 (local storage)
    Sale_DateStart: [yesterday, [Validators.required]],  // 銷售日期_起始日(必填_預設昨天)
    Sale_DateEnd: [yesterday, [Validators.required]],  // 銷售日期_終止日(必填_預設昨天)
    Gen_DateStart: [null],  // 產檔日期_起始日
    Gen_DateEnd: [null],  // 產檔日期_終止日
    TXN_GUINoStart: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    TXN_GUINoEnd: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    ECR_NoStart: [null, [Validators.maxLength(8)]], // 收銀機代號(起)
    ECR_NoEnd: [null, [Validators.maxLength(8)]], // 收銀機代號(迄)
    Query_Cond: ['1', Validators.required],  // 條件依據 送出 (銷售日期/收銀機號/收銀機號)
    Is_ShowErr: ['Y', [Validators.required]], //  是否只顯示異常

    //分頁查詢
    // ...createPaginationConfig([{ field: 'TXN_GUINo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
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

  POS_NOSOptions: { value: string; label: string; }[] = []; // 收銀機號


  data: InvoiceRecord[] = [];
  columns: Column[] = []; //顯示的column
  columnsType1: Column[] = [
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'TXN_GUINO', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '發票日期', visible: true },
    { field: 'MIG_Time', header: '上傳日期', visible: true },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_Date', header: '交易日期', visible: true },
  ];

  columnsType2: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_Time', header: '發票日期', visible: true },
    { field: 'MIG_Time', header: '上傳日期', visible: true },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_Date', header: '交易日期', visible: true },
  ];

  columnsType3: Column[] = [
    { field: 'TXN_Date', header: '交易日期', visible: true },
    { field: 'TXN_Time', header: '發票日期', visible: true },
    { field: 'MIG_Time', header: '上傳日期', visible: true },
    { field: 'CF0401_9000', header: '一般交易_正常', visible: true },
    { field: 'CF0501_9000', header: '作廢交易_正常', visible: true },
    { field: 'CF0701_9000', header: '發票註銷_正常', visible: true },
    { field: 'DG0401_9000', header: '跨期折讓_正常', visible: true },
    { field: 'DG0501_9000', header: '跨期折讓作廢_正常', visible: true },
    { field: 'CF0401_9001', header: '一般交易_異常', visible: true },
    { field: 'CF0501_9001', header: '作廢交易_異常', visible: true },
    { field: 'CF0701_9001', header: '發票註銷_異常', visible: true },
    { field: 'DG0401_9001', header: '跨期折讓_異常', visible: true },
    { field: 'DG0501_9001', header: '跨期折讓作廢_異常', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_Date', header: '交易日期', visible: true },
  ];

  selectedItems: InvoiceRecord[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private fin11060Service: Fin11060Service,
    private eCRNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11060', 'FIN/FIN11060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();

    // 監聽 condition_type 變化(切換顯示欄位)
    this.queryForm.get('Query_Cond')?.valueChanges.subscribe((value) => {
      this.updateColumnsByCondition(value);
    });

    // 預設初始欄位
    this.updateColumnsByCondition(this.queryForm.get('Query_Cond')?.value || '1');
  }

  onSubmit(frm: FormGroup) {
    this.queryForm.get('SYS_StoreNo')?.setValue(this.authService.getUserInfo()?.SYS_StoreNo ?? '');
    const midNum = Number(this.authService.getUserInfo()?.mid ?? 0); //section項目讀取字串轉換為number
    this.queryForm.get('MID')?.setValue(midNum);
    // this.queryForm.get('MID')?.setValue(this.authService.getUserInfo()?.mid ?? 0);
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      this.fin11060Service.queryFIN11060(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            console.log('Result', this.data);
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            console.error('API error:', response.Status, response.Message);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err: string) => {
          console.error('API error:', err);
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  //顯示欄位(初始為條件1)
  updateColumnsByCondition(value: string | string[] | null): void {
    const type = Array.isArray(value) ? value[0] : value;

    switch (type) {
      case '1':
        this.columns = [...this.columnsType1];
        console.log('切換為欄位1', this.columns);
        break;
      case '2':
        this.columns = [...this.columnsType2];
        console.log('切換為欄位2', this.columns);
        break;
      case '3':
        this.columns = [...this.columnsType3];
        console.log('切換為欄位3', this.columns);
        break;
      default:
        this.columns = [];
    }
  }

  // 刪除項目
  onDelete(data: InvoiceRecord | InvoiceRecord[]): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      console.error('No items to delete');
      this.messageService.errorBubble('無法刪除：沒有選中的項目');
      return;
    }

    // 收集所有有效的 ID
    const idList = items
      .filter((item) => item && item.id != null && item.id !== undefined)
      .map((item) => item.id);

    if (idList.length === 0) {
      console.error('No valid IDs to delete');
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      return;
    }

    // const deleteBody = {
    //   idList: idList, // 符合 API 的 idList 格式
    // };

    // this.tls12010Service.deleteTLS12010(deleteBody).subscribe({
    //   next: (response) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });

    this.selectedItems = [];
  }


  loadOptions() {
    // 查 收銀機號
    this.eCRNoService.getECRNo().pipe(untilDestroyed(this)).subscribe(data => this.POS_NOSOptions = data.map((item: { value: string; label: string; }) => ({ ...item, label: `${item.value} - ${item.label}` })));
  }
}
