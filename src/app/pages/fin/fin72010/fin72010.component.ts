import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72010Data, FIN72010Service, QueryFIN72010Request, voidFIN72010Request } from '@service/api/fin/fin72010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
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
import { finalize } from 'rxjs';
import { AddButton, Column, createPaginationConfig, formatDate } from '../../../others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
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
    CalendarRangeComponent,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    DropdownComponent,
    TranslateModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ConfirmPopupModule,
    DialogModule,
    TableModule,
    TableReportComponent,
    NgIf,
  ],
  providers: [ConfirmationService]
})
export class FIN72010Component extends BasicQueryPageComponent<FIN72010Service> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    PCS_No: [null, [Validators.maxLength(20)]], // 零用金單號
    DateFrom: [null], // 申請日期起
    DateTo: [null], // 申請日期迄
    AmtFrom: [null, Validators.max(9999999999)], // 起始零用金金額
    AmtTo: [null, Validators.max(9999999999)], // 結束零用金金額
    PCS_UsrNo: [null], // 申請人
    PCS_UsrDisplay: [''], // 申請人顯示用
    Keep_UsrNo: [null], // 保管人
    Keep_UsrDisplay: [''], // 保管人顯示用
    PCS_Status: [null], // 狀態
    Keep_OrgID: [null], // 保管單位

    //分頁查詢
    ...createPaginationConfig([{ field: 'PCS_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------

  public readonly totalRecords = signal<number>(0);

  PCS_No_Options = signal<{ label: string; value: string }[]>([]);
  status_Options: apiOption[] = [
    { No: '1', Name: '建立 ', Label: '1 - 建立 ' },
    { No: '2', Name: '請款', Label: '2 - 請款' },
    { No: '3', Name: '拋轉', Label: '3 - 拋轉' },
    { No: '4', Name: '撥補', Label: '4 - 撥補' },
  ];
  keepingUnit_Options = signal<{ label: string; value: string }[]>([]);

  data: FIN72010Data[] = [];
  lastQueryBody: QueryFIN72010Request | null = null;
  columns: Column[] = [
    { field: 'PCS_No', header: '零用金單號', visible: true },
    { field: 'PCS_Date', header: '申請日期', visible: true, format: formatDate },
    { field: 'PCS_UsrDisplay', header: '零用金申請人', visible: true },
    { field: 'PCS_OrgDisplay', header: '申請人組織', visible: true },
    { field: 'Keep_UsrDisplay', header: '零用金保管人', visible: true },
    { field: 'Keep_OrgDisplay', header: '保管單位', visible: true },
    { field: 'PCS_Status', header: '狀態', visible: true },
    { field: 'AccNo', header: '費用會計科目', visible: true },
    { field: 'AccName', header: '費用科目組織', visible: true },
    { field: 'NOTeDesc', header: '項目摘要', visible: true },
    { field: 'PCS_DtlTypeName', header: '明細類別', visible: true },
    { field: 'PCS_GUINo', header: '發票/收據號碼', visible: true },
    { field: 'PUR_Date', header: '日期', visible: true, format: formatDate },
    { field: 'PCS_Net', header: '未稅金額', visible: true },
    { field: 'PCS_Tax', header: '稅額', visible: true },
    { field: 'PCS_Amt', header: '總額', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-trash',
      action: (rowData: FIN72010Data) => this.onDelete(rowData),
      disabled: (rowData: FIN72010Data) => !this.hasPermission(this.Actions.Delete) || rowData.PCS_Status == '作廢',
    }
  ];

  selectedItems: FIN72010Data[] = [];// 多選項目


  // 「零用金申請人」與「零用金保管人」使用者對話框的變數
  userDialogVisible = false;
  userQueryForm!: FormGroup;

  // 原始完整資料
  allUserResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);
  // 零用金保管人原始完整資料
  allKeeperUserResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);
  // 畫面目前顯示資料
  userResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);


  selectedUser: any = null;
  selectedUserName = '';
  // 目前選擇的使用者類別
  currentUserTarget: 'PCS_UsrNo' | 'Keep_UsrNo' | null = null;

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
    public fin72010Service: FIN72010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', 'FIN/FIN72010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();

    // 零用金申請人與零用金保管人
    this.userQueryForm = this.fb.group({
      user_No: [''],
      user_Name: [''],
      Org_ID: [''],
      Org_Name: ['']
    });

  }

  onSubmit(form: FormGroup) {
    console.log(form.value);
    this.handleSubmit(form, () => {
      this.fin72010Service.queryFIN72010(form.value)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.lastQueryBody = form.value;
          this.totalRecords.set(response.TotalCount);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });

  }

  //---刪除檢查---
  onDelete(data: FIN72010Data): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    this.messageService.confirm({
      header: '刪除作廢',
      message: `是否確認作廢 零用金單號: ${data.PCS_No} 的資料？`,
      accept: () => {
        const deleteRequest: voidFIN72010Request = {
          PCS_No: data.PCS_No
        }
        this.fin72010Service.voidFIN72010(deleteRequest)
          .pipe(untilDestroyed(this))
          .subscribe(response => {
            if (response.Status !== "0000") {
              this.messageService.errorBubble(response.Data.Message || '作廢失敗');
            }
            else {
              this.messageService.successBubble(response.Data.Message || '作廢成功');
            }
            this.onSubmit(this.queryForm);
          })
      }
    });
  }

  isRowSelectable(rowData: sample72010): boolean {
    return rowData.CanDel
  }

  queryUserData(): void {
    const raw = this.userQueryForm.getRawValue();

    const userNo = (raw.user_No ?? '').trim().toLowerCase();
    const userName = (raw.user_Name ?? '').trim().toLowerCase();
    const orgId = (raw.Org_ID ?? '').trim().toLowerCase();
    const orgName = (raw.Org_Name ?? '').trim().toLowerCase();

    const sourceData = this.currentUserTarget === 'Keep_UsrNo'
      ? this.allKeeperUserResultData()
      : this.allUserResultData();

    const filteredData = sourceData.filter(item => {
      return (
        (!userNo || item.user_No.toLowerCase().includes(userNo)) &&
        (!userName || item.user_Name.toLowerCase().includes(userName)) &&
        (!orgId || item.Org_ID.toLowerCase().includes(orgId)) &&
        (!orgName || item.Org_Name.toLowerCase().includes(orgName))
      );
    });

    this.userResultData.set(filteredData);
  }



  openUserDialog(target: 'PCS_UsrNo' | 'Keep_UsrNo'): void {
    this.currentUserTarget = target;

    this.userDialogVisible = true;
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });

    this.userResultData.set(target === 'Keep_UsrNo' ? this.allKeeperUserResultData() : this.allUserResultData());
    this.selectedUser = null;
  }
  clearUserQuery(): void {
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });

    this.userResultData.set(this.currentUserTarget === 'Keep_UsrNo' ? this.allKeeperUserResultData() : this.allUserResultData());

    this.selectedUser = null;
  }

  onSelectUser(row: any): void {
    console.log('選到的使用者', row);

    //this.selectedUserName = `${row.user_No} - ${row.user_Name}`;
    if (!this.currentUserTarget) return;

    const nameControlName = this.currentUserTarget.replace('No', 'Name');
    const DisplayName = this.currentUserTarget.replace('No', 'Display');

    this.queryForm.patchValue({
      [this.currentUserTarget]: row.user_No ?? '',
      [nameControlName]: row.user_Name ?? '',
      [DisplayName]: `${row.user_No ?? ''} - ${row.user_Name ?? ''}`
    });

    this.userDialogVisible = false;
    this.currentUserTarget = null;
  }

  // 清除使用者選擇的資料
  clearUser(type: 'PCS' | 'Keep'): void {
    if (type === 'PCS') {
      this.queryForm.patchValue({
        PCS_UsrNo: null,
        PCS_UsrDisplay: null,
      });
      return;
    }

    this.queryForm.patchValue({
      Keep_UsrNo: null,
      Keep_UsrDisplay: null
    });
  }

  // 根據狀態代碼回傳狀態名稱
  getPCSStatusName(status?: string | number | null): string {
    const statusMap: Record<string, string> = {
      '1': '建立',
      '2': '請款',
      '3': '拋轉',
      '4': '撥補'
    };

    return statusMap[String(status ?? '')] ?? '';
  }


  /** 載入下拉選單選項 */
  private loadDropdownOptions(): void {
    // 零用金單號
    this.fin72010Service.POS2064MPCS_NoDropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: item.PCS_No ?? '',
          value: item.PCS_No ?? '',
        }));
        this.PCS_No_Options.set(options);
      },
    });

    // 零用金申請人
    this.fin72010Service.queryTBLUSER_Orgid_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          user_No: item.user_No ?? '',
          user_Name: item.user_Name ?? '',
          Org_ID: item.Org_ID ?? '',
          Org_Name: item.Org_Name ?? '',
        }));

        this.allUserResultData.set(options); // 原始完整資料
        this.userResultData.set(options);   // 畫面顯示資料
      },
    });

    // 零用金保管人
    this.fin72010Service.queryTBLUSER_PCS_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          user_No: item.user_No ?? '',
          user_Name: item.user_Name ?? '',
          Org_ID: item.Org_ID ?? '',
          Org_Name: item.Org_Name ?? '',
        }));

        this.allKeeperUserResultData.set(options);
      },
    });

    // 保管單位
    this.fin72010Service.querySYS3100_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.keepingUnit_Options.set(options);
      },
    });
  }

}
