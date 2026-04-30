import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
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
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from './../../../shared/models/system/CRUDstatus';

// POS2064M 收支主檔
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
export class FIN72010CRUComponent extends BasicCruPageComponent<sample72010> implements OnInit {
  isRefreshing = false; // 是否是重製表單狀態(預設為false)
  orgdataForm: any;
  dataForm = this.formBuilder.group({
    id: [{ value: 0, disabled: true }], // 主鍵ID;
    KeepQuota_No: [null, [Validators.maxLength(20)]], // 零用金單號
    applyDate: [null], // 申請日期
    Pettycashapplicant: [null], // 申請人
    PettycashapplicantName: [''], // 申請人名稱
    Pettycashcustodian: [null], // 保管人
    PettycashcustodianName: [''], // 保管人名稱
    //Debitamount: [null, Validators.max(9999999999)], // 申請人組織代號
    applicantUnit: [null, [Validators.maxLength(20)]], // 申請人組織代號
    custodianUnit: [null, [Validators.maxLength(20)]], // 保管人組織代號
    keepingUnitName: ['', [Validators.maxLength(20)]], // 保管單位名稱
  });
  // 基本資料dropdown
  KeepQuota_No_Options: apiOption[] = [
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
  keepingUnit_Options: apiOption[] = [
    { No: 'KU001', Name: '保管單位1', Label: 'KU001 - 保管單位1' },
    { No: 'KU002', Name: '保管單位2', Label: 'KU002 - 保管單位2' },
    { No: 'KU003', Name: '保管單位3', Label: 'KU003 - 保管單位3' },
  ];

  vendorOptions: option[] = [];  //廠商編號: 資料讀 POS2013
  // -----------------------------------------------------------------------
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

  // ---POS2064 -------------
  POS2064Detail: POS2064[] = [];
  // ---------明細 (POS2064) 編輯表格 至少要一筆-------------------------------------------------------
  // #region POS2064定義
  // 廠商編號	下拉
  POS2064Data: POS2064[] = [];
  orgPOS2064Data: POS2064[] = []; // POS2064(備分)
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

  // POS2064 展開式表格的欄位定義
  POS2064DataColumn: EditColumn[] = []; // 等廠商編號好了再寫入POS2064欄位(廠商下拉)
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
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', this.dataForm);
    //導入下拉清單
    this.loadOptions();

    if (this.crudstatus == CRUDStatus.Edit || this.crudstatus == CRUDStatus.Read) {
      //查詢明細檔案 (編輯模式)
      console.log('編輯模式，明細檔讀取中', this.dataForm.value);

      //讀取明細檔 並載入預設值 (商品管理編號、目前進價)
      this.isRefreshing = true;
      this.loadDetail(this.dataForm.get('PLU_MagNo')?.value || '')
        .then(() => {
          this.isRefreshing = false; // ✅ 等 loadDetail 完成後再關
        })
        .catch(() => {
          this.isRefreshing = false;
        });
    }

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

  // #region onSubmit
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('讀取表單', frm);
            // this.tls51070Service.insertTLS51070(requestBody).subscribe(async (response) => {
            //   this.messageService.successBubble('POS2004主檔新增成功');

            //   const newSeqNo = response?.Data; // 回傳的 IMG_SeqNo
            //   console.log('新增取號:', newSeqNo);
            //   this.onCancel();
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('讀取表單', frm);
            // this.tls51070Service.updateTLS51070(requestBody).subscribe({
            //   next: async () => {
            //     // 用 this.img1001Data 裡的 IMG_SeqNo 呼叫 createImage
            //     const seqNo = this.dataForm.get('PLU_MagNo')?.value; //圖片編號抓商品管理碼
            //     this.onCancel(); // 儲存後，會返回列表
            //   }
            // });
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

  // #region 明細檔 下拉選項
  loadOptions() {
    this.tls51070Service
      .queryPOS2013_DropDownList({ "VEN_Flag": '1' }).pipe(untilDestroyed(this)).subscribe((response) => {
        this.vendorOptions = response.Data.map((item: any) => ({
          value: item.VEN_No,
          label: item.VEN_No + '-' + item.Name,
        }));

        // 等廠商編號好了再寫入POS2064欄位(廠商下拉)
        this.POS2064DataColumn = [
          { field: 'type01', header: '費用會計科目', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'value', options: this.vendorOptions },
          { field: 'type02', header: '項目摘要', type: 'input', width: '12rem' },
          { field: 'type03', header: '組織代號', type: 'dropdown', width: '12rem' },
          { field: 'type04', header: '明細類別', type: 'dropdown', width: '12rem' },
          { field: 'type05', header: '發票格式', type: 'dropdown', width: '12rem' },
          { field: 'type06', header: '發票/收據號碼', type: 'input', width: '12rem' },
          { field: 'type07', header: '發票日期', type: 'input', width: '12rem' },
          { field: 'type08', header: '申報年月', type: 'input', width: '12rem' },
          { field: 'type09', header: '廠商統一編號', type: 'input', width: '12rem' },
          { field: 'type10', header: '發票用途', type: 'dropdown', width: '12rem' },
          { field: 'type11', header: '發票總金額', type: 'input', width: '12rem' },
          { field: 'type12', header: '課稅別', type: 'dropdown', width: '12rem' },
          { field: 'type13', header: '發票未稅金額', type: 'input', width: '12rem' },
          { field: 'type14', header: '發票稅額', type: 'input', width: '12rem' },
          { field: 'type15', header: '扣抵代號', type: 'dropdown', width: '12rem' },
          { field: 'type16', header: '彙總張數', type: 'input', width: '12rem' },
        ];
      });
  }

  // #region 明細檔 讀取
  async loadDetail(pLU_MagNo: string): Promise<void> {
    if (pLU_MagNo == '') {
      console.log('讀取key', this.dataForm.value)
      if (this.crudstatus !== CRUDStatus.Create) {
        this.messageService.infoBubble('key為空，不載入明細檔'); //編輯、查看模式如果沒有明細檔就跳出提示
      }
    } else {
      this.tls51070Service.queryTLS51070_Detail({ 'PLU_MagNo': pLU_MagNo }).pipe(untilDestroyed(this)).subscribe(async (response) => {
        this.POS2064Detail = response.Data[0].POS2064Detail;

        this.POS2064Data = this.POS2064Detail.map(item => ({
          id: item.id,
          type01: item.type01,
          type02: item.type02,
          type03: item.type03,
          type04: item.type04,
          type05: item.type05,
          type06: item.type06,
          type07: item.type07,
          type08: item.type08,
          type09: item.type09,
          type10: item.type10,
          type11: item.type11,
          type12: item.type12,
          type13: item.type13,
          type14: item.type14,
          type15: item.type15,
          type16: item.type16,
          status: 'old'
        }));

        //建立項目模板
        this.createDefaultNew2064();

        console.log('明細 POS2064Data', this.POS2064Data);

        this.orgPOS2064Data = this.POS2064Data;
      });
    }
  }

  // #region 明細檔 重製
  reset51070() {
    // 將明細檔重新刷新
    if (this.crudstatus == CRUDStatus.Create) {
      this.isRefreshing = true
      this.POS2064Data = [];
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

        this.POS2064Data = this.orgPOS2064Data;
      }
    } else {
      console.log('查看模式無須重製');
    }
  }

  // #region 明細檔 驗證
  validate2064Row = (rowData: POS2064): { isValid: boolean; errorMessage: string } => {
    const venNo = rowData?.type01?.trim();
    const currentId = rowData?.id;

    //  檢查廠商編號是否為空
    if (!venNo) {
      return { isValid: false, errorMessage: '廠商編號不可為空，請輸入有效的廠商編號。' };
    }

    // 檢查重複（包含新增中未有 id 的情況）
    const isDuplicate = this.POS2064Data.some((item, _index, array) => {
      if (!item.type01) return false;

      // 編輯同筆資料不用比對
      if (item.id && currentId && item.id === currentId) return false;

      // 新增中沒有 id，用索引判斷是不是自己
      if (!item.id && !currentId) {
        const currentIndex = array.indexOf(rowData);
        return item.type01 === venNo && array.indexOf(item) !== currentIndex;
      }

      // 其他一般情況
      return item.type01 === venNo && item.id !== currentId;
    });

    if (isDuplicate) {
      return {
        isValid: false,
        errorMessage: `會計費用科目 ${venNo} 已存在，請使用其他編號。`,
      };
    }

    return { isValid: true, errorMessage: '' };
  };



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

    // this.userService.queryUsers(request)
    //   .pipe(finalize(() => {}))
    //   .subscribe({
    //     next: res => {
    //       this.userResultData = res.Data ?? [];
    //     },
    //     error: err => {
    //       console.error('查詢失敗', err);
    //     }
    //   });
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

    this.dataForm.patchValue({
      [this.currentUserTarget]: row.user_No,
      [`${this.currentUserTarget}Name`]: `${row.user_No} - ${row.user_Name}`
    });


    if (this.currentUserTarget === 'Pettycashapplicant') {
      this.dataForm.patchValue({
        applicantUnit: row.Org_ID, // 申請人組織代號
      });
    }
    else if (this.currentUserTarget === 'Pettycashcustodian') {
      this.dataForm.patchValue({
        custodianUnit: row.Org_ID, // 保管人組織代號
      });
    }

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
    // const { Org_ID, Org_Name } = this.keepDeptQueryForm.getRawValue();

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
    this.dataForm.patchValue({
      // keepingUnit: row.No,
      keepingUnitName: `${row.No} - ${row.Name}`
    });

    this.keepDeptDialogVisible = false;
  }


}
