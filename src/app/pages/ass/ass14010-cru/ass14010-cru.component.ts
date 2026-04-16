import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ass14010detailData, Ass14010Items, Ass14010Service, Ass14010Supplier } from '@service/api/ass/ass14010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';

//3.1.4.1  進貨發票建檔作業 CRU
@Component({
  selector: 'app-ass14010-cru',
  templateUrl: './ass14010-cru.component.html',
  styleUrl: './ass14010-cru.component.scss',
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

    SUPPLIER_ID: [{ value: null, disabled: true }], // 供應商編號
    TICKET_BE: [{ value: null, disabled: true }], // 付款天數(這個明細找不到)

    NTX_AMT: [{ value: null, disabled: true }], // 未稅金額
    TX_AMT: [{ value: null, disabled: true }], // 稅額
    AMT: [{ value: null, disabled: true }], // 含稅金額

    TOKEN_NO: [{ value: '', disabled: true }], // 驗收單號(多筆: TOKEN_NO以逗號相連)
    RECEIPT_TYPE: [], //單據種類(0發票 1收據)
    RECEIPT_NO: ['', [Validators.maxLength(1000)]], // 發票/收據號碼
    RECEIPT_DATE: [null], // 發票日期
    TICKET_DATE: [null], // 票據到期日
    DEC_YM: [null], // 申報年月(YYYYMM)
    INV_FORMAT: ['', [Validators.maxLength(20)]], // 發票格式
    TAX_CODE: ['', [Validators.maxLength(20)]], // 稅別
    REDU_CODE: ['', [Validators.maxLength(20)]], // 扣抵別
  });
  //---------下拉選單-------------------------------------------------------
  SUPPLIER_ID_Options: { value: string; label: string }[] = []; // 供應商編號 下拉選項 (ass12050: queryPOS2013_DropDownList)
  RECEIPT_TYPE_Options: { value: string; label: string }[] = [ // 單據種類 下拉選項
    { value: "0", label: '發票' },
    { value: "1", label: '單據' },
  ];
  TOKEN_NO_Options: { value: string; label: string }[] = []; // 進貨單號 下拉選項 (ass15070: queryFAASSCHKMASS15070_DropDownList)
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
    'SUPPLIER_ID': null, // 供應商代碼
    'SUPPLIER_NAME': null, // 供應商名稱
    'TICKET_BE': null, // 付款天數
    'TOTAL_AMT': null, // 發票總金額
    'TOTAL_NTX_AMT': null, // 未稅總金額
    'TOTAL_TX_AMT': null, // 稅額總金額
  };
  // ---------單據明細 表格-------------------------------------------------------
  orgitemData: Ass14010Items[] = []; // 原始供應商備份
  itemData: Ass14010Items[] = [];
  itemColumn: EditColumn[] = [
    { field: 'TOKEN_NO', header: '驗收單號', type: 'input' },
    { field: 'NTX_AMT', header: '未稅金額', type: 'inputNumber' },
    { field: 'TX_AMT', header: '稅額', type: 'inputNumber' },
    { field: 'AMT', header: '含稅金額', type: 'inputNumber' },
  ];
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
    console.log('接收端', this.dataForm.value);

    const { STO_NO, RECEIPT_NO } = this.dataForm.getRawValue();
    this.get14010Detail(STO_NO, RECEIPT_NO);
    this.loadOptions();

    // 觀察 驗收單號(TOKEN_NO)發生變化時自動同步給主檔的驗收單號 (TOKEN_NO)
  }

  onSubmit(frm: FormGroup) {// 驗證單據明細
    // --------------------------
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
      // 送出只會更新上面的部分 (明細都不送出)
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // const formValue = frm.getRawValue();
            // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.dataForm.reset();
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('edit submit', frm.getRawValue());
            console.log('edit supplierData', this.supplierData);
            console.log('edit itemData', this.itemData);
            this.loading = false;
            // const formValue = frm.getRawValue();
            // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
            //   this.onCancel();
            // });
          }
          break;
      }
    });
  }
  //讀取明細
  get14010Detail(STO_NO: string | null, RECEIPT_NO: string) {
    //編輯模式確認是否包含指定引數
    if (this.crudstatus == CRUDStatus.Edit || CRUDStatus.Read) {
      if (!STO_NO || !RECEIPT_NO) {
        this.messageService.errorBubble('明細必須包含分店編號與收據編號')
      }
      this.ass14010Service
        .queryDetailASS14010({ STO_NO: STO_NO, RECEIPT_NO: RECEIPT_NO })
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          // 確保 res.Data.QueryData 有資料
          console.log('明細資料', res);
          // 2. 程式碼存取時要加上索引 [0]
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

            // 同步備份原始資料
            this.orgsupplierData = [...this.supplierData];
            this.orgitemData = [...this.itemData];

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

  // 讀取dopropdown選項
  loadOptions() {
    // 供應商編號
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.SUPPLIER_ID_Options = list.map((item: { VEN_No?: string; No?: string; Name?: string }) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));

        this.supplierColumn = [
          { field: 'SUPPLIER_ID', header: '供應商代碼' },
          { field: 'SUPPLIER_NAME', header: '供應商名稱' },
          { field: 'TICKET_BE', header: '付款天數', type: 'inputNumber' },
          { field: 'TOTAL_AMT', header: '發票總金額', type: 'inputNumber' },
          { field: 'TOTAL_NTX_AMT', header: '未稅總金額', type: 'inputNumber' },
          { field: 'TOTAL_TX_AMT', header: '稅額總金額', type: 'inputNumber' },
        ]
      });
    // 進貨單號
    this.dropdownApiService
      .queryFAASSCHKMASS15070_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.TOKEN_NO_Options = (options ?? []).map(res => ({
          label: res.label,
          value: res.value,
        }));
      });
    //發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.INV_FORMAT_Options = r.Data.INV_GUITypes
        .filter(item => ['21', '22', '25'].includes(item.INV_GUIType))
        .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
        .map(item => ({ label: `${item.INV_GUIType}-${item.INV_GUIName}`, value: item.INV_GUIType }));
    });
    // 扣抵別
    this.dropdownApiService
      .querySys1000({ SYS_Type: 'PUR_DiscNo' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        // console.log('扣抵別', res)
        this.REDU_CODE_Options = (res ?? []).map(res => ({
          label: res.No + '-' + res.Name,
          value: res.No,
        }));
      });
  }

  //依據明細驗收單號進行主檔token_no刷新
  onTableDataChange(eventData: Ass14010Items[]) {
    // 1. 變更後的資料同步回 itemData
    this.itemData = eventData;

    // 2. 取得所有不為空的 TOKEN_NO 並用逗號結合
    const tokenNos = this.itemData
      .map(item => item.TOKEN_NO)
      .filter(no => no !== null && no !== undefined && no !== '')
      .join(',');

    // 3. 更新主表單的值
    // 由於 TOKEN_NO 是 disabled 狀態，setValue 依然有效
    this.dataForm.get('TOKEN_NO')?.setValue(tokenNos);
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
    this.supplierData = this.orgsupplierData; // 還原表格資料
    this.itemData = this.orgitemData; // 還原表格資料
  }
}
