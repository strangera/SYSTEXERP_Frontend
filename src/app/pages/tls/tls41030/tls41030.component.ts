import { Tls41030Service } from './../../../service/API/tls/tls41030.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { option } from '../../../shared/models/sys/sysb000.module';


interface POS2001 {
  id: number;
  USR_No: string; // 收銀員編號
  USR_Name: string; //收銀員姓名
  USR_Passwd: string; // 密碼
  USR_Level: string; // 收銀鍵盤等級(編號)
  USR_Auth: string; // 收銀員授權等級，預設值為0
  USR_JobStatus: string; // 收銀員(在職)狀態，J=在職(預設值)、Q=離職
  USR_Class: string; // 收銀員等級，R=一般(預設值)、M=店長、S=系統管理者
  USR_RegType: string; // 收銀員區分，2=獨立收銀(預設值)、1=集中收銀
  USR_TLT_No: string; // 收銀員所屬櫃編
  USR_TLT_Name: string; // 收銀員所屬專櫃名稱
  USR_OnJobDate: Date; // 啟用(到職)日期
  USR_QuitDate: Date; // 停用(離職)日期
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: Date; // 變更日期
  UPD_USR_No: string; // 變更人員
  UPD_USR_Name: string; // 變更人員姓名

  CanDel: boolean; //能否刪除 僅顯示
}

// 2.4.1.3 收銀專櫃人員資料維護作業
@Component({
  selector: 'app-tls41030',
  templateUrl: './tls41030.component.html',
  styleUrl: './tls41030.component.scss'
})
export class TLS41030Component extends BasicQueryPageComponent<POS2001> implements OnInit{
    bigCategoryOptions: { value: string, label: string }[] = []; // 用於下拉選單
    queryForm = this.formBuilder.nonNullable.group({
      // id: [null, [Validators.required]], // decimal(19, 0)
      USR_No: ['', [Validators.maxLength(8)]], // 收銀員編號
      USR_Name: ['', [ Validators.maxLength(20)]], // 收銀員姓名
      USR_Passwd: ['', [ Validators.maxLength(20)]], // 密碼
      USR_Level: ['', [Validators.maxLength(6)]], // 收銀鍵盤等級(編號)
      USR_Auth: [''], // 收銀員授權等級，預設值為0

      // USR_JobStatus: ['J', [Validators.required, Validators.maxLength(2)]], // 在職狀態
      // USR_Class: ['R', [Validators.required, Validators.maxLength(2)]], // 收銀員等級
      // USR_RegType: ['2', [Validators.required, Validators.maxLength(2)]], // 區分
      // USR_TLT_No: ['', [Validators.maxLength(20)]], // 所屬櫃編（可選）
      // USR_TLT_Name: ['', [Validators.maxLength(60)]], // 所屬專櫃名稱（可選）
      // USR_OnJobDate: [''], // 到職日（可選）
      // USR_QuitDate: [''], // 離職日（可選

      ...createPaginationConfig([{ field: 'USR_No', order: 1 }]), // 分頁和排序參數
    });
    // 表格
    // ----------------------------------------------------------------
    data: POS2001[] = [];
    filteredData: POS2001[] = [...this.data];
    //篩選表格的欄位
    columns: Column[] = [
      { field: 'USR_No', header: '收銀員編號', visible: true },
      { field: 'USR_Name', header: '收銀員姓名', visible: true },
      { field: 'USR_Passwd', header: '密碼', visible: true },
      { field: 'USR_Level', header: '收銀鍵盤等級', visible: true },
      { field: 'USR_Auth', header: '收銀員授權等級', visible: true },
      { field: 'USR_JobStatus', header: '收銀員(在職)狀態', visible: true,
        format: (value: string) => this.jobStatusOption.find((option) => option.value === value)?.label ||value
      },
      { field: 'USR_Class', header: '收銀員等級', visible: true ,
        format: (value: string) => this.classOption.find((option) => option.value === value)?.label ||value
      },
      { field: 'USR_RegType', header: '收銀員區分', visible: true,
        format: (value: string) => this.regTypeOption.find((option) => option.value === value)?.label ||value
      },
      { field: 'USR_TLT_No', header: '收銀員所屬櫃編', visible: true },
      { field: 'USR_TLT_Name', header: '收銀員所屬專櫃名稱', visible: true },
      { field: 'USR_OnJobDate', header: '啟用(到職)日期', visible: true, format: formatDate},
      { field: 'USR_QuitDate', header: '停用(離職)日期', visible: true, format: formatDate},
    ];
  
    totalRecords = 0;
  
    // 多選項目
    selectedItems: POS2001[] = [];

    jobStatusOption: option[] = [ // 收銀員(在職)狀態 選單
      {value: 'J', label: '在職'}, // 預設值
      {value: 'Q', label: '離職'},
    ];

    classOption: option[] = [ // 收銀員等級 選單
      {value: 'R', label: '一般'}, // 預設值
      {value: 'M', label: '店長'},
      {value: 'S', label: '系統管理者'}
    ];

    regTypeOption: option[] = [ // 收銀員區分 選單
      {value: '2', label: '獨立收銀'}, // 預設值
      {value: '1', label: '集中收銀'},
    ];
  
    constructor(
      private tls41030Service: Tls41030Service,
    ) {
      super();
    }
  
    ngOnInit(): void {
      this.initializePage('TLS41030', '/TLS/TLS41030cru', this.queryForm, (form) => this.onSubmit(form));
    }
    onSubmit(frm: FormGroup): void {
      this.handleSubmit(frm, () => {
        console.log('查詢參數:', frm.value); // 除錯用，上線時可移除
  
        this.tls41030Service.queryTLS41030(frm.value).subscribe({
        next: (response) => {
          // console.log('回傳階層:', response.Data);
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
  
  
    onDelete(data: POS2001 | POS2001[]): void {
      const items = Array.isArray(data) ? data : [data];
      if (items.length === 0) return;
  
      const idList = items
        .filter(item => item && item.id != null)
        .map(item => item.id);
  
      if (idList.length === 0) {
        this.messageService.warnBubble('未找到有效的刪除項目');
        return;
      }
  
      // this.tls41030Service.deleteTLS41030({ idList }).subscribe({
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
      //     this.onSubmit(this.queryForm); // 刷新資料
      //   },
      // });
  
      this.selectedItems = [];
    }
  
    isRowSelectable(rowData: POS2001): boolean {
      return rowData.CanDel
    }
}
