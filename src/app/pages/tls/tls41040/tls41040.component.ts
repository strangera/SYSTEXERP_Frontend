import { AsyncPipe, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from "@shared/componentkit/calendar/calendar.component";
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { TLS41040Data, TLS41040QueryReq, Tls41040Service } from '../../../service/api/tls/tls41040.service'; // 引入剛剛做的 service
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { Column } from '../../../shared/componentkit/table/table.model';

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
    InputTextareaComponent,
    AsyncPipe
  ],
})
export class TLS41040Component extends BasicQueryPageComponent<TLS41040Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [null], // 收銀機號
    NOT_BegDateTime: [new Date()], // 開始時間
    NOT_EndDateTime: [new Date()], // 結束時間
    NOT_Status: ['A'], // 通告狀態
    NOT_Remark: ['', [Validators.maxLength(200)]], // 改成和後端一樣
    pageSize: [100],
    pageIndex: [1], // 你將初始頁碼改為 1
  });
  ECRNoOptions = this.dropDown.queryPos1002();
  NOT_Status_Options = [{ label: '已生效', value: 'A' }, { label: '已刪除', value: 'D' },];
  ECRTypeOptions = getSYS1000Options('ECR_Type');
  columns7: Column[] = [
    { field: 'NOT_DateTime', header: '通告產生時間', format: formatDateTime },
    { field: 'NOT_BegDateTime', header: '開始日期', format: formatDateTime },
    { field: 'NOT_EndDateTime', header: '結束時間', format: formatDateTime },
    { field: 'NOT_Desc', header: '通告內容' },
    { field: 'NOT_Status', header: '通告狀態', format: (v: string) => (v === 'A' ? '已生效' : v === 'D' ? '已刪除' : v ?? '') },
    { field: 'NOT_Remark', header: '通告備註' },
  ];
  expansionColumns7: Column[] = [
    { field: 'ECR_GrpNo', header: '機台群組編號' },
    { field: 'ECR_GrpName', header: '機台群組名稱' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'ECR_Type', header: '機台類別', format: (v) => getSYS1000('ECR_Type', v) },
    { field: 'BUILDING_Name', header: '館別' },
    { field: 'FLOOR_Name', header: '樓層' },
    { field: 'Area_Name', header: '區域' },
  ];
  data: TLS41040Data[] = [];
  lastQueryBody: TLS41040QueryReq | null = null;
  totalRecords = 0;
  selectedItems: TLS41040Data[] = [];

  constructor(
    private readonly dropDown: DropdownApiService,
    public readonly tls41040Service: Tls41040Service, // 注入 Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', '/TLS/TLS41040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const frmValue = frm.value;
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
      this.tls41040Service.queryTLS41040(payload).pipe(finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res?.Data ?? [];
        this.lastQueryBody = payload;
        this.totalRecords = res?.TotalCount ?? 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  isRowSelectable = (row: TLS41040Data) => {
    // 已刪除的不可選
    if (row.NOT_Status === 'D') return false;
    // 結束日早於今天的也不可選（避免刪除/批次操作）
    if (this.isEditDisabled(row)) return false;
    return true;
  };

  // 判斷是否可以編輯/刪除：當 NOT_EndDateTime < 今日 (日期比較，不含時間) 時，回傳 true 表示禁用編輯
  isEditDisabled = (row: TLS41040Data) => {
    if (!row || !row.NOT_EndDateTime) return false; // 沒有結束日則允許
    const end = new Date(row.NOT_EndDateTime);
    if (isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end < today; // 結束日 < 今天 => 禁用編輯/刪除
  };

  // ---- 刪除 ----
  onDelete(selectedRows: TLS41040Data[]): void {
    const idList = selectedRows.map(row => row.ID).filter((id): id is number => typeof id === 'number');
    if (!idList.length) { return; }
    this.messageService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        this.loading = true;
        const deletePayload = { idList };
        this.tls41040Service.deleteTLS41040(deletePayload).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe(() => {
          this.onSubmit(this.queryForm);
          this.selectedItems = [];
        });
      }
    });
  }

  // ---- 下傳 ----
  btnLoading = false;
  onUpload(): void {
    const idList = this.selectedItems.map(row => row.ID).filter((id): id is number => typeof id === 'number');
    if (!idList.length) {
      this.messageService.errorBubble('無可下傳的資料');
      return;
    }
    this.btnLoading = true;
    this.tls41040Service.posTLS41040({ idList }).pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false))).subscribe(() => {
      this.messageService.successBubble('下傳成功');
      this.onSubmit(this.queryForm);
      this.selectedItems = [];
    });
  }


}
