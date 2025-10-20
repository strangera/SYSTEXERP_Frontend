import { ValidationService } from '@shared/service/validation.service';
import { Tls29010DetailService } from './tls29010-detail.service';
// --Commonly used imports--
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
//
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';


import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { Tls29010Service } from '../../../service/api/tls/tls29010.service';
import { ColumnDef, ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { untilDestroyed } from '@ngneat/until-destroy';

// TALPORDERM (主檔)
export interface TALPORDERM {
  id: string; // identity(1,1) not null
  mid: number; // DEFAULT 0 not null
  str_no: string; // 店部編號
  pod_no: string; // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
  pod_type: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
  // 活動類型: 作業固定操作的活動類型為 8=期間開放折扣
  // 1=預售 (只有預售才下到 pos)
  // 2=滿千送百發行
  // 3=滿千送百兌回
  // 4=會員卡集點-銷售 (不用)
  // 5=會員卡集點-點數 (不用)
  // 6=全館消費滿額集點-銷售
  // 7=全館消費滿額集點-點數
  // 8=期間開放折扣

  org_id?: string | null; // 組織-部門(SYS3100) //
  act_no?: string | null; // 活動編號(群組) // 券類才會用到
  pod_desc?: string | null; // 活動名稱
  pod_sdate: Date; // 活動起始日期
  pod_edate: Date; // 活動終止日期
  pod_busdate?: Date | null; // 活動正檔日期 // 券類才會用到
  pod_back_sdate?: Date | null;  //活動兌回起始日期
  pod_back_edate?: Date | null;  //活動兌回終止日期
  pod_status: '0' | '1' | '9';
  // 0=未核准 1=已核准 9=刪除

  approved_userno?: string | null; // 核准人員
  approved_usr_name?: string | null; // 核准人員姓名
  approved_date?: Date | null; // 核准日期

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名
}

// TALPORDERD_OPENDisc (明細檔)
export interface TALPORDERD_OPENDisc {
  id: number; // 主鍵，自動編號
  mid: number; // 主鍵，自動編號

  str_no: string; // 店部編號
  pod_no: string; // 活動編號(TALPORDERM)
  talent_id: number; // 合約編號系統
  tlt_id: string; // 抽成類別(0-9)

  tlt_no: string; // 專櫃編號
  cag_barcode: string; // 折數(條碼)
  use_flag: string; // 是否使用 Y/N

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名

  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

@Component({
  selector: 'app-tls29010-cru',
  templateUrl: './tls29010-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, ExpandableEditTableComponent, CalendarComponent, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, EditorTextComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonComponent, NgIf, TranslateModule]
})

// 2.2.9.1 折扣開放維護作業cru
export class TLS29010CRUComponent extends BasicCruPageComponent<TALPORDERD_OPENDisc> implements OnInit {
  @ViewChild('detailTable') detailTable!: ExpandableEditTableComponent;
  //主黨也可以新增
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    id: [{ value: null, disabled: true }], // 主鍵，自動編號
    mid: [{ value: null, disabled: true }], // 主檔關聯 ID
    str_no: [{ value: '', disabled: true }], // 店部編號 // 20251015 此欄位不顯示調整
    // --先選 專櫃活動設定主檔TALPORDERM--
    //欄位用這些就好
    pod_no: [{ value: null, disabled: true }], // 活動申請編號 (YYYYMMDDSSS)
    pod_type: ['', [Validators.required]], // 活動類型(1=預售, 2=滿千送百發行, 3=滿千送百兌回, 4~5=會員卡集點, 6~7=全館集點, 8=期間開放折扣)

    //20251015 新增 (act_no、pod_desc 欄位)
    act_no: ['', [Validators.maxLength(10), this.validationService.noChineseValidator]], // 活動編號(使用者輸入)
    pod_desc: ['', [Validators.maxLength(100)]], // 活動名稱(使用者輸入)

    pod_sdate: [null, [Validators.required]], // 活動起始日 (Date)
    pod_edate: [null, [Validators.required]], // 活動終止日 (Date)
    org_id: [''], // 組織-部門(SYS3100)
    // pod_busdate: [null], // 活動正檔日期  // 券類才會用到
    // pod_back_sdate: [null], // 活動兌回起始日期
    // pod_back_edate: [null], // 活動兌回終止日期
    pod_status: ['', Validators.required], // 活動狀態(0=未核准, 1=已核准, 9=刪除)

    // 核准不會再新增進行
    approved_userno: [{ value: null, disabled: true }], // 核准人員編號
    approved_usr_name: [{ value: null, disabled: true }], // 核准人員姓名
    approved_date: [{ value: null, disabled: true }], // 核准日期
  });

  whetherOption: option[] = [ // 是否使用 Y/N
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  podTypeOptions = [
    { label: '1 預售', value: '1' },
    { label: '2 滿千送百(發行)', value: '2' },
    { label: '3 滿千送百(兌回)', value: '3' },
    { label: '4 會員卡集點-銷售', value: '4' },
    { label: '5 會員卡集點-點數', value: '5' },
    { label: '6 全館集點-銷售', value: '6' },
    { label: '7 全館集點-點數', value: '7' },
    { label: '8 期間開放折扣', value: '8' }, //新增用這個
  ];

  pod_status_Options = [
    { label: '未核准', value: '0' },
    { label: '已核准', value: '1' },
    { label: '刪除', value: '9' },
  ];

  // 有8 不能重複
  actNoOptions: apiOption[] = []; // 活動群組編號下拉選單 -- 僅顯示(依照id, mid自動切換)
  tlt_No_Option: option[] = [];  // 專櫃編號下拉
  orgOptions: apiOption[] = []; // 組織部門下拉選單

  //主檔下拉 --之後由後端api提供

  // ---Potential_Customer_Detail 潛在客戶其他資料明細檔 table---
  opendisc_Detail: TALPORDERD_OPENDisc[] = [];
  //欄位資訊
  TALPORDERD_OPENDisc_Detail_Columns: ColumnDef[] = [
    { field: 'talent_id', header: '合約編號系統', type: 'number', editable: false, autoWidth: true }, // 不用顯示 內容與主檔案一致 *
    { field: 'tlt_id', header: '抽成類別', type: 'text', editable: false, autoWidth: true }, // 抽成類別(0-9) *
    //---要使用的---
    // [專櫃編號] 帶出 下面這坨
    { field: 'tlt_no', header: '專櫃編號', type: 'dropdown', editable: true, autoWidth: true, options: [] }, //(專櫃編號_專櫃名稱，下拉選單)用[專櫃編號] 帶出 [專櫃名稱]、[抽成類別]、[折數]、[抽成率] * ([TALPORDERD])
    { field: 'cag_barcode', header: '折數條碼', type: 'text', editable: false, autoWidth: true }, // 後端提供，要去(TLTTALENT_CHARGED)撈 *
    { field: 'cag_charge_rate', header: '抽成率', type: 'text', editable: false, autoWidth: true, hidden: true }, // 後端提供，要去(TLTTALENT_CHARGED)撈 * (*為一組，用id,mid 對應) 只有顯示，不會存到明細
    { field: 'use_flag', header: '是否使用', type: 'dropdown', editable: true, autoWidth: true, options: this.whetherOption }, // 本作業維護
  ];
  // 預設新項目模板
  defaultNewDetail: any = {
    pod_no: '', //自動設設為和主檔一致
    talent_id: 0, // 合約編號系統
    tlt_id: '', // 折扣別
    // --SA指定的顯示項目--
    tlt_no: '', // 抽成類別
    cag_barcode: 0, // 折數條碼
    cag_charge_rate: 0, // 折數條碼 //依照專櫃編號 進行變動
    use_flag: 'Y', // 是否使用

    status: 'new', // 新增狀態
    CanDel: true,
  };
  // 預設 POS2005 新項目模板 (內容有需要變動時使用)
  // createDefaultNew() {
  //   this.defaultNewDetail = {
  //     talent_id: '', // 合約編號系統
  //     tlt_id: '', // 抽成類別(0-9)
  //     tlt_no: '', // 抽成類別
  //     cag_barcode: '', // 折數條碼 //依照專櫃編號 進行變動
  //     cag_charge_rate: '', // 折數條碼 //依照專櫃編號 進行變動
  //     use_flag: true, // 是否使用:

  //     status: 'new' // 新增狀態
  //   };
  // }
  // 展開式表格的載入狀態
  expandDetailLoading = false;
  // ------

  // ----------------------------------------------------------------
  constructor(
    private tls29010Service: Tls29010Service,
    private tls29010DetailService: Tls29010DetailService,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS29010', this.dataForm);
    this.loadOption();
    console.log('主檔', this.dataForm.getRawValue());

    const pod_no = this.dataForm.get('pod_no')?.value;
    if (pod_no) {
      this.loadDetailData(pod_no); //讀取明細檔
      // this.createDefaultNew; //編輯頁如果有新項目要寫入在此更改
    }

    //新增模式pod_desc才可以填寫，否則與其他欄位一樣都設為disabled
    const userInfo = this.authService?.getUserInfo?.();
    if (userInfo) {
      if (this.crudstatus === CRUDStatus.Create) {
        this.dataForm.get('pod_desc')?.enable();
        this.dataForm.get('str_no')?.setValue(userInfo?.SYS_StoreNo || '') //依照section填寫店號

        this.dataForm.get('pod_status')?.setValue('0') //新增模式 [活動狀態] 只能(未審核)
        this.dataForm.get('pod_status')?.disable();
        this.dataForm.get('approved_userno')?.disable();
        this.dataForm.get('approved_usr_name')?.disable();
        this.dataForm.get('approved_date')?.disable();

        // 新增 活動類型只能選8號
        this.dataForm.get('pod_type')?.setValue('8') //新增模式 只能選 8 期間開放折扣
        this.dataForm.get('pod_type')?.disable();
      } else {
        this.dataForm.get('pod_desc')?.disable();
      }
    }
  }

  //---新增卡控(tlt_id =8 只能有一筆)---
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    // 明細送出的pod全部都用主檔的pod_no (新增是後端自動新增流水號)
    const mainPodNo = this.dataForm.get('pod_no')?.value;

    // console.log('原始明細資料',this.opendisc_Detail);

    const processedDetail = this.opendisc_Detail.map(item => {
      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([key, _]) => key !== '')
      );

      if (item.status === 'new') {
        cleaned['id'] = 0;
      }

      // 👉 自動指定為主檔 pod_no
      cleaned['pod_no'] = mainPodNo;

      return cleaned;
    });

    const formValue = frm.getRawValue();
    const body = {
      ...formValue,
      TALPORDERD_OPENDisc: processedDetail, // 將明細資料加入請求體
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // console.log('insert', body);
          console.log('insert', JSON.stringify(body, null, 2));
          this.tls29010Service.insertTLS29010(body).subscribe(() => {
            this.messageService.successBubble('新增成功');

            // 取出要保留的欄位值 --- 20251007 調整重設邏輯，避免多次新增造成的數值變成null
            const keepValues = {
              str_no: this.dataForm.get('str_no')?.value,
              pod_type: this.dataForm.get('pod_type')?.value,
              pod_status: this.dataForm.get('pod_status')?.value,
            };

            // reset 其他欄位
            this.dataForm.reset();

            // 把保留欄位的值重新設回去
            this.dataForm.patchValue(keepValues);
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update:', JSON.stringify(body, null, 2));
          this.tls29010Service.updateTLS29010(body).subscribe(() => {
            // this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }

  loadOption() {
    // 專櫃編號
  this.tls29010Service
    .queryTLTTALENT_Status_DropDownList({})
    .pipe(untilDestroyed(this))
    .subscribe((response) => {
      this.tlt_No_Option = response.Data.map((item: apiOption) => ({
        value: item.No,
        label: item.Name,
      }));

      console.log('專櫃編號 下拉:', this.tlt_No_Option);

      // ✅ 在這裡再更新欄位的 options
      this.TALPORDERD_OPENDisc_Detail_Columns =
        TLS29010CRUComponent.updateTlt_No_OptionInColumns(
          this.TALPORDERD_OPENDisc_Detail_Columns,
          this.tlt_No_Option
        );
    });

    // 部門編號(SYS3100)
    this.tls29010Service
      .querySYS3100_DropDownList({}).pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.orgOptions = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('部門編號 下拉:', response.Data);
      });
  }

  // 在這裡再更新欄位的 options
  static updateTlt_No_OptionInColumns(columns: ColumnDef[], tlt_No_Option: any[]): ColumnDef[] {
    const col = columns.find(c => c.field === 'tlt_no');
    if (col) col.options = tlt_No_Option;
    return columns;
  }

  //讀取明細檔
  async loadDetailData(pod_no: string): Promise<void> {
    console.log('要求pod_no資料:', pod_no);
    this.tls29010Service.queryTLS29010_Detail({ "POD_No": pod_no }).subscribe((response) => {
      if (response.Status === '0000') {
        this.opendisc_Detail = response.Data.map((item: any) => ({
          ...item,
          status: 'original', // 有明細資料，讀取明細狀態設定為 'original';
        }));
        console.log('取得明細資料:', this.opendisc_Detail);
      } else {
        this.messageService.infoBubble(`該主檔無明細資料`);
      }
    });
  }

  // ---明細檔操作---
  //HTML 顯示的明細資料
  get filteredDetail(): TALPORDERD_OPENDisc[] {
    return this.opendisc_Detail.filter(item => item.status !== 'deleted');
  }

  // ---TALPORDERD_OPENDisc 表格編輯事件---
  async onRowSaveDetail(event: any) {
    const { oldData, newData } = event;

    // ✅ 狀態與 talent_id 重複檢查
    const hasDuplicate = this.opendisc_Detail.some(
      item => item !== newData && item.talent_id === newData.talent_id
    );

    if (hasDuplicate) {
      if (newData?.status === 'new') {
        // new 狀態，直接刪除
        console.log('該合約編號已存在，移除該筆明細', JSON.stringify(this.opendisc_Detail));
        this.messageService.errorBubble('該合約編號已存在，移除該筆明細');
        this.opendisc_Detail = this.opendisc_Detail.filter(item => item !== newData);
      } else {
        // 非 new 狀態，還原成舊資料
        const index = this.opendisc_Detail.findIndex(item => item === newData);
        if (index > -1) {
          this.opendisc_Detail[index] = oldData;
        }
        this.messageService.infoBubble('重複的合約編號，已還原為原始資料');
      }
      return; // 有重複就不繼續執行後面
    }

    // ✅ 後續流程：有 tlt_no 先查 API
    if (newData?.tlt_no) {
      console.log('寫入專櫃編號', newData.tlt_no);

      try {
        const res = await this.tls29010Service
          .queryTLTTALENT_Data({ tlt_no: newData.tlt_no }).pipe(untilDestroyed(this))
          .toPromise();

        if (res.Status === '0000' && res.Data?.length) {
          const apiData = res.Data[0];

          // 更新 newData
          // newData.tlt_id = apiData.tlt_id;
          newData.tlt_no = apiData.tlt_no;
          newData.tlt_name = apiData.tlt_name;
          newData.apply_no = apiData.apply_no;
          newData.tlt_term_type = apiData.tlt_term_type;
          newData.tlt_bdate = apiData.tlt_bdate;
          newData.tlt_edate = apiData.tlt_edate;
          newData.cag_charge_rate = apiData.cag_charge_rate;

          console.log('合約明細', apiData);

          // 做狀態判斷與更新
          this.tls29010DetailService.handleRowSave({ oldData, newData });
        } else {
          this.messageService.errorBubble('找不到對應的合約資料，移除該筆明細');
          const index = this.opendisc_Detail.indexOf(newData);
          if (index > -1) {
            this.opendisc_Detail.splice(index, 1);
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // 沒有 talent_id 直接進行狀態判斷
      this.tls29010DetailService.handleRowSave(event);
    }

    //不允許talent_id 有'0'的存在
    if(this.opendisc_Detail.some(item => item.talent_id === 0)){
      this.messageService.errorBubble('請確實輸入合約編號');
    }
  }

  onRowCancelDetail(event: any) {
    this.tls29010DetailService.handleRowCancel(event);
    //有任何talent_id是'0'就刪除該筆
    this.opendisc_Detail = this.opendisc_Detail.filter(item => item.talent_id !== 0);
  }
  // 新增 TALPORDERD_OPENDisc
  onAddPotentialCustomerDetail() {
    this.tls29010DetailService.addPotentialCustomerDetail(this.opendisc_Detail, this.defaultNewDetail, this.detailTable);
  }
  // 批次刪除 TALPORDERD_OPENDisc
  onBatchDeleteDetail(selectedItems: TALPORDERD_OPENDisc[]): void {
    this.tls29010DetailService.deletePotentialCustomerDetail(selectedItems, this.opendisc_Detail);
  }
}
