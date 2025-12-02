import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { AccordionModule } from 'primeng/accordion';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';

export interface fin32010request {
  "ARS_No": string,
  "ORG_ID": string,
  "sam_yyymm": string,
  "sam_termno": number,
  "ARS_Amt_From": number,
  "ARS_Amt_To": number,
  "PTA_Amt_From": number,
  "PTA_Amt_To": number,
  "BalAmt_From": number,
  "BalAmt_To": number,
  "PTA_Date_From": Date,
  "PTA_Date_To": Date,
  "ARS_Date_From": Date,
  "ARS_Date_To": Date,
  "CustNo": string,
  "Uniform_No": string,
  "AccNo": string,
  "ARS_SourceNo": string,
  "VouNo": string,
  "PostFlag": string,
  "ARS_Status": string,
  "SubDetailNo": string,
  "NoteDesc": string
}

export interface fin32010response {
  "ARS_No": string,
  "ORG_ID": string,
  "sam_yyymm": string,
  "sam_termno": number,
  "ARS_Amt_From": number,
  "ARS_Amt_To": number,
  "PTA_Amt_From": number,
  "PTA_Amt_To": number,
  "BalAmt_From": number,
  "BalAmt_To": number,
  "PTA_Date_From": Date,
  "PTA_Date_To": Date,
  "ARS_Date_From": Date,
  "ARS_Date_To": Date,
  "CustNo": string,
  "Uniform_No": string,
  "AccNo": string,
  "ARS_SourceNo": string,
  "VouNo": string,
  "PostFlag": string,
  "ARS_Status": string,
  "SubDetailNo": string,
  "NoteDesc": string
}


//1.3.2.1 應收帳款維護
@Component({
  selector: 'app-fin32010',
  templateUrl: './fin32010.component.html',
  styleUrl: './fin32010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class FIN32010Component extends BasicQueryPageComponent<fin32010response> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    ARS_No: [''], // 應收ID
    ORG_ID: [''], // 組織代號
    sam_yyymm: [''], // 帳款年月 (format: "yyyyMM")
    sam_termno: [''], // 帳款帳次
    ARS_Amt_From: [null], // 應收金額起
    ARS_Amt_To: [null], //  應收金額迄
    PTA_Amt_From: [null], // 沖帳金額起
    PTA_Amt_To: [null], // 沖帳金額迄
    BalAmt_From: [null], // 應收帳款餘額起
    BalAmt_To: [null], // 應收帳款餘額迄
    PTA_Date_From: [null], // 預計收款日起
    PTA_Date_To: [null], // 預計收款日迄
    ARS_Date_From: [null], // 立帳日期起
    ARS_Date_To: [null], // 立帳日期迄
    CustNo: [''], // 顧客代號 (VEN_No)
    Uniform_No: [''], // 統一編號 (VEN_Uniform)
    AccNo: [''], // 會計科目代號
    ARS_SourceNo: [''], // 帳款來源單號
    VouNo: [''], // 傳票號碼
    PostFlag: [''], // 傳票狀態 (1=未過帳 3=過帳) GLS3001.POSTFLAG
    ARS_Status: [''], // 應收狀態 (0=作廢 2=建立)
    SubDetailNo: [''], // 對象別編號
    NoteDesc: [''], // 摘要(模糊)

    //分頁查詢
    ...createPaginationConfig([{ field: 'ARS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: fin32010response[] = [];
  columns: Column[] = [
    { field: 'STO_No', header: '公司編號/店號', visible: false },
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    {
      field: 'org_id', header: '部門編號', visible: true
      , format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.No ||
        value,
    },
    {
      field: 'org_name', header: '部門名稱', visible: true
      , format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Name ||
        value,
    },
    {
      field: 'building_no', header: '館別', visible: true, format: (value: string) => // 館別只顯示名稱(不用編碼)
        this.building_noOptions.find((option) => option.No === value)?.Name ||
        value,
    },
    { field: 'HOS_Remark', header: '備註說明', visible: true },

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: fin32010response[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32010', 'FIN/FIN32010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('應收帳款request:', JSON.stringify(frm.value, null, 2));
      this.tls51080Service.queryTLS51080(frm.value).subscribe({
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

  //---刪除檢查---
  // 到處都有倉別的資料，先不允許刪除
  //-------------
  onDelete(data: fin32010response | fin32010response[]): void {
    // console.log('Delete data:', JSON.stringify(data, null, 2));

    // const items = Array.isArray(data) ? data : [data];
    // if (items.length === 0) {
    //   console.error('No items to delete');
    //   this.messageService.errorBubble('無法刪除：沒有選中的項目');
    //   return;
    // }

    // // 收集所有有效的 ID
    // const idList = items
    //   .filter((item) => item && item.id != null && item.id !== undefined)
    //   .map((item) => item.id);

    // if (idList.length === 0) {
    //   console.error('No valid IDs to delete');
    //   this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
    //   return;
    // }

    // //確認是否全部都可以刪除
    // const canDelete = items.every((item) => item.CanDel);

    // if (!canDelete) {
    //   console.error('Some items cannot be deleted');
    //   this.messageService.errorBubble('無法刪除：組織階層互相關連');
    //   return;
    // }

    // const deleteBody = {
    //   idList: idList, // 符合 API 的 idList 格式
    // };
    // this.tls51080Service.deleteTLS51080(deleteBody).subscribe({
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

    // this.selectedItems = [];
  }

  loadOptions() {
    {
      // 組織代碼 下拉
      this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.SYS3100_Options = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('組織', this.SYS3100_Options);
      })
      // 館別 下拉
      this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
        this.building_noOptions = res.Data.map(item => ({ ...item, Label: `${item.No} - ${item.Name}`, }));
        console.log('館別', this.building_noOptions);
      })
    }
  }

  isRowSelectable(rowData: fin32010response): boolean {
    // return rowData.CanDel
    return true;
  }
}
