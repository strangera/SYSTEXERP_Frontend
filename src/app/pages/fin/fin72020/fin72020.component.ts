import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72020Data, FIN72020Service, QueryFIN72020Request, voidFIN72020Request } from '@service/api/fin/fin72020.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { finalize, Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { AddButton, Column, createPaginationConfig } from '../../../others/component/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';

@Component({
  selector: 'app-fin72020',
  templateUrl: './fin72020.component.html',
  styleUrl: './fin72020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
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
    TableReportComponent,
    NgIf,
  ]
})
export class FIN72020Component extends BasicQueryPageComponent<FIN72020Service> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    // POS2064M 收支主檔(I/O)
    // 收支請款檔(I/O) 

    PCS_RqstNo: [null, [Validators.maxLength(20)]], // 支出請款單號
    PCS_RqstDate: [null], // 產生日期
    PCS_UsrNo: [null], // 申請人
    PCS_UsrName: [''], // 申請人名稱
    PCS_UsrDisplay: [''], // 申請人顯示用
    Keep_UsrNo: [null], // 保管人
    Keep_UsrName: [''], // 保管人名稱
    Keep_UsrDisplay: [''], // 保管人顯示用
    PCS_Status: [null], // 狀態
    Keep_OrgID: [null], // 保管單位

    //分頁查詢
    ...createPaginationConfig([{ field: 'PCS_RqstNo', order: 1 }]), // 分頁和排序參數
  });

  public readonly totalRecords = signal<number>(0);

  status_Options: apiOption[] = [
    { No: '1', Name: '建立 ', Label: '1 - 建立 ' },
    { No: '2', Name: '請款', Label: '2 - 請款' },
    { No: '3', Name: '拋轉', Label: '3 - 拋轉' },
    { No: '4', Name: '撥補', Label: '4 - 撥補' },
  ];

  PCS_RqstNo_Options = signal<{ label: string; value: string }[]>([]);
  // 原始完整資料
  allUserResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);
  // 畫面目前顯示資料
  userResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);
  keepingUnit_Options = signal<{ label: string; value: string }[]>([]);

  data: any[] = [];
  lastQueryBody: QueryFIN72020Request | null = null;
  columns: Column[] = [
    { field: 'PCS_RqstNo', header: '支出請款單號', visible: true },
    { field: 'PCS_UsrDisplay', header: '零用金申請人', visible: true },
    { field: 'PCS_OrgDisplay', header: '申請人組織', visible: true },
    { field: 'Keep_UsrDisplay', header: '零用金保管人', visible: true },
    { field: 'Keep_OrgDisplay', header: '保管人組織', visible: true },
    { field: 'Keep_OrgDisplay', header: '保管單位', visible: true },
    { field: 'PCS_No', header: '零用金單號', visible: true },
    { field: 'PCS_StatusName', header: '狀態', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '作廢',
      icon: 'pi pi-trash',
      action: (rowData: FIN72020Data) => this.onDelete(rowData),
      disabled: (rowData: FIN72020Data) => !this.hasPermission(this.Actions.Delete) || rowData.PCS_Status == '9',
    }
  ];

  selectedItems: FIN72020Data[] = [];// 多選項目


  // 「零用金申請人」與「零用金保管人」使用者對話框的變數
  userDialogVisible = false;
  userQueryForm!: FormGroup;

  selectedUser: any = null;
  selectedUserName = '';
  // 目前選擇的使用者類別
  currentUserTarget: 'PCS_UsrNo' | 'Keep_UsrNo' | null = null;


  // ----------------------------------------------------------------
  constructor(
    private fb: FormBuilder,
    public fin72020Service: FIN72020Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72020', 'FIN/FIN72020cru', this.queryForm, (form) => this.onSubmit(form));
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
    const req = {
      PCS_RqstNo: form.value.PCS_RqstNo,
      PCS_RqstDate: form.value.PCS_RqstDate,
      PCS_UsrNo: form.value.PCS_UsrNo,
      Keep_UsrNo: form.value.Keep_UsrNo,
      PCS_Status: form.value.PCS_Status,
      Keep_OrgID: form.value.Keep_OrgID,
      SortBy: form.value.SortBy ?? [{ field: 'PCS_RqstNo', order: 1 }],
      PageSize: form.value.pageSize ?? 30,
      PageIndex: form.value.pageIndex ?? 1,
    };
    this.handleSubmit(form, () => {
      this.fin72020Service.queryFIN72020(req)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.lastQueryBody = req;
          this.totalRecords.set(response.TotalCount);
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });

  }

  // 表格查詢函式，會在分頁、排序、初始查詢時被呼叫
  public queryFunction = (
    body: QueryFIN72020Request & { pageSize?: number; pageIndex?: number }
  ): Observable<ApiResponse<FIN72020Data[]>> => {

    const cleanPayload = removeEmptyValues(body) as QueryFIN72020Request;
    return this.fin72020Service.queryFIN72020(cleanPayload);
  };


  //---刪除檢查---
  onDelete(data: FIN72020Data): void {
    console.log('Delete data:', JSON.stringify(data, null, 2));

    this.messageService.confirm({
      header: '刪除作廢',
      message: `是否確認作廢 零用金單號: ${data.PCS_No} 的資料？`,
      accept: () => {
        const deleteRequest: voidFIN72020Request = {
          PCS_No: data.PCS_No
        }
        this.fin72020Service.voidFIN72020(deleteRequest)
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

  openUserDialog(target: 'PCS_UsrNo' | 'Keep_UsrNo'): void {
    this.currentUserTarget = target;

    this.userDialogVisible = true;
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });

    this.userResultData.set(this.allUserResultData());
    // this.userResultData = [];
    this.selectedUser = null;
  }

  queryUserData(): void {
    const raw = this.userQueryForm.getRawValue();

    const userNo = (raw.user_No ?? '').trim().toLowerCase();
    const userName = (raw.user_Name ?? '').trim().toLowerCase();
    const orgId = (raw.Org_ID ?? '').trim().toLowerCase();
    const orgName = (raw.Org_Name ?? '').trim().toLowerCase();

    const filteredData = this.allUserResultData().filter(item => {
      return (
        (!userNo || item.user_No.toLowerCase().includes(userNo)) &&
        (!userName || item.user_Name.toLowerCase().includes(userName)) &&
        (!orgId || item.Org_ID.toLowerCase().includes(orgId)) &&
        (!orgName || item.Org_Name.toLowerCase().includes(orgName))
      );
    });

    this.userResultData.set(filteredData);
  }

  clearUserQuery(): void {
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });

    // this.userResultData = [];
    this.userResultData.set(this.allUserResultData());
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

  /** 載入下拉選單選項 */
  private loadDropdownOptions(): void {
    // 支出請款單號
    this.fin72020Service.POS2064MPCS_RqstNoDropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: item.PCS_RqstNo ?? '',
          value: item.PCS_RqstNo ?? '',
        }));
        this.PCS_RqstNo_Options.set(options);
      },
    });

    // 零用金申請人、零用金保管人
    this.fin72020Service.queryTBLUSER_Orgid_DropDownList().subscribe({
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

    // 保管單位
    this.fin72020Service.querySYS3100_DropDownList().subscribe({
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
