import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';


import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';

export interface tls26010response {
  // TALPORDERM
  id: number; // 主鍵，自動編號

  pod_no: string; // 預售編號(readonly)
  pod_desc: string; // 預售名稱
  pod_sdate: Date; // 預售期間-起日
  pod_edate: Date; // 預售期間-迄日
  pod_status: string; // 核准狀態(readonly)
  approved_usr_name?: string; // 核准人員(readonly)
  approved_date?: Date; // 核准日期
  CanDelete?: number;
  CanEdit?: number;
}

// 明細檔
export interface tls26010response {
  pod_info: pod_info;
  ecr_list: ecr_list[];
  talent_list: talent_list[];
  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

export interface pod_info {
  id: number;
  mid: number;
  pod_no: string,
  pod_desc: string,
  pod_sdate: Date,
  pod_edate: Date,
  pod_status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

export interface ecr_list {
  id: number,
  ECR_No: string,
  ECR_Name: string,
  tlt_no: string | null,
  tlt_name: string | null
  status?: string  // 加上可選屬性
}

export interface talent_list {
  id: number, // 本作業資料處理的
  talent_id: number, // api進來讀取的
  tlt_no: string,
  tlt_name: string,
  tlt_bdate: Date,
  tlt_edate: Date,
  status?: string  // 加上可選屬性
}

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
  imports: [
    TableComponent,
    TableEditComponent,
    TranslateModule,
    MenubarComponent,
    MultiSelectComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    CommonModule,
    DropdownComponent,
    DialogComponent,
    RadiobuttonComponent,
    EditorTextComponent,
    ExpandableEditTableComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    ButtonComponent,
    NgIf
  ]

})
export class TLS26010CRUComponent extends BasicCruPageComponent<tls26010response> implements OnInit {
  @ViewChild('ecrTable') ecrTable!: ExpandableEditTableComponent;
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // TALPORDERM
    id: [{ value: null, disabled: true }], // 主鍵，自動編號
    pod_no: ['', [Validators.required]], // 預售編號(readonly)
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]], // 預售名稱
    pod_sdate: [null, [Validators.required, this.validationService.dateAfterTodayValidator()]], // 預售期間-起日
    pod_edate: [null, [Validators.required]], // 預售期間-迄日
    pod_status: [''], // 核准狀態(readonly)
    approved_usr_name: [''], // 核准人員(readonly)
    approved_date: [null], // 核准日期核准日期
    CanDelete: [],
    CanEdit: []
  });

  // #region 收銀機明細
  //----------------------------------------------------------------
  ecrData: ecr_list[] = [];
  orgEcrData: ecr_list[] = []; // ecr_list(備分)
  selectedECRItems: ecr_list[] = [];
  ecrLoading = false;
  // 預設新項目模板
  defaultNewECR = {
    id: 0, //新增
    ECR_No: '',
    ECR_Name: '',
    tlt_no: '',
    tlt_name: '',

    status: 'new'
  };
  ecrColumn: EditColumn[] = [
    { field: 'ECR_No', header: '收銀機編號', type: 'input', width: '12rem', disabled: () => true },
    { field: 'ECR_Name', header: '收銀機名稱', type: 'input', width: '12rem', disabled: () => true }
  ];
  createDefaultNewECR() {
    this.defaultNewECR = {
      id: 0, //新增
      ECR_No: '',
      ECR_Name: '',
      tlt_no: '',
      tlt_name: '',

      status: 'new'
    };
  }
  //----------------------------------------------------------------
  // #region 專櫃明細
  //----------------------------------------------------------------
  tltData: talent_list[] = [];
  orgTltData: talent_list[] = []; // ecr_list(備分)
  selectedTLTItems: talent_list[] = [];
  tltLoading = false;
  // 預設新項目模板
  defaultNewTLT = {
    id: 0, //新增
    tlt_no: '',
    tlt_name: '',
    status: 'new'
  };
  tltColumn: EditColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', type: 'input', width: '12rem', disabled: () => true },
    { field: 'tlt_name', header: '專櫃名稱', type: 'input', width: '12rem', disabled: () => true }
  ];
  createDefaultNewTLT() {
    this.defaultNewTLT = {
      id: 0, //新增
      tlt_no: '',
      tlt_name: '',
      status: 'new'
    };
  }
  //----------------------------------------------------------------
  // #region 彈出視窗設定義
  ecrDialogForm = this.formBuilder.nonNullable.group({
    sys3800: [''], // 館別(單選)
    sys3900: [''], // 樓層(單選)
    sys3A00: ['']  // 區域(單選)
  });

  tltDialogForm = this.formBuilder.nonNullable.group({
    sys3800: [[]], // 館別(多選)
    sys3900: [[]], // 樓層(多選)
    sys3A00: [[]]  // 區域(多選)
  });

  //是否顯示
  ecrDialogVisible = false;
  tltDialogVisible = false;

  ecrDialogLoading = false;
  tltDialogLoading = false;
  ecrDialogData: ecr_list[] = [];
  tltDialogData: talent_list[] = [];
  ecrDialogSelected: ecr_list[] = [];
  tltDialogSelected: talent_list[] = [];

  ecrDialogColumn: Column[] = [
    { field: 'ecr_no', header: '收銀機號', visible: true },
    { field: 'ecr_name', header: '收銀機名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  tltDialogColumn: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  //----------------------------------------------------------------

  building_Option: apiOption[] = [];  // 館別
  floor_Option: apiOption[] = [];  // 樓層
  area_Option: apiOption[] = [];  // 區域

  pod_status_Option: option[] = [
    { value: "0", label: '未核准' },
    { value: "1", label: '已核准' }
  ]

  // ----------------------------------------------------------------
  constructor(
    private validationService: ValidationService,
    private tLS26010Service: TLS26010Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    this.loadOptions();

    const pod_no = this.dataForm.get('pod_no')?.value;
    if (pod_no) {
      this.loadDetailData(pod_no);
    } else {
      if (this.crudstatus != CRUDStatus.Create)
        console.warn('無法讀取明細資料');
    }

    // DialogForm變更重打API
    this.setupAutoReloadForECR();
    this.setupAutoReloadForTLT();

    // 主表日期變更也重新打api
    this.dataForm.get('pod_sdate')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.tltDialogVisible) this.loadTLTDialogData();
      });

    this.dataForm.get('pod_edate')?.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.tltDialogVisible) this.loadTLTDialogData();
      });
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();
    const body = {
      ...formValue,
      // Detail: processedDetail, // 將明細資料加入請求體
    }
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert:', JSON.stringify(body, null, 2));
          console.log('ECR detail', this.ecrData);
          console.log('TLT detail', this.tltData);
          // this.tls12010Service.insertTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
          //   this.messageService.successBubble('新增成功');
          //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
          //   this.dataForm.reset(); // 重置表單
          //   this.potentialDetail = []; // 清除明細
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update:', JSON.stringify(body, null, 2));
          console.log('ECR detail', this.ecrData);
          console.log('TLT detail', this.tltData);
          // this.tls12010Service.updateTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
          //   this.messageService.successBubble('更新成功');
          //   this.onCancel(); // 儲存後，會返回列表
          // });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }
  // 讀取dopropdown選項
  loadOptions() {
    // 查詢 館別
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.building_Option = response.Data.map((item: any) => ({
        No: item.No, // 館別 代碼
        Name: item.Name, // 館別 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      // console.log('館別 代號:', this.building_Option);
    });
    // 查詢 樓層
    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.floor_Option = response.Data.map((item: any) => ({
        No: item.No, // 樓層 代碼
        Name: item.Name, // 樓層 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      // console.log('樓層 代號:', this.floor_Option);
    });
    // 查詢 區域
    this.dropDownListService.querySYS3A00_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.area_Option = response.Data.map((item: any) => ({
        No: item.No, // 樓層 代碼
        Name: item.Name, // 樓層 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      // console.log('區域 代號:', this.area_Option);
    });
  }

  // 讀取明細資料
  async loadDetailData(pod_no: string): Promise<void> {
    console.log('要求pod_no資料:', pod_no);
    this.tLS26010Service.loadTLS26010Detail({ "pod_no": pod_no }).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === '0000') {
        console.log('取得明細資料:', response.Data);
        this.ecrData = response.Data.ecr_list as unknown as ecr_list[];
        this.tltData = response.Data.talent_list as unknown as talent_list[];
        this.orgEcrData = this.ecrData;
        this.orgTltData = this.tltData;
        this.ecrDialogSelected = this.ecrData; // 明細Dialog勾選項目
        this.tltDialogSelected = this.tltData;
        console.log('取得ECR明細:', this.ecrData);
        console.log('取得TLT明細:', this.tltData);

      } else {
        this.messageService.errorBubble(`讀取失敗: ${response.Message}`);
      }
    });
  }

  // #region 明細dialog
  dialogVisible(dialogMode: string) {
    if (dialogMode == 'ecr') {
      this.ecrDialogVisible = true;
      this.tltDialogVisible = false;

      this.loadECRDialogData(); // 讀取ECR Dialog
      // 打開時就把主表已存在的明細同步給 dialog 選項
      this.tltDialogSelected = [...this.tltData];
    } else {
      this.ecrDialogVisible = false;
      this.tltDialogVisible = true;

      this.loadTLTDialogData(); // 讀取TLT Dialog
    }
  }

  // #region 收銀機明細

  onDialogECRSubmit(): any {
    console.log('舊的ECR ecrData', this.ecrData);
    const added: any = [];

    this.ecrDialogSelected.forEach(item => {
      const exists = this.ecrData.find(d => d.ECR_No === item.ECR_No);
      if (!exists) {
        added.push({
          id: 0,
          ECR_No: item.ECR_No,
          ECR_Name: item.ECR_Name,
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          status: item.status ?? 'new'
        });
      }
    });

    // 重要：重新 assign 才會觸發 OnPush / Change Detection
    this.ecrData = [...this.ecrData, ...added];

    console.log('新的ECR ecrData', this.ecrData);

    this.ecrDialogVisible = false;
  }

  onSelectionECRChange(event: ecr_list[]): void {
    // 把新的選項加入舊陣列，避免覆蓋掉之前已勾選的
    this.ecrDialogSelected = [
      ...this.ecrDialogSelected.filter(item => !event.some(e => e.ECR_No === item.ECR_No)),
      ...event
    ];

    console.log('ecr dialog選擇變更', this.ecrDialogSelected);
  }

  // #region 專櫃明細

  onDialogTLTSubmit(): any {
    console.log('舊的TLT ecrData', this.tltData);
    const added: any = [];

    this.tltDialogSelected.forEach(item => {
      const exists = this.tltData.find(d => d.tlt_no === item.tlt_no);
      if (!exists) {
        added.push({
          id: 0,
          tlt_no: item.tlt_no,
          tlt_name: item.tlt_name,
          status: item.status ?? 'new'
        });
      }
    });

    this.tltData = [...this.tltData, ...added];
    console.log('新的 tltData', this.tltData);

    this.tltDialogVisible = false;
  }

  onSelectionTLTChange(event: any[]): void {
    // 把新的選項加入舊陣列，避免覆蓋掉之前已勾選的
    this.tltDialogSelected = [
      ...this.tltDialogSelected.filter(item => !event.some(e => e.tlt_no === item.tlt_no)),
      ...event
    ];

    console.log('tlt dialog選擇變更', this.tltDialogSelected);
  }

  // #region 刷新Dialog API
  private setupAutoReloadForECR(): void {
    this.ecrDialogForm.valueChanges
      .pipe(
        debounceTime(300),           // 避免連續觸發
        distinctUntilChanged()       // 避免同樣值重複觸發
      )
      .subscribe(() => {
        if (this.ecrDialogVisible) { // 只有 dialog 開啟時才打 API
          this.loadECRDialogData();
        }
      });
  }

  private setupAutoReloadForTLT(): void {
    this.tltDialogForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.tltDialogVisible) { // Dialog 開啟才打
          this.loadTLTDialogData();
        }
      });
  }

  loadECRDialogData(): void {
    this.ecrDialogLoading = true;

    const req = {
      building_no: this.ecrDialogForm.value.sys3800,
      floor_no: this.ecrDialogForm.value.sys3900,
      area_no: this.ecrDialogForm.value.sys3A00,
      ecr_type: '1',
      ecr_no: '',
      tlt_no: '',
    };

    // 預設進來資料全打
    console.log('收銀機 Dialog request', req);
    this.tLS26010Service.queryECRDropDownList(req)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        console.log('取得 ECR Dialog:', response);
        this.ecrDialogData = response.Data.map((item: any) => ({
          ...item,
          ECR_No: item.ecr_no,
          ECR_Name: item.ecr_name
        }));
        console.log('Dialog 已勾選項目：', this.ecrDialogSelected);

        console.log('取得 ECR選單表:', this.ecrDialogData);
        this.ecrDialogLoading = false;
      });
  }

  loadTLTDialogData(): void {
    this.tltDialogLoading = true;

    const sData = this.dataForm.get('pod_sdate')?.value; //主表 起始日期
    const eDate = this.dataForm.get('pod_edate')?.value; //主表 終止日期

    if (!sData) {   //沒輸入起始日期就不處理
      this.messageService.errorBubble('請先輸入起始日期')
      this.tltDialogLoading = false;
      return;
    }

    const req = {
      building_nos: this.tltDialogForm.value.sys3800,
      floor_nos: this.tltDialogForm.value.sys3900,
      area_nos: this.tltDialogForm.value.sys3A00,
      tlt_openflag: '',
      tlt_no: '',
      tlt_name: '',
      ven_no: '',
      tlt_bdate: this.datePipe.transform(sData, 'yyyy-MM-dd'),
      tlt_edate: this.datePipe.transform(eDate, 'yyyy-MM-dd') ?? null, // 沒有輸入就傳null
    };

    console.log('專櫃 Dialog request', req);
    this.tLS26010Service.queryTalentDropDownList(req)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // console.log('取得 TLT Dialog:', response);
        this.tltDialogData = response.Data.map((item: talent_list) => ({
          ...item,
          id: item.talent_id  // 將原本的 talent_id 當作新的 id
        }));
        console.log('取得 TLT選單表:', this.tltDialogData);
        this.tltDialogLoading = false;
      });
  }

  // #region 收銀機驗證
  validateECR = (rowData: ecr_list): { isValid: boolean; errorMessage: string } => {
    if (!rowData.ECR_No) {
      return { isValid: false, errorMessage: '收銀機編號不可為空' };
    }
    // 檢查 ECR_No 是否在現有明細中重複（排除自己）
    const duplicate = this.ecrData.some(
      item => item.ECR_No === rowData.ECR_No && item !== rowData && item.status !== 'deleted'
    );

    if (duplicate) {
      return { isValid: false, errorMessage: '收銀機編號不可重複' };
    }

    return { isValid: true, errorMessage: '' };
  };

  validateTLT = (rowData: talent_list): { isValid: boolean; errorMessage: string } => {
    if (!rowData.tlt_no) {
      return { isValid: false, errorMessage: '專櫃編號不可為空' };
    }

    // 檢查 tlt_no 是否在現有明細中重複（排除自己）
    const duplicate = this.tltData.some(
      item => item.tlt_no === rowData.tlt_no && item !== rowData && item.status !== 'deleted'
    );

    if (duplicate) {
      return { isValid: false, errorMessage: '專櫃編號不可重複' };
    }
    return { isValid: true, errorMessage: '' };
  };

  // #region 明細重製
  reset26010() {
    // 將明細檔重新刷新
    if (this.crudstatus == CRUDStatus.Create) {
      this.ecrData = [];
    } else if (this.crudstatus == CRUDStatus.Edit) {
      if (this.orgEcrData) {
        // 重製明細檔
        this.ecrData = this.orgEcrData;
        this.tltData = this.orgTltData;
        this.messageService.infoBubble('編輯模式重製完成');
      }
    } else {
      console.log('查看模式無須重製');
    }
  }
}