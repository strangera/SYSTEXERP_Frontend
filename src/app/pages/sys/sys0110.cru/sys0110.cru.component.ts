import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { IDropdownItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { ValidationService } from '@shared/service/validation.service';
import { TreeNode } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { TreeSelectModule } from 'primeng/treeselect';
import { finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { UserCodeService } from '../../../service/system/user-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { user_priorityOptions, UserInfo, UserSys3700Detail } from '../sys0110/sys0110.model';
@Component({
  selector: 'app-sys0110-cru',
  templateUrl: './sys0110.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    NgIf,
    CalendarComponent,
    TranslateModule,
    TableEditComponent,
    AsyncPipe,
    MultiSelectComponent,
    MultiSelectModule,
    TreeSelectModule,
  ],
})
export class SYS0110CRUComponent extends BasicCruPageComponent<UserInfo> implements OnInit {
  @ViewChild('multiSelectTemp', { static: true }) multiSelectTemp!: TemplateRef<any>;
  @ViewChild('table2') tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    user_No: ['', [Validators.required, Validators.maxLength(10), this.validationService.englishNumberSymbolValidator]], // 使用者編號
    user_Name: ['', [Validators.required, Validators.maxLength(20)]], // 使用者名稱
    user_Password: ['', [Validators.required, this.validationService.englishNumberSymbolValidator]], // 使用者密碼-加密
    title: [null, Validators.maxLength(6)], // 職位-SYS1000 (就是職位)
    org_ID: [null, [Validators.required, Validators.maxLength(20)]], // 組織編號 (SYSB400_SYS3100)
    str_date: [null], // 帳號有效開始日期
    end_date: [null], // 帳號有效結束日期
    status: ['1', [Validators.required, Validators.maxLength(1)]], // 使用者狀態 1=有效 2=停用
    user_type: [null, [Validators.required, Validators.maxLength(1)]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他
    user_email: ['', [Validators.email, Validators.maxLength(100)]], // 使用者email帳號
    TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: [null, Validators.maxLength(1)], // 使用者等級
    USER_PwdExpireDate: [{ value: null, disabled: true }], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼
    last_Login: [null], // 上次登入時間
    CRT_Date: [{ value: null, disabled: true }], // 建立日期
    CRT_USR_No: [{ value: '', disabled: true }], // 建立人員編號
    CRT_USR_Name: [{ value: '', disabled: true }], // 建立人員名稱
    UPD_Date: [{ value: null, disabled: true }], // 更新日期
    UPD_USR_No: [{ value: '', disabled: true }], // 更新人員編號
    UPD_USR_Name: [{ value: '', disabled: true }], // 更新人員名稱
    // 專櫃權限
    FLOOR_ID: [[] as null | number[]], // 樓層代碼
    AREA_ID: [[] as null | number[]], // 樓層代碼
    STORE_ID: [[] as null | number[]], // 樓層代碼
    BTYPE_ID: [[] as null | number[]], // 樓層代碼
  });
  // 下拉選單選項
  titleOptions = getSYS1000Options('T103');
  userStatusOptions = getSYS1000Options('status');
  userTypeOptions = getSYS1000Options('user_type')
  SYS3100_Options$ = this.dropDown.querySys3100();
  SYS3700_Options$ = this.dropDown.querySys3800();
  SYS3800_Options$ = this.dropDown.querySys3900();
  SYS3A00_Options$ = this.dropDown.querySys3A00();
  TLTTALENT_OPTIONS$ = this.dropDown.queryTltTalent();
  BUS_TypeOptions$ = this.dropDown.queryTltBusType();
  user_priorityOptions = user_priorityOptions;

  // 新增：用來存放所有選項的實體陣列，供全選判定使用
  private orgOptionsList: Option[] | null = null;
  private buildingOptionsList: IDropdownItem[] | null = null;
  private floorOptionsList: IDropdownItem[] | null = null;
  private areaOptionsList: IDropdownItem[] | null = null;
  private tltTalentOptionsList: Option[] | null = null;
  private busTypeOptionsList: Option[] | null = null;

  sysTreeOptions: TreeNode[] = [];
  private sysIdOptionsList: any[] = []; // 改為 any[] 因為我們要用到 CRT_USR_Name
  private sysSubModuleList: any[] = [];

  data: UserSys3700Detail[] = [];
  selectedRows: UserSys3700Detail[] = [];
  columns: EditColumn[] = [
    { field: 'Org_ID', header: '組織代碼', type: 'dropdown', options: this.SYS3100_Options$, optionsAsync: true, optionLabel: 'label', optionValue: 'value' },
    { field: 'Building_No', header: '館別代碼', width: '110px', type: 'dropdown', options: this.SYS3700_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No' },
    { field: 'Floor_No', header: '樓層代碼', width: '110px', type: 'dropdown', options: this.SYS3800_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No' },
    { field: 'Area_No', header: '區域代碼', width: '110px', type: 'dropdown', options: this.SYS3A00_Options$, optionsAsync: true, optionLabel: 'Name', optionValue: 'No' },
    { field: 'TLT_No', header: '專櫃編號', type: 'dropdown', options: this.TLTTALENT_OPTIONS$, optionsAsync: true, optionLabel: 'label', optionValue: 'value' },
    { field: 'TLT_Kind', header: '專櫃類型', width: '110px', type: 'dropdown', options: getSYS1000Options('TLT_Kind'), optionLabel: 'label', optionValue: 'value' },
    { field: 'BUS_Type', header: '大分類代碼', type: 'dropdown', options: this.BUS_TypeOptions$, optionsAsync: true, optionLabel: 'label', optionValue: 'value' },
  ];
  columnsReportRole: EditColumn[] = [
    { field: 'ORG_ID', header: '組織代碼', width: '50%', type: 'custom', options: this.SYS3100_Options$, optionsAsync: true, optionLabel: 'label', optionValue: 'value' },
    { field: 'SYS_ID', header: '系統代碼', width: '50%', type: 'custom', options: getSYS1000Options('SYS_ID'), optionLabel: 'label', optionValue: 'value' }
  ];
  reportRoleData: any[] = [];
  selectedReportRoleRows: any[] = [];
  constructor(
    private readonly sys0110Service: Sys0110Service,
    private readonly encrypt: EncryptionService,
    private readonly userCodeService: UserCodeService,
    private readonly validationService: ValidationService,
    private readonly dropDown: DropdownApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }
  onRoleValueChange(rowData: any, col: EditColumn, value: any, index: number) {
    // 通知共通元件這格的值改了，觸發 modified 狀態
    if (this.tableEditComponent) {
      this.tableEditComponent.onValueChange(rowData, value, col, index);
      this.cdr.detectChanges();
    }
  }
  ngOnInit(): void {
    this.initializePage('SYS0110', this.dataForm);
    this.SYS3100_Options$.pipe(untilDestroyed(this)).subscribe(res => this.orgOptionsList = res);
    this.SYS3700_Options$.pipe(untilDestroyed(this)).subscribe(res => this.buildingOptionsList = res);
    this.SYS3800_Options$.pipe(untilDestroyed(this)).subscribe(res => this.floorOptionsList = res);
    this.SYS3A00_Options$.pipe(untilDestroyed(this)).subscribe(res => this.areaOptionsList = res);
    this.TLTTALENT_OPTIONS$.pipe(untilDestroyed(this)).subscribe(res => this.tltTalentOptionsList = res);
    this.BUS_TypeOptions$.pipe(untilDestroyed(this)).subscribe(res => this.busTypeOptionsList = res);
    // 獲取選項
    this.sysIdOptionsList = SystemOptionsService.getOptions('SYS_ID'); // 直接拿原始物件，包含 CRT_USR_Name
    this.sysSubModuleList = SystemOptionsService.getOptions('SYS_SubModule');
    // 組建樹狀結構
    this.sysTreeOptions = this.buildSysTree(this.sysSubModuleList, this.sysIdOptionsList);
    if (this.rowdata && !this.isFormCreateable) {
      this.dataForm.get('user_No')?.disable();
      this.dataForm.get('user_Password')?.disable();
      this.sys0110Service.queryUserDetail({ user_No: this.rowdata.user_No }).subscribe((response: any) => {
        // 1. 回填表格一 (SYS3700)
        this.data = [...response.Data.QueryData];
        // 2. 回填表格二 (tblUserContractReportRole)
        // 需要將後端傳回來的 "xx" 或 "A#B" 轉回 MultiSelect 認識的陣列
        this.reportRoleData = response.Data.ReportRoleData.map((role: any) => {
          return {
            ...role,
            // 這裡呼叫一個轉回陣列的輔助函式
            ORG_ID: this.parseSAString(role.ORG_ID, 'ORG_ID'),
            SYS_ID_TreeNodes: this.parseSysIdToNodes(role.SYS_ID),
            SYS_ID: role.SYS_ID,
            // 如果你的 FLOOR_ID 等是在 form 裡的，也要回填給 form
          };
        });

        // 3. 回填底部的 Multi-Select (FormControls)
        // 假設你只取第一筆權限作為底部 UI 的顯示來源
        if (response.Data.ReportRoleData.length > 0) {
          const firstRole = response.Data.ReportRoleData[0];
          this.dataForm.patchValue({
            FLOOR_ID: this.parseSAString(firstRole.FLOOR_ID, 'FLOOR_ID'),
            AREA_ID: this.parseSAString(firstRole.AREA_ID, 'AREA_ID'),
            STORE_ID: this.parseSAString(firstRole.STORE_ID, 'STORE_ID'),
            BTYPE_ID: this.parseSAString(firstRole.BTYPE_ID, 'BTYPE_ID'),
          });
        }

        this.cdr.detectChanges();
      });
    }
    this.dataForm.get('org_ID')?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (this.isFormCreateable && value && this.data.length === 0) {
        this.data = [{ ID: 0, User_No: this.dataForm.get('user_No')?.value, Org_ID: value, Building_No: null, Floor_No: null, Area_No: null, TLT_No: null, TLT_Kind: null, BUS_Type: null }];
      }
    });
  }

  // 模擬將 SYS_ID 選項轉成 Tree 結構的函式
  buildSysTree(parents: any[], children: any[]): TreeNode[] {
    if (!parents) return [];

    return parents.map(p => ({
      label: `${p.SYS_Code} - ${p.SYS_Name}`,
      data: p.SYS_Code,
      key: p.SYS_Code,
      selectable: true,
      children: children
        // 使用你 SQL 修正後的欄位做精確關聯
        .filter(c => c.CRT_USR_Name === p.SYS_Code)
        .map(c => ({
          label: `${c.SYS_Code} - ${c.SYS_Name}`,
          data: c.SYS_Code,
          key: c.SYS_Code,
          selectable: true
        }))
    }));
  }

  onTreeValueChange(rowData: any, col: EditColumn, index: number) {
    const selectedNodes: TreeNode[] = rowData[col.field + '_TreeNodes'] || [];

    // 邏輯：如果父節點被選取，我們只拿父節點的值（符合你說的套用全部）
    // 或者根據後端需求，拿到所有選中的 leaf 節點。
    // 這裡採用你要求的：選了父就代表子。
    const values = selectedNodes.map(node => node.key);

    // 同步回原始欄位 (以 # 串接)
    rowData[col.field] = values.join('#');

    // 通知 Table 更新狀態
    if (this.tableEditComponent) {
      this.tableEditComponent.onValueChange(rowData, rowData[col.field], col, index);
      this.cdr.detectChanges();
    }
  }
  private parseSysIdToNodes(val: string | null): TreeNode[] {
    if (!val || this.sysTreeOptions.length === 0) return [];

    const nodes: TreeNode[] = [];
    const isAllSelected = val === 'xx';
    const keys = isAllSelected ? [] : val.split('#');

    const findNodes = (treeNodes: TreeNode[]) => {
      treeNodes.forEach(node => {
        // 如果是 xx (全選)，直接加入節點；否則比對 key
        if (isAllSelected || keys.includes(node.key!)) {
          nodes.push(node);
        }
        if (node.children) {
          findNodes(node.children);
        }
      });
    };

    findNodes(this.sysTreeOptions);
    return nodes;
  }

  private parseSAString(val: string | null, type: string): any[] {
    if (!val) return [];
    if (val === 'xx') {
      // 如果是全選，拿對應的 optionsList 裡所有的 value
      const options = this.getOptionsArray(type);
      // 這裡要注意你的 optionValue 是 'No' 還是 'value'
      const valueField = (type === 'FLOOR_ID' || type === 'AREA_ID') ? 'No' : 'value';
      return options ? options.map((opt: any) => opt[valueField]) : [];
    }
    return val.split('#');
  }
  private getOptionsArray(type: string): any {
    switch (type) {
      case 'ORG_ID': return this.orgOptionsList;
      case 'SYS_ID': return this.sysIdOptionsList;
      case 'BTYPE_ID': return this.busTypeOptionsList;   // 根據 HTML 對應關係
      case 'FLOOR_ID': return this.floorOptionsList;
      case 'AREA_ID': return this.areaOptionsList;
      case 'STORE_ID': return this.tltTalentOptionsList; // 根據 HTML 對應關係
      default: return [];
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data.some((item: UserSys3700Detail) => !item.Org_ID && !item.Building_No && !item.Floor_No && !item.Area_No && !item.TLT_No && !item.TLT_Kind && !item.BUS_Type)) {
        this.messageService.errorBubble('請至少填寫一個組織代碼、館別代碼、樓層代碼、區域代碼、專櫃編號、專櫃類型或大分類代碼');
        return;
      }
      const today = new Date();
      const expireDate = new Date(today);
      expireDate.setDate(today.getDate() + 90);
      const formatForSA = (selectedIds: any[], totalOptions: any[]) => {
        // 確保它是陣列，如果不是陣列（例如是 null 或已經是字串），就回傳原始值或處理它
        if (!Array.isArray(selectedIds)) {
          return selectedIds;
        }
        if (selectedIds.length === 0) return null;
        if (totalOptions && selectedIds.length === totalOptions.length && totalOptions.length > 0) {
          return 'xx';
        }
        return selectedIds.join('#');
      };
      const allSysIdCodes = [
        ...(this.sysSubModuleList?.map(m => m.SYS_Code) || []),
        ...(this.sysIdOptionsList?.map(c => c.SYS_Code) || [])
      ];
      const body = {
        ...frm.value,
        id: this.rowdata?.id,
        user_Password: this.isFormCreateable ? this.encrypt.getPassword(frm.value.user_No, frm.value.user_Password) : undefined,
        user_No: frm.get('user_No')?.value,
        USER_PwdExpireDate: expireDate.toISOString(),
        sys3700: this.data.map((item: UserSys3700Detail) => ({
          ...item,
          User_No: frm.get('user_No')?.value,
        })),
        userContractReportRole: this.reportRoleData.map(role => {
          // 【關鍵修正】：從選中的 TreeNodes 中提取 key 陣列
          const sysIdArray = (role.SYS_ID_TreeNodes as TreeNode[])?.map(node => node.key) || [];

          return {
            USER_ID: frm.get('user_No')?.value,
            ORG_ID: formatForSA(role.ORG_ID, this.getOptionsArray('ORG_ID')),
            // 這裡傳入提取後的陣列
            SYS_ID: formatForSA(sysIdArray, allSysIdCodes),
            FLOOR_ID: formatForSA(frm.value.FLOOR_ID, this.getOptionsArray('FLOOR_ID')),
            AREA_ID: formatForSA(frm.value.AREA_ID, this.getOptionsArray('AREA_ID')),
            STORE_ID: formatForSA(frm.value.STORE_ID, this.getOptionsArray('STORE_ID')),
            BTYPE_ID: formatForSA(frm.value.BTYPE_ID, this.getOptionsArray('BTYPE_ID')),
          };
        })
      };
      const serviceCall = this.isFormCreateable ? this.sys0110Service.createUser(body) : this.sys0110Service.updateUser(body);
      serviceCall.pipe(untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message || (this.isFormCreateable ? '建立成功' : '更新成功'));
        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.resetTable();
        } else if (this.isFormEditable) {
          this.onCancel();
        }
      });
    });
  }

  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }

  resetLoading = false;
  showStar = true;
  resetPassword() {
    const body = {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo || '',
      User_No: this.dataForm.get('user_No')?.value || '',
    }
    this.userCodeService.resetPassword(body).pipe(untilDestroyed(this), finalize(() => this.resetLoading = false)).subscribe(response => {
      this.messageService.successBubble(`${this.dataForm.get('user_No')?.value} 密碼重置成功，密碼為：${response.Data}`);
      this.dataForm.get('user_Password')?.setValue(response.Data);
      this.showStar = false;
    });
  }
}
