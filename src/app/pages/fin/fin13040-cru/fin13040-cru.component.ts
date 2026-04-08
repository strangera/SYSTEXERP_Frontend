import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { AutoCompleteComponent } from '@shared/componentkit/auto-complete/auto-complete.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import { TableEditComponent } from './fin13040-table-edit/fin13040-table-edit.component';
import { EditColumn } from './fin13040-table-edit/fin13040-table-edit.model';

@Component({
  selector: 'app-fin13040-cru',
  templateUrl: './fin13040-cru.component.html',
  standalone: true,
  imports: [
    AutoCompleteComponent,
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
    NgIf,
    YearMonthComponent
  ],
})
export class FIN13040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    // InvoiceType hidden in UI; default to '35' so backend receives 35 when creating
    InvoiceType: ['35', Validators.required],
    SAL_Type: ['', Validators.required],
    GUI_Track: ['', [Validators.maxLength(2)]],
    INV_GUINumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{8}$/)]],
    InvoiceDate: [null as Date | null, Validators.required],
    Buyer_Uniform: ['', Validators.required],
    PUR_TaxType: ['', Validators.required],
    Voucher_No: [null], // Added Voucher_No control
    AssetType: [''],
    PUR_InvoiceTitle: ['', [Validators.maxLength(64)]],
    Buyer_VenNo: [''],
    Buyer_Name: [''],
    PUR_Tax: [{ value: 0, disabled: true }],
    PUR_Amt: [{ value: 0, disabled: true }],
    PUR_Net: [{ value: 0, disabled: true }],
    Invoice_Cancel: [{ value: 'N', disabled: true }],
    INV_DeclareYM: ['', Validators.required],

  });

  /** 下拉選單與資料 */
  InvoiceType_Options: any[] = [];
  SAL_Type_Options = getSYS1000Options('T205');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: any[] = [];
  Invoice_CancelOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];
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
    private fin13040Service: Fin13040Service
  ) {
    super();
  }

  // 在模板使用：新增模式且選到 InvoiceType='35' 時隱藏發票號碼欄位
  get showInvoiceNumberField(): boolean {
    return !(this.crudstatus === CRUDStatus.Create && this.dataForm?.controls?.InvoiceType?.value === '35');
  }

  // 在模板使用：發票號碼欄位是否應為唯讀（Edit 模式或 control 被停用）
  get isInvoiceNumberReadonly(): boolean {
    const ctrl = this.dataForm?.controls?.INV_GUINumber;
    return this.crudstatus === CRUDStatus.Edit || !!ctrl?.disabled;
  }

  // ======================== 初始化 ========================
  ngOnInit(): void {
    this.initializePage('FIN13040', this.dataForm);
    this.loadBuyerUniformOptions();
    this.loadInvoiceTypeOptions();

    // 若為編輯模式，僅停用發票號碼欄位（發票格式仍可變更）
    if (this.crudstatus === CRUDStatus.Edit) {
      const invCtrl = this.dataForm.get('INV_GUINumber');
      if (invCtrl && !invCtrl.disabled) invCtrl.disable({ emitEvent: false });
    }

    // 自動將發票號碼轉為大寫，方便使用者輸入小寫英文字母時仍符合格式
    this.dataForm.get('INV_GUINumber')?.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      if (val && typeof val === 'string') {
        this.dataForm.controls.INV_GUINumber.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });

    // 若為新增且發票格式為 35，則隱藏/停用發票號碼欄位
    this.dataForm.get('InvoiceType')?.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
      if (this.crudstatus === CRUDStatus.Create && val === '35') {
        this.dataForm.controls.INV_GUINumber.setValue('', { emitEvent: false });
        this.dataForm.controls.INV_GUINumber.disable({ emitEvent: false });
      } else {
        // 若不是新增模式或不是 35，確保欄位可用（非 Read 模式）
        if (!this.isFormReadable && this.dataForm.controls.INV_GUINumber.disabled) {
          this.dataForm.controls.INV_GUINumber.enable({ emitEvent: false });
        }
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
      this.loadDetail(rowData);
    }

    // SAL_Type 改變時重新載入品項
    this.dataForm.get('SAL_Type')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        console.log('[valueChanges] SAL_Type 改變:', val);
        this.loadINVItemOptions();
      });

    // 初始若已有 SAL_Type
    setTimeout(() => {
      const salType = this.dataForm.get('SAL_Type')?.value;
      if (salType) this.loadINVItemOptions();
    }, 200);

    // 統編帶出廠商資訊
    this.dataForm.get('Buyer_Uniform')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val: any) => {
        // 取得真正的統編值 (如果是物件就拿 .value，如果是字串就直接用)
        const actualValue = (val && typeof val === 'object') ? val.value : val;

        const selected = this.Buyer_Uniform_Options.find(o => o.value === actualValue);
        this.dataForm.patchValue({
          Buyer_VenNo: selected?.VEN_No ?? '',
          Buyer_Name: selected?.VEN_Name ?? '',
        }, { emitEvent: false }); // 建議加 emitEvent: false 避免無限循環
      });
  }

  loadGuiTrackOptions(event: any): void {
    // 根據申報年月載入字軌下拉（參考 FIN15010）
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: event,
      MID: 0,
      STO_No: '10',
      GUI_Type: this.dataForm.controls.InvoiceType.value ? [this.dataForm.controls.InvoiceType.value] : []
    }).pipe(untilDestroyed(this)).subscribe(r => {
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
        let match = this.AssetNoteOptions.find(opt => normalize(opt.value) === target || normalize(opt.label) === target);
        if (!match) {
          match = this.AssetNoteOptions.find(opt => normalize(opt.value).startsWith(target) || normalize(opt.value).includes(target));
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
      Invoice_Cancel: header.Invoice_Cancel ?? this.dataForm.controls.Invoice_Cancel.value ?? 'N',
    });
  }

  // ======================== 載入明細 ========================
  private loadDetail(rowData: any): void {
    console.log('載入明細 rowData:', rowData);
    const payload = {
      MID: 0,
      STO_No: rowData.STO_No ?? '',
      ID: rowData.ID ?? rowData.id ?? rowData.No,
    };
    this.fin13040Service.queryFIN13040Detail(payload).pipe(untilDestroyed(this)).subscribe((res) => {
      const data = res.Data;
      if (!data) return;
      const header = data.FIN13040Detail_APS4023;
      const details = data.FIN13040Detail_APS40235 ?? [];
      this.currentDetailId = header?.ID ?? null;
      if (header?.InvoiceType) this.fillHeaderData(header);
      const salType = header?.SAL_Type ?? '';
      if (salType) {
        this.dataForm.patchValue({ SAL_Type: salType });
      }
      // 若尚未建立欄位 → 先載入品項再填入資料
      if (this.columns.length === 0) {
        this.loadINVItemOptions(() => this.fillDetailData(details));
      } else {
        this.fillDetailData(details);
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

    this.data = details.map(d => ({
      PLU_No: d.PLU_MagNo ?? d.PLU_No ?? '',
      PLU_Name: d.PLU_Name ?? '',
      TXN_Qty: Number(d.TXN_Qty ?? 0),
      PLU_SalePrc: Number(d.PLU_SalePrc ?? 0),
      TXN_SaleAmt: Number(d.TXN_SaleAmt ?? 0),
      TXN_Tax: Number(d.TXN_Tax ?? 0),
    }));
    this.totalRecords = this.data.length;
    if (this.INV_ItemName_Options && this.INV_ItemName_Options.length > 0) {
      const normalize = (s: any) => (s ?? '').toString().trim();
      const stripCommon = (s: string) => s.replace(/收入|費用|費用|費|入/gi, '').trim();
      this.data = this.data.map(row => {
        if ((!row.PLU_No || row.PLU_No === '') && row.PLU_Name) {
          const rawName = normalize(row.PLU_Name);
          let match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName) === rawName || normalize(opt.value) === rawName || normalize(opt.label) === rawName);
          if (!match) {
            match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName).includes(rawName) || rawName.includes(normalize(opt.INV_ItemName)));
          }
          if (!match) {
            const alt = stripCommon(rawName);
            if (alt && alt !== rawName) {
              match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName).includes(alt) || stripCommon(normalize(opt.INV_ItemName)).includes(alt));
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

    // 填完明細後更新主檔金額
    this.updateMasterAmounts();
  }

  // ======================== 下拉選單 ========================
  /** 載入買受人統一編號下拉清單 */
  loadBuyerUniformOptions(): void {
    this.dropDownListService.queryPOS2013_DropDownList({}).pipe(untilDestroyed(this)).subscribe((res) => {
      const data = res?.Data ?? [];
      // 使用 Map 以 No 作為 Key 來去重
      const uniqueDataMap = new Map();
      data.forEach((item: any) => {
        if (item.No) uniqueDataMap.set(item.No, item);
      });
      // 轉換為 AutoComplete 需要的格式，並保留原始屬性供後續 patchValue 使用
      this.Buyer_Uniform_Options = Array.from(uniqueDataMap.values()).map((item: any) => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No,
        VEN_No: item.VEN_No,
        VEN_Name: item.Name,
      }));
    });
  }

  loadInvoiceTypeOptions(): void {
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).pipe(untilDestroyed(this)).subscribe((res) => {
      const allowed = ['31', '32', '35'];
      const data = res?.Data?.INV_GUITypes ?? [];
      const filtered = data.filter((x: any) => allowed.includes(x.INV_GUIType));
      filtered.sort((a: any, b: any) => Number(a.INV_GUIType) - Number(b.INV_GUIType));
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
      return;
    }

    this.dropDownListService.queryTDS1008_DropDownList([salType]).pipe(untilDestroyed(this)).subscribe((res) => {
      let list: any[] = [];
      if (Array.isArray((res as any)?.Data)) {
        list = (res as any).Data.flatMap((d: any) => d?.Data ?? []);
      } else if ((res as any)?.Data?.Data && Array.isArray((res as any).Data.Data)) {
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

  updateMasterAmounts(): void {
    const totalTax = this.data.reduce((sum, r) => sum + (Number(r.TXN_Tax) || 0), 0);
    const totalAmt = this.data.reduce((sum, r) => sum + (Number(r.TXN_SaleAmt) || 0), 0);
    const net = totalAmt - totalTax;
    this.dataForm.patchValue({
      PUR_Tax: totalTax,
      PUR_Amt: totalAmt,
      PUR_Net: net,
    });
  }

  private loadAndSetupColumns(): void {
    this.columns = [
      {
        field: 'PLU_No', header: '品名', type: 'dropdown',
        options: () => this.INV_ItemName_Options.map(opt => ({
          label: `${opt.INV_ItemNo} - ${opt.INV_ItemName}`,
          value: opt.INV_ItemNo,
          INV_ItemName: opt.INV_ItemName,
        })),
        optionLabel: 'label',
        optionValue: 'value',
        validate: [
          (value: any) => ({
            isValid: !!value,
            errorMessage: ['請選擇品名']
          })
        ],
        calculate: (rowData, value) => {
          const selected = this.INV_ItemName_Options.find(opt => opt.INV_ItemNo === value);
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
            errorMessage: ['數量必須大於 0']
          })
        ],
        calculate: (rowData, value) => {
          const qty = Number(value) || 0;
          const price = Number(rowData.PLU_SalePrc) || 0;
          const saleAmt = qty * price;
          const tax = Math.round(saleAmt / 21);
          return { TXN_SaleAmt: saleAmt, TXN_Tax: tax };
        },
      },
      {
        field: 'PLU_SalePrc',
        header: '單價',
        type: 'inputNumber',
        defaultValue: 0,
        validate: [
          (value: any) => ({
            isValid: value !== null && !isNaN(value),
            errorMessage: ['單價為必填且須為數字']
          })
        ],
        calculate: (rowData, value) => {
          const price = Number(value) || 0;
          const qty = Number(rowData.TXN_Qty) || 0;
          const saleAmt = qty * price;
          const tax = Math.round(saleAmt / 21);
          return { TXN_SaleAmt: saleAmt, TXN_Tax: tax };
        },
      },
      {
        field: 'TXN_SaleAmt',
        header: '銷售金額',
        type: 'inputNumber',
        validate: [
          (value: any) => ({
            isValid: value !== null && !isNaN(value),
            errorMessage: ['請輸入有效的銷售金額']
          })
        ],
      },
      {
        field: 'TXN_Tax',
        header: '稅額',
        type: 'inputNumber',
        validate: [
          (value: any) => ({
            isValid: value !== null && !isNaN(value),
            errorMessage: ['請輸入有效的稅額']
          })
        ],
      },
    ];
  }

  // ======================== 儲存 ========================
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      console.log('Form submitted with values:', form.value);
      const v = form.getRawValue();
      const selectedBuyer = this.Buyer_Uniform_Options.find(o => o.value === (v.Buyer_Uniform && typeof v.Buyer_Uniform === 'object')
        ? v.Buyer_Uniform.value
        : v.Buyer_Uniform);
      if (!selectedBuyer) {
        alert('請選擇買受人統編');
        this.loading = false;
        return;
      }
      const validDetails = this.data.filter(d => !d._isAutoInsertCandidate);
      if (validDetails.length === 0) {
        alert('明細中沒有有效資料');
        this.loading = false;
        return;
      }
      const invalidDetail = validDetails.some((item) => !item.PLU_No || item.PLU_No.trim() === '');
      if (invalidDetail) {
        alert('明細中有缺少貨號的資料');
        this.loading = false;
        return;
      }

      const toISO = (d: any): string | null => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime()) ? null : date.toISOString();
      };

      const header = {
        MID: 0,
        STO_No: history.state?.rowdata?.STO_No ?? '10',
        ID: this.currentDetailId ?? history.state?.rowdata?.ID ?? history.state?.rowdata?.id ?? history.state?.rowdata?.No ?? 0,
        InvoiceType: v.InvoiceType ?? '35',
        SAL_Type: v.SAL_Type,
        InvoiceNumber: v.INV_GUINumber,
        InvoiceDate: toISO(v.InvoiceDate),
        INV_DeclareYM: this.formatDeclareYM(v.InvoiceDate),
        Buyer_Uniform: (v.Buyer_Uniform && typeof v.Buyer_Uniform === 'object')
          ? v.Buyer_Uniform.value
          : v.Buyer_Uniform,
        Buyer_VenNo: selectedBuyer.VEN_No ?? '',
        Buyer_Name: selectedBuyer.VEN_Name ?? '',
        Group_Mark: 'N',
        Donate_Mark: 'N',
        PUR_TaxType: v.PUR_TaxType,
        Voucher_No: v.Voucher_No, // Updated to use v.Voucher_No
        AssetType: v.AssetType ?? '',
        InvoiceTime: new Date().toISOString(),
        Invoice_Cancel: v.Invoice_Cancel ?? this.dataForm.value.Invoice_Cancel ?? 'N',
        PUR_Net: this.dataForm.value.PUR_Net ?? 0,
        PUR_Tax: this.dataForm.value.PUR_Tax ?? 0,
        PUR_Amt: this.dataForm.value.PUR_Amt ?? 0,
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
      this.fin13040Service.updateFIN13040(payload).pipe(untilDestroyed(this), finalize(() => { this.loading = false; })).subscribe(res => {
        if (res?.Status === '0000') {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        }
      });
    })
  }
  // 匯出功能已搬至清單頁的列印按鈕 (FIN13040Component.onPrint)
}
