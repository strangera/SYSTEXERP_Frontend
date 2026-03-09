// --Commonly used imports--
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TableEditComponent } from '../fin13040-cru/fin13040-table-edit/fin13040-table-edit.component';
import { EditColumn } from '../fin13040-cru/fin13040-table-edit/fin13040-table-edit.model';

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

// POS2064 明細檔
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
    ButtonModule]
})
export class FIN72010CRUComponent extends BasicCruPageComponent<sample72010> implements OnInit {
  @ViewChild('detailTable') detailTable!: ExpandableEditTableComponent;
  // ---------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    KeepQuota_No: [null, [Validators.maxLength(20)]], // 零用金單號
    applyDate: [null], // 申請日期
    Pettycashapplicant: [null], // 申請人
    Pettycashcustodian: [null], // 保管人
    Debitamount: [null, Validators.max(9999999999)], // 申請人組織代號
    keepingUnit: [null, [Validators.maxLength(20)]], // 申請人組織代號
    custodianUnit: [null, [Validators.maxLength(20)]], // 保管人組織代號
    keepingUnitName: [null, [Validators.maxLength(20)]], // 保管單位名稱
  });

  // ---------明細表格 至少要一筆-------------------------------------------------------
  POS2064: POS2064[] = [];
  orgPOS2064: POS2064[] = []; // POS2064(備分)
  selectedPOS2064Items: POS2064[] = [];
  isRefreshing = false; // 是否是重製表單狀態(預設為false)
  // 預設新項目模板
  defaultPOS2064 = {
    id: 0, //新增
    type01: '',
    type02: '',
    type03: '',
    type04: '',
    type05: '',
    type06: '',
    type07: '',
    type08: '',
    type09: '',
    type10: '',
    type11: '',
    type12: '',
    type13: '',
    type14: '',
    type15: '',
    type16: '',

    status: 'new'
  };

  // POS2064 展開式表格的欄位定義
  POS2064Column: EditColumn[] = []; // 等下拉選單好了再寫入POS2020欄位
  // 預設 POS2064 新項目模板(如果預設有需要變動的情況)
  createDefaultNewPOS2064() {
    this.defaultPOS2064 = {
      id: 0,
      type01: '',
      type02: '',
      type03: '',
      type04: '',
      type05: '',
      type06: '',
      type07: '',
      type08: '',
      type09: '',
      type10: '',
      type11: '',
      type12: '',
      type13: '',
      type14: '',
      type15: '',
      type16: '',

      status: 'new'
    };
  }
  // ---

  // 展開式表格的載入狀態
  POS2064loading = false;

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
  // ----------------------------------------------------------------
  constructor() {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN72010', this.dataForm);
    this.loadOptions();
    // #region 讀取明細檔
    if (this.crudstatus == CRUDStatus.Edit || this.crudstatus == CRUDStatus.Read) {
      //查詢明細檔案 (編輯模式)
      console.log('編輯模式，明細檔讀取中', this.dataForm.value);

      //讀取明細檔 並載入預設值 (key: 假設是零用金單號)
      this.isRefreshing = true;
      this.loadDetail(this.dataForm.get('KeepQuota_No')?.value || '')
        .then(() => {
          this.isRefreshing = false; // ✅ 等 loadDetail 完成後再關
        })
        .catch(() => {
          this.isRefreshing = false;
        });
    }
    // 2. 即使進入編輯模式或新增模式，也要確保 POS2064 是陣列
    if (!this.POS2064) {
      this.POS2064 = [];
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    //將新的資料id指定為null
    const processedDetail = this.POS2064.map(item => {
      // 刪除 key 為空字串的欄位
      if ("" in item) {
        delete item[""];
      }

      if (item.status === 'new') {
        return { ...item, id: null }; // 把新項目的 id 改為 null
      }
      return item; // 其他不變
    });

    const formValue = frm.getRawValue();
    const body = {
      ...formValue,
      Detail: processedDetail, // 將明細資料加入請求體
    }

    console.log('送出資料:', JSON.stringify(body, null, 2));
    // switch (this.crudstatus) {
    //   case CRUDStatus.Create:
    //     if (this.canAdd()) {
    //       console.log('insert:', JSON.stringify(body, null, 2));
    //       console.log('detail', this.potentialDetail);
    //       this.tls12010Service.insertTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
    //         this.messageService.successBubble('新增成功');
    //         // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
    //         this.dataForm.reset(); // 重置表單
    //         this.potentialDetail = []; // 清除明細
    //       });
    //     }
    //     break;
    //   case CRUDStatus.Edit:
    //     if (this.canEdit()) {
    //       console.log('update:', JSON.stringify(body, null, 2));
    //       console.log('detail', this.potentialDetail);
    //       this.tls12010Service.updateTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
    //         this.messageService.successBubble('更新成功');
    //         this.onCancel(); // 儲存後，會返回列表
    //       });
    //     }
    //     break;
    // }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    if (this.crudstatus == CRUDStatus.Create)
      this.POS2064 = []; // 清除明細
    if (this.crudstatus == CRUDStatus.Edit) {
      console.log('還原明細', this.orgPOS2064);
      // ✅ 修改這裡：確保還原回去的是全新的物件複本
      this.POS2064 = JSON.parse(JSON.stringify(this.orgPOS2064));
    }
  }

  // #region 讀取明細檔案
  async loadDetail(keepQuotaNo: string): Promise<void> {
    if (keepQuotaNo == '') {
      console.log('讀取keepQuotaNo', this.dataForm.value)
      if (this.crudstatus !== CRUDStatus.Create) {
        console.log('該資料無明細');
      }
      this.POS2064 = [];
    } else {
      // this.tls51070Service.queryTLS51070_Detail({ 'keepQuotaNo': keepQuotaNo }).pipe(untilDestroyed(this)).subscribe(async (response) => {
      //   const rawPOS2064 = response.Data[0].rawPOS2064;
      //   this.POS2064 = rawPOS2064.map(item => ({
      //     id: item.id,
      //     PLU_MagNo: item.PLU_MagNo,
      //     PLU_OrderPrc: item.PLU_OrderPrc,

      //     VEN_No: item.VEN_No,
      //     STO_No: item.STO_No,
      //     PLU_Purchase: item.PLU_Purchase,
      //     PLU_TransType: item.PLU_TransType,
      //     PLU_TransDay: item.PLU_TransDay,
      //     Remark: item.Remark,
      //     VDP_LastStockDate: item.VDP_LastStockDate,
      //     status: 'old'
      //   }));

      //   //建立項目模板
      this.createDefaultNewPOS2064(); //根據需要初始化default預設值

      //   console.log('明細 POS2064', this.POS2064);
      //   this.orgPOS2064 = this.POS2064
      // });
    }
  }

  // 在 fin72010-cru.component.ts 中修正
  validate2064Row = (rowData: any, index?: number): { isValid: boolean; errorMessage: string } => {
    // 初始化回傳物件
    const result = { isValid: true, errorMessage: '' };

    // 範例驗證：檢查會計費用科目 (type01) 是否必填
    if (!rowData.type01 || rowData.type01.trim() === '') {
      result.isValid = false;
      result.errorMessage = '「會計費用科目」為必填項目';
      return result;
    }

    // 範例驗證：檢查項目摘要 (type02) 是否必填
    if (!rowData.type02 || rowData.type02.trim() === '') {
      result.isValid = false;
      result.errorMessage = '「項目摘要」為必填項目';
      return result;
    }

    // 若還有其他欄位驗證可依此類推...

    return result;
  };

  // 讀取下拉
  loadOptions() {
    this.POS2064Column = [
      { field: 'type01', header: '會計費用科目', type: 'input', width: '12rem' },
      { field: 'type02', header: '項目摘要', type: 'input', width: '12rem' },
      { field: 'type03', header: '組織代號', type: 'input', width: '12rem' },
      { field: 'type04', header: '明細類別', type: 'input', width: '12rem' },
      { field: 'type05', header: '發票格式', type: 'input', width: '12rem' },
      { field: 'type06', header: '發票/收據號碼', type: 'input', width: '12rem' },
      { field: 'type07', header: '發票日期', type: 'input', width: '12rem' },
      { field: 'type08', header: '申報年月', type: 'input', width: '12rem' },
      { field: 'type09', header: '廠商統一編號', type: 'input', width: '12rem' },
      { field: 'type10', header: '發票用途', type: 'input', width: '12rem' },
      { field: 'type11', header: '發票總金額', type: 'input', width: '12rem' },
      { field: 'type12', header: '課稅別', type: 'input', width: '12rem' },
      { field: 'type13', header: '發票未稅金額', type: 'input', width: '12rem' },
      { field: 'type14', header: '發票稅額', type: 'input', width: '12rem' },
      { field: 'type15', header: '扣抵代號', type: 'input', width: '12rem' },
      { field: 'type16', header: '彙總張數', type: 'input', width: '12rem' },
    ];
  }
}
