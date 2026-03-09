import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';

export interface sample72010 {
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
@Component({
  selector: 'app-fin72010',
  templateUrl: './fin72010.component.html',
  styleUrl: './fin72010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class FIN72010Component extends BasicQueryPageComponent<sample72010> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    //  POS2064M 收支主檔(I/O)
    //  POS2064 收支明細檔(I/O) 
    //  tblUser 使用者資料檔(O)

    KeepQuota_No: ['', [Validators.maxLength(20)]], // 零用金單號
    applyDateFrom: [null], // 申請日期起
    applyDateTo: [null], // 申請日期迄
    startKeepQuota: [null, Validators.max(9999999999)], // 起始零用金金額
    endKeepQuota: [null, Validators.max(9999999999)], // 結束零用金金額
    Pettycashapplicant: [''], // 申請人
    Pettycashcustodian: [''], // 保管人
    status: [''], // 狀態
    keepingUnit: [''], // 保管單位

    //分頁查詢
    ...createPaginationConfig([{ field: 'HOS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  KeepQuota_Options: apiOption[] = [
    { No: 'KQ001', Name: '零用金單1', Label: 'KQ001 - 零用金單1' },
    { No: 'KQ002', Name: '零用金單2', Label: 'KQ002 - 零用金單2' },
    { No: 'KQ003', Name: '零用金單3', Label: 'KQ003 - 零用金單3' },
  ];
  Pettycashapplicant_Options: apiOption[] = [
    { No: 'PA001', Name: '申請人1', Label: 'PA001 - 申請人1' },
    { No: 'PA002', Name: '申請人2', Label: 'PA002 - 申請人2' },
    { No: 'PA003', Name: '申請人3', Label: 'PA003 - 申請人3' },
  ];
  Pettycashcustodian_Options: apiOption[] = [
    { No: 'PC001', Name: '保管人1', Label: 'PC001 - 保管人1' },
    { No: 'PC002', Name: '保管人2', Label: 'PC002 - 保管人2' },
    { No: 'PC003', Name: '保管人3', Label: 'PC003 - 保管人3' },
  ];
  status_Options: apiOption[] = [
    { No: 'S001', Name: '狀態1', Label: 'S001 - 狀態1' },
    { No: 'S002', Name: '狀態2', Label: 'S002 - 狀態2' },
    { No: 'S003', Name: '狀態3', Label: 'S003 - 狀態3' },
  ];
  keepingUnit_Options: apiOption[] = [
    { No: 'KU001', Name: '保管單位1', Label: 'KU001 - 保管單位1' },
    { No: 'KU002', Name: '保管單位2', Label: 'KU002 - 保管單位2' },
    { No: 'KU003', Name: '保管單位3', Label: 'KU003 - 保管單位3' },
  ];

  data: sample72010[] = [];
  columns: Column[] = [
    { field: 'STO_No', header: '零用金單號', visible: false },
    { field: 'HOS_No', header: '申請日期', visible: true },
    { field: 'HOS_NAME', header: '零用金申請人', visible: true },
    // {
    //   field: 'org_id', header: '部門編號', visible: true
    //   , format: (value: string) =>
    //     this.SYS3100_Options.find((option) => option.No === value)?.No ||
    //     value,
    // },
    // {
    //   field: 'org_name', header: '部門名稱', visible: true
    //   , format: (value: string) =>
    //     this.SYS3100_Options.find((option) => option.No === value)?.Name ||
    //     value,
    // },
    // {
    //   field: 'building_no', header: '館別', visible: true, format: (value: string) => // 館別只顯示名稱(不用編碼)
    //     this.building_noOptions.find((option) => option.No === value)?.Name ||
    //     value,
    // },

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];

  selectedItems: sample72010[] = [];// 多選項目

  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', 'FIN/FIN72010', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('零用金維護request:', JSON.stringify(frm.value, null, 2));
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
  // 到處都有倉別的資料，先不允許刪除
  //-------------
  // 刪除項目(到處都有倉別的資料，先不允許刪除)
  onDelete(data: sample72010 | sample72010[]): void {
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

  isRowSelectable(rowData: sample72010): boolean {
    return rowData.CanDel
  }
}
