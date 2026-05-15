import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72010Service, QueryFIN72010DetailDetailResponse, QueryFIN72010DetailRequest, saveFIN72010Request } from '@service/api/fin/fin72010.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { ConfirmationService } from 'primeng/api';
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
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from './../../../shared/models/system/CRUDstatus';

// POS2064 收支明細檔
export interface POS2064 {
  id: number | null; // 明細ID，新增時為null
  type01: string; // 會計費用科目
  type02: string; // 項目摘要
  type03: string; // 組織代號
  type04: string; // 明細類別
  type05: string; // 發票格式
  type06: string; // 發票/收據號碼
  type07: string; // 發票日期
  type08: string; // 申報年月
  type09: string; // 廠商統一編號
  type10: string; // 發票用途
  type11: string; // 發票總金額
  type12: string; // 課稅別
  type13: string; // 發票未稅金額
  type14: string; // 發票稅額
  type15: string; // 扣抵代號
  type16: string; // 彙總張數
  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
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
    RadiobuttonComponent,
    EditorTextComponent,
    ExpandableEditTableComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
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
    PCS_No: [{ value: null, disabled: true }, [Validators.required, Validators.maxLength(20)]], // 零用金單號
    PCS_Date: [null, [Validators.required]], // 申請日期
    PCS_UsrNo: [null, [Validators.required]], // 申請人
    PCS_UsrName: ['', [Validators.required]], // 申請人名稱
    Keep_UsrNo: [null, [Validators.required]], // 保管人
    Keep_UsrName: ['', [Validators.required]], // 保管人名稱
    PCS_OrgID: [null, [Validators.required, Validators.maxLength(20)]], // 申請人組織代號
    Keep_OrgID: [null, [Validators.required, Validators.maxLength(20)]], // 保管人組織代號
    //keepingUnitName: ['', [Validators.maxLength(20)]], // 保管單位名稱
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

  vendorOptions: option[] = [];  //廠商編號: 資料讀 POS2013
  // -----------------------------------------------------------------------
  // 「零用金申請人」與「零用金保管人」使用者對話框的變數
  userDialogVisible = false;
  userQueryForm!: FormGroup;

  // 原始完整資料
  allUserResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);
  // 畫面目前顯示資料
  userResultData = signal<{ user_No: string; user_Name: string; Org_ID: string; Org_Name: string }[]>([]);

  selectedUser: any = null;
  selectedUserName = '';
  // 目前選擇的使用者類別
  currentUserTarget: 'PCS_UsrNo' | 'Keep_UsrNo' | null = null;


  // ---POS2064 -------------
  POS2064Detail: POS2064[] = [];
  // ---------明細 (POS2064) 編輯表格 至少要一筆-------------------------------------------------------
  Detaildata: QueryFIN72010DetailDetailResponse[] = [];
  orgDetaildata: POS2064[] = []; // POS2064(備分)
  selectedPOS2064Items: POS2064[] = [];
  // 預設新項目模板
  defaultNew2064 = {
    id: 0, //新增
    type01: 'item.type01',
    type02: 'item.type02',
    type03: 'item.type03',
    type04: 'item.type04',
    type05: 'item.type05',
    type06: 'item.type06',
    type07: 'item.type07',
    type08: 'item.type08',
    type09: 'item.type09',
    type10: 'item.type10',
    type11: 'item.type11',
    type12: 'item.type12',
    type13: 'item.type13',
    type14: 'item.type14',
    type15: 'item.type15',
    type16: 'item.type16',

    status: 'new'
  };


  //「保管單位」對話框的變數
  keepDeptDialogVisible = false;
  keepDeptQueryForm!: FormGroup;

  keepDeptResultData: any[] = [];
  selectedKeepDept: any = null;

  // 預設 POS2064 新項目模板 (最後進價=POS2004的標準進價PLU_OrderPrc)
  createDefaultNew2064() {
    this.defaultNew2064 = {
      id: 0,
      type01: 'item.type01',
      type02: 'item.type02',
      type03: 'item.type03',
      type04: 'item.type04',
      type05: 'item.type05',
      type06: 'item.type06',
      type07: 'item.type07',
      type08: 'item.type08',
      type09: 'item.type09',
      type10: 'item.type10',
      type11: 'item.type11',
      type12: 'item.type12',
      type13: 'item.type13',
      type14: 'item.type14',
      type15: 'item.type15',
      type16: 'item.type16',

      status: 'new'
    };
  }

  constructor(
    private tls51070Service: Tls51070Service,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private fin72010Service: FIN72010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', this.dataForm);
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
      { field: 'AccNo', header: '費用會計科目', type: 'dropdown', width: '12rem', options: this.PCS_No_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'NOTeDesc', header: '項目摘要', type: 'input', width: '12rem', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'ORG_ID', header: '組織代號', type: 'dropdown', width: '12rem', options: this.keepingUnit_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PCS_DtlType', header: '明細類別', type: 'dropdown', width: '12rem', options: this.PCS_DtlType_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
      { field: 'PUR_VoucherType', header: '發票格式', type: 'dropdown', width: '12rem', options: this.PUR_VoucherType_Options, optionLabel: 'label', optionValue: 'value', validate: [validateRequired], disabled: () => this.crudstatus === CRUDStatus.Read },
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
            console.log('讀取表單', frm);

            const updateRequest: saveFIN72010Request = {
              ActionMode: 'I',
              PCS_Date: this.dataForm.getRawValue().PCS_Date || '',
              PCS_UsrNo: this.dataForm.getRawValue().PCS_UsrNo || '',
              PCS_UsrName: this.dataForm.getRawValue().PCS_UsrName || '',
              PCS_OrgID: this.dataForm.getRawValue().PCS_OrgID || '',
              Keep_UsrNo: this.dataForm.getRawValue().Keep_UsrNo || '',
              Keep_UsrName: this.dataForm.getRawValue().Keep_UsrName || '',
              Keep_OrgID: this.dataForm.getRawValue().Keep_OrgID || '',
              Details: this.Detaildata
                .map(item => ({
                  id: null, // 新增時ID為null
                  RowAction: 'I', // 新增
                  AccNo: item.AccNo,
                  NOTeDesc: item.NOTeDesc,
                  ORG_ID: item.ORG_ID,
                  PCS_DtlType: item.PCS_DtlType,
                  PUR_VoucherType: item.PUR_VoucherType,
                  PCS_GUINo: item.PCS_GUINo,
                  PUR_Date: item.PUR_Date,
                  DEC_YM: this.formatDateToYm(item.DEC_YM_Date),
                  PCS_Net: item.PCS_Net,
                  PCS_Tax: item.PCS_Tax,
                  VEN_UniformNum: item.VEN_UniformNum,
                  PUR_DiscNo: item.PUR_DiscNo,
                  PCS_TaxType: item.PCS_TaxType,
                  PUR_DirectType: item.PUR_DirectType,
                  COLLECT_NUM: item.COLLECT_NUM,
                  PCS_Remark: item.PCS_Remark
                }))
            };
            console.log('送出資料', updateRequest);
            this.fin72010Service.saveFIN72010(updateRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                if (response.Data.Summary.IsSuccess !== 1) {
                  this.messageService.errorBubble(response.Data.Summary.Message || '修改失敗');
                }
                else {
                  this.messageService.successBubble(response.Data.Summary.Message || '修改成功');
                }
                this.onCancel();  // 返回查詢頁
              })
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('讀取表單', frm);
            const editRequest: saveFIN72010Request = {
              ActionMode: 'U',
              PCS_Date: this.dataForm.getRawValue().PCS_Date || '',
              PCS_UsrNo: this.dataForm.getRawValue().PCS_UsrNo || '',
              PCS_UsrName: this.dataForm.getRawValue().PCS_UsrName || '',
              PCS_OrgID: this.dataForm.getRawValue().PCS_OrgID || '',
              Keep_UsrNo: this.dataForm.getRawValue().Keep_UsrNo || '',
              Keep_UsrName: this.dataForm.getRawValue().Keep_UsrName || '',
              Keep_OrgID: this.dataForm.getRawValue().Keep_OrgID || '',
              Details: this.Detaildata
                .map(item => ({
                  id: item.id,
                  RowAction: item.status
                    ? item.status === 'new'
                      ? 'I' // 新增
                      : item.status === 'modified'
                        ? 'U' // 修改
                        : item.status === 'deleted'
                          ? 'D' // 刪除
                          : 'U' // 預設為修改
                    : 'U', // 如果沒有status屬性，預設為修改
                  AccNo: item.AccNo,
                  NOTeDesc: item.NOTeDesc,
                  ORG_ID: item.ORG_ID,
                  PCS_DtlType: item.PCS_DtlType,
                  PUR_VoucherType: item.PUR_VoucherType,
                  PCS_GUINo: item.PCS_GUINo,
                  PUR_Date: item.PUR_Date,
                  DEC_YM: item.DEC_YM,
                  PCS_Net: item.PCS_Net,
                  PCS_Tax: item.PCS_Tax,
                  VEN_UniformNum: item.VEN_UniformNum,
                  PUR_DiscNo: item.PUR_DiscNo,
                  PCS_TaxType: item.PCS_TaxType,
                  PUR_DirectType: item.PUR_DirectType,
                  COLLECT_NUM: item.COLLECT_NUM,
                  PCS_Remark: item.PCS_Remark
                }))
            };
            console.log('送出資料', editRequest);
            this.fin72010Service.saveFIN72010(editRequest)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                if (response.Data.Summary.IsSuccess !== 1) {
                  this.messageService.errorBubble(response.Data.Summary.Message || '修改失敗');
                }
                else {
                  this.messageService.successBubble(response.Data.Summary.Message || '修改成功');
                }
                this.onCancel();  // 返回查詢頁
              })
          }
          break;
      }
    });

    this.messageService.unblockUi();
    this.submitted = false;
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
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
      console.log('讀取key', this.dataForm.value)
      if (this.crudstatus !== CRUDStatus.Create) {
        this.messageService.infoBubble('key為空，不載入明細檔'); //編輯、查看模式如果沒有明細檔就跳出提示
      }
    } else {
      const req: QueryFIN72010DetailRequest = { PCS_No: this.dataForm.get('PCS_No')?.value || '' };
      this.fin72010Service.queryFIN72010Detail(req).pipe(untilDestroyed(this)).subscribe((response) => {
        console.log('API 回傳資料', response);
        this.Detaildata = (response.Data?.Details ?? []).map(item => ({
          ...item,
          DEC_YM_Date: this.parseYmToDate(item.DEC_YM)
        }));

        console.log('明細 Detaildata', this.Detaildata);
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
  reset51070() {
    // 將明細檔重新刷新
    if (this.crudstatus == CRUDStatus.Create) {
      this.isRefreshing = true
      this.Detaildata = [];
      this.isRefreshing = false
    } else if (this.crudstatus == CRUDStatus.Edit) {
      if (this.orgdataForm) {
        this.isRefreshing = true;

        const magno = this.dataForm.get('PLU_MagNo')?.value;

        this.loadDetail(magno || '')
          .then(() => {
            console.log('編輯模式重製完成', this.dataForm.value);
            this.isRefreshing = false;
          })
          .catch(() => {
            this.isRefreshing = false;
          });

        // this.Detaildata = this.orgDetaildata;
      }
    } else {
      console.log('查看模式無須重製');
    }
  }

  // #region 明細檔 驗證
  validate2064Row = (rowData: QueryFIN72010DetailDetailResponse): { isValid: boolean; errorMessage: string } => {
    const venNo = rowData?.VEN_UniformNum?.trim();
    const currentId = rowData?.id;

    //  檢查廠商編號是否為空
    if (!venNo) {
      return { isValid: false, errorMessage: '廠商編號不可為空，請輸入有效的廠商編號。' };
    }

    // 檢查重複（包含新增中未有 id 的情況）
    const isDuplicate = this.Detaildata.some((item, _index, array) => {
      if (!item.AccNo) return false;

      // 編輯同筆資料不用比對
      if (item.id && currentId && item.id === currentId) return false;

      // 新增中沒有 id，用索引判斷是不是自己
      if (!item.id && !currentId) {
        const currentIndex = array.indexOf(rowData.AccNo === item.AccNo ? rowData : item);
        return item.AccNo === venNo && array.indexOf(item) !== currentIndex;
      }

      // 其他一般情況
      return item.AccNo === venNo && item.id !== currentId;
    });

    if (isDuplicate) {
      return {
        isValid: false,
        errorMessage: `會計費用科目 ${venNo} 已存在，請使用其他編號。`,
      };
    }

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
    //this.userResultData = [];
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
    //this.userResultData = [];
    this.selectedUser = null;
  }

  onSelectUser(row: any): void {
    console.log('選到的使用者', row);

    //this.selectedUserName = `${row.user_No} - ${row.user_Name}`;
    if (!this.currentUserTarget) return;

    this.dataForm.patchValue({
      [this.currentUserTarget]: row.user_No,
      [`${this.currentUserTarget}Name`]: `${row.user_No} - ${row.user_Name}`
    });


    if (this.currentUserTarget === 'PCS_UsrNo') {
      this.dataForm.patchValue({
        PCS_OrgID: row.Org_ID, // 申請人組織代號
      });
    }
    else if (this.currentUserTarget === 'Keep_UsrNo') {
      this.dataForm.patchValue({
        Keep_OrgID: row.Org_ID, // 保管人組織代號
      });
    }

    this.userDialogVisible = false;
    this.currentUserTarget = null;
  }

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
  }

}
