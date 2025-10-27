import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Shared
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '@shared/componentkit/table/table.model';

//主檔
export interface APS1002 {
  id: number;                              // 主鍵
  mid: number;                             // ((0))

  BNK_No: string;                          // 全省銀行代碼 (讀取APS1004銀行分行代碼檔，下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME，不可重覆)
  BNK_AccNo: string;                       // 帳號
  BNK_BranchNo: string;                    // 銀行分行代號
  BNK_AccType: string;                     // 存款代號 (SYS1000.BNK_ACCTYPE)
  BNK_AccName: string;                     // 帳戶名稱
  BNK_AccStatus: string;                   // 帳戶狀態 (0=正常)
  BNK_DepositAccNo?: string | null;        // 公司銀行科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)
  BNK_CheckInAccNo?: string | null;        // 應付票據科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)
  BNK_CheckOutAccNo?: string | null;       // 應收票據科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)

  CRT_Date?: string | null;                // 建立日期 (datetime)
  CRT_USR_No?: string | null;              // 建立人員
  CRT_USR_Name?: string | null;            // 建立人員姓名
  UPD_Date?: string | null;                // 變更日期 (datetime)
  UPD_USR_No?: string | null;              // 變更人員
  UPD_USR_Name?: string | null;            // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)     // 看SA有沒有要卡控
}

export interface APS1004 {
  id: number;                              // 主鍵
  BNK_No: string;                          // 全省銀行代碼
  BNK_BranchNo: string;                    // 銀行分行代號
  BNK_BranchName: string;                  // 銀行分行名稱
  ACC_LEN?: number | null;                 // 該行帳號最小長度 (沒有使用)
  ACC_LEN_MAX?: number | null;             // 該行帳號最大長度 (沒有使用)
  CRT_Date?: string | null;                // 建立日期
  CRT_USR_No?: string | null;              // 建立人員
  CRT_USR_Name?: string | null;            // 建立人員姓名
  UPD_Date?: string | null;                // 變更日期
  UPD_USR_No?: string | null;              // 變更人員
  UPD_USR_Name?: string | null;            // 變更人員姓名
}

export interface GLS1005{
  ACCNO: string;           //會計科目代號
  ACCCNAME: string;        //會計科目名稱
}

//1.2.1.1 公司銀行資料維護
@Component({
    selector: 'app-fin21010',
    templateUrl: './fin21010.component.html',
    styleUrl: './fin21010.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, InputTextComponent, InputNumberComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class FIN21010Component extends BasicQueryPageComponent<APS1002> implements OnInit {
  // 查詢
    queryForm = this.formBuilder.group({
      // Potential_Customer 潛在客戶主檔
      BNK_No: [null],           // 全省銀行代碼 // "讀取APS1004銀行分行代碼檔
                                                                      // 下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME
                                                                      // 不可重覆"
      BNK_AccNo: [null],        // 帳號
      BNK_BranchNo: [null],     // 銀行分行代號
      BNK_AccType: [null],      // 存款代號 (SYS1000.BNK_ACCTYPE)
      BNK_AccName: [null],      // 帳戶名稱
      BNK_AccStatus: ['0'],     // 帳戶狀態 (0=正常)
      BNK_DepositAccNo: [null],                       // 公司銀行科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME"
      BNK_CheckInAccNo: [null],                       // 應付票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME"
      BNK_CheckOutAccNo: [null],                      // 應收票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME"
      //分頁查詢
      ...createPaginationConfig([{ field: 'contact_USR_No', order: 1 }]), // 分頁和排序參數
    });
    // 表格
    // ----------------------------------------------------------------
    totalRecords = 0;// 分頁和排序參數 // 排序需要

    APS1004_Option: APS1004[] = [{id: 114514, BNK_No: '114514', BNK_BranchNo: '123456', BNK_BranchName: '王道分行'}]; // APS1004銀行分行代碼檔 -- 下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME， 不可重覆
    GLS1005_Option: GLS1005[] = [{ACCNO: '114514', ACCCNAME: '王道銀行'}]; // GLS1005會計科目檔 -- 下拉GLS1005.ACCNO，讀取 ACCNO, ACCCNAME (先大概放一下)
  
    data: APS1002[] = [];
    columns: Column[] = [
      { field: 'BNK_No', header: '銀行代碼', visible: true },
      {
        field: 'BNK_BranchNo',
        header: '銀行分行代號',
        visible: true,
        format: (value: string) =>
          this.APS1004_Option?.find((opt) => opt.BNK_BranchNo === value)?.BNK_BranchName || value //看這裡之後要帶不帶名稱
      },
      { field: 'BNK_AccNo', header: '帳號', visible: true },
      { field: 'BNK_AccType', header: '存款代號', visible: true },
      { field: 'BNK_AccName', header: '帳戶名稱', visible: true },
      {
        field: 'BNK_AccStatus',
        header: '帳戶狀態',
        visible: true,
        format: (value: string) => (value === '0' ? '正常' : value)
      },
      {
        field: 'BNK_DepositAccNo',
        header: '公司銀行科目',
        visible: false,
      },
      {
        field: 'BNK_CheckInAccNo',
        header: '應付票據科目',
        visible: false,
      },
      {
        field: 'BNK_CheckOutAccNo',
        header: '應收票據科目',
        visible: false,
      },
      { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate},
      { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
      { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
      { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate},
      { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
      { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
    ];

  
    selectedItems: APS1002[] = [];// 多選項目
  
    // ----------------------------------------------------------------
    constructor(private tls12010Service: Tls12010Service) {
      super();
    }
  
    ngOnInit(): void {
      this.initializePage('FIN21010', 'FIN/FIN21010cru', this.queryForm, (form) => this.onSubmit(form));
      this.loadOptions();
    }
  
    onSubmit(frm: FormGroup) {
      console.log('查詢條件', frm.value);
      this.handleSubmit(frm, () => {
        // this.tls12010Service.queryTLS12010(frm.value).subscribe({
        //   next: (response) => {
        //     if (response.Status === '0000') {
        //       this.data = response.Data || [];
        //       console.log('Result', this.data);
        //       this.totalRecords = response.TotalCount || response.Data.length;
        //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
        //     } else {
        //       console.error('API error:', response.Status, response.Message);
        //     }
        //     this.loading = false;
        //     this.messageService.unblockUi();
        //   },
        //   error: (err: string) => {
        //     console.error('API error:', err);
        //     this.loading = false;
        //     this.messageService.unblockUi();
        //   },
        // });

        console.log('查詢API待提供');
        this.loading = false;
      });
    }
  
    // 刪除項目
    onDelete(data: APS1002 | APS1002[]): void {
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
  
      console.log('deleteBody', deleteBody);
  
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
      
      console.log('刪除API待提供', deleteBody);
  
      this.selectedItems = [];
    }

    isRowSelectable(rowData: APS1002): boolean {
      return rowData.CanDel ?? false;
    }
  
    loadOptions() {
      // 查 大分類(專櫃)
      // this.tls12010Service.queryTLTBUSTYPE_DropDownList({}).subscribe((response) => {
      //   this.bus_type_Option = response.Data.map((item: any) => ({
      //     No: item.No, // 大分類(專櫃) 號
      //     Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      //   }));
      //   console.log('大分類代號:', this.bus_type_Option);
      // });
    }
}
