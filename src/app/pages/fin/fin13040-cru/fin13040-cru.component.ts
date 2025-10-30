import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableEditComponent } from "@shared/componentkit/table-edit/table-edit.component";
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';

@Component({
  selector: 'app-fin13040-cru',
  templateUrl: './fin13040-cru.component.html',
  styleUrl: './fin13040-cru.component.scss',
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
    TableEditComponent
  ],
})
export class FIN13040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    InvoiceType: ['', Validators.required],
    SAL_Type: ['', Validators.required],
    GUI_Track: ['', [Validators.maxLength(2)]],
    INV_GUINumber: ['', Validators.required],
    InvoiceDate: [null as Date | null, Validators.required],
    Buyer_Uniform: ['', Validators.required],
    PUR_TaxType: ['', Validators.required],
    startVoucher_No: [null],
    endVoucher_No: [null],
    AssetType: [[] as string[]],
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

    const rowData = history.state?.rowdata;
    console.log('主檔資料:', rowData);

    if (rowData) {
      this.fillHeaderData(rowData);
      this.loadDetail(rowData);
    }

    //  SAL_Type 改變時重新載入品項
    this.dataForm.get('SAL_Type')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        console.log('[valueChanges] SAL_Type 改變:', val);
        this.loadINVItemOptions();
      });

    // 如果初始化時 SAL_Type 已有值（例如編輯模式），延遲執行一次
    setTimeout(() => {
      const salType = this.dataForm.get('SAL_Type')?.value;
      console.log('[init] SAL_Type 初始值:', salType);
      if (salType) this.loadINVItemOptions();
    }, 200);

    // 買受人統編改變自動帶入廠商資訊
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
    this.dataForm.patchValue({
      InvoiceType: header.InvoiceType ?? '',
      SAL_Type: header.SAL_Type ?? '',
      GUI_Track: header.GUI_Track ?? '',
      INV_GUINumber: header.InvoiceNumber ?? '',
      InvoiceDate: this.formatValidDate(header.InvoiceDate),
      Buyer_Uniform: header.Buyer_Uniform ?? '',
      PUR_TaxType: header.PUR_TaxType ?? '',
      startVoucher_No: header.Voucher_No ?? null,
      endVoucher_No: header.Voucher_No ?? null,
      AssetType: header.AssetType ? [header.AssetType] : [],
      PUR_InvoiceTitle: header.Buyer_Name ?? '',
    });

    console.log('[fillHeaderData] 已設定 SAL_Type =', header.SAL_Type);
  }
  // ======================== 載入明細 ========================
  private loadDetail(rowData: any): void {
    const payload = {
      MID: 0,
      STO_No: rowData.STO_No ?? '',
      ID: rowData.No,
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

          console.log('主檔資料(明細API):', header);
          console.log('明細資料:', details);

          if (header?.InvoiceType) {
            this.fillHeaderData(header);
          }

          this.data = details;
          this.totalRecords = this.data.length;
        },
      });
  }

  // ======================== 下拉選單 ========================
  /** 載入買受人統一編號 */
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

  /** 載入發票類型 */
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

  /** 載入品項下拉 (TDS1008) */
  loadINVItemOptions(): void {
    const salType = this.dataForm.get('SAL_Type')?.value || '';
    console.log('[loadINVItemOptions] 呼叫，SAL_Type =', salType);

    if (!salType) {
      console.warn('[loadINVItemOptions] SAL_Type 為空，不呼叫 API');
      this.INV_ItemName_Options = [];
      this.loadAndSetupColumns();
      this.data = [];
      this.tableEdit?.insertRow(true); // 這裡也可加（SAL_Type 清空時）
      return;
    }

    this.dropDownListService
      .queryTDS1008_DropDownList([salType])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          console.log('[TDS1008 回傳原始資料]:', res);
          let list: any[] = [];
          if (Array.isArray((res as any)?.Data)) {
            list = (res as any).Data.flatMap((d: any) => d?.Data ?? []);
          } else if ((res as any)?.Data?.Data && Array.isArray((res as any).Data.Data)) {
            list = (res as any).Data.Data;
          } else {
            console.warn('[TDS1008] Data 結構未知:', (res as any)?.Data);
          }

          this.INV_ItemName_Options = list.map((item: any) => ({
            label: `${item.INV_ItemNo}`,
            value: item.INV_ItemNo,
            INV_ItemNo: item.INV_ItemNo,
            INV_ItemName: item.INV_ItemName,
            INV_UsageType: item.INV_UsageType,
          }));

          this.loadAndSetupColumns();

          this.data = [];
          setTimeout(() => {
            this.tableEdit?.insertRow(true);
          });
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

  /** yyyyMM 格式 */
  private formatDeclareYM(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  /** 更新主檔金額合計 */
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

  // ======================== 明細欄位設定 ========================
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
      },
      {
        field: 'TXN_Qty',
        header: '數量',
        type: 'inputNumber',
        defaultValue: 1,
        validate: [
          (value: any) => ({
            isValid: value !== null && value !== undefined && !isNaN(value) && Number(value) > 0,
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
            isValid: value !== null && value !== undefined && !isNaN(value),
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
            isValid: value !== null && value !== undefined && !isNaN(value),
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
            isValid: value !== null && value !== undefined && !isNaN(value),
            errorMessage: ['請輸入有效的稅額']
          })
        ],
      },
    ];
  }


  // ======================== 儲存 ========================
  @ViewChild('tableEdit') tableEdit!: TableEditComponent;

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
      ID: history.state?.rowdata?.No ?? 0,
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
      Voucher_No: v.startVoucher_No || null,
      AssetType: v.AssetType?.[0] ?? '',
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
          console.log('[updateFIN13040 回傳]', res);
          if (res?.Status === '0000') {
            alert('更新成功');
            this.onCancel();
          } else {
            alert(`更新失敗，狀態碼：${res?.Status ?? '未知'}`);
          }
        },
        error: (err) => {
          console.error('[updateFIN13040 錯誤]', err);
          alert('呼叫 API 發生錯誤，請查看 console。');
        },
      });
  }


}
