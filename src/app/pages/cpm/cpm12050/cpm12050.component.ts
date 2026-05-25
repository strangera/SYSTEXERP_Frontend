import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { AddButton, Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';
import { CPM12050Data, CPM12050Service, QueryCPM12050Request } from '../../../service/api/cpm/cpm12050.service';
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
    CalendarComponent,
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
    ORG_ID: [null],                                     // 組織
    CLASS_ID: [null],                                   // 責任單位
    CRT_USR_Name: [null, Validators.maxLength(50)],     // 建檔人員
    COMPLAIN_DATE_F: [(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })() as Date | null],   // 接件日期(起) 預設今天 00:00:00
    COMPLAIN_DATE_T: [(() => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; })() as Date | null], // 接件日期(迄) 預設今天 23:59:59
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
    { label: '處理中', value: '1' },
    { label: '結案', value: '2' },
    { label: '已建立', value: '3' },
    { label: '已派單', value: '4' }
  ];

  // 意見類型選項
  kindIdOptions: any[] = [];
  suggSourceOptions = getSYS1000Options('SUGG_SOURCE');

  // 組織選項
  orgIdQueryOptions: any[] = [];

  // 責任單位選項
  orgIdOptions: any[] = [];
  // 全部責任單位備份
  orgIdAllOptions: any[] = [];
  //#endregion

  // table設定
  data: CPM12050Data[] = [];
  selectedItems: CPM12050Data[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'SEQ_ID', header: '客戶意見編號', visible: true },
    { field: 'COMPLAIN_NOTES', header: '顧客意見內容', visible: true, align: 'left' },
    { field: 'COMPLAIN_DATE', header: '接件日期', visible: true, format: formatDate },
    { field: 'CRT_USR_Name', header: '建檔人員', visible: true },
    { field: 'CLASS_ID', header: '責任單位', visible: true },
    { field: 'CLASS_NAME', header: '責任單位名稱', visible: true },
    { field: 'STATUS', header: '處理狀況', visible: true, format: (value: any) => this.statusOptions.find(option => option.value === value)?.label || value },
  ];

  expansionColumns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'ANSWER', header: '處理紀錄', visible: true },
    { field: 'ANSWER_DATE', header: '處理日期時間', visible: true, format: (v: unknown) => { if (!v) return ''; const d = new Date(v as string); if (isNaN(d.getTime())) return String(v); return d.toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } },
    { field: 'ANSWER_ID', header: '處理者', visible: true },
  ]

  addButton: AddButton[] = [
    {
      label: '派單',
      displayText: '派單',
      icon: '',
      action: (rowData: CPM12050Data) => this.onDispatch(rowData),
      disabled: (rowData: CPM12050Data) => rowData.STATUS !== '3'
    },
    {
      label: '結案',
      displayText: '結案',
      icon: '',
      action: (rowData: CPM12050Data) => this.onClose(rowData),
      disabled: (rowData: CPM12050Data) => rowData.STATUS === '2'
    },
    {
      label: '高權限',
      displayText: '高權限',
      icon: '',
      action: (rowData: CPM12050Data) => {
        const extras = {
          state: {
            crudstatus: CRUDStatus.Edit,
            rowdata: rowData,
            fromRoute: this.router.url,
            queryConditions: this.queryForm.getRawValue(),
            forceEditAll: true
          }
        };
        this.router.navigate([`account/${this.cruPage.toLocaleLowerCase()}`], extras);
      },
      disabled: () => false
    },
  ];

  // Dialog相關
  dialogVisible = false;
  selectedRowDataId = 0;
  closeForm = this.formBuilder.group({
    USR_NO: [''],          // 使用者編號
    USR_NAME: [''],        // 使用者名稱
    CLOSE_MEMO: ['', [Validators.required, Validators.maxLength(1000)]],  // 結案備註
    ALERT_DATE: [null, Validators.required] // 通知相關單位處理日期 (必填)
  });

  exportLoading = false;

  /** 呼叫後端 API 並觸發瀏覽器下載 */
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportCustomPdf(): void {
    if (!this.data.length) { this.messageService.warnBubble('無資料可匯出'); return; }
    this.exportLoading = true;
    const req = this.queryForm.getRawValue() as unknown as QueryCPM12050Request;
    this.cpm12050Service.exportCPM12050Pdf(req)
      .pipe(untilDestroyed(this), finalize(() => this.exportLoading = false))
      .subscribe({
        next: (blob) => {
          const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
          this.downloadBlob(blob, `顧客意見管理作業_${today}.pdf`);
        },
        error: () => this.messageService.errorBubble('PDF 匯出失敗')
      });
  }

  exportCustomExcel(): void {
    if (!this.data.length) { this.messageService.warnBubble('無資料可匯出'); return; }
    this.exportLoading = true;
    const req = this.queryForm.getRawValue() as unknown as QueryCPM12050Request;
    this.cpm12050Service.exportCPM12050Excel(req)
      .pipe(untilDestroyed(this), finalize(() => this.exportLoading = false))
      .subscribe({
        next: (blob) => {
          const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '');
          this.downloadBlob(blob, `顧客意見管理作業_${today}.xlsx`);
        },
        error: () => this.messageService.errorBubble('Excel 匯出失敗')
      });
  }

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
    // 直接載入責任單位選項，讓使用者不需先選組織即能下拉
    this.dropdownApiService.queryCss1005()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdAllOptions = res || [];
        this.orgIdOptions = this.orgIdAllOptions;
      });
  }

  onOrgQueryChange(orgId: string) {
    // 清除已選的責任單位
    this.queryForm.patchValue({ CLASS_ID: null });
    // 依組織過濾責任單位下拉選單
    this.dropdownApiService.queryCss1005({ ORG_ID: orgId || '' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }

  // 判斷是否禁用編輯按鈕: 只有結案（value '2'）為不可編輯
  editDisabled = (rowData: any): boolean => {
    return rowData?.STATUS === '2';
  }

  expansionLoadFn = (rowData: CPM12050Data): Observable<any> => {
    return this.cpm12050Service.queryCPM12050Detail({ ID: rowData.ID, SEQ_ID: rowData.SEQ_ID! });
  };

  // 派單
  onDispatch(rowData: CPM12050Data) {
    this.messageService.confirm({
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
    const alertVal: any = this.closeForm.get('ALERT_DATE')!.value;
    let alertIso: string | null = null;
    try {
      if ((alertVal as any) instanceof Date) alertIso = (alertVal as Date).toISOString();
      else if (typeof alertVal === 'string' && alertVal) alertIso = new Date(alertVal).toISOString();
    } catch (e) {
      alertIso = null;
    }

    const req = {
      ID: this.selectedRowDataId,
      CLOSE_MEMO: this.closeForm.get('CLOSE_MEMO')!.value || '',
      USR_NO: this.authService.getUserInfo()?.user_No,
      USR_NAME: this.authService.getUserInfo()?.user_Name,
      ALERT_DATE: alertIso
    }
    console.log('closeCPM12050 req', req);
    this.cpm12050Service.closeCPM12050(req)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.messageService.successBubble('結案成功');
        this.dialogVisible = false;
        this.onSubmit(this.queryForm);
      });
  }

}
