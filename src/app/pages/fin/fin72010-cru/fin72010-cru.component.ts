import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72010Service, QueryFIN72010DetailDetailResponse, QueryFIN72010DetailRequest, saveFIN72010Request } from '@service/api/fin/fin72010.service';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from './../../../shared/models/system/CRUDstatus';

interface UserOrgOption {
  user_No: string;
  user_Name: string;
  Org_ID: string;
  Org_Name: string;
}

interface LoginUserInfo {
  user_No?: string;
  user_Name?: string;
  Org_ID?: string;
  Org_Name?: string;
  USER_No?: string;
  USER_Name?: string;
  org_ID?: string;
  org_Name?: string;
}

@Component({
  selector: 'app-fin72010-cru',
  templateUrl: './fin72010-cru.component.html',
  styleUrl: './fin72010-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    InputTextComponent,
    NgIf,
    ButtonComponent,
    TranslateModule,
    TableEditComponent,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ToastModule,
    ConfirmPopupModule,
    DialogModule,
    TableModule,
  ]
})
export class FIN72010CRUComponent extends BasicCruPageComponent<FIN72010Service> implements OnInit {
  isRefreshing = false; // 是否是重製表單狀態(預設為false)
  orgdataForm: any;
  dataForm = this.formBuilder.group({
    PCS_No: new FormControl<string | null>(
      { value: null, disabled: true },
      [Validators.required, Validators.maxLength(20)]
    ),
    PCS_Date: new FormControl<Date | string | null>(null, [
      Validators.required
    ]),
    PCS_UsrNo: new FormControl<string | null>(null, [
      Validators.required
    ]),
    PCS_UsrName: new FormControl<string>('', { nonNullable: true }),
    PCS_UsrDisplay: new FormControl<string>('', { nonNullable: true }),
    Keep_UsrNo: new FormControl<string | null>(null, [
      Validators.required
    ]),
    Keep_UsrName: new FormControl<string>('', { nonNullable: true }),
    Keep_UsrDisplay: new FormControl<string>('', { nonNullable: true }),
    PCS_OrgID: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(20)
    ]),
    Keep_OrgID: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(20)
    ])
  });
  DetailColumn: EditColumn[] = []; // 明細表格欄位定義

  // 基本資料dropdown
  PCS_No_Options = signal<{ label: string; value: string }[]>([]);
  keepingUnit_Options = signal<{ label: string; value: string }[]>([]);
  PCS_DtlType_Options = signal<{ label: string; value: string }[]>([]);
  PUR_VoucherType_Options = signal<{ label: string; value: string }[]>([]);
  PUR_DirectType_Options = signal<{ label: string; value: string }[]>([]);
  PCS_TaxType_Options = signal<{ label: string; value: string }[]>([]);
  PUR_DiscNo_Options = signal<{ label: string; value: string }[]>([]);
  AccNo_Options = signal<{ label: string; value: string }[]>([]);

  // -----------------------------------------------------------------------
  // 「零用金申請人」與「零用金保管人」使用者對話框的變數
  userDialogVisible = false;
  userQueryForm!: FormGroup;

  // 原始完整資料
  allUserResultData = signal<UserOrgOption[]>([]);
  // 畫面目前顯示資料
  userResultData = signal<UserOrgOption[]>([]);

  selectedUser: UserOrgOption | null = null;
  selectedUserName = '';
  // 目前選擇的使用者類別
  currentUserTarget: 'PCS_UsrNo' | 'Keep_UsrNo' | null = null;

  // 是否顯示checkbox 
  isShowCheckBox = true;
  isRead = false;

  // ---------明細 (POS2064) 編輯表格 至少要一筆-------------------------------------------------------
  Detaildata: QueryFIN72010DetailDetailResponse[] = [];
  orgDetaildata: QueryFIN72010DetailDetailResponse[] = []; // POS2064(備分)

  selectedPOS2064Items: QueryFIN72010DetailDetailResponse[] = [];


  //「保管單位」對話框的變數
  keepDeptDialogVisible = false;
  keepDeptQueryForm!: FormGroup;

  keepDeptResultData: any[] = [];
  selectedKeepDept: any = null;

  constructor(
    private fb: FormBuilder,
    private fin72010Service: FIN72010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', this.dataForm);

    // 新增模式：申請日期預設今天
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.patchValue({
        PCS_Date: new Date()
      });
    }
    //導入下拉清單
    // this.loadOptions();

    if (this.crudstatus == CRUDStatus.Edit || this.crudstatus == CRUDStatus.Read) {
      //查詢明細檔案 (編輯模式)
      console.log('編輯模式，明細檔讀取中', this.dataForm.value);

      //讀取明細檔 並載入預設值 (商品管理編號、目前進價)
      this.isRefreshing = true;
      this.loadDetail(this.dataForm.get('PCS_No')?.value || '')
        .then(() => {

          this.isRefreshing = false; // ✅ 等 loadDetail 完成後再關
        })
        .catch(() => {
          this.isRefreshing = false;
        });
    }

    this.DetailColumn = [
      { field: 'AccNo', header: '費用會計科目', type: 'dropdown', width: '12rem', options: this.AccNo_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'NOTeDesc', header: '項目摘要', type: 'input', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'ORG_ID', header: '組織代號', type: 'dropdown', width: '12rem', options: this.keepingUnit_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_DtlType', header: '明細類別', type: 'dropdown', width: '12rem', options: this.PCS_DtlType_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read, onChange: this.onDtlTypeChange },
      { field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown', width: '12rem', options: (rowData: QueryFIN72010DetailDetailResponse) => this.getVoucherTypeOptions(rowData?.PCS_DtlType), optionLabel: 'label', optionValue: 'value', validate: [this.validateVoucherTypeRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_GUINo', header: '發票/收據號碼', type: 'input', width: '12rem', validate: [this.validateGUINoRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PUR_Date', header: '發票日期', type: 'date', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read }, // 不確定欄位
      { field: 'DEC_YM_Date', header: '申報年月', type: 'date', dateFormat: 'yy-mm', view: 'month', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'VEN_Uniform', header: '廠商統一編號', type: 'input', width: '12rem', disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PUR_DirectType', header: '發票用途', type: 'dropdown', width: '12rem', options: this.PUR_DirectType_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_Amt', header: '發票總金額', type: 'input', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_TaxType', header: '課稅別', type: 'dropdown', width: '12rem', options: this.PCS_TaxType_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_Net', header: '發票未稅金額', type: 'input', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_Tax', header: '發票稅額', type: 'input', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PUR_DiscNo', header: '扣抵代號', type: 'dropdown', width: '12rem', options: this.PUR_DiscNo_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'COLLECT_NUM', header: '彙總張數', type: 'input', width: '12rem', disabled: () => this.crudstatus === CRUDStatus.Read },
    ];

    this.loadDropdownOptions();

    if (this.crudstatus === CRUDStatus.Read) {
      this.isShowCheckBox = false;
      this.isRead = true;
    }

    // 零用金申請人與零用金保管人
    this.userQueryForm = this.fb.group({
      user_No: [''],
      user_Name: [''],
      Org_ID: [''],
      Org_Name: ['']
    });

  }

  // #region onSubmit
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const updateRequest: saveFIN72010Request = {
              ActionMode: 'I',
              PCS_Date: this.formatDateToApi(this.dataForm.getRawValue().PCS_Date),
              PCS_UsrNo: this.dataForm.getRawValue().PCS_UsrNo || '',
              PCS_UsrName: this.getUserNameFromOptions(this.dataForm.getRawValue().PCS_UsrNo),
              PCS_OrgID: this.dataForm.getRawValue().PCS_OrgID || '',
              Keep_UsrNo: this.dataForm.getRawValue().Keep_UsrNo || '',
              Keep_UsrName: this.getUserNameFromOptions(this.dataForm.getRawValue().Keep_UsrNo),
              Keep_OrgID: this.dataForm.getRawValue().Keep_OrgID || '',
              Details: this.Detaildata
                .map((item, index) => ({
                  id: null, // 新增時ID為null
                  RowAction: 'I', // 新增
                  PCS_SeqNo: item.PCS_SeqNo ?? index + 1, // 如果沒有值，就依照目前明細順序給 1, 2, 3...
                  AccNo: item.AccNo,
                  NOTeDesc: item.NOTeDesc,
                  ORG_ID: item.ORG_ID,
                  PCS_DtlType: item.PCS_DtlType,
                  PUR_VoucherType: item.PUR_VoucherType,
                  PCS_GUINo: item.PCS_GUINo,
                  PUR_Date: item.PUR_Date ? this.formatDateToApi(item.PUR_Date) : null, // 空日期送 null，不可送 '' 否則後端 DateTime? 反序列化失敗
                  DEC_YM: this.formatDateToYm(item.DEC_YM_Date),
                  PCS_Net: item.PCS_Net,
                  PCS_Tax: item.PCS_Tax,
                  VEN_Uniform: item.VEN_Uniform ?? '',
                  PUR_DiscNo: item.PUR_DiscNo,
                  PCS_TaxType: item.PCS_TaxType,
                  PUR_DirectType: item.PUR_DirectType,
                  COLLECT_NUM: item.COLLECT_NUM,
                  PCS_Remark: item.PCS_Remark
                }))
            };
            this.fin72010Service.saveFIN72010(updateRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                if (response.Data.Summary.IsSuccess !== 1) {
                  this.messageService.errorBubble(response.Data.ValidationErrors[0].ErrReason || '新增失敗');
                }
                else {
                  this.messageService.successBubble(response.Data.Summary.Message || '新增成功');
                  this.onCancel();  // 返回查詢頁
                }
              })
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 刪除資料先排前面，確保送出時先處理刪除，再處理新增和修改，避免衝突
            const sortedDetails = [
              ...this.orgDetaildata.filter(item => item.status === 'deleted'),
              ...this.orgDetaildata.filter(item => item.status !== 'deleted')
            ];

            const editRequest: saveFIN72010Request = {
              ActionMode: 'U',
              PCS_No: this.dataForm.getRawValue().PCS_No || '',
              PCS_Date: this.formatDateToApi(this.dataForm.getRawValue().PCS_Date),
              PCS_UsrNo: this.dataForm.getRawValue().PCS_UsrNo || '',
              PCS_UsrName: this.getUserNameFromOptions(this.dataForm.getRawValue().PCS_UsrNo),
              PCS_OrgID: this.dataForm.getRawValue().PCS_OrgID || '',
              Keep_UsrNo: this.dataForm.getRawValue().Keep_UsrNo || '',
              Keep_UsrName: this.getUserNameFromOptions(this.dataForm.getRawValue().Keep_UsrNo),
              Keep_OrgID: this.dataForm.getRawValue().Keep_OrgID || '',
              Details: sortedDetails
                .map((item, index) => ({
                  id: item.id || null, // 如果有id就用原本的，沒有就給null（代表新增）
                  RowAction: item.status
                    ? item.status === 'new'
                      ? 'I' // 新增
                      : item.status === 'modified'
                        ? 'U' // 修改
                        : item.status === 'deleted'
                          ? 'D' // 刪除
                          : 'U' // 預設為修改
                    : 'U', // 如果沒有status屬性，預設為修改
                  PCS_SeqNo: item.PCS_SeqNo ?? index + 1, // 如果沒有值，就依照目前明細順序給 1, 2, 3...
                  AccNo: item.AccNo,
                  NOTeDesc: item.NOTeDesc,
                  ORG_ID: item.ORG_ID,
                  PCS_DtlType: item.PCS_DtlType,
                  PUR_VoucherType: item.PUR_VoucherType,
                  PCS_GUINo: item.PCS_GUINo,
                  PUR_Date: item.PUR_Date ? this.formatDateToApi(item.PUR_Date) : null, // 空日期送 null，不可送 '' 否則後端 DateTime? 反序列化失敗
                  DEC_YM: this.formatDateToYm(item.DEC_YM_Date),
                  PCS_Net: item.PCS_Net,
                  PCS_Tax: item.PCS_Tax,
                  VEN_Uniform: item.VEN_Uniform ?? '',
                  PUR_DiscNo: item.PUR_DiscNo,
                  PCS_TaxType: item.PCS_TaxType,
                  PUR_DirectType: item.PUR_DirectType,
                  COLLECT_NUM: item.COLLECT_NUM,
                  PCS_Remark: item.PCS_Remark
                }))
            };
            this.fin72010Service.saveFIN72010(editRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                if (response.Data.Summary.IsSuccess !== 1) {
                  this.messageService.errorBubble(response.Data.ValidationErrors[0].ErrReason || '修改失敗');
                }
                else {
                  this.messageService.successBubble(response.Data.Summary.Message || '修改成功');
                  this.onCancel();  // 返回查詢頁
                }
              })
          }
          break;
      }
    });

    this.messageService.unblockUi();
    this.submitted = false;
  }

  deleteDetail(event: QueryFIN72010DetailDetailResponse | QueryFIN72010DetailDetailResponse[]): void {
    // 如果 app-table-edit 傳回來的是整個陣列，先找出被標記 deleted 的那一筆
    const rowData = Array.isArray(event)
      ? event.find(item => item.status === 'deleted')
      : event;

    // 如果沒有找到被標記 deleted 的資料，直接返回
    if (!rowData) {
      return;
    }

    // 既有資料，要保留在 orgDetaildata，並標記 deleted
    const target = this.orgDetaildata.find(item =>
      item.id === rowData.id
    );

    if (target) {
      target.status = 'deleted';
    } else {
      this.orgDetaildata.push({
        ...rowData,
        status: 'deleted'
      });
    }

    // 畫面資料移除
    this.Detaildata = this.Detaildata.filter(item =>
      item.id !== rowData.id
    );
  }

  // 當 app-table-edit 的資料有變動時，更新 Detaildata，並同步到 orgDetaildata，以便後續送出時能夠知道哪些資料是新增、修改、刪除
  onDetailDataChange(data: QueryFIN72010DetailDetailResponse[]): void {
    // 畫面目前資料
    this.Detaildata = data;

    // 保留已刪除資料
    const deletedRows = this.orgDetaildata.filter(item => item.status === 'deleted');

    // 同步目前畫面上的新增/修改資料到 orgDetaildata
    const currentRows = data.map(item => {
      const oldItem = this.orgDetaildata.find(org =>
        // 已存在 DB 的資料，用 id 對應
        (item.id && org.id === item.id) ||

        // 新增資料沒有 id，用 _TABLE_KEY 對應
        (!item.id && item._TABLE_KEY && org._TABLE_KEY === item._TABLE_KEY)
      );

      return {
        ...oldItem,
        ...item
      };
    });

    // orgDetaildata = 目前畫面資料 + 已刪除資料
    this.orgDetaildata = [
      ...currentRows,
      ...deletedRows
    ];
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  /** 將 Date 或日期字串轉為後端需要的 YYYY-MM-DD */
  private formatDateToApi(
    value: Date | string | null | undefined
  ): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    return value.substring(0, 10);
  }

  // 將 Date 物件或 "YYYY-MM" 格式的字串轉換成 "YYYYMM" 格式的字串，以符合後端 API 的需求
  private formatDateToYm(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      return `${year}${month}`;
    }

    return value.replace('-', '').substring(0, 6);
  }

  // #region 明細檔 下拉選項
  loadOptions() {
    const req: QueryFIN72010DetailRequest = { PCS_No: this.dataForm.get('PCS_No')?.value || '' };
    this.fin72010Service.queryFIN72010Detail(req).pipe(untilDestroyed(this)).subscribe((response) => {
      this.Detaildata = response.Data.Details;
    }
    );
  }

  // #region 明細檔 讀取
  async loadDetail(PCS_No: string): Promise<void> {
    if (PCS_No == '') {
      if (this.crudstatus !== CRUDStatus.Create) {
        this.messageService.infoBubble('key為空，不載入明細檔'); //編輯、查看模式如果沒有明細檔就跳出提示
      }
    } else {
      const req: QueryFIN72010DetailRequest = { PCS_No: this.dataForm.get('PCS_No')?.value || '' };
      this.fin72010Service.queryFIN72010Detail(req).pipe(untilDestroyed(this)).subscribe((response) => {
        this.Detaildata = (response.Data?.Details ?? []).map(item => ({
          ...item,
          DEC_YM_Date: this.parseYmToDate(item.DEC_YM)
        }));
        this.orgDetaildata = [...this.Detaildata]; // 保留原始資料的副本
      }
      );
    }
  }

  // 將 "YYYYMM" 格式的字串轉換成 Date 物件，方便 PrimeNG Calendar 使用
  private parseYmToDate(value?: string | null): Date | null {
    if (!value || value.length !== 6) {
      return null;
    }

    const year = Number(value.substring(0, 4));
    const month = Number(value.substring(4, 6)) - 1; // JS 月份從 0 開始

    return new Date(year, month, 1);
  }

  // #region 明細檔 重製
  reset51070(): void {
    if (this.crudstatus === CRUDStatus.Create) {
      this.isRefreshing = true;

      this.dataForm.reset({
        PCS_No: null,
        PCS_Date: new Date(),
        PCS_UsrNo: null,
        PCS_UsrName: '',
        PCS_UsrDisplay: '',
        Keep_UsrNo: null,
        Keep_UsrName: '',
        Keep_UsrDisplay: '',
        PCS_OrgID: null,
        Keep_OrgID: null
      });

      this.Detaildata = [];
      this.orgDetaildata = [];
      this.selectedPOS2064Items = [];

      this.setDefaultApplicant();

      this.isRefreshing = false;
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      const pcsNo = this.dataForm.get('PCS_No')?.value;

      if (!pcsNo) {
        return;
      }

      this.isRefreshing = true;
      this.loadDetail(pcsNo)
        .then(() => {
          this.isRefreshing = false;
        })
        .catch(() => {
          this.isRefreshing = false;
        });

      return;
    }

    console.log('查看模式無須重製');
  }

  // 判斷是否為空值
  // 注意：0 不算空值，因為金額、稅額可能合法為 0
  isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  // #region 明細檔 驗證
  validateDetailRow = (rowData: QueryFIN72010DetailDetailResponse): { isValid: boolean; errorMessage: string } => {
    // const accNo = rowData.AccNo?.trim(); // 取得目前這一列的費用會計科目，並去除前後空白
    // 發票格式僅在明細類別為發票(1)或收據(2)時必填，0(不扣抵憑證)免填
    const voucherTypeRequired = rowData.PCS_DtlType === '1' || rowData.PCS_DtlType === '2';

    const requiredFields = [
      { value: rowData.AccNo?.trim(), name: '費用會計科目' },
      { value: rowData.NOTeDesc?.trim(), name: '項目摘要' },
      { value: rowData.ORG_ID?.trim(), name: '組織代號' },
      { value: rowData.PCS_DtlType?.trim(), name: '明細類別' },
      ...(voucherTypeRequired ? [{ value: rowData.PUR_VoucherType?.trim(), name: '發票格式' }] : []),
      { value: rowData.PUR_Date, name: '發票日期' },
      { value: rowData.DEC_YM_Date, name: '申報年月' },
      { value: rowData.PUR_DirectType?.trim(), name: '發票用途' },
      { value: rowData.PCS_Amt, name: '發票總金額' },
      { value: rowData.PCS_TaxType?.trim(), name: '課稅別' },
      { value: rowData.PCS_Net, name: '發票未稅金額' },
      { value: rowData.PCS_Tax, name: '發票稅額' },
      { value: rowData.PUR_DiscNo?.trim(), name: '扣抵代號' },
    ];

    const emptyField = requiredFields.find(field =>
      this.isEmptyValue(field.value)
    );

    if (emptyField) {
      return {
        isValid: false,
        errorMessage: `${emptyField.name}不可為空，請輸入有效的${emptyField.name}。`
      };
    }

    // // 找出目前這一列在 Detaildata 陣列中的位置，避免檢查重複時，把自己也判斷成重複
    // const currentIndex = this.Detaildata.indexOf(rowData);
    // // 檢查是否有其他列的 AccNo 跟目前這列相同
    // const isDuplicate = this.Detaildata.some((item, index) => {

    //   if (index === currentIndex) {
    //     return false; // 如果目前的是自己這一列，就跳過不檢查
    //   }

    //   // 比對其他列的 AccNo 是否與目前這列的 accNo 相同，有相同就代表重複
    //   return item.AccNo?.trim() === accNo;
    // });

    // // 如果有找到重複的費用會計科目，回傳驗證失敗
    // if (isDuplicate) {
    //   return {
    //     isValid: false,
    //     errorMessage: `費用會計科目編號 ${accNo} 已存在，請使用其他編號。`
    //   };
    // }

    // 沒有空白，也沒有重複，驗證通過
    return { isValid: true, errorMessage: '' };
  };


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
    this.selectedUser = null;
  }

  clearUserQuery(): void {
    this.userQueryForm.reset({
      user_No: '',
      user_Name: '',
      Org_ID: '',
      Org_Name: ''
    });

    this.userResultData.set(this.allUserResultData());
    this.selectedUser = null;
  }

  onSelectUser(row: UserOrgOption): void {
    if (!this.currentUserTarget) {
      return;
    }

    if (this.currentUserTarget === 'PCS_UsrNo') {
      this.dataForm.patchValue({
        PCS_UsrNo: row.user_No ?? '',
        PCS_UsrName: row.user_Name ?? '',
        PCS_UsrDisplay: this.getUserDisplay(row),
        PCS_OrgID: row.Org_ID ?? ''
      });
    } else {
      this.dataForm.patchValue({
        Keep_UsrNo: row.user_No ?? '',
        Keep_UsrName: row.user_Name ?? '',
        Keep_UsrDisplay: this.getUserDisplay(row),
        Keep_OrgID: row.Org_ID ?? ''
      });
    }

    this.userDialogVisible = false;
    this.selectedUser = null;
    this.currentUserTarget = null;
  }

  // 各明細類別允許顯示的發票格式代碼
  // 0(不扣抵憑證)：不顯示且免填；1(發票)：21/22/25/26/27；2(收據)：22/27
  private readonly voucherTypeByDtlType: Record<string, string[]> = {
    '1': ['21', '22', '25', '26', '27'],
    '2': ['22', '27'],
  };

  // 依明細類別過濾發票格式選項，0 或未選時回傳空陣列
  private getVoucherTypeOptions(dtlType?: string | null): { label: string; value: string }[] {
    const allowed = this.voucherTypeByDtlType[dtlType ?? ''];
    if (!allowed) {
      return [];
    }
    return this.PUR_VoucherType_Options().filter(opt => allowed.includes(opt.value));
  }

  // 明細類別改變後，若目前發票格式不在新允許清單內就清空
  private onDtlTypeChange = (
    _value: unknown,
    rowData: QueryFIN72010DetailDetailResponse
  ): void => {
    const allowed = this.voucherTypeByDtlType[rowData.PCS_DtlType ?? ''];
    if (!allowed || !allowed.includes(rowData.PUR_VoucherType ?? '')) {
      rowData.PUR_VoucherType = '';
    }
  };

  // 發票格式：明細類別為發票(1)或收據(2)時必填；不扣抵憑證(0)時免填
  validateVoucherTypeRequired = (
    value: unknown,
    rowData?: QueryFIN72010DetailDetailResponse
  ): { isValid: boolean; errorMessage: string[] } => {
    const dtlType = rowData?.PCS_DtlType;
    const needRequired = dtlType === '1' || dtlType === '2';
    const isEmpty = value === null || value === undefined || value.toString().trim() === '';

    if (needRequired && isEmpty) {
      return { isValid: false, errorMessage: ['必填'] };
    }

    return { isValid: true, errorMessage: [] };
  };

  // 根據明細類別決定是否驗證發票/收據號碼為必填
  validateGUINoRequired = (
    value: any,
    rowData?: any
  ): { isValid: boolean; errorMessage: string[] } => {
    const dtlType = rowData?.PCS_DtlType;

    // 1 = 發票 2 = 收據
    const needRequired = dtlType === '1' || dtlType === '2';

    if (needRequired && !value) {
      return {
        isValid: false,
        errorMessage: ['發票/收據號碼為必填']
      };
    }

    return {
      isValid: true,
      errorMessage: []
    };
  };

  // 清除使用者選擇的資料
  clearUser(type: 'PCS' | 'Keep'): void {
    if (type === 'PCS') {
      this.dataForm.patchValue({
        PCS_UsrNo: null,
        PCS_UsrName: '',
        PCS_UsrDisplay: '',
        PCS_OrgID: null
      });
      return;
    }

    this.dataForm.patchValue({
      Keep_UsrNo: null,
      Keep_UsrName: '',
      Keep_UsrDisplay: '',
      Keep_OrgID: null
    });
  }

  private getUserDisplay(user: UserOrgOption): string {
    return `${user.user_No ?? ''} - ${user.user_Name ?? ''}`;
  }

  private getLoginUserInfo(): LoginUserInfo | null {
    try {
      const rawUserInfo = localStorage.getItem('UserInfo');

      if (!rawUserInfo) {
        console.warn('[FIN72010] localStorage 找不到 UserInfo');
        return null;
      }

      return JSON.parse(rawUserInfo) as LoginUserInfo;
    } catch (error) {
      console.error('[FIN72010] UserInfo JSON 解析失敗：', error);
      return null;
    }
  }

  /** 新增模式預設申請人為目前登入者 */
  private setDefaultApplicant(): void {
    if (this.crudstatus !== CRUDStatus.Create) {
      return;
    }

    if (this.dataForm.controls.PCS_UsrNo.value) {
      return;
    }

    const loginUserInfo = this.getLoginUserInfo();
    const loginUserNo = String(
      loginUserInfo?.user_No ??
      loginUserInfo?.USER_No ??
      ''
    ).trim();

    if (!loginUserNo) {
      console.warn('[FIN72010] UserInfo 找不到 user_No');
      return;
    }

    const matchedUser = this.allUserResultData().find(
      user =>
        String(user.user_No ?? '').trim().toLowerCase() ===
        loginUserNo.toLowerCase()
    );

    if (matchedUser) {
      this.dataForm.patchValue({
        PCS_UsrNo: matchedUser.user_No,
        PCS_UsrName: matchedUser.user_Name,
        PCS_UsrDisplay: this.getUserDisplay(matchedUser),
        PCS_OrgID: matchedUser.Org_ID
      });

      console.log('[FIN72010] 已帶入登入申請人：', matchedUser);
      return;
    }

    const loginUserName = String(
      loginUserInfo?.user_Name ??
      loginUserInfo?.USER_Name ??
      ''
    ).trim();

    this.dataForm.patchValue({
      PCS_UsrNo: loginUserNo,
      PCS_UsrName: loginUserName,
      PCS_UsrDisplay: loginUserName
        ? `${loginUserNo} - ${loginUserName}`
        : loginUserNo,
      PCS_OrgID: null
    });

    console.warn(
      `[FIN72010] 使用者清單找不到 ${loginUserNo}，無法帶入組織代號`
    );
  }

  // 從下拉選單選項中取得使用者名稱
  private getUserNameFromOptions(userNo: string | null | undefined): string {
    if (!userNo) {
      return '';
    }

    const option = this.allUserResultData()
      .find(item => item.user_No === userNo);

    if (!option?.user_Name) {
      return '';
    }

    return option.user_Name;
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

    // 零用金申請人、零用金保管人
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

        // 使用者清單載入完成後，再依登入帳號帶入申請人
        this.setDefaultApplicant();
      },
      error: error => {
        console.error('[FIN72010] 使用者及組織資料載入失敗：', error);
      }
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

    // 明細類別
    this.fin72010Service.querySYS1000_DropDownList('PCS_DtlType').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.PCS_DtlType_Options.set(options);
      },
    });

    // 發票格式
    this.fin72010Service.querySYS1000_DropDownList('PUR_GUIPaper').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.PUR_VoucherType_Options.set(options);
      },
    });

    // 發票用途
    this.fin72010Service.querySYS1000_DropDownList('PUR_DirectType').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.PUR_DirectType_Options.set(options);
      },
    });


    // 課稅別
    this.fin72010Service.querySYS1000_DropDownList('PUR_TaxType').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.PCS_TaxType_Options.set(options);
      },
    });

    // 扣抵代號
    this.fin72010Service.querySYS1000_DropDownList('PUR_DiscNo').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.PUR_DiscNo_Options.set(options);
      },
    });

    // 費用會計科目
    this.fin72010Service.queryGLS1005_FASExpAccNo_DropDownList('').subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = res.Data.map(item => ({
          label: item.AccDisplay ?? '',
          value: item.AccNo ?? '',
        }));
        this.AccNo_Options.set(options);
      },
    });

  }

}