import { NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from "@shared/componentkit/calendar/calendar.component";
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { Tls41040Service } from '../../../service/api/tls/tls41040.service'; // 引入剛剛做的 service
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 定義資料項目介面
interface TLS41040Item {
  NOT_SeqNo: string;
  NOT_DateTime: string;
  NOT_BegDateTime: string;
  NOT_EndDateTime: string;
  NOT_Desc: string;
  NOT_Status: string;
  NOT_Remark: string;
  TLT_No: string;
  ECR_Type: string;
  ECR_GrpNo: string;
  BUILDING_No: string;
  FLOOR_No: string;
  Area_No: string;
  ID?: number;
  id?: number;
  NOT_DispRt: string;
  NOT_DispSpd: string;
  NOT_DispBtn: string;
  NOT_DispCd: string;
  NOT_Prn: string;
  NOT_DtlLimit: string;
}

@Component({
  selector: 'app-tls41040',
  templateUrl: './tls41040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
    InputTextareaComponent
  ],
})
export class TLS41040Component extends BasicQueryPageComponent<TLS41040Item> implements OnInit {

  // ---- 表單 ----
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [''], // 收銀機號
    NOT_BegDateTime: [new Date()], // 開始時間
    NOT_EndDateTime: [new Date()], // 結束時間
    NOT_Status: ['A'], // 通告狀態
    NOT_Remark: ['', [Validators.maxLength(200)]], // 改成和後端一樣
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  ECRNoOptions: { label: string; value: string }[] = [];

  ECRTypeOptions: { No: string; Name: string }[] = [
    { No: '1', Name: '統收(集中)機台' },
    { No: '2', Name: '自收(專櫃)機台' },
    { No: '5', Name: '離線機台' },
    { No: '7', Name: '虛擬機台' },
    { No: 'CH', Name: '發票換開機台' },
    { No: 'OT', Name: '它社機台' }
  ];

  // 由 ECR_Type 的代碼取得中文顯示
  getECRTypeLabel = (code: string | number | undefined): string => {
    if (code === null || code === undefined) return '';
    const c = String(code);
    const found = this.ECRTypeOptions.find(x => x.No === c);
    return found ? found.Name : c;
  };

  NOT_Status_Options = [
    { label: '已生效', value: 'A' },
    { label: '已刪除', value: 'D' },
  ];

  private statusLabel = (v: string) => (v === 'A' ? '已生效' : v === 'D' ? '已刪除' : v ?? '');

  toColumnDateTimeFormat(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}-${hh}:${min}:${ss}`;
  }
  columns7: Column[] = [
    { field: 'NOT_DateTime', header: '通告產生時間', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_BegDateTime', header: '開始日期', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_EndDateTime', header: '結束時間', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_Desc', header: '通告內容', visible: true },
    { field: 'NOT_Status', header: '通告狀態', visible: true, format: (v: string) => this.statusLabel(v) },
    { field: 'NOT_Remark', header: '通告備註', visible: true },
  ];

  expansionColumns7: Column[] = [
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'ECR_Type', header: '機台類別', visible: true, format: (v) => this.getECRTypeLabel(v) },
    { field: 'ECR_GrpNo', header: '機台群組編號', visible: true },
    { field: 'BUILDING_No', header: '館別', visible: true },
    { field: 'FLOOR_No', header: '樓層', visible: true },
    { field: 'Area_No', header: '區域', visible: true },
  ];

  data: TLS41040Item[] = [];
  lastQueryBody: any | null = null;
  totalRecords = 0;
  selectedItems: TLS41040Item[] = [];

  constructor(
    private readonly ECRNoService: ECRNoService,
    public readonly tls41040Service: Tls41040Service, // 注入 Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', '/TLS/TLS41040cru', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }


  onSubmit(frm: FormGroup) {
    const frmValue = frm.value;
    this.handleSubmit(frm, () => {
      // 將查詢日期統一轉為：
      //  開始日 = 當天 00:00:00
      //  結束日 = (使用者選的結束日 + 1 天) 00:00:00
      //  以配合後端常見的「>= 開始日 且 < 結束日」條件，
      //  讓使用者選 25 號時，可以查到 25 號整天的資料。
      const beg = frmValue.NOT_BegDateTime ? new Date(frmValue.NOT_BegDateTime) : null;
      const end = frmValue.NOT_EndDateTime ? new Date(frmValue.NOT_EndDateTime) : null;

      if (beg && !isNaN(beg.getTime())) {
        beg.setHours(0, 0, 0, 0);
      }
      if (end && !isNaN(end.getTime())) {
        end.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 1); // 往後推一天，後端用 < end 時會包含使用者選的那一天
      }

      const payload = {
        PageSize: frmValue?.pageSize || 10,
        PageIndex: (frmValue?.pageIndex ?? 1),
        STO_No: '10',
        ECR_No: frmValue.ECR_No || '',
        NOT_BegDateTime: beg,
        NOT_EndDateTime: end,
        NOT_Status: frmValue.NOT_Status || '',
        NOT_Remark: frmValue.NOT_Remark || ''
      };

      this.loading = true;
      this.tls41040Service.queryTLS41040(payload)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (res) => {
            this.data = res?.Data ?? [];
            this.lastQueryBody = payload;
            this.totalRecords = res?.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            console.log('查詢結果', this.data.find(x => x.ID === 69));
          },
          error: (err) => console.error('TLS41040 查詢失敗:', err)
        });
    });
  }

  isRowSelectable = (row: TLS41040Item) => {
    // 如果 row 不存在則預設為可選
    if (!row) return true;
    // 已刪除的不可選
    if (row.NOT_Status === 'D') return false;
    // 結束日早於今天的也不可選（避免刪除/批次操作）
    if (this.isEditDisabled(row)) return false;
    return true;
  };

  // 判斷是否可以編輯/刪除：當 NOT_EndDateTime < 今日 (日期比較，不含時間) 時，回傳 true 表示禁用編輯
  isEditDisabled = (row: TLS41040Item) => {
    if (!row || !row.NOT_EndDateTime) return false; // 沒有結束日則允許
    const end = new Date(row.NOT_EndDateTime);
    if (isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end < today; // 結束日 < 今天 => 禁用編輯/刪除
  };

  // ---- 刪除 ----
  onDelete(selectedRows: TLS41040Item[]): void {
    const idList = selectedRows.map(row => row.ID || row.id).filter((id): id is number => typeof id === 'number');
    if (!idList.length) {
      this.messageService.warnBubble('無有效的 ID 可供刪除');
      return;
    }

    this.messageService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        const deletePayload = { idList };
        this.tls41040Service.deleteTLS41040(deletePayload).pipe(untilDestroyed(this)).subscribe({
          next: () => {
            this.onSubmit(this.queryForm);
            this.selectedItems = [];
          },
          error: (err) => {
            console.error('刪除失敗', err);
            this.messageService.errorBubble('刪除失敗');
          }
        });
      }
    });
  }

  // ---- 下傳 ----
  btnLoading = false;
  onUpload(): void {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      return;
    }

    // 後端需求：以 idList 傳入欲下傳的資料 ID 清單
    const idList = this.selectedItems
      .map(row => row.ID ?? row.id)
      .filter((id): id is number => typeof id === 'number');

    if (!idList.length) {
      this.messageService.errorBubble('無可下傳的資料');
      return;
    }

    this.btnLoading = true;

    this.tls41040Service.posTLS41040({ idList })
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: () => {
          this.messageService.successBubble('下傳成功');
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
        },
      });
  }


}
