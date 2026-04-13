import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';

//ass14010sample
export interface ass14010sample {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/組織名稱
  'org_name': string; // 部門名稱
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}

//3.1.4.1  進貨發票建檔作業
@Component({
  selector: 'app-ass14010',
  templateUrl: './ass14010.component.html',
  styleUrl: './ass14010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonComponent,
    CalendarRangeQuickComponent,
    DropdownComponent,
    FormsModule,
    InputTextComponent,
    MenubarComponent,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule
  ]
})
export class ASS14010Component extends BasicQueryPageComponent<ass14010sample> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // ass14010sample
    INV_GUINo: ['', [Validators.maxLength(10)]], // 發票/收據號碼
    supplierId: ['', [Validators.maxLength(50)]], // 供應商編號
    invoice_type: ['', [Validators.maxLength(100)]], // 請款單據種類
    ODM_No: ['', [Validators.maxLength(20)]], // 驗收單號
    maintenanceID: ['', [Validators.maxLength(20)]], // 發票維護單號
    INV_GUIType: ['', [Validators.maxLength(20)]], // 發票格式

    PUR_TaxType: ['', [Validators.maxLength(20)]], // 課稅別
    PUR_DedType: ['', [Validators.maxLength(20)]], // 扣抵別
    PUR_GUIDate_From: [null], // 發票/收據日期(起)
    PUR_GUIDate_To: [null], // 發票/收據日期(迄)

    //分頁查詢
    ...createPaginationConfig([{ field: 'INV_GUINo', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  supplierId_Options: apiOption[] = [ // 供應商編號 下拉選項
    { No: 'SUP001', Name: '供應商A', Label: 'SUP001 - 供應商A' },
    { No: 'SUP002', Name: '供應商B', Label: 'SUP002 - 供應商B' },
    { No: 'SUP003', Name: '供應商C', Label: 'SUP003 - 供應商C' }
  ];
  invoice_type_Options: apiOption[] = [ // 請款單據種類 下拉選項
    { No: 'IT001', Name: '請款單據種類A', Label: 'IT001 - 請款單據種類A' },
    { No: 'IT002', Name: '請款單據種類B', Label: 'IT002 - 請款單據種類B' },
    { No: 'IT003', Name: '請款單據種類C', Label: 'IT003 - 請款單據種類C' }
  ];
  ODM_No_Options: apiOption[] = [ // 驗收單號 下拉選項
    { No: 'ODM001', Name: '驗收單號A', Label: 'ODM001 - 驗收單號A' },
    { No: 'ODM002', Name: '驗收單號B', Label: 'ODM002 - 驗收單號B' },
    { No: 'ODM003', Name: '驗收單號C', Label: 'ODM003 - 驗收單號C' }
  ];
  INV_GUIType_Options: apiOption[] = [ // 發票格式 下拉選項
    { No: 'GUI001', Name: '發票格式A', Label: 'GUI001 - 發票格式A' },
    { No: 'GUI002', Name: '發票格式B', Label: 'GUI002 - 發票格式B' },
    { No: 'GUI003', Name: '發票格式C', Label: 'GUI003 - 發票格式C' }
  ];
  PUR_TaxType_Options: apiOption[] = [ // 課稅別 下拉選項
    { No: 'TAX001', Name: '課稅別A', Label: 'TAX001 - 課稅別A' },
    { No: 'TAX002', Name: '課稅別B', Label: 'TAX002 - 課稅別B' },
    { No: 'TAX003', Name: '課稅別C', Label: 'TAX003 - 課稅別C' }
  ];
  PUR_DedType_Options: apiOption[] = [ // 扣抵別 下拉選項
    { No: 'DED001', Name: '扣抵別A', Label: 'DED001 - 扣抵別A' },
    { No: 'DED002', Name: '扣抵別B', Label: 'DED002 - 扣抵別B' },
    { No: 'DED003', Name: '扣抵別C', Label: 'DED003 - 扣抵別C' }
  ];

  data: ass14010sample[] = [];
  columns: Column[] = [
    { field: 'INV_GUINo', header: '發票/收據號碼', visible: false },
    { field: 'ODM_No', header: '驗收單號', visible: false },
    { field: 'maintenanceID', header: '發票維護單號', visible: false },
    { field: 'supplierId', header: '供應商編號', visible: false },
    { field: 'invoice_type', header: '請款單據種類', visible: false },
    { field: 'INV_GUIType', header: '發票格式', visible: false },
    { field: 'PUR_TaxType', header: '課稅別', visible: false },
    { field: 'NTAX_AMT', header: '未稅金額', visible: true, format: formatAmount },
    { field: 'TAX_AMT', header: '金額', visible: true, format: formatAmount },
    { field: 'PUR_DedType', header: '扣抵別', visible: false },

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: ass14010sample[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private tls51080Service: Tls51080Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS14010', 'ASS/ASS14010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log(' 進貨發票request:', JSON.stringify(frm.value, null, 2));
      // this.tls51080Service.queryTLS51080(frm.value).subscribe({
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
    });
  }

  //---刪除檢查---
  onDelete(data: ass14010sample | ass14010sample[]): void {
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

    //確認是否全部都可以刪除
    const canDelete = items.every((item) => item.CanDel);

    if (!canDelete) {
      console.error('Some items cannot be deleted');
      this.messageService.errorBubble('無法刪除：組織階層互相關連');
      return;
    }

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

    this.selectedItems = [];
  }

  isRowSelectable(rowData: ass14010sample): boolean {
    return rowData.CanDel
  }
}
