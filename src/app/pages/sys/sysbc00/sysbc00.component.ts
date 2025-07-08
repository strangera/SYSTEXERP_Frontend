import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ISysbc00Data, Sysbc00Service } from '../../../service/api/sys/sysbc00.service';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { Sys1004Service } from '../../../service/api/sys/sys1004.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-sysbc00',
  templateUrl: './sysbc00.component.html',
})
// 銀行基本資料維護作業
export class SYSBC00Component extends BasicQueryPageComponent<ISysbc00Data> implements OnInit {
  queryForm = this.formBuilder.group({
    BNK_No: ['', [Validators.maxLength(10)]], // 金資中心銀行代碼
    BNK_Name: ['', [Validators.maxLength(60)]], // 銀行名稱
    BNK_ShortName: ['', [Validators.maxLength(30)]], // 銀行簡稱
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: ISysbc00Data[] = [];
  selectedRows: ISysbc00Data[] = [];
  columns: Column[] = [
    { field: 'BNK_No', header: '金資中心銀行代碼', visible: true },
    { field: 'BNK_Name', header: '銀行名稱', visible: true },
    { field: 'BNK_ShortName', header: '銀行簡稱', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  subColumns: Column[] = [
    { field: 'BNK_BranchNo', header: '銀行分行代號', visible: true },
    { field: 'BNK_BranchName', header: '銀行分行名稱', visible: true },
    { field: 'ACC_LEN', header: '該行帳號最小長度', visible: false },
    { field: 'ACC_LEN_MAX', header: '該行帳號最大長度', visible: false },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];

  constructor(
    private sysbc00Service: Sysbc00Service,
    private sys1004Service: Sys1004Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBC00', 'SYS/SYSBC00cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sysbc00Service.querySYSBC00(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.addSys1004Data(this.data);
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    })
  }

  addSys1004Data(data: ISysbc00Data[]) {
    data.forEach(item => {
      this.sys1004Service.queryAPS1004({ BNK_No: item.BNK_No }).pipe(untilDestroyed(this)).subscribe(response => {
        item.details = response.Data;
      });
    });
  }

  onDelete(rows: ISysbc00Data[]) {
    this.confirmationService.confirm({
      message: `是否確認刪除此銀行?`,
      header: `確認刪除銀行`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsToDelete = rows.map(item => item.id);
        this.loading = true; // 設置載入狀態
        this.sysbc00Service.deleteSYSBC00(idsToDelete).pipe(
          untilDestroyed(this), // 確保在組件銷毀時取消訂閱
          finalize(() => this.loading = false) // 無論成功失敗，都要關閉載入狀態
        ).subscribe({
          next: (response) => {
            if (response.Status === '0000') { // 假設 '0000' 為成功狀態碼
              this.messageService.successBubble('刪除成功');
              this.selectedRows = []; // 清空選取狀態
              this.onSubmit(this.queryForm);
            } else {
              console.error('刪除失敗響應:', response);
            }
          }
        });
      }
    });
  }

  isRowSelectable(row: ISysbc00Data): boolean {
    return row.CanDel;
  }
}
