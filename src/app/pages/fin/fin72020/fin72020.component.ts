import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';

export interface sample72020 {
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
  selector: 'app-fin72020',
  templateUrl: './fin72020.component.html',
  styleUrl: './fin72020.component.scss',
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
    TranslateModule,
    CalendarComponent,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ConfirmPopupModule,
    DialogModule,
    TableModule,
    TableReportComponent
  ]
})
export class FIN72020Component extends BasicQueryPageComponent<sample72020> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    // POS2064M 收支主檔(I/O)
    // 收支請款檔(I/O) 

    KeepQuota_No: [null, [Validators.maxLength(20)]], // 支出請款單號
    applyDate: [null], // 產生日期
    Pettycashapplicant: [null], // 申請人
    PettycashapplicantName: [''], // 申請人名稱
    Pettycashcustodian: [null], // 保管人
    PettycashcustodianName: [''], // 保管人名稱
    status: [null], // 狀態
    keepingUnit: [null], // 保管單位
    keepingUnitName: [''], // 保管單位名稱

    //分頁查詢
    ...createPaginationConfig([{ field: 'KeepQuota_No', order: 1 }]), // 分頁和排序參數
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

  data: any[] = [];
  columns: Column[] = [
    { field: 'type01', header: '支出請款單號', visible: true },
    { field: 'type02', header: '零用金申請人', visible: true },
    { field: 'type03', header: '申請人組織', visible: true },
    { field: 'type04', header: '零用金保管人', visible: true },
    { field: 'type05', header: '保管人組織', visible: true },
    { field: 'type06', header: '保管單位', visible: true },
    { field: 'type07', header: '零用金單號', visible: true },
    { field: 'type08', header: '狀態', visible: true },
  ];

  selectedItems: sample72020[] = [];// 多選項目


  // 「零用金申請人」與「零用金保管人」使用者對話框的變數
  userDialogVisible = false;
  userQueryForm!: FormGroup;

  userResultData: any[] = [];
  selectedUser: any = null;
  selectedUserName = '';
  // 目前選擇的使用者類別
  currentUserTarget: 'Pettycashapplicant' | 'Pettycashcustodian' | null = null;

  //「保管單位」對話框的變數
  keepDeptDialogVisible = false;
  keepDeptQueryForm!: FormGroup;

  keepDeptResultData: any[] = [];
  selectedKeepDept: any = null;


  // ----------------------------------------------------------------
  constructor(
    private readonly dropDownListService: DropDownListService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72020', 'FIN/FIN72020cru', this.queryForm, (form) => this.onSubmit(form));

    // 零用金申請人與零用金保管人
    this.userQueryForm = this.fb.group({
      user_No: [''],
      user_Name: [''],
      Org_ID: [''],
      Org_Name: ['']
    });

    // 保管單位
    this.keepDeptQueryForm = this.formBuilder.group({
      Org_ID: [''],
      Org_Name: ['']
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('零用金維護request:', JSON.stringify(frm.value, null, 2));
      this.loading = false;
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

    this.data = [
      { id: 1, type01: 'A', type02: 'B', type03: 'C', type04: 'D', type05: 'E', type06: 'F', type07: 'G', type08: 'H' },
    ];
  }

  //---刪除檢查---
  onDelete(data: sample72020 | sample72020[]): void {
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

  isRowSelectable(rowData: sample72020): boolean {
    return rowData.CanDel
  }


  openUserDialog(target: 'Pettycashapplicant' | 'Pettycashcustodian'): void {
    this.currentUserTarget = target;

    this.userDialogVisible = true;
    this.userResultData = [];
    this.selectedUser = null;
  }

  queryUsers(): void {
    const request = this.userQueryForm.getRawValue();

    console.log('查詢條件', request);

    // 模擬 API 回應資料
    this.userResultData = [
      { user_No: 'U001', user_Name: '使用者1', Org_ID: 'D001', Org_Name: '部門1' },
      { user_No: 'U002', user_Name: '使用者2', Org_ID: 'D002', Org_Name: '部門2' },
      { user_No: 'U003', user_Name: '使用者3', Org_ID: 'D003', Org_Name: '部門3' },
    ];
  }

  clearUserQuery(): void {
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });
    this.userResultData = [];
    this.selectedUser = null;
  }

  onSelectUser(row: any): void {
    console.log('選到的使用者', row);

    //this.selectedUserName = `${row.user_No} - ${row.user_Name}`;
    if (!this.currentUserTarget) return;

    this.queryForm.patchValue({
      [this.currentUserTarget]: row.user_No,
      [`${this.currentUserTarget}Name`]: `${row.user_No} - ${row.user_Name}`
    });

    this.userDialogVisible = false;
    this.currentUserTarget = null;
  }

  openKeepDeptDialog(): void {
    this.keepDeptDialogVisible = true;
    this.keepDeptResultData = [];
    this.selectedKeepDept = null;

    this.keepDeptQueryForm.reset({
      Org_ID: '',
      Org_Name: ''
    });
  }

  queryKeepDept(): void {
    const request = this.keepDeptQueryForm.getRawValue();

    console.log('查詢條件', request);

    // 模擬 API 回應資料
    this.keepDeptResultData = [
      { No: 'D001', Name: '部門1' },
      { No: 'D002', Name: '部門2' },
      { No: 'D003', Name: '部門3' },
    ];


  }

  clearKeepDeptQuery(): void {
    this.keepDeptQueryForm.reset({
      Org_ID: '',
      Org_Name: ''
    });

    this.keepDeptResultData = [];
    this.selectedKeepDept = null;
  }

  onSelectKeepDept(row: any): void {
    this.queryForm.patchValue({
      keepingUnit: row.No,
      keepingUnitName: `${row.No} - ${row.Name}`,
    });

    this.keepDeptDialogVisible = false;
  }

}
