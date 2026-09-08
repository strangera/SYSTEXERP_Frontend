import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Column } from '@others/component/table/table.model';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import {
  DropdownTableComponent,
  FieldsConfig,
} from '@shared/components/dropdown-table/dropdown-table.component';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { TableEditComponent } from './fin13040-table-edit/fin13040-table-edit.component';
import { EditColumn } from './fin13040-table-edit/fin13040-table-edit.model';

@Component({
  selector: 'app-fin13040-cru',
  templateUrl: './fin13040-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    TableEditComponent,
    ButtonModule,
    // NgClass,
    NgIf,
    YearMonthComponent,
    DropdownTableComponent,
  ],
})
export class FIN13040CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    // InvoiceType hidden in UI; default to '35' so backend receives 35 when creating
    InvoiceType: ['35', Validators.required],
    SAL_Type: ['', Validators.required],
    GUI_Track: ['', [Validators.maxLength(2)]],
    INV_GUINumber: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{8}$/)],
    ],
    InvoiceDate: [null as Date | null, Validators.required],
    Buyer_Uniform: [''],
    PUR_TaxType: ['', Validators.required],
    Voucher_No: [null], // Added Voucher_No control
    AssetType: [''],
    PUR_InvoiceTitle: ['', [Validators.maxLength(64)]],
    Buyer_VenNo: [''],
    Buyer_Name: [''],
    PUR_Tax: [0],
    PUR_Amt: [{ value: 0, disabled: true }],
    PUR_Net: [{ value: 0, disabled: true }],
    Invoice_Cancel: [{ value: 'N', disabled: true }],
    INV_DeclareYM: ['', Validators.required],
    INV_REMARK: [''],
  });

  /** 下拉選單與資料 */
  InvoiceType_Options: any[] = [];
  SAL_Type_Options = getSYS1000Options('T205');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: any[] = [];
  filteredBuyerOptions: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buyerOpForm: FormGroup = this.formBuilder.group({} as any);
  buyerFieldsConfig: FieldsConfig[] = [
    { field: 'label', header: '買受人統一編號', mainDataField: true },
  ];
  buyerDialogColumns: Column[] = [
    { field: 'value', header: '統一編號' },
    { field: 'VEN_Name', header: '廠商名稱' },
  ];
  Invoice_CancelOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' },
  ];
  private isLoadingDetail = false;
  /** 使用者是否已手動調整過稅額（明細表無稅額欄位可調整時，改由此header欄位手動輸入） */
  private isTaxManuallyEdited = false;
  /** 明細資料表 */
  columns: EditColumn[] = [];
  data: any[] = [];
  totalRecords = 0;
  INV_ItemName_Options: any[] = [];
  /** 儲存後端主檔 ID */
  public currentDetailId: number | null = null;

  @ViewChild('tableEdit') tableEdit!: TableEditComponent;

  constructor(
    private dropDownListService: DropDownListService,
    private fin13040Service: Fin13040Service,
  ) {
    super();
  }

  // 在模板使用：新增模式且選到 InvoiceType='35' 時隱藏發票號碼欄位
  get showInvoiceNumberField(): boolean {
    return !(
      this.crudstatus === CRUDStatus.Create &&
      this.dataForm?.controls?.InvoiceType?.value === '35'
    );
  }

  // 在模板使用：發票號碼欄位是否應為唯讀（Edit 模式或 control 被停用）
  get isInvoiceNumberReadonly(): boolean {
    const ctrl = this.dataForm?.controls?.INV_GUINumber;
    return this.crudstatus === CRUDStatus.Edit || !!ctrl?.disabled;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  private applyEditModeLock(): void {
    if (!this.isEditMode) return;

    Object.keys(this.dataForm.controls).forEach((key) => {
      if (['Voucher_No', 'INV_REMARK'].includes(key)) {
        this.dataForm.get(key)?.enable({ emitEvent: false });
      } else {
        this.dataForm.get(key)?.disable({ emitEvent: false });
      }
    });
  }

  // ======================== 初始化 ========================
  ngOnInit(): void {
    this.initializePage('FIN13040', this.dataForm);
    this.loadBuyerUniformOptions();
    this.loadInvoiceTypeOptions();
    this.applyEditModeLock();

    // 新增模式：預設申報年月（當期雙數月）及發票日期（今天）
    if (this.crudstatus === CRUDStatus.Create) {
      const today = new Date();
      const month = today.getMonth() + 1; // 1-12
      const evenMonth = month % 2 === 0 ? month : month + 1;
      const evenMonthStr = String(evenMonth).padStart(2, '0');
      this.dataForm.patchValue({
        INV_DeclareYM: `${today.getFullYear()}${evenMonthStr}`,
        InvoiceDate: today,
      });
    }

    // 編輯模式：只允許修改傳票號碼、備註
    this.applyEditModeLock();

    // 自動將發票號碼轉為大寫，方便使用者輸入小寫英文字母時仍符合格式
    this.dataForm
      .get('INV_GUINumber')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val && typeof val === 'string') {
          this.dataForm.controls.INV_GUINumber.setValue(val.toUpperCase(), {
            emitEvent: false,
          });
        }
      });

    // 若為新增且發票格式為 35，則隱藏/停用發票號碼欄位
    this.dataForm
      .get('InvoiceType')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (this.crudstatus === CRUDStatus.Create && val === '35') {
          this.dataForm.controls.INV_GUINumber.setValue('', {
            emitEvent: false,
          });
          this.dataForm.controls.INV_GUINumber.disable({ emitEvent: false });
          // 若不是新增模式或不是 35，確保欄位可用（非 Read/Edit 模式）
        } else if (
          !this.isFormReadable &&
          !this.isEditMode &&
          this.dataForm.controls.INV_GUINumber.disabled
        ) {
          this.dataForm.controls.INV_GUINumber.enable({ emitEvent: false });
        }
      });

    // 初始檢查：若預設值為 '35'（例如已把 InvoiceType 預設為 '35'）且為新增模式，則一開始也要停用發票號碼
    try {
      const currentInvType = this.dataForm.get('InvoiceType')?.value;
      if (this.crudstatus === CRUDStatus.Create && currentInvType === '35') {
        this.dataForm.controls.INV_GUINumber.setValue('', { emitEvent: false });
        this.dataForm.controls.INV_GUINumber.disable({ emitEvent: false });
      }
    } catch (e) {
      // ignore
    }

    const rowData = history.state?.rowdata;
    console.log('主檔資料:', rowData);

    if (rowData) {
      this.fillHeaderData(rowData);
      this.applyEditModeLock();
      this.loadDetail(rowData);
    }

    // SAL_Type 改變時重新載入品項
    this.dataForm
      .get('SAL_Type')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (this.isLoadingDetail) return;
        if (!val) return;

        console.log('[valueChanges] SAL_Type 改變:', val);
        this.loadINVItemOptions();
      });

    // 初始若已有 SAL_Type


    // 統編 free-text 輸入時，若剛好符合選項則帶入廠商資訊
    // （下拉選取的情境由 onBuyerSelect 處理）
    this.dataForm
      .get('Buyer_Uniform')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((val: any) => {
        if (val && typeof val === 'object') return; // 選取事件由 onBuyerSelect 處理

        // 使用者可能複製貼上下拉顯示的完整文字「代號 - 名稱」，只取 "-" 前的代號作為實際值
        if (typeof val === 'string' && val.includes(' - ')) {
          const code = val.split(' - ')[0].trim();
          if (code !== val) {
            this.dataForm.controls.Buyer_Uniform.setValue(code);
            return;
          }
        }

        const selected = this.Buyer_Uniform_Options.find(
          (o) => o.value === val,
        );
        this.dataForm.patchValue(
          {
            Buyer_VenNo: selected?.VEN_No ?? '',
            Buyer_Name: selected?.VEN_Name ?? '',
          },
          { emitEvent: false },
        );
        if (selected) {
          this.dataForm.patchValue(
            { PUR_InvoiceTitle: selected.VEN_Name },
            { emitEvent: false },
          );
        }
      });

    // 稅類別改變時，重新載入稅率
    this.dataForm.get('PUR_TaxType')?.valueChanges.subscribe((taxType) => {
      // 載入既有資料（編輯/檢視）時是程式帶入既有稅別，不是使用者操作，金額一律照存檔值顯示，不重算
      if (this.isLoadingDetail) return;

      const isNoTax = this.isNoTaxType(taxType);
      // 零稅/免稅：稅額一律歸0且不可手動調整；重算前先清除手動旗標，讓加總改回自動算出的0
      if (isNoTax) this.isTaxManuallyEdited = false;

      this.recalculateAllDetailByTaxType(taxType);

      if (isNoTax) {
        this.dataForm.controls.PUR_Tax.disable({ emitEvent: false });
      } else if (!this.isFormReadable && !this.isEditMode) {
        this.dataForm.controls.PUR_Tax.enable({ emitEvent: false });
      }
    });

    // 明細表無稅額欄位，若使用者手動修改上方稅額，記錄為手動調整並重算未稅金額（未稅金額 = 含稅金額 - 稅額）
    // 內部自動加總（updateMasterAmounts/recalculateMasterAmount）都以 emitEvent:false 寫回，不會觸發這裡
    this.dataForm
      .get('PUR_Tax')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe(() => {
        // 載入既有資料（編輯/檢視）時是程式帶入既有稅額，不是使用者操作，金額一律照存檔值顯示，不重算
        if (this.isLoadingDetail) return;

        this.isTaxManuallyEdited = true;
        const amt = Number(this.dataForm.controls.PUR_Amt.value) || 0;
        const tax = Number(this.dataForm.controls.PUR_Tax.value) || 0;
        // 明細無稅額欄位可調整，改由最後一筆有效明細承接與自動加總的差額，
        // 讓「下方銷售金額加總」自動跟上手動調整後的「上方未稅金額」，不用使用者自己手改明細湊數
        this.redistributeTaxToDetail(tax);
        this.dataForm.patchValue(
          { PUR_Net: amt - tax },
          { emitEvent: false },
        );
      });
  }

  loadGuiTrackOptions(event: any): void {
    // 根據申報年月載入字軌下拉（參考 FIN15010）
    this.dropDownListService
      .queryPOS1018_GUI_TRACK_DropDownList({
        GUI_YYMM: event,
        MID: 0,
        STO_No: '10',
        GUI_Type: this.dataForm.controls.InvoiceType.value
          ? [this.dataForm.controls.InvoiceType.value]
          : [],
      })
      .pipe(untilDestroyed(this))
      .subscribe((r) => {
        // 若回傳結構不同，嘗試從 r.Data.GuiTracks 取得陣列
        const tracks = r?.Data?.GuiTracks ?? r?.Data ?? [];
        // 不直接存到 control，僅供其他下拉使用；若需要可存到 this.guiTrackOptions
        console.log('[loadGuiTrackOptions] tracks', tracks);
      });
  }
  // ======================== 主檔填入 ========================
  private fillHeaderData(header: any): void {
    // 處理 AssetType：嘗試以下拉選項比對完整 code 或片段，並填入下拉可辨識的 value
    let assetVal = header.AssetType ?? '';
    try {
      const normalize = (s: any) => (s ?? '').toString().trim().toUpperCase();
      const target = normalize(assetVal);
      if (target && this.AssetNoteOptions && this.AssetNoteOptions.length > 0) {
        let match = this.AssetNoteOptions.find(
          (opt) =>
            normalize(opt.value) === target || normalize(opt.label) === target,
        );
        if (!match) {
          match = this.AssetNoteOptions.find(
            (opt) =>
              normalize(opt.value).startsWith(target) ||
              normalize(opt.value).includes(target),
          );
        }
        if (match) assetVal = match.value;
      }
    } catch (e) {
      console.warn('AssetType 比對失敗', e);
    }

    this.dataForm.patchValue({
      InvoiceType: header.InvoiceType ?? '',
      SAL_Type: header.SAL_Type ?? '',
      GUI_Track: header.GUI_Track ?? '',
      INV_GUINumber: header.InvoiceNumber ?? '',
      InvoiceDate: this.formatValidDate(header.InvoiceDate),
      Buyer_Uniform: header.Buyer_Uniform ?? '',
      PUR_TaxType: header.PUR_TaxType ?? '',
      Voucher_No: header.Voucher_No ?? null, // Added Voucher_No assignment
      AssetType: assetVal ?? '',
      PUR_InvoiceTitle: header.Buyer_Name ?? '',
      PUR_Net: header.PUR_Net ?? this.dataForm.controls.PUR_Net.value ?? 0,
      PUR_Tax: header.PUR_Tax ?? this.dataForm.controls.PUR_Tax.value ?? 0,
      PUR_Amt: header.PUR_Amt ?? this.dataForm.controls.PUR_Amt.value ?? 0,
      Invoice_Cancel:
        header.Invoice_Cancel ??
        this.dataForm.controls.Invoice_Cancel.value ??
        'N',
      INV_REMARK: header.INV_REMARK ?? '',
    });
  }

  // ======================== 載入明細 ========================
  private loadDetail(rowData: any): void {
    this.loading = true;
    this.isLoadingDetail = true;

    const payload = {
      MID: 0,
      STO_No: rowData.STO_No ?? '',
      ID: rowData.ID ?? rowData.id ?? rowData.No,
    };

    this.fin13040Service
      .queryFIN13040Detail(payload)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((res) => {
        const data = res.Data;
        if (!data) return;

        const header = data.FIN13040Detail_APS4023;
        const details = data.FIN13040Detail_APS40235 ?? [];

        this.currentDetailId = header?.ID ?? null;

        if (header?.InvoiceType) {
          this.fillHeaderData(header);
        }

        const salType = header?.SAL_Type ?? '';
        if (salType) {
          this.dataForm.patchValue(
            { SAL_Type: salType },
            { emitEvent: false }
          );
        }

        this.loadINVItemOptions(() => {
          this.fillDetailData(details);

          if (this.formTitle === '編輯資料') {
            this.lockEditModeFields();
          }

          // 全部完成後才解除 Loading
          this.loading = false;
          this.isLoadingDetail = false;
        });
      });
  }
  private lockEditModeFields(): void {
    Object.keys(this.dataForm.controls).forEach((key) => {
      if (!['Voucher_No', 'INV_REMARK'].includes(key)) {
        this.dataForm.get(key)?.disable({ emitEvent: false });
      } else {
        this.dataForm.get(key)?.enable({ emitEvent: false });
      }
    });
  }

  /** 將明細轉為 table-edit 可用格式 */
  private fillDetailData(details: any[]): void {
    if (!details || details.length === 0) {
      console.warn('[fillDetailData] 明細為空，建立一筆空白行');
      this.data = [];
      setTimeout(() => this.tableEdit?.insertRow(true));
      return;
    }

    // 編輯/檢視：明細金額一律照存檔值直接顯示，不重算（避免跟公式反算出的值不一致）
    this.data = details.map((d) => {
      const saleAmt = Number(d.TXN_SaleAmt ?? 0);
      const tax = Number(d.TXN_Tax ?? 0);
      const qty = Number(d.TXN_Qty ?? 0);
      return {
        PLU_No: d.PLU_MagNo ?? d.PLU_No ?? '',
        PLU_Name: d.PLU_Name ?? '',
        TXN_Qty: qty,
        PLU_SalePrc: Number(d.PLU_SalePrc ?? 0),
        PLU_SalePrc_Display: qty > 0 ? Math.round((saleAmt - tax) / qty) : 0,
        TXN_SaleAmt: saleAmt,
        TXN_Tax: tax,
        SaleAmt: saleAmt,
      };
    });
    this.totalRecords = this.data.length;
    if (this.INV_ItemName_Options && this.INV_ItemName_Options.length > 0) {
      const normalize = (s: any) => (s ?? '').toString().trim();
      const stripCommon = (s: string) =>
        s.replaceAll(/收入|費用|費用|費|入/gi, '').trim();
      this.data = this.data.map((row) => {
        if ((!row.PLU_No || row.PLU_No === '') && row.PLU_Name) {
          const rawName = normalize(row.PLU_Name);
          let match = this.INV_ItemName_Options.find(
            (opt) =>
              normalize(opt.INV_ItemName) === rawName ||
              normalize(opt.value) === rawName ||
              normalize(opt.label) === rawName,
          );
          if (!match) {
            match = this.INV_ItemName_Options.find(
              (opt) =>
                normalize(opt.INV_ItemName).includes(rawName) ||
                rawName.includes(normalize(opt.INV_ItemName)),
            );
          }
          if (!match) {
            const alt = stripCommon(rawName);
            if (alt && alt !== rawName) {
              match = this.INV_ItemName_Options.find(
                (opt) =>
                  normalize(opt.INV_ItemName).includes(alt) ||
                  stripCommon(normalize(opt.INV_ItemName)).includes(alt),
              );
            }
          }
          if (match) {
            row.PLU_No = match.INV_ItemNo ?? match.value ?? '';
            row.PLU_Name = match.INV_ItemName ?? row.PLU_Name;
          }
        }
        return row;
      });
    }
    // 編輯/檢視不重算金額：上方表單金額已由 fillHeaderData 直接帶入存檔值，這裡不再呼叫
    // recalculateAllDetailByTaxType/updateMasterAmounts 覆蓋，確保畫面與存檔值一致
  }

  // ======================== 下拉選單 ========================
  /** autocomplete 輸入時過濾建議（限50筆） */
  onBuyerInputChange(event: Record<string, string>): void {
    let query = (Object.values(event)[0] ?? '').toLowerCase();
    // 使用者可能複製貼上下拉顯示的完整文字「代號 - 名稱」，過濾建議清單時也只取 "-" 前的代號比對
    if (query.includes(' - ')) {
      query = query.split(' - ')[0].trim();
    }
    this.filteredBuyerOptions = this.Buyer_Uniform_Options.filter(
      (o) =>
        o.value.toLowerCase().includes(query) ||
        (o.VEN_Name ?? '').toLowerCase().includes(query),
    ).slice(0, 50);
  }

  /** 載入買受人統一編號下拉清單 */
  loadBuyerUniformOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const data = res?.Data ?? [];
        const uniqueDataMap = new Map();
        (data as unknown[]).forEach((item) => {
          const r = item as Record<string, string>;
          if (r['No']) uniqueDataMap.set(r['No'], r);
        });
        this.Buyer_Uniform_Options = Array.from(uniqueDataMap.values()).map(
          (item) => {
            const r = item as Record<string, string>;
            return {
              label: `${r['No']} - ${r['Name']}`,
              value: r['No'],
              VEN_No: r['VEN_No'],
              VEN_Name: r['Name'],
            };
          },
        );
        this.filteredBuyerOptions = this.Buyer_Uniform_Options.slice(0, 50);
      });
  }

  loadInvoiceTypeOptions(): void {
    this.dropDownListService
      .queryTDS1007_DropDownList({ mid: 0 })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const allowed = ['31', '32', '35'];
        const data = res?.Data?.INV_GUITypes ?? [];
        const filtered = data.filter((x: any) =>
          allowed.includes(x.INV_GUIType),
        );
        filtered.sort(
          (a: any, b: any) => Number(a.INV_GUIType) - Number(b.INV_GUIType),
        );
        this.InvoiceType_Options = filtered.map((x: any) => ({
          label: `${x.INV_GUIType} - ${x.INV_GUIName}`,
          value: x.INV_GUIType,
        }));
      });
  }

  /** 載入品項下拉 (TDS1008)，支援 callback */
  loadINVItemOptions(done?: () => void): void {
    const salType = this.dataForm.get('SAL_Type')?.value || '';
    if (!salType) {
      this.INV_ItemName_Options = [];
      this.loadAndSetupColumns();

      done?.();

      return;
    }

    this.dropDownListService
      .queryTDS1008_DropDownList([salType])
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        let list: any[] = [];
        if (Array.isArray((res as any)?.Data)) {
          list = (res as any).Data.flatMap((d: any) => d?.Data ?? []);
        } else if (
          (res as any)?.Data?.Data &&
          Array.isArray((res as any).Data.Data)
        ) {
          list = (res as any).Data.Data;
        }
        this.INV_ItemName_Options = list.map((item: any) => ({
          label: `${item.INV_ItemNo}`,
          value: item.INV_ItemNo,
          INV_ItemNo: item.INV_ItemNo,
          INV_ItemName: item.INV_ItemName,
          INV_UsageType: item.INV_UsageType,
        }));
        this.loadAndSetupColumns();
        if (done) {
          done();
        } else {
          setTimeout(() => this.tableEdit?.insertRow(true));
        }
      });
  }

  // ======================== 工具 ========================
  private formatValidDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const y = d.getFullYear();
    return y <= 1 ? null : d;
  }

  private formatDeclareYM(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  // 手動調整上方稅額時，把差額回填到最後一筆有效明細，讓明細的含稅/銷售金額加總持續與上方表單一致
  private redistributeTaxToDetail(manualTax: number): void {
    const validRows = this.data.filter((d) => !d._isAutoInsertCandidate);
    if (validRows.length === 0) return;

    const lastRow = validRows[validRows.length - 1];
    const otherTax = validRows.reduce(
      (sum, r) => sum + (r === lastRow ? 0 : Number(r.TXN_Tax) || 0),
      0,
    );

    const txnSaleAmt = Number(lastRow.TXN_SaleAmt) || 0;
    const qty = Number(lastRow.TXN_Qty) || 0;
    const newTax = manualTax - otherTax;
    const updatedLastRow = {
      ...lastRow,
      TXN_Tax: newTax,
      SaleAmt: txnSaleAmt,
      PLU_SalePrc: qty > 0 ? Math.round(txnSaleAmt / qty) : txnSaleAmt,
      PLU_SalePrc_Display: qty > 0 ? Math.round((txnSaleAmt - newTax) / qty) : txnSaleAmt - newTax,
    };

    this.data = this.data.map((row) =>
      row === lastRow ? updatedLastRow : row,
    );
  }

  updateMasterAmounts(): void {
    const autoTax = this.data.reduce(
      (sum, r) => sum + (Number(r.TXN_Tax) || 0),
      0,
    );
    const totalAmt = this.data.reduce(
      (sum, r) => sum + (Number(r.TXN_SaleAmt) || 0),
      0,
    );
    this.applyMasterAmounts(totalAmt, autoTax);
  }

  // 明細總額寫回上方表單：稅額若使用者已手動調整過，維持手動值，未稅金額一律用「含稅金額-稅額」回推
  private applyMasterAmounts(totalAmt: number, autoTax: number): void {
    const tax = this.isTaxManuallyEdited
      ? Number(this.dataForm.controls.PUR_Tax.value) || 0
      : autoTax;
    const net = totalAmt - tax;
    this.dataForm.patchValue(
      {
        PUR_Tax: tax,
        PUR_Amt: totalAmt,
        PUR_Net: net,
      },
      { emitEvent: false },
    );
  }

  private loadAndSetupColumns(): void {
    this.columns = [
      {
        field: 'PLU_No',
        header: '品名',
        type: 'dropdown',
        options: () =>
          this.INV_ItemName_Options.map((opt) => ({
            label: `${opt.INV_ItemNo} - ${opt.INV_ItemName}`,
            value: opt.INV_ItemNo,
            INV_ItemName: opt.INV_ItemName,
          })),
        optionLabel: 'label',
        optionValue: 'value',
        validate: [
          (value: any) => ({
            isValid: !!value,
            errorMessage: ['請選擇品名'],
          }),
          validateRequired,
        ],
        calculate: (rowData, value) => {
          const selected = this.INV_ItemName_Options.find(
            (opt) => opt.INV_ItemNo === value,
          );
          return selected ? { PLU_Name: selected.INV_ItemName } : {};
        },
      },
      {
        field: 'TXN_Qty',
        header: '數量',
        type: 'inputNumber',
        defaultValue: 1,
        validate: [
          (value: any) => ({
            isValid: value !== null && !isNaN(value) && Number(value) > 0,
            errorMessage: ['數量必須大於 0'],
          }),
          validateRequired,
        ],
        // calculate: (rowData, value) => {
        //   const qty = Number(value) || 0;
        //   const price = Number(rowData.PLU_SalePrc) || 0;
        //   const saleAmt = qty * price;
        //   const tax = Math.round(saleAmt / 21);
        //   return { TXN_SaleAmt: saleAmt, TXN_Tax: tax };
        // },
      },
      {
        field: 'TXN_SaleAmt',
        header: '含稅金額',
        type: 'inputNumber',
        validate: [
          (value: any) => ({
            isValid: value !== null && value !== '' && !isNaN(Number(value)),
            errorMessage: ['含稅金額為必填且須為數字'],
          }),
          validateRequired,
        ],
        calculate: (rowData, value) => {
          const qty = Number(rowData.TXN_Qty) || 0;

          // 使用者已手動調整過稅額：稅額視為固定值，未稅金額直接用「含稅金額-稅額」回推，不再用公式重算稅額
          if (this.isTaxManuallyEdited) {
            const tax = Number(rowData.TXN_Tax) || 0;
            const unitPrice = qty > 0 ? Math.round(value / qty) : value;
            const displayPrice = qty > 0 ? Math.round((value - tax) / qty) : value - tax;
            return {
              TXN_SaleAmt: value,
              TXN_Tax: tax,
              PLU_SalePrc: unitPrice,
              PLU_SalePrc_Display: displayPrice,
              SaleAmt: value,
            };
          }

          const taxType = this.dataForm.get('PUR_TaxType')?.value;
          const isNoTax = this.isNoTaxType(taxType);

          const tax = isNoTax ? 0 : Math.round(value / 21);
          const unitPrice = qty > 0 ? Math.round(value / qty) : value;
          const displayPrice = qty > 0 ? Math.round((value - tax) / qty) : value - tax;

          return {
            TXN_SaleAmt: value,
            TXN_Tax: tax,
            PLU_SalePrc: unitPrice,
            PLU_SalePrc_Display: displayPrice,
            SaleAmt: value,
          };
        },
      },
      {
        field: 'PLU_SalePrc_Display',
        header: '單價',
        type: 'inputNumber',
        defaultValue: 0,
        validate: [validateRequired],
        calculate: (rowData, value) => {
          // value = 未稅單價（顯示值），回推含稅
          const qty = Number(rowData.TXN_Qty) || 0;
          const netAmt = Math.round(Number(value) * qty);

          if (this.isTaxManuallyEdited) {
            const tax = Number(rowData.TXN_Tax) || 0;
            const txnSaleAmt = netAmt + tax;
            const prc = qty > 0 ? Math.round(txnSaleAmt / qty) : txnSaleAmt;
            return { PLU_SalePrc: prc, PLU_SalePrc_Display: value, SaleAmt: txnSaleAmt, TXN_SaleAmt: txnSaleAmt, TXN_Tax: tax };
          }

          const taxType = this.dataForm.get('PUR_TaxType')?.value;
          const isNoTax = this.isNoTaxType(taxType);
          const txnSaleAmt = isNoTax ? netAmt : Math.round((netAmt * 21) / 20);
          const tax = txnSaleAmt - netAmt;
          const prc = qty > 0 ? Math.round(txnSaleAmt / qty) : txnSaleAmt;
          return { PLU_SalePrc: prc, PLU_SalePrc_Display: value, SaleAmt: txnSaleAmt, TXN_SaleAmt: txnSaleAmt, TXN_Tax: tax };
        },
      },
      {
        field: 'SaleAmt',
        header: '銷售金額',
        type: 'inputNumber',
        defaultValue: 0,
        validate: [validateRequired],
        calculate: (rowData, value) => {
          // value 現在 = 含稅金額 (= TXN_SaleAmt)
          const qty = Number(rowData.TXN_Qty) || 0;
          const taxType = this.dataForm.get('PUR_TaxType')?.value;
          const isNoTax = this.isNoTaxType(taxType);

          if (this.isTaxManuallyEdited) {
            const tax = Number(rowData.TXN_Tax) || 0;
            const unitPrice = qty > 0 ? Math.round(value / qty) : value;
            const displayPrice = qty > 0 ? Math.round((value - tax) / qty) : value - tax;
            return {
              TXN_SaleAmt: value,
              TXN_Tax: tax,
              PLU_SalePrc: unitPrice,
              PLU_SalePrc_Display: displayPrice,
            };
          }

          const tax = isNoTax ? 0 : Math.round(value / 21);
          const unitPrice = qty > 0 ? Math.round(value / qty) : value;
          const displayPrice = qty > 0 ? Math.round((value - tax) / qty) : value - tax;
          return {
            TXN_SaleAmt: value,
            TXN_Tax: tax,
            PLU_SalePrc: unitPrice,
            PLU_SalePrc_Display: displayPrice,
          };
        },
      },
    ];
  }

  // 判斷明細是否為空值
  validateDetailRow = (
    rowData: any,
  ): { isValid: boolean; errorMessage: string } => {
    const requiredFields = [
      { value: rowData.PLU_No?.trim(), name: '品名' },
      { value: rowData.TXN_Qty, name: '數量' },
      { value: rowData.TXN_SaleAmt, name: '含稅金額' },
      // { value: rowData.UnitPrice, name: '單價' },
      // { value: rowData.SaleAmt, name: '銷售金額' }
    ];

    const emptyField = requiredFields.find((field) =>
      this.isEmptyValue(field.value),
    );

    if (emptyField) {
      return {
        isValid: false,
        errorMessage: `${emptyField.name}不可為空，請輸入有效的${emptyField.name}。`,
      };
    }
    return { isValid: true, errorMessage: '' };
  };

  // 判斷是否為空值
  // 注意：0 不算空值，因為金額、稅額可能合法為 0
  isEmptyValue(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  // 判斷是否為免稅或零稅
  isNoTaxType(taxType: any): boolean {
    return ['2', '0'].includes(taxType);
  }

  // 重新計算所有金額
  private recalculateAllDetailByTaxType(taxType: any): void {
    const isNoTax = this.isNoTaxType(taxType);

    this.data = this.data.map((row) => {
      return this.recalculateDetailAmount(row, taxType, isNoTax);
    });

    this.recalculateMasterAmount();
  }

  // 重新計算明細金額
  private recalculateDetailAmount(
    row: any,
    taxType: any,
    isNoTax: boolean,
  ): any {
    const qty = Number(row.TXN_Qty) || 0;
    const txnSaleAmt = Number(row.TXN_SaleAmt) || 0; // 含稅金額

    // 稅額：免稅 / 零稅時強制為 0
    const tax = isNoTax ? 0 : Math.round(txnSaleAmt / 21);

    const unitPrice = qty > 0 ? Math.round(txnSaleAmt / qty) : txnSaleAmt;
    const displayPrice = qty > 0 ? Math.round((txnSaleAmt - tax) / qty) : txnSaleAmt - tax;

    return {
      ...row,
      TXN_SaleAmt: txnSaleAmt,
      TXN_Tax: tax,
      SaleAmt: txnSaleAmt,
      PLU_SalePrc: unitPrice,
      PLU_SalePrc_Display: displayPrice,
    };
  }

  // 重新計算主表金額
  private recalculateMasterAmount(): void {
    const purAmt = this.data.reduce((sum, row) => {
      return sum + (Number(row.TXN_SaleAmt) || 0);
    }, 0);

    const autoTax = this.data.reduce((sum, row) => {
      return sum + (Number(row.TXN_Tax) || 0);
    }, 0);

    this.applyMasterAmounts(purAmt, autoTax);
  }

  // ======================== 儲存 ========================
  onSubmit(form: FormGroup): void {
    // 驗證明細（排除自動插入的空白候選列）
    for (const item of this.data.filter((d) => !d._isAutoInsertCandidate)) {
      const { isValid, errorMessage } = this.validateDetailRow(item);
      if (isValid) continue;

      this.loading = false;
      this.messageService.errorBubble(errorMessage);
      return;
    }

    // 卡控：明細加總須與上方表單金額一致才可存檔
    const detailTaxedTotal = this.data.reduce(
      (sum, r) => sum + (Number(r.TXN_SaleAmt) || 0),
      0,
    );
    const headerAmt = Number(this.dataForm.controls.PUR_Amt.value) || 0;

    if (Math.abs(detailTaxedTotal - headerAmt) > 0.5) {
      this.loading = false;
      this.messageService.errorBubble(
        '列表含稅金額加總需等於總含稅金額，請確認',
      );
      return;
    }

    this.handleSubmit(form, () => {
      console.log('Form submitted with values:', form.value);
      const v = form.getRawValue();
      const uniformValue =
        v.Buyer_Uniform && typeof v.Buyer_Uniform === 'object'
          ? v.Buyer_Uniform.value
          : v.Buyer_Uniform;
      const selectedBuyer = this.Buyer_Uniform_Options.find(
        (o) => o.value === uniformValue,
      );
      const validDetails = this.data.filter((d) => !d._isAutoInsertCandidate);
      if (validDetails.length === 0) {
        alert('明細中沒有有效資料');
        this.loading = false;
        return;
      }
      const invalidDetail = validDetails.some(
        (item) => !item.PLU_No || item.PLU_No.trim() === '',
      );
      if (invalidDetail) {
        alert('明細中有缺少貨號的資料');
        this.loading = false;
        return;
      }

      const toDateOnly = (
        d: Date | string | null | undefined,
      ): string | null => {
        if (!d) return null;
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const header = {
        MID: 0,
        STO_No: history.state?.rowdata?.STO_No ?? '10',
        ID:
          this.currentDetailId ??
          history.state?.rowdata?.ID ??
          history.state?.rowdata?.id ??
          history.state?.rowdata?.No ??
          0,
        InvoiceType: v.InvoiceType ?? '35',
        SAL_Type: v.SAL_Type,
        InvoiceNumber: v.INV_GUINumber,
        InvoiceDate: toDateOnly(v.InvoiceDate),
        INV_DeclareYM: this.formatDeclareYM(v.InvoiceDate),
        Buyer_Uniform:
          v.Buyer_Uniform && typeof v.Buyer_Uniform === 'object'
            ? v.Buyer_Uniform.value
            : v.Buyer_Uniform,
        Buyer_VenNo: selectedBuyer?.VEN_No ?? '',
        Buyer_Name: selectedBuyer?.VEN_Name ?? v.PUR_InvoiceTitle ?? '',
        Group_Mark: 'N',
        Donate_Mark: 'N',
        PUR_TaxType: v.PUR_TaxType,
        Voucher_No: v.Voucher_No, // Updated to use v.Voucher_No
        AssetType: v.AssetType ?? '',
        INV_REMARK: v.INV_REMARK ?? '',
        InvoiceTime: new Date().toISOString(),
        Invoice_Cancel:
          v.Invoice_Cancel ?? this.dataForm.value.Invoice_Cancel ?? 'N',
        PUR_Net: v.PUR_Net ?? 0,
        PUR_Tax: v.PUR_Tax ?? 0,
        PUR_Amt: v.PUR_Amt ?? 0,
        CRT_USR_No: 'admin',
        CRT_USR_Name: '系統管理員',
        CRT_Date: new Date().toISOString(),
        UPD_USR_No: 'admin',
        UPD_USR_Name: '系統管理員',
        UPD_Date: new Date().toISOString(),
        Print_Date: new Date().toISOString(),
      };

      const details = validDetails.map((item) => ({
        PLU_No: item.PLU_No?.trim() ?? '',
        PLU_Name: item.PLU_Name ?? '',
        TXN_Qty: Number(item.TXN_Qty ?? 0),
        PLU_SalePrc: Number(item.PLU_SalePrc ?? 0),
        TXN_SaleAmt: Number(item.TXN_SaleAmt ?? 0),
        TXN_Tax: Number(item.TXN_Tax ?? 0),
      }));

      const payload = {
        FIN13040Detail_APS4023: header,
        FIN13040Detail_APS40235: details,
      };
      this.fin13040Service
        .updateFIN13040(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe((res) => {
          if (res?.Status === '0000') {
            this.messageService.successBubble('新增成功');
            const savedId =
              res?.Data?.ID ??
              res?.Data?.id ??
              this.currentDetailId ??
              header.ID;
            const savedInvoiceNumber =
              res?.Data?.InvoiceNumber ?? header.InvoiceNumber;
            if (savedId != null) {
              this.fin13040Service
                .printFIN13040({
                  MID: 0,
                  STO_No: header.STO_No ?? '10',
                  ID: savedId,
                })
                .subscribe({
                  next: (printRes) => {
                    const blob = new Blob([printRes.body as Blob], {
                      type: 'application/pdf',
                    });
                    const url = globalThis.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${savedInvoiceNumber || savedId}.pdf`;
                    a.click();
                    globalThis.URL.revokeObjectURL(url);
                    this.onCancel();
                  },
                  error: () => {
                    this.onCancel();
                  },
                });
            } else {
              this.onCancel();
            }
          }
        });
    });
  }
  // 匯出功能已搬至清單頁的列印按鈕 (FIN13040Component.onPrint)
}
