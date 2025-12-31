import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { AddButton, Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { CPM12050Data, CPM12050Service } from '../../../service/api/cpm/cpm12050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-cpm12050',
  templateUrl: './cpm12050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    CalendarRangeComponent,
    InputTextareaComponent,
    DialogComponent
  ]
})
export class CPM12050Component extends BasicQueryPageComponent<CPM12050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SEQ_ID: [null, Validators.maxLength(15)],           // 客戶意見編號
    CUST_NAME: [null, Validators.maxLength(20)],        // 客戶姓名
    SEX: [null],                                        // 性別
    STATUS: [null],                                     // 處理狀況
    KIND_ID: [null],                                    // 意見類型
    SUGG_SOURCE: [null],                                // 建議來源
    CONTACT_TEL: [null, [this.validationService.phoneNumberValidator, Validators.maxLength(30)]], // 聯絡電話
    CELL_PHONE: [null, [this.validationService.phoneNumberValidator, Validators.maxLength(30)]],  // 手機號碼
    E_MAIL: [null, [this.validationService.emailValidator, Validators.maxLength(100)]],           // Email
    COMPLAIN_NOTES: [null, Validators.maxLength(1000)], // 顧客意見內容
    ORG_ID: [null],                                     // 責任單位
    ORG_ID_QUERY: [null],                               // 組織(查詢責任單位用)
    CRT_USR_Name: [null, Validators.maxLength(50)],     // 建檔人員
    COMPLAIN_DATE_F: [null as Date | null],             // 接件日期(起)
    COMPLAIN_DATE_T: [null as Date | null],             // 接件日期(迄)
    ...createPaginationConfig([])
  });

  //#region 下拉選單
  // 性別選項
  sexOptions = [
    { label: '男', value: 'M' },
    { label: '女', value: 'F' }
  ];

  // 處理狀況選項
  statusOptions = [
    { label: '已建立', value: 'S' },
    { label: '已派單', value: 'W' },
    { label: '處理中', value: 'Y' },
    { label: '結案', value: 'Z' }
  ];

  // 意見類型選項
  kindIdOptions: any[] = [];

  // 建議來源選項
  suggSourceOptions = [
    { label: 'WEB', value: 'WEB' },
    { label: 'APP', value: 'APP' },
  ];

  // 組織選項
  orgIdQueryOptions: any[] = [];

  // 責任單位選項
  orgIdOptions: any[] = [];
  //#endregion

  // table設定
  data: CPM12050Data[] = [];
  selectedItems: CPM12050Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'SEQ_ID', header: '客戶意見編號', visible: true },
    { field: 'COMPLAIN_NOTES', header: '顧客意見內容', visible: true },
    { field: 'COMPLAIN_DATE', header: '接件日期', visible: true, format: formatDate },
    { field: 'CRT_USR_Name', header: '建檔人員', visible: true },
    { field: 'ORG_ID', header: '責任單位', visible: true },
    { field: 'STATUS', header: '處理狀況', visible: true, format: (value: any) => this.statusOptions.find(option => option.value === value)?.label || value },
  ];

  expansionColumns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'ANSWER', header: '回覆內容', visible: true },
    { field: 'ANSWER_ID', header: '回覆人員代碼', visible: true },
    { field: 'ANSWER_DATE', header: '回覆日期', visible: true, format: formatDate },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: true },
    { field: 'CRT_Date', header: '建立時間', visible: true, format: formatDate },
    { field: 'UPD_USR_Name', header: '異動人員名稱', visible: true },
    { field: 'UPD_Date', header: '異動時間', visible: true, format: formatDate }
  ]

  addButton: AddButton[] = [
    {
      label: '派單',
      displayText: '派單',
      icon: '',
      action: (rowData: CPM12050Data) => this.onDispatch(rowData),
      disabled: (rowData: CPM12050Data) => rowData.STATUS !== 'S'
    },
    {
      label: '結案',
      displayText: '結案',
      icon: '',
      action: (rowData: CPM12050Data) => this.onClose(rowData),
      disabled: (rowData: CPM12050Data) => rowData.STATUS === 'Z'
    },
  ];

  // Dialog相關
  dialogVisible = false;
  selectedRowDataId = 0;
  closeForm = this.formBuilder.group({
    USR_NO: [''],          // 使用者編號
    USR_NAME: [''],        // 使用者名稱
    CLOSE_MEMO: ['', [Validators.required, Validators.maxLength(1000)]]  // 結案備註
  });

  constructor(
    private cpm12050Service: CPM12050Service,
    private validationService: ValidationService,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12050', 'cpm/cpm12050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.cpm12050Service.queryCPM12050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  loadOptions() {
    // 獲取組織下拉選項
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdQueryOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
    // 獲取意見類型下拉選項
    this.dropDownListService.queryCSS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.kindIdOptions = this.kindIdOptions.concat(
          res.Data.map(item => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        );
      })
  }

  onOrgQueryChange(orgId: string) {
    if (!orgId) {
      this.orgIdOptions = [];
      this.queryForm.patchValue({ ORG_ID: null });
      return
    };
    this.dropdownApiService.queryCss1005({ ORG_ID: orgId })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }

  expansionLoadFn = (rowData: CPM12050Data): Observable<any> => {
    return this.cpm12050Service.queryCPM12050Detail({ ID: rowData.ID, SEQ_ID: rowData.SEQ_ID! });
  };

  // 派單
  onDispatch(rowData: CPM12050Data) {
    this.confirmationService.confirm({
      header: `是否確認派單?`,
      accept: () => {
        const usrNo = this.authService.getUserInfo()?.user_No;
        const usrName = this.authService.getUserInfo()?.user_Name;
        this.cpm12050Service.dispatchCPM12050({
          ID: rowData.ID,
          USR_NO: usrNo,
          USR_NAME: usrName
        })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('派單成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  // 結案
  onClose(rowData: CPM12050Data) {
    this.dialogVisible = true;
    this.closeForm.patchValue({
      USR_NO: this.authService.getUserInfo()?.user_No,
      USR_NAME: this.authService.getUserInfo()?.user_Name,
      CLOSE_MEMO: ''
    });
    this.closeForm.controls.USR_NO.disable();
    this.closeForm.controls.USR_NAME.disable();
    this.selectedRowDataId = rowData.ID!;
  }

  saveDialog() {
    const req = {
      ID: this.selectedRowDataId,
      CLOSE_MEMO: this.closeForm.get('CLOSE_MEMO')!.value || '',
      USR_NO: this.authService.getUserInfo()?.user_No,
      USR_NAME: this.authService.getUserInfo()?.user_Name
    }
    this.cpm12050Service.closeCPM12050(req)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.messageService.successBubble('結案成功');
        this.dialogVisible = false;
        this.onSubmit(this.queryForm);
      });
  }

}
