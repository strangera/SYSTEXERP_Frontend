import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ass14010detailData, Ass14010Items, Ass14010Service, Ass14010Supplier } from '@service/api/ass/ass14010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';

//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-ass14010-cru',
  templateUrl: './ass14010-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    MultiSelectComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    NgIf,
    TableEditComponent,
    TranslateModule]

})
export class ASS14010CRUComponent extends BasicCruPageComponent<ass14010detailData> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // 明細由 STO_NO、RECEIPT_NO進行查詢
    MID: [this.authService.getUserInfo()?.mid || null], //token取
    STO_NO: [this.authService.getUserInfo()?.SYS_StoreNo || null], //token取

    // ---查詢頁回報---
    RECEIPT_NO: [''], // 發票/收據號碼
    TOKEN_NO: [{ value: '', disabled: true }], // 驗收單號
    RECEIPT_INS_ID: [null], // 發票維護單號
    SUPPLIER_ID: [null], // 供應商代碼
    RECEIPT_TYPE: [null], // 單據代碼
    INV_FORMAT: [null], // 發票格式
    TAX_CODE: [null], // 稅別
    NTX_AMT: [{ value: null as number | null, disabled: true }], // 未稅金額
    TX_AMT: [{ value: null as number | null, disabled: true }], // 稅額
    AMT: [{ value: null as number | null, disabled: true }], // 含稅金額
    REDU_CODE: [null], // 扣抵別
    RECEIPT_STATUS: ['1'], //(1.可刪除 2.不可刪除)
    //------

    TICKET_BE: [{ value: 0, disabled: true }], // 付款天數(明細加總)
    RECEIPT_DATE: [null], // 發票日期
    TICKET_DATE: [null], // 票據到期日
    DEC_YM: [null], // 申報年月(YYYYMM)
  });
  //---------下拉選單-------------------------------------------------------
  SUPPLIER_ID_Options: { value: string; label: string }[] = []; // 供應商編號 下拉選項 (ass12050: queryPOS2013_DropDownList)
  RECEIPT_TYPE_Options: { value: string; label: string }[] = [ // 單據種類 下拉選項
    { value: "0", label: '發票' },
    { value: "1", label: '單據' },
  ];
  TOKEN_NO_Options:
    { SUBCHECK_ID: string; TAX_AMT: number; NTAX_AMT: number; AMT: number }[] = []; // 驗收單號 下拉選項 (ass15070: queryFAASSCHKMASS15070_DropDownList)
  INV_FORMAT_Options: { value: string; label: string }[] = []; // 發票格式 下拉選項 (fin15030: queryTDS1007_DropDownList)
  TAX_CODE_Options: { value: string; label: string }[] = [
    { value: "1", label: '應稅' },
    { value: "3", label: '免稅' },
  ];
  REDU_CODE_Options: { value: string; label: string }[] = []; // 扣抵別 下拉選項 (querySys1000({ SYS_Type: 'PUR_DiscNo' }))
  // ---------供應商 表格-------------------------------------------------------
  orgsupplierData: Ass14010Supplier[] = []; // 原始供應商備份
  supplierData: Ass14010Supplier[] = [];
  supplierColumn: EditColumn[] = []; //等下拉讀取完成後寫入定義
  defaultsupplier = {
    'RECEIPT_TYPE': null, // 單據種類(0發票 1收據)
    'RECEIPT_NO': null, // 發票號碼
    'RECEIPT_DATE': null, // 發票日期
    'TICKET_DATE': null, // 票據到期日
    'DEC_YM': null, // 申報年月(YYYYMM)
    'INV_FORMAT': null, // 發票格式
    'TAX_CODE': null, // 稅別
    'REDU_CODE': null, // 扣抵別

    'TICKET_BE': null, // 付款天數
    'TOTAL_AMT': null, // 發票總金額
    'TOTAL_NTX_AMT': null, // 未稅總金額
    'TOTAL_TX_AMT': null, // 稅額總金額
  };
  // ---------單據明細 表格-------------------------------------------------------
  orgitemData: Ass14010Items[] = []; // 原始供應商備份
  itemData: Ass14010Items[] = [];
  itemColumn: EditColumn[] = [];
  // ----------------------------------------------------------------
  constructor(
    private ass14010Service: Ass14010Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS14010', this.dataForm);

    const { STO_NO, RECEIPT_NO } = this.dataForm.getRawValue();

    this.get14010Detail(STO_NO, RECEIPT_NO);

    this.loadOptions();

    // 監聽供應商變更
    this.dataForm.controls.SUPPLIER_ID.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(supplierId => {

        // 更換供應商時，原本選擇的驗收單全部清除
        this.itemData = [];

        this.dataForm.patchValue({
          TOKEN_NO: '',
          NTX_AMT: 0,
          TX_AMT: 0,
          AMT: 0
        });

        // 根據供應商重新取得驗收單
        this.loadTokenOptions(supplierId);
      });
  }

  onSubmit(frm: FormGroup) {// 驗證單據明細
    // --------------------------
    //必須至少有一筆供應商資料
    if (this.supplierData.length < 1) {
      this.messageService.errorBubble('發票資料不可為空。');
      return;
    }
    for (let i = 0; i < this.supplierData.length; i++) {
      const row = this.supplierData[i];
      const result = this.validateSupplierRow(row);
      if (!result.isValid) {
        this.messageService.unblockUi();
        this.messageService.errorBubble(`發票資料 第 ${i + 1} 筆錯誤: ${result.errorMessage}`);
        return;
      }
    }
    for (let i = 0; i < this.itemData.length; i++) {
      const row = this.itemData[i];
      const result = this.validateItemRow(row);
      if (!result.isValid) {
        this.messageService.unblockUi();
        this.messageService.errorBubble(`單據資料 第 ${i + 1} 筆錯誤: ${result.errorMessage}`);
        return;
      }
    }
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const payload = {
              MID: this.authService.getUserInfo()?.mid || null,
              STO_NO: this.authService.getUserInfo()?.SYS_StoreNo || null,
              SUPPLIER_ID: frm.get('SUPPLIER_ID')?.value,
              TICKET_BE: this.supplierData[0]?.TICKET_BE || null,
              TOKEN_NO: frm.get('TOKEN_NO')?.value,
              RECEIPT_TYPE: this.supplierData[0]?.RECEIPT_TYPE || null,
              RECEIPT_NO: this.supplierData[0]?.RECEIPT_NO || null,
              RECEIPT_DATE: this.supplierData[0]?.RECEIPT_DATE || null,
              TICKET_DATE: this.supplierData[0]?.TICKET_DATE || null,
              DEC_YM: this.supplierData[0]?.DEC_YM || null,
              INV_FORMAT: this.supplierData[0]?.INV_FORMAT || null,
              TAX_CODE: this.supplierData[0]?.TAX_CODE || null,
              REDU_CODE: this.supplierData[0]?.REDU_CODE || null,
              NTX_AMT: this.supplierData[0]?.TOTAL_NTX_AMT,
              TX_AMT: this.supplierData[0]?.TOTAL_TX_AMT,
              AMT: this.supplierData[0]?.TOTAL_AMT,
            }
            console.log('提交的payload', payload);
            this.ass14010Service.insertASS14010(payload).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
              // 還原子表單
              this.supplierData = [];
              this.itemData = [];
            });
            this.loading = false
          }
          break;
        case CRUDStatus.Edit:
          // AN39731047
          if (this.canEdit()) {
            this.loading = false;
            const payload = {
              RECEIPT_INS_ID: frm.get('RECEIPT_INS_ID')?.value, // 發票維護單號(編輯時帶入，新增時為null)
              SUPPLIER_ID: frm.get('SUPPLIER_ID')?.value, // 供應商代碼(不可修改)
              TOKEN_NO: frm.get('TOKEN_NO')?.value, // 驗收單號(多筆)
              TICKET_BE: this.supplierData[0]?.TICKET_BE || null, // 付款天數(編輯時帶入，新增時由使用者選擇)
              RECEIPT_TYPE: this.supplierData[0]?.RECEIPT_TYPE || null, // 單據代碼(編輯時帶入，新增時由使用者選擇)
              RECEIPT_NO: this.supplierData[0]?.RECEIPT_NO || null, // 發票/收據號碼(編輯時帶入，新增時由使用者輸入)
              RECEIPT_DATE: this.supplierData[0]?.RECEIPT_DATE || null, // 發票日期(編輯時帶入，新增時由使用者選擇)
              TICKET_DATE: this.supplierData[0]?.TICKET_DATE || null, // 票據到期日(編輯時帶入，新增時由使用者選擇)
              DEC_YM: this.supplierData[0]?.DEC_YM || null, // 申報年月(編輯時帶入，新增時由使用者選擇)
              INV_FORMAT: this.supplierData[0]?.INV_FORMAT || null, // 發票格式(編輯時帶入，新增時由使用者選擇)
              TAX_CODE: this.supplierData[0]?.TAX_CODE || null, // 稅別(編輯時帶入，新增時由使用者選擇)
              REDU_CODE: this.supplierData[0]?.REDU_CODE || null, // 扣抵別(編輯時帶入，新增時由使用者選擇)
              NTX_AMT: this.supplierData[0]?.TOTAL_NTX_AMT,
              TX_AMT: this.supplierData[0]?.TOTAL_TX_AMT,
              AMT: this.supplierData[0]?.TOTAL_AMT,
            }

            console.log('提交的payload', payload);
            this.ass14010Service.updateASS14010(payload).subscribe((res) => {
              if (res.Data.O_MSGTYPE === 'S') {
                this.messageService.successBubble('更新成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble('更新失敗: ' + res.Data.O_MESSAGE || '更新失敗');
              }
            });
            this.loading = false
          }
          break;
      }
    });
  }
  //讀取明細
  get14010Detail(STO_NO: string | null, RECEIPT_NO: string) {
    //編輯模式確認是否包含指定引數
    if (this.crudstatus == CRUDStatus.Edit || this.crudstatus == CRUDStatus.Read) {
      //編輯模式不可變更供應商代號
      if (this.crudstatus == CRUDStatus.Edit) {
        this.dataForm.controls.SUPPLIER_ID.disable();
      }
      if (!STO_NO || !RECEIPT_NO) {
        this.messageService.errorBubble('明細必須包含分店編號與收據編號')
      }
      this.ass14010Service
        .queryDetailASS14010({ STO_NO: STO_NO, RECEIPT_NO: RECEIPT_NO })
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          // 確保 res.Data.QueryData 有資料
          console.log('明細資料', res);
          // 2. 程式碼存取時要加上索引
          if (res.Data) {
            // 檢查 Supplier 是否為陣列，若不是則轉為陣列
            const supplierRaw = res.Data.Supplier;
            this.supplierData = Array.isArray(supplierRaw)
              ? [...supplierRaw]
              : (supplierRaw ? [supplierRaw] : []);

            // 檢查 Details 是否為陣列
            const detailsRaw = res.Data.Details;
            this.itemData = Array.isArray(detailsRaw)
              ? [...detailsRaw]
              : (detailsRaw ? [detailsRaw] : []);

            // 深拷備份(切斷與原始資料物件的參考連結)
            this.orgsupplierData = JSON.parse(JSON.stringify(this.supplierData));
            this.orgitemData = JSON.parse(JSON.stringify(this.itemData));

            this.updateTokenNoSum(); //更新付款天數加總

            console.log('明細供應商資料', this.supplierData);
            console.log('明細單據資料', this.itemData);
          } else {
            // 如果整個 res.Data 都是空的，也要清空表格防止舊資料殘留
            this.supplierData = [];
            this.itemData = [];
          }
        });
    }
  }

  // 讀取 dropdown 選項
  loadOptions() {
    const supplier$ = this.dropDownListService.queryPOS2013_DropDownList({});
    const invFormat$ = this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 });
    const reduCode$ = this.dropdownApiService.querySys1000({ SYS_Type: 'PUR_DiscNo' });

    forkJoin([supplier$, invFormat$, reduCode$])
      .pipe(untilDestroyed(this))
      .subscribe(([resSup, resInv, resRedu]) => {

        // 1. 供應商
        this.SUPPLIER_ID_Options = (resSup.Data ?? []).map((item: any) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));

        // 2. 發票格式
        this.INV_FORMAT_Options = (resInv.Data.INV_GUITypes ?? [])
          .filter(item => ['21', '22', '25'].includes(item.INV_GUIType))
          .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
          .map(item => ({
            label: `${item.INV_GUIType}-${item.INV_GUIName}`,
            value: item.INV_GUIType
          }));

        // 3. 扣抵別
        this.REDU_CODE_Options = (resRedu ?? []).map(res => ({
          label: res.No + '-' + res.Name,
          value: res.No,
        }));

        // 尚未選供應商，不載入驗收單
        this.TOKEN_NO_Options = [];

        this.initSupplierColumns();
      });
  }
  private loadTokenOptions(supplierId: string | null) {

    // 尚未選擇供應商
    if (!supplierId) {
      this.TOKEN_NO_Options = [];

      // 清空已選的單據資料
      this.itemData = [];

      this.dataForm.patchValue({
        TOKEN_NO: '',
        NTX_AMT: 0,
        TX_AMT: 0,
        AMT: 0
      });

      // 重新建立欄位，讓驗收單 dropdown Disabled
      this.initSupplierColumns();

      return;
    }

    this.ass14010Service
      .queryFAASSCHKD_LIST_DropDownList({
        SUPPLIER_ID: supplierId
      })
      .pipe(untilDestroyed(this))
      .subscribe(res => {

        this.TOKEN_NO_Options = (res.Data ?? []).map((item: any) => ({
          SUBCHECK_ID: item.SUBCHECK_ID,
          TAX_AMT: item.TAX_AMT,
          NTAX_AMT: item.NTAX_AMT,
          AMT: item.AMT
        }));

        // 重新建立欄位，更新 dropdown options
        this.initSupplierColumns();
      });
  }
  //---發票明細---

  //欄位名稱初始化
  private initSupplierColumns() {
    this.supplierColumn = [
      { field: 'RECEIPT_TYPE', header: '單據種類', type: 'dropdown', options: [...this.RECEIPT_TYPE_Options], optionLabel: 'label', optionValue: 'value' },
      { field: 'RECEIPT_NO', header: '發票號碼', type: 'input' },
      { field: 'RECEIPT_DATE', header: '發票日期', type: 'date' },
      { field: 'TICKET_DATE', header: '票據到期日', type: 'date' },
      { field: 'DEC_YM', header: '申報年月', type: 'input' },
      { field: 'INV_FORMAT', header: '發票格式', type: 'dropdown', options: [...this.INV_FORMAT_Options], optionLabel: 'label', optionValue: 'value' },
      { field: 'TAX_CODE', header: '稅別', type: 'dropdown', options: [...this.TAX_CODE_Options], optionLabel: 'label', optionValue: 'value' },
      { field: 'REDU_CODE', header: '扣抵別', type: 'dropdown', options: [...this.REDU_CODE_Options], optionLabel: 'label', optionValue: 'value' },

      { field: 'TICKET_BE', header: '付款天數', type: 'inputNumber' },
      { field: 'TOTAL_NTX_AMT', header: '未稅金額', type: 'inputNumber', disabled: () => true },
      { field: 'TOTAL_TX_AMT', header: '稅額', type: 'inputNumber', disabled: () => true },
      { field: 'TOTAL_AMT', header: '含稅金額', type: 'inputNumber', disabled: () => true },
    ];
    this.itemColumn = [
      { field: 'TOKEN_NO', header: '驗收單號', type: 'dropdown', options: this.TOKEN_NO_Options, optionLabel: 'SUBCHECK_ID', optionValue: 'SUBCHECK_ID', disabled: () => !this.dataForm.get('SUPPLIER_ID')?.value },
      // { field: 'TOKEN_NO', header: '驗收單號', type: 'input' },
      { field: 'NTX_AMT', header: '未稅金額', type: 'inputNumber', aggregate: 'sum', disabled: () => true },
      { field: 'TX_AMT', header: '稅額', type: 'inputNumber', aggregate: 'sum', disabled: () => true },
      { field: 'AMT', header: '含稅金額', type: 'inputNumber', aggregate: 'sum', disabled: () => true },
    ];
  }
  //依據明細驗收單號進行主檔token_no刷新
  onSupplierDataChange(eventData: Ass14010Supplier[]) {
    // 1. 變更後的資料同步回 itemData
    this.supplierData = eventData;

    // 2. 實作「發票號清空連帶清除 單據資料」
    // 檢查是否還有任何發票號碼存在
    const hasReceiptNo = this.supplierData.some(item =>
      item.RECEIPT_NO && item.RECEIPT_NO.trim() !== ''
    );

    // 如果發票號碼被清空（例如使用者刪除文字或整列），則清空單據資料
    if (!hasReceiptNo) {
      this.itemData = []; // 清空單據明細表格

      // 同步更新主表單中的驗收單號與金額欄位
      this.dataForm.patchValue({
        TOKEN_NO: '',
        NTX_AMT: 0,
        TX_AMT: 0,
        AMT: 0,
        TICKET_BE: 0
      });
    }

    //更新付款天數
    this.updateTokenNoSum()
  }

  //更新付款天數
  private updateTokenNoSum() {
    const ticket_sum = this.supplierData.reduce((sum, item) => {
      return sum + (Number(item.TICKET_BE) || 0);
    }, 0);

    this.dataForm.get('TICKET_BE')?.setValue(ticket_sum);
  }

  //驗證供應商資料
  validateSupplierRow = (rowData: Ass14010Supplier): { isValid: boolean; errorMessage: string } => {
    // 1. 檢查發票號碼是否為空
    const RECEIPT_NO = rowData?.RECEIPT_NO?.trim();
    if (!RECEIPT_NO) {
      return { isValid: false, errorMessage: '發票號碼不能為空。' };
    }
    // 2. 檢查發票號碼格式 (假設格式為兩碼英文+八碼數字，例如 AB12345678)
    const receiptNoPattern = /^[A-Z]{2}\d{8}$/;
    if (!receiptNoPattern.test(RECEIPT_NO)) {
      return { isValid: false, errorMessage: '發票號碼格式不正確，應為兩碼英文加八碼數字。' };
    }
    // 3. 發票總金額應為未稅金額加稅額總金額
    const expectedTotal = (Number(rowData.TOTAL_NTX_AMT) || 0) + (Number(rowData.TOTAL_TX_AMT) || 0);
    if (Number(rowData.TOTAL_AMT) !== expectedTotal) {
      return { isValid: false, errorMessage: `含稅金額應為未稅金額加稅額，應為 (${expectedTotal}) 元。` };
    }

    return { isValid: true, errorMessage: '' };
  }
  // ---驗收單明細---

  //依據明細驗收單號進行主檔token_no刷新
  onItemDataChange(eventData: Ass14010Items[]) {
    // 1. 變更後的資料同步回 itemData
    // 遍歷 eventData，若 TOKEN_NO 有值且金額為空，則從 Options 抓取對應金額
    this.itemData = eventData.map(item => {
      if (item.TOKEN_NO) {
        const matchedOption = this.TOKEN_NO_Options.find(opt => opt.SUBCHECK_ID === item.TOKEN_NO);
        if (matchedOption) {
          return {
            ...item,
            // 只有在金額欄位尚未輸入或需要連動時才自動填入
            NTX_AMT: matchedOption.NTAX_AMT,
            TX_AMT: matchedOption.TAX_AMT,
            AMT: matchedOption.AMT
          };
        }
      }
      return item;
    });

    // 2. 取得所有不為空的 TOKEN_NO 並用逗號結合
    const tokenNos = this.itemData
      .map(item => item.TOKEN_NO)
      .filter(no => no !== null && no !== undefined && no !== '')
      .join(',');

    // 3. 更新主表單的值
    // 由於 TOKEN_NO 是 disabled 狀態，setValue 依然有效
    this.dataForm.get('TOKEN_NO')?.setValue(tokenNos);

    // 計算 itemData 的各項總和
    const totalNtx = this.itemData.reduce((sum, item) => sum + (Number(item.NTX_AMT) || 0), 0);
    const totalTx = this.itemData.reduce((sum, item) => sum + (Number(item.TX_AMT) || 0), 0);
    const totalAmt = this.itemData.reduce((sum, item) => sum + (Number(item.AMT) || 0), 0);

    // 3. 同步到發票資料 (supplierData) 的第一筆
    if (this.supplierData && this.supplierData.length > 0) {
      // 建立一個新物件參考以觸發變更偵測
      this.supplierData[0] = {
        ...this.supplierData[0],
        TOTAL_NTX_AMT: totalNtx,
        TOTAL_TX_AMT: totalTx,
        TOTAL_AMT: totalAmt
      };

      // 觸發表格重新渲染
      this.supplierData = [...this.supplierData];
    }

    // 4. 同步更新主表單的金額欄位 (如果 dataForm 也需要顯示)
    this.dataForm.patchValue({
      NTX_AMT: totalNtx,
      TX_AMT: totalTx,
      AMT: totalAmt
    });

  }

  //驗收單號前端驗證機制
  validateItemRow = (rowData: Ass14010Items): { isValid: boolean; errorMessage: string } => {
    const TOKEN_NO = rowData?.TOKEN_NO?.trim();

    // 1. 檢查驗收單號是否為空
    if (!TOKEN_NO) {
      return { isValid: false, errorMessage: '驗收單號不能為空。' };
    }

    // 2. 檢查重複 
    const isDuplicate = this.itemData.some(item =>
      item !== rowData && // 排除掉自己 (記憶體位址比對)
      item.TOKEN_NO?.trim() === TOKEN_NO
    );

    if (isDuplicate) {
      return { isValid: false, errorMessage: `驗收單號不可重複。` };
    }

    return { isValid: true, errorMessage: '' };
  };

  //清除明細內容
  clearSubForm() {
    const restoredData = JSON.parse(JSON.stringify(this.orgsupplierData));

    this.supplierData = restoredData.map((item: any) => ({
      ...item,
      // 手動將字串轉回 Date 物件
      RECEIPT_DATE: item.RECEIPT_DATE ? new Date(item.RECEIPT_DATE) : null,
      TICKET_DATE: item.TICKET_DATE ? new Date(item.TICKET_DATE) : null
    }));
    this.itemData = JSON.parse(JSON.stringify(this.orgitemData));
    this.updateTokenNoSum(); // 重新觸發加總計算
  }
}
