import { Tls46010Service } from './../../../service/API/TLS0000/tls46000/tls46010.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Permissions
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls46010m } from '../module/tls000/tls000.module';
import { SortMeta } from 'primeng/api';
import { option } from '../../sys/module/sysb000.module';
import { TableLazyLoadEvent } from 'primeng/table';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS46010';

@Component({
  selector: 'app-tls46010',
  templateUrl: './tls46010.component.html',
  styleUrl: './tls46010.component.scss',
})

// 2.4.6.1 網路位置設定
export class TLS46010Component
  extends BasicQueryPageComponent<Tls46010m>
  implements OnInit {
  queryForm = this.formBuilder.group({
    // POS10015 門市系統主機設定檔

    // ID                  NUMERIC(19,0) IDENTITY(1,1) NOT NULL
    SYS_StoreNo: ['', [Validators.maxLength(10)]], // 門市店號
    SYS_SrvNo: ['', [Validators.maxLength(8)]], // 主機編號
    SYS_SrvIP: ['', [Validators.maxLength(40)]], // 主機IP
    SYS_SrvPort: [, [Validators.maxLength(6)]], // 主機連接埠 預設值為20
    SYS_SrvStatus: ['', [Validators.maxLength(2)]], // 主機狀態 A=啟用 C=停用 預設值為A
    SYS_SrvName: ['', [Validators.maxLength(40)]], // 主機名稱
    SYS_SrvUsrID: ['', [Validators.maxLength(20)]], // 主機登入帳號
    SYS_SrvUsrPwd: ['', [Validators.maxLength(20)]], // 主機登入密碼

    //
    SYS_SRVDDir: ['', [Validators.maxLength(60)]], // 後台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDir: ['', [Validators.maxLength(60)]], // 後台系統上傳目錄 預設值為/MyPOSData/PosUp
    SYS_MyPOSDDir: ['', [Validators.maxLength(60)]], // 傳輸程式下載目錄 預設值為/MyPOSData/MyPOSDown
    SYS_MyPOSUDir: ['', [Validators.maxLength(60)]], // 傳輸程式上傳目錄 預設值為/MyPOSData/MyPOSUp
    SYS_SRVDDirClt: ['', [Validators.maxLength(60)]], // 前台系統下載目錄 預設值為/MyPOSData/PosDown
    SYS_SRVUDirClt: ['', [Validators.maxLength(60)]], // 前台系統上傳目錄 預設值為/MyPOSData/PosUp

  });
  // 表格
  // ----------------------------------------------------------------
  data: Tls46010m[] = [];
  filteredData: Tls46010m[] = [...this.data];
  columns: any[] = [
    { field: 'SYS_StoreNo', header: '門市店號', visible: true },
    { field: 'SYS_SrvNo', header: '主機編號', visible: true },
    { field: 'SYS_SrvIP', header: '主機IP', visible: true },
    { field: 'SYS_SrvPort', header: '主機連接埠', visible: true },
    { field: 'SYS_SrvStatus', header: '主機狀態', visible: true },
    { field: 'SYS_SrvName', header: '主機名稱', visible: true },
    { field: 'SYS_SrvUsrID', header: '主機登入帳號', visible: true },

    { field: 'SYS_SRVDDir', header: '主機端下載目錄', visible: true },
    { field: 'SYS_SRVUDir', header: '主機端上傳目錄', visible: true },

    { field: 'SYS_MyPOSDDir', header: 'KGDPS下載目錄', visible: true },
    { field: 'SYS_MyPOSUDir', header: 'KGDPS上傳目錄', visible: true },

    { field: 'SYS_SRVDDirClt', header: '客戶端下載目錄', visible: true },
    { field: 'SYS_SRVUDirClt', header: '客戶端上傳目錄', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

  // // 分頁和排序參數
  // pageSize: number = 10;
  // pageIndex: number = 0;
  totalRecords = 0;
  // lastQueryParams: any = null;
  // sortField: string = 'CAT_LNo';
  // sortOrder: number = 1;

  // 多選項目
  selectedItems: Tls46010m[] = [];

  //-dropDown-
  SYS_SrvStatus_Option: option[] = [];

  constructor(private tls46010Service: Tls46010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46010', 'TLS/TLS46010CRU');
    this.loadOptions();

    // 恢復查詢狀態並自動查詢
    this.handleQueryRestore(this.queryForm, storageKey, (form) =>
      this.onSubmit(form),
    );
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls46010Service.queryTLS46010(frm.value).subscribe({
        next: (response: any) => {
          console.log('API response:', response);
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.filteredData = [...this.data];
            this.totalRecords = response.TotalCount || response.Data.length;
            this.queryStateService.setQueryState(storageKey, frm.value);
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

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();
    this.data = [];
    this.filteredData = [];
    this.totalRecords = 0;
    this.queryStateService.clearQueryState(storageKey);
  }

  // 刪除項目
  onDelete(data: Tls46010m | Tls46010m[]): void {
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

    const deleteBody = {
      idList: idList, // 符合 API 的 idList 格式
    };
    this.tls46010Service.deleteTLS46010(deleteBody).subscribe({
      next: (response: any) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗');
      },
      complete: () => {
        this.onSubmit(this.queryForm);
      },
    });

    this.selectedItems = [];
  }

  loadOptions() {
    this.SYS_SrvStatus_Option = [
      { value: 'A', label: '啟用' },
      { value: 'C', label: '停用' },
    ];
  }
}
