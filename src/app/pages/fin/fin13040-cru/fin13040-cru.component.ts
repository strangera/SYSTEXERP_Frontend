import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from './fin13040-table-edit/fin13040-table-edit.component';
import { EditColumn } from './fin13040-table-edit/fin13040-table-edit.model';

@Component({
  selector: 'app-fin13040-cru',
  templateUrl: './fin13040-cru.component.html',
  standalone: true,
  imports: [
    InputTextRangeComponent,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    ButtonComponent,
    TranslateModule,
    TableEditComponent,
    ButtonModule,
    NgIf
  ],
})
export class FIN13040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    InvoiceType: ['', Validators.required],
    SAL_Type: ['', Validators.required],
    GUI_Track: ['', [Validators.maxLength(2)]],
    INV_GUINumber: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}\d{8}$/)]],
    InvoiceDate: [null as Date | null, Validators.required],
    Buyer_Uniform: ['', Validators.required],
    PUR_TaxType: ['', Validators.required],
    Voucher_No: [null], // Added Voucher_No control
    AssetType: [''],
    PUR_InvoiceTitle: [''],
    Buyer_VenNo: [''],
    Buyer_Name: [''],
    PUR_Tax: [0],
    PUR_Amt: [0],
    PUR_Net: [0],
  });

  /** 下拉選單與資料 */
  InvoiceType_Options: any[] = [];
  SAL_Type_Options = getSYS1000Options('T205');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: any[] = [];

  /** 明細資料表 */
  columns: EditColumn[] = [];
  data: any[] = [];
  totalRecords = 0;
  isTableDisabled = false;
  selectedRows: any[] = [];
  INV_ItemName_Options: any[] = [];
  btnLoading = false;
  btnLoading2 = false;
  /** 儲存後端主檔 ID */
  public currentDetailId: number | null = null;

  @ViewChild('tableEdit') tableEdit!: TableEditComponent;

  constructor(
    private dropDownListService: DropDownListService,
    private fin13040Service: Fin13040Service
  ) {
    super();
  }

  // ======================== 初始化 ========================
  ngOnInit(): void {
    this.initializePage('FIN13040', this.dataForm);
    this.loadBuyerUniformOptions();
    this.loadInvoiceTypeOptions();

    // 自動將發票號碼轉為大寫，方便使用者輸入小寫英文字母時仍符合格式
    this.dataForm.get('INV_GUINumber')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (val && typeof val === 'string') {
          const up = val.toUpperCase();
          if (up !== val) {
            this.dataForm.controls.INV_GUINumber.setValue(up, { emitEvent: false });
          }
        }
      });

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
      .subscribe((val) => {
        const selected = this.Buyer_Uniform_Options.find(o => o.value === val);
        this.dataForm.patchValue({
          Buyer_VenNo: selected?.VEN_No ?? '',
          Buyer_Name: selected?.VEN_Name ?? '',
        });
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

    console.log('呼叫明細 payload:', payload);

    this.fin13040Service
      .queryFIN13040Detail(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          if (!data) return;

          const header = data.FIN13040Detail_APS4023;
          const details = data.FIN13040Detail_APS40235 ?? [];

          // 儲存主檔 ID
          this.currentDetailId = header?.ID ?? null;

          console.log('主檔資料(明細API):', header);
          console.log('明細資料:', details);

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
        },
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
    console.log('[填入的明細資料]', this.data);

    // 若後端僅提供品名（PLU_Name），嘗試以已載入的品項清單找回貨號（PLU_No）
    if (this.INV_ItemName_Options && this.INV_ItemName_Options.length > 0) {
      const normalize = (s: any) => (s ?? '').toString().trim();
      const stripCommon = (s: string) => s.replace(/收入|費用|費用|費|入/gi, '').trim();

      this.data = this.data.map(row => {
        if ((!row.PLU_No || row.PLU_No === '') && row.PLU_Name) {
          const rawName = normalize(row.PLU_Name);

          // 1) 精準比對
          let match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName) === rawName || normalize(opt.value) === rawName || normalize(opt.label) === rawName);

          // 2) 包含/部分比對
          if (!match) {
            match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName).includes(rawName) || rawName.includes(normalize(opt.INV_ItemName)));
          }

          // 3) 移除常見字尾再比對（例如 後端給 "租金"，下拉為 "租金收入"）
          if (!match) {
            const alt = stripCommon(rawName);
            if (alt && alt !== rawName) {
              match = this.INV_ItemName_Options.find(opt => normalize(opt.INV_ItemName).includes(alt) || stripCommon(normalize(opt.INV_ItemName)).includes(alt));
            }
          }

          if (match) {
            row.PLU_No = match.INV_ItemNo ?? match.value ?? '';
            // 將下拉中的正式品名填回，讓 UI 顯示一致
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
  loadBuyerUniformOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const list = res?.Data ?? [];
          this.Buyer_Uniform_Options = list.map((item: any) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
            VEN_No: item.VEN_No,
            VEN_Name: item.Name,
          }));
        },
      });
  }

  loadInvoiceTypeOptions(): void {
    this.dropDownListService
      .queryTDS1007_DropDownList({ mid: 0 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const allowed = ['31', '32', '35'];
          const data = res?.Data?.INV_GUITypes ?? [];
          this.InvoiceType_Options = data
            .filter((x: any) => allowed.includes(x.INV_GUIType))
            .map((x: any) => ({
              label: `${x.INV_GUIType} - ${x.INV_GUIName}`,
              value: x.INV_GUIType,
            }));
        },
      });
  }

  /** 載入品項下拉 (TDS1008)，支援 callback */
  loadINVItemOptions(done?: () => void): void {
    const salType = this.dataForm.get('SAL_Type')?.value || '';
    console.log('[loadINVItemOptions] 呼叫，SAL_Type =', salType);

    if (!salType) {
      console.warn('[loadINVItemOptions] SAL_Type 為空，不呼叫 API');
      this.INV_ItemName_Options = [];
      this.loadAndSetupColumns();
      return;
    }

    this.dropDownListService
      .queryTDS1008_DropDownList([salType])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
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

          // callback 用於載入明細
          if (done) {
            done();
          } else {
            // 新增模式才建立空白行
            setTimeout(() => this.tableEdit?.insertRow(true));
          }
        },
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
        field: 'PLU_No',
        header: '貨號',
        type: 'dropdown',
        options: () => this.INV_ItemName_Options,
        optionLabel: 'label',
        optionValue: 'INV_ItemNo',
        validate: [
          (value: any) => ({
            isValid: !!value,
            errorMessage: ['請選擇貨號']
          })
        ],
        calculate: (rowData, value) => {
          const selected = this.INV_ItemName_Options.find(opt => opt.INV_ItemNo === value);
          return selected ? { PLU_Name: selected.INV_ItemName } : {};
        },
      },
      {
        field: 'PLU_Name',
        header: '品名',
        type: 'dropdown',
        options: () =>
          this.INV_ItemName_Options.map(opt => ({
            label: opt.INV_ItemName,
            value: opt.INV_ItemName,
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
          const selected = this.INV_ItemName_Options.find(opt => opt.INV_ItemName === value);
          return selected ? { PLU_No: selected.INV_ItemNo } : {};
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
    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    const v = form.value;
    const selectedBuyer = this.Buyer_Uniform_Options.find(o => o.value === v.Buyer_Uniform);
    if (!selectedBuyer) {
      alert('請選擇買受人統編');
      return;
    }

    const validDetails = this.data.filter(d => !d._isAutoInsertCandidate);
    if (validDetails.length === 0) {
      alert('明細中沒有有效資料');
      return;
    }

    const invalidDetail = validDetails.some((item) => !item.PLU_No || item.PLU_No.trim() === '');
    if (invalidDetail) {
      alert('明細中有缺少貨號的資料');
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
      InvoiceType: v.InvoiceType,
      SAL_Type: v.SAL_Type,
      InvoiceNumber: v.INV_GUINumber,
      InvoiceDate: toISO(v.InvoiceDate),
      INV_DeclareYM: this.formatDeclareYM(v.InvoiceDate),
      Buyer_Uniform: selectedBuyer.value,
      Buyer_VenNo: selectedBuyer.VEN_No ?? '',
      Buyer_Name: selectedBuyer.VEN_Name ?? '',
      Group_Mark: 'N',
      Donate_Mark: 'N',
      PUR_TaxType: v.PUR_TaxType,
      Voucher_No: v.Voucher_No, // Updated to use v.Voucher_No
      AssetType: v.AssetType ?? '',
      InvoiceTime: new Date().toISOString(),
      Invoice_Cancel: 'N',
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

    console.log('[Update payload]', payload);

    this.fin13040Service
      .updateFIN13040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {

          if (res?.Status === '0000') {
            this.messageService.successBubble('新增成功');
            this.onCancel();
          }
        },
      });
  }
  /** 匯出 PDF */
  onExportPDF(): void {
    if (!this.currentDetailId || this.currentDetailId <= 0) {
      return;
    }

    this.btnLoading = true;

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      MID: 0,
      STO_No: '10',
      ID: this.currentDetailId,
    };

    console.log('[PrintFIN13040 payload]', payload);

    this.fin13040Service.printFIN13040(payload).subscribe({
      next: async (res: any) => {
        console.log('[printFIN13040 回傳]', res);

        const contentType = res.headers?.get('Content-Type') || '';
        const blob = res.body;

        if (contentType.includes('application/json')) {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            if (json?.Status === '0000' && json?.Data?.Print_URL) {
              const url = `${environment.ApiUrl.replace(/\/$/, '')}${json.Data.Print_URL}`;
              const filename = decodeURIComponent(
                json.Data.Print_URL.split('/').pop() ?? '三聯式發票列印.pdf'
              );

              const a = document.createElement('a');
              a.href = url;
              a.setAttribute('download', filename);
              a.click();
            }
          } catch (e) {
            console.error('解析 JSON 失敗', e);
          }
          return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        a.download = '三聯式發票列印.pdf';
        a.click();
        URL.revokeObjectURL(a.href);
      },
      complete: () => {
        this.btnLoading = false;
      },
    });
  }
}
