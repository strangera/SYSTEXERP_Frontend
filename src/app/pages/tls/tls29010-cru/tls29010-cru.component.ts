// --Commonly used imports--
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { NgFor, NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';


import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Tls29010Service } from '../../../service/api/tls/tls29010.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { option } from '../../../shared/models/sys/sysb000.model';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';

// TALPORDERM (主檔)
export interface TALPORDERM {
  id?: string; // identity(1,1) not null
  pod_no: string; // 活動申請編號YYYYMMDDSSS(活動起始日期+流水號)
  pod_type: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
  pod_desc: string | null; // 活動名稱
  pod_sdate: Date | null; // 活動起始日期
  pod_edate: Date | null; // 活動終止日期
  pod_status: '0' | '1' | '9';
  approved_userno?: string | null; // 核准人員
  approved_usr_name?: string | null; // 核准人員姓名
  approved_date?: Date | null; // 核准日期
}

// TALPORDERD_OPENDisc (明細檔)
export interface TALPORDERD_OPENDisc {
  id: number; // 主鍵，自動編號

  talent_id: number; // 合約編號系統
  tlt_id: string; // 抽成類別(0-9)
  tlt_no: string; // 專櫃編號
  tlt_name?: string; // 專櫃名稱
  cag_barcode: string; // 折數(條碼)
  tlt_bdate?: string; // 合約起日 (ISO 字串格式: YYYY-MM-DD)
  tlt_edate?: string; // 合約迄日 (ISO 字串格式: YYYY-MM-DD)
  use_flag?: string; // 是否使用 Y/N

  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

//活動申請編號 下拉選單
export interface ACT_NO_type {
  "act_no": string,
  "POD_DESC": string,
  "pod_sdate": string,
  "pod_edate": string,

  "Label"?: string, // 前端 顯示用(POD_NO+POD_DESC)
}


@Component({
  selector: 'app-tls29010-cru',
  templateUrl: './tls29010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    ExpandableEditTableComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    EditorTextComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent]
})

// 2.2.9.1 折扣開放維護作業cru
export class TLS29010CRUComponent extends BasicCruPageComponent<TALPORDERD_OPENDisc> implements OnInit {
  @ViewChild('detailTable') detailTable!: ExpandableEditTableComponent;
  //主黨也可以新增
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    id: [{ value: null, disabled: true }], // 主鍵，自動編號
    // --先選 專櫃活動設定主檔TALPORDERM--
    pod_no: [{ value: '系統產生代碼', disabled: true }], // YYYYMMDDSSS(活動起始日期+流水號)
    pod_type: ['8', [Validators.required]], // 固定寫入8

    pod_desc: [{ value: '', disabled: true }], // 活動名稱(使用者輸入)
    pod_sdate: [{ value: null as Date | null, disabled: true }, [Validators.required]], // 活動起始日 (Date)
    pod_edate: [{ value: null as Date | null, disabled: true }, [Validators.required]], // 活動終止日 (Date)
    pod_status: ['', Validators.required], // 活動建立=0 /核准=1 /反核准=0 /刪除=9

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
    // { label: '1 預售', value: '1' },
    // { label: '2 滿千送百(發行)', value: '2' },
    // { label: '3 滿千送百(兌回)', value: '3' },
    // { label: '4 會員卡集點-銷售', value: '4' },
    // { label: '5 會員卡集點-點數', value: '5' },
    // { label: '6 全館集點-銷售', value: '6' },
    // { label: '7 全館集點-點數', value: '7' },
    { label: '8 期間開放折扣', value: '8' }, //新增用這個
  ];

  pod_status_Options = [
    { label: '核准', value: '1' },
    { label: '反核准', value: '0' },
    { label: '刪除', value: '9' },
  ];

  act_No_Options: ACT_NO_type[] = []; // 折扣別下拉
  tlt_No_Option: { value: string, label: string }[] = [];  // 專櫃編號下拉

  //主檔資料備份 用於比對是否更動
  originalData: TALPORDERD_OPENDisc[] = []; // 明細檔 備份
  originalMainData: ReturnType<typeof this.dataForm.getRawValue> | null = null;  // 主檔 備份

  // ---Potential_Customer_Detail 潛在客戶其他資料明細檔 table---
  opendisc_Detail: TALPORDERD_OPENDisc[] = [];
  selectedItems: TALPORDERD_OPENDisc[] = [];
  //欄位資訊
  TALPORDERD_OPENDisc_Detail_Columns: EditColumn[] = [
    {
      field: 'tlt_no', // 專櫃編號_專櫃名稱: 用[專櫃編號] 帶出 [專櫃名稱]、[抽成類別]、[折數]、[抽成率] * ([TALPORDERD])
      header: '專櫃編號/名稱',
      width: '200px',
      type: 'dropdown',
      options: this.tlt_No_Option,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired, this.validateUniqueTLT_NO.bind(this)],
    },
    {
      field: 'tlt_id', // 下拉選單：依據專櫃編號，顯示對應抽成類別(0-9)
      header: '抽成類別',
      type: 'inputNumber',
      width: '150px',
      validate: [validateRequired],
      disabled: () => true,
    },
    {
      field: 'cag_barcode', // 下拉選單：依據專櫃編號，排除當初所設定折扣別，去(TLTTALENT_CHARGED)撈
      header: '折扣別',
      type: 'input',
      width: '150px',
      validate: [validateRequired],
      // disabled: () => true,
    },
    {
      field: 'use_flag', // 下拉選單：是/否
      header: '是否使用',
      width: '200px',
      type: 'dropdown',
      options: this.whetherOption,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired],
    },
  ];
  // ----------------------------------------------------------------
  constructor(
    private tls29010Service: Tls29010Service,
    private dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS29010', this.dataForm);
    this.loadOption();
    console.log('主檔', this.dataForm.getRawValue());

    const pod_no = this.dataForm.get('pod_no')?.value;
    if (pod_no) {
      // 備份主檔
      this.originalMainData = this.dataForm.getRawValue();
      this.loadDetailData(pod_no); //讀取明細檔
    }

    // pod_no 變更時寫入dataform對應的活動名稱(pod_desc)與起訖日期(pod_sdate、pod_edate)
    this.dataForm.get('pod_no')?.valueChanges
      .pipe(untilDestroyed(this)) // 使用直到銷毀的操作符，避免記憶體洩漏
      .subscribe(selectedPodNo => {
        // 根據選中的 pod_no，從 act_No_Options 中尋找對應的資料
        const selectedOption = this.act_No_Options.find(
          option => option.act_no === selectedPodNo
        );

        if (selectedOption) {
          // 找到了對應的活動資料，更新 dataForm 中的其他欄位
          this.dataForm.patchValue({
            // 活動名稱
            pod_desc: selectedOption.POD_DESC,
            // 活動起始日期 (注意：如果您的表單控制項是 Date 類型，您可能需要轉換字串)
            // 假設 pod_sdate 和 pod_edate 在您的 dataForm 中預期是 Date 類型
            pod_sdate: new Date(selectedOption.pod_sdate),
            pod_edate: new Date(selectedOption.pod_edate),
          });
        } else {
          // 如果選擇的值為 null 或在 options 中找不到，可以選擇清空或保持不變
          this.dataForm.patchValue({
            pod_desc: null,
            pod_sdate: null,
            pod_edate: null,
          });

          // (可選) 清空明細資料
          this.opendisc_Detail = [];
        }
      });

    //新增模式pod_desc才可以填寫，否則與其他欄位一樣都設為disabled
    const userInfo = this.authService?.getUserInfo?.();
    if (userInfo) {
      if (this.crudstatus === CRUDStatus.Create) {
        this.dataForm.get('pod_status')?.setValue('0') //新增模式 [活動狀態] 只能(未審核)
        this.dataForm.get('pod_status')?.disable();
        this.dataForm.get('approved_userno')?.disable();
        this.dataForm.get('approved_usr_name')?.disable();
        this.dataForm.get('approved_date')?.disable();

        // 新增 活動類型只能選8號
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

    //檢核明細檔talent_id不能有0
    if (this.opendisc_Detail.some(item => item.talent_id === 0)) {
      this.messageService.errorBubble('專櫃合約不可空白');
      this.messageService.unblockUi();
      return;
    }

    // 明細送出的pod全部都用主檔的pod_no (新增是後端自動新增流水號)
    const mainPodNo = this.dataForm.get('pod_no')?.value;
    const processedDetail = this.opendisc_Detail.map(item => {
      const cleaned = Object.fromEntries(
        Object.entries(item).filter(([key,]) => key !== '')
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
          const userInfo = this.authService?.getUserInfo?.();
          const request = {
            ...body,
            "str_no": userInfo?.SYS_StoreNo || ''
          }

          // console.log('insert', request);

          console.log('insert', JSON.stringify(request, null, 2));
          // this.tls29010Service.insertTLS29010(request).pipe(untilDestroyed(this)).subscribe(() => {
          //   this.messageService.successBubble('新增成功');

          //   // 取出要保留的欄位值 --- 20251007 調整重設邏輯，避免多次新增造成的數值變成null
          //   const keepValues = {
          //     pod_type: this.dataForm.get('pod_type')?.value,
          //     pod_status: this.dataForm.get('pod_status')?.value,
          //   };

          //   // reset 其他欄位
          //   this.dataForm.reset();

          //   // 把保留欄位的值重新設回去
          //   this.dataForm.patchValue(keepValues);
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          const userInfo = this.authService?.getUserInfo?.();
          const request = {
            ...body,
            "str_no": userInfo?.SYS_StoreNo || ''
          }
          console.log('update:', JSON.stringify(request, null, 2));
          // this.tls29010Service.updateTLS29010(request).pipe(untilDestroyed(this)).subscribe(() => {
          //   // this.messageService.successBubble('更新成功');
          //   this.onCancel(); // 儲存後，會返回列表
          // });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  loadOption() {
    // 專櫃編號
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.tlt_No_Option = res.Data.map(item => ({
        value: item.No,
        label: `${item.No} - ${item.Name}`
      }));
      // console.log('專櫃編號 下拉:', this.tlt_No_Option);

      // 更新欄位的 options
      this.TALPORDERD_OPENDisc_Detail_Columns = TLS29010CRUComponent.updateTlt_No_OptionInColumns(this.TALPORDERD_OPENDisc_Detail_Columns, this.tlt_No_Option);
    });
    //折扣別
    const pod_no = this.dataForm.get('pod_no')?.value || "";
    // 活動編號，下拉選單
    this.tls29010Service.dropdownTLS29010bypodno({ "pod_no": pod_no }).pipe(untilDestroyed(this)).pipe(untilDestroyed(this)).subscribe((response) => {
      this.act_No_Options = response.Data.map((item: ACT_NO_type) => ({
        ...item,
        Label: item.act_no + '-' + item.POD_DESC,
        // Label: item.act_no + '-' + item.POD_DESC + '-' + item.pod_sdate + '-' + item.pod_edate, // 檢查時間用的
      }));
      console.log('✨pod_no:', pod_no, '對應的 活動編號 下拉:', response.Data);
    });

  }

  // 更新欄位的 專櫃編號
  static updateTlt_No_OptionInColumns(columns: EditColumn[], tlt_No_Option: any[]): EditColumn[] {
    const col = columns.find(c => c.field === 'tlt_no');
    if (col) col.options = tlt_No_Option;
    return columns;
  }

  //讀取明細檔
  async loadDetailData(pod_no: string): Promise<void> {
    console.log('要求pod_no資料:', pod_no);
    this.tls29010Service.queryTLS29010_Detail({ "POD_No": pod_no }).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === '0000') {
        // 填充明細資料
        this.opendisc_Detail = response.Data.map((item: any) => ({
          ...item,
          status: 'original', // 有明細資料，讀取明細狀態設定為 'original';
        }));
        // 深拷貝原始明細資料備份
        this.originalData = this.opendisc_Detail.map(item => ({ ...item }));

        console.log('取得明細資料:', this.opendisc_Detail);
      } else {
        this.messageService.infoBubble(`該主檔無明細資料`);
      }
    });
  }

  // #region 明細檔操作
  async onDataChange(newData: TALPORDERD_OPENDisc[]): Promise<void> {
    // this.opendisc_Detail = newData;

    // 找出哪一列的 tlt_no 發生了變動 (且變動後的值不為空)
    for (let i = 0; i < newData.length; i++) {
      const currentRow = newData[i];
      const oldRow = this.opendisc_Detail[i];

      // 條件：這一列是新的，或者 tlt_no 與之前不同
      if (currentRow.tlt_no && (!oldRow || currentRow.tlt_no !== oldRow.tlt_no)) {
        try {
          // 呼叫 API 取得該專櫃的詳細合約資料
          const res = await this.tls29010Service
            .queryTLTTALENT_Data({ tlt_no: currentRow.tlt_no })
            .pipe(untilDestroyed(this))
            .toPromise();

          if (res.Status === '0000' && res.Data?.length) {
            const apiData = res.Data[0];

            console.log('API 回傳的專櫃合約資料:', apiData);

            // 自動填充該列的其他欄位
            currentRow.talent_id = apiData.talent_id;
            currentRow.tlt_id = apiData.tlt_id;
            currentRow.tlt_no = apiData.tlt_no;
            currentRow.cag_barcode = apiData.cag_barcode;
            currentRow.tlt_bdate = apiData.tlt_bdate;
            currentRow.tlt_edate = apiData.tlt_edate;

            // 如果是剛選定專櫃，通常預設將「是否使用」設為 'Y'
            if (!currentRow.use_flag) {
              currentRow.use_flag = 'Y';
            }

            console.log(`已更新專櫃 ${currentRow.tlt_no} 的合約資料`, apiData);
          } else {
            // 若查無資料，可考慮清空相關欄位
            this.clearRowData(currentRow);
          }
        } catch (error) {
          console.error('取得專櫃合約資料失敗', error);
        }
      }
    }

    // 最後更新元件內的資料狀態
    this.opendisc_Detail = [...newData];
  }

  // 輔助方法：清空該列資料(專櫃API無資料時使用)
  private clearRowData(row: TALPORDERD_OPENDisc) {
    // 尋找原始資料庫中對應的資料 (對應 TLS29010 的 ID 或序號)
    const originalRow = this.originalData.find(ori => ori.id === row.id);

    if (originalRow && (row.status === 'original' || row.status === 'modified')) {
      // 1. 若狀態為 original 或 modified，則依照 originalData 進行重製
      row.talent_id = originalRow.talent_id;
      row.tlt_id = originalRow.tlt_id;
      row.cag_barcode = originalRow.cag_barcode;
      row.tlt_no = originalRow.tlt_no;
      row.use_flag = originalRow.use_flag || 'Y'; // 規格書提及預設為 Y 

      // 重製後狀態應回到原始狀態 (或交由 TableEditComponent 自動處理)
      row.status = 'original';
    } else {
      // 2. 其他狀態 (如 added) 則設為空值或預設值 
      row.talent_id = 0;
      row.tlt_no = '';
      row.tlt_id = '';
      row.cag_barcode = '';
      row.use_flag = 'Y'; // 依規格書，新增列預設使用為 Y 
    }
  }

  onReset(): void {
    // 恢復主表單資料
    if (this.originalMainData) {
      this.dataForm.patchValue(this.originalMainData);
    } else {
      this.dataForm.reset();
    }

    // 恢復明細資料
    this.opendisc_Detail = [...this.originalData];
  }

  // 明細表格驗證(專櫃編號不可重複)
  validateUniqueTLT_NO(value: string, rowData: TALPORDERD_OPENDisc): { isValid: boolean; errorMessage: string[] } {
    if (!value) return { isValid: true, errorMessage: [] }; // 空值由 validateRequired 處理

    // 1. 資料來源 opendisc_Detail
    // 2. 檢查欄位 tlt_no
    // 3. 狀態判斷應與你的 status: 'original' | 'new' | 'modified' | 'deleted' 一致
    const duplicate = this.opendisc_Detail.some(item =>
      item !== rowData &&             // 排除當前行
      item.status !== 'deleted' &&    // 排除已標記刪除的明細
      item.tlt_no === value           // 檢查專櫃編號是否重複
    );

    return {
      isValid: !duplicate,
      errorMessage: duplicate ? ['專櫃編號不可重複'] : []
    };
  }
}
