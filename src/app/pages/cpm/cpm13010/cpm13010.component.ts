import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm13010Service, QueryCPM13010Request, QueryCPM13010Response } from '@service/api/cpm/cpm13010.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { formatDateTime } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-cpm13010',
  templateUrl: './cpm13010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputNumberComponent,
    ButtonModule,
    TableReportComponent,
    ButtonModule
  ],
})
// 5.11.7 專櫃停車費折抵設定作業
export class CPM13010Component extends BasicQueryPageComponent<QueryCPM13010Response> implements OnInit {
  queryForm = this.formBuilder.group({
    PKNG_DiscHour: [null, [Validators.max(999), Validators.min(0)]], // 折抵時數，允許小數一位
    PKNG_SaleAmt: [null, [Validators.max(99999999), Validators.min(0)]], // 消費金額，允許小數兩位
    PageSize: [30],
    PageIndex: [1],
  });
  lastQueryBody: QueryCPM13010Request | null = null;
  totalRecords = 0;
  data: QueryCPM13010Response[] = [];
  selectedRows: QueryCPM13010Response[] = []; // 用於表格多選/刪除

  columns: ReportColumn[] = [
    { field: 'PKNG_SeqNo', header: '序號', visible: false },
    { field: 'PKNG_DiscHour', header: '折抵時數', visible: true },
    { field: 'PKNG_SaleAmt', header: '折抵金額', visible: true },
    { field: 'PKNG_Status', header: '狀態', visible: true, format: (val: string) => getSYS1000('PKNG_Status', val) },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  constructor(
    public readonly cpm13010Service: Cpm13010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化頁面，設定程式代號和新增/修改頁面路由
    this.initializePage('CPM13010', '/CPM/CPM13010cru', this.queryForm, (frm) => this.onSubmit(frm));
  }

  // 表單提交邏輯 (查詢)
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm13010Service.queryCPM13010(frm.value as QueryCPM13010Request)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Data) {
            this.lastQueryBody = frm.value;
            this.data = response.Data;
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        });
    });
  }

  // onDelete (刪除功能，此處僅為模板，需根據實際需求實現)
  onDelete(selectedRows: QueryCPM13010Response[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedRows.length} 筆資料?`,
      accept: () => {
        const IDs = selectedRows.map(row => row.ID);
        this.loading = true;
        this.cpm13010Service.deleteCPM13010({ IDs }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          if (res.Status === '0000') {
            this.onSubmit(this.queryForm);
            this.selectedRows = [];
            this.messageService.successBubble(res.Message);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });

      }
    })
  }
  btnLoading = false;
  // onUpload() {
  //   const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
  //   const userNo = this.authService.currentUserValue?.user_No; // 雖然這裡沒用到，但習慣上會取
  //   const itemsToUpload = this.selectedRows; // 確保處理的是選取的項目
  //   if (!storeNo || !userNo || !itemsToUpload.length) { return; }
  //   this.btnLoading = true;
  //   from(itemsToUpload).pipe(
  //     concatMap((item) => {
  //       // 為每個選定的 item 建立 params
  //       const params = {
  //         SYS_StoreNo: storeNo,
  //         EXP_StoreNo: storeNo,
  //         EXP_Type: "DSC2010",
  //         EXP_DocNo: storeNo + ";" + item.PKNG_SeqNo,
  //         EXP_DataFlag: item.PKNG_Status === 'D' ? "SDP" : "S2P",
  //         EXP_Desc: ""
  //       };
  //       return this.ExecSpFunc.ExecSpFunc(params);
  //     }),
  //     finalize(() => this.btnLoading = false),
  //     untilDestroyed(this)
  //   ).subscribe(response => {
  //     if (response.ErrCode !== 0) {
  //       this.messageService.errorBubble(response.ErrMsg);
  //       return;
  //     }
  //     this.selectedRows = [];
  //     this.onSubmit(this.queryForm);
  //   });
  // }
  // 狀態為刪除禁止下傳
  get isDisabled(): boolean {
    return this.selectedRows.some(row => row.PKNG_Status === 'D');
  }

  isRowSelectable = (row: QueryCPM13010Response): boolean => {
    // 1. 如果資料不存在，不給選
    if (!row) return false;

    // 2. 如果目前沒有選取任何資料，全部都可以選
    if (!this.selectedRows || this.selectedRows.length === 0) {
      return true;
    }

    // 3. 互斥邏輯判斷
    // 拿目前已選的第一筆作為基準
    const firstSelectedStatus = this.selectedRows[0].PKNG_Status;

    // 如果第一筆是「已刪除 (D)」，後續就只能選「已刪除」的
    // 如果第一筆是「正常」，後續就只能選「正常」的
    return row.PKNG_Status === firstSelectedStatus;
  }
  editDisabled(row: QueryCPM13010Response): boolean {
    return row.PKNG_Status === 'D';
  }

  deleteDisabled = (row: QueryCPM13010Response): boolean => {
    return row?.PKNG_Status === 'D';
  }

  get isRecoverDisabled(): boolean {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      return true;
    }
    // 如果選中的資料中有任何一筆不是 'D'，就不能點恢復
    return this.selectedRows.some(row => row.PKNG_Status !== 'D');
  }

  // 實作恢復折抵邏輯
  onRecoverDiscount() {
    if (this.selectedRows.length === 0) return;

    this.messageService.confirm({
      header: `是否確認恢復 ${this.selectedRows.length} 筆資料?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const IDs = this.selectedRows.map(row => row.ID);
        this.btnLoading = true; // 按鈕進入讀取狀態

        this.cpm13010Service.recoverCPM13010({ IDs })
          .pipe(
            untilDestroyed(this),
            finalize(() => this.btnLoading = false)
          )
          .subscribe(res => {
            if (res.Status === '0000') {
              this.messageService.successBubble('資料已成功恢復');
              this.onSubmit(this.queryForm); // 重新查詢更新列表
              this.selectedRows = [];        // 清空選取項
            } else {
              this.messageService.errorBubble(res.Message || '恢復失敗');
            }
          });
      }
    });
  }
}
