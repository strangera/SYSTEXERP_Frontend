import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-fin13040-cru',
  templateUrl: './fin13040-cru.component.html',
  styleUrl: './fin13040-cru.component.scss',
  standalone: true,
  imports: [
    TableComponent,
    InputTextRangeComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    ButtonComponent,
    TranslateModule,
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
    startVoucher_No: [''],
    endVoucher_No: [''],
    AssetType: [[] as string[]],
    PUR_InvoiceTitle: [''], // 暫不處理
    Buyer_VenNo: [''],
    Buyer_Name: [''],
  });

  /** 下拉選單與資料 */
  InvoiceType_Options: any[] = [];
  SAL_Type_Options = getSYS1000Options('SAL_Type');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: any[] = [];

  /** 明細資料表 */
  columns: Column[] = [];
  data: any[] = [];
  totalRecords = 0;
  isTableDisabled = false;
  selectedRows: any[] = [];

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
    this.loadAndSetupColumns();

    const rowData = history.state?.rowdata;
    console.log('主檔資料:', rowData);

    if (rowData) {
      this.fillHeaderData(rowData);
      this.loadDetail(rowData);
    }

    this.dataForm.get('Buyer_Uniform')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        const selected = this.Buyer_Uniform_Options.find(o => o.value === val);
        if (selected) {
          this.dataForm.patchValue({
            Buyer_VenNo: selected.VEN_No,
            Buyer_Name: selected.VEN_Name,
          });
        } else {
          this.dataForm.patchValue({
            Buyer_VenNo: '',
            Buyer_Name: '',
          });
        }
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
      startVoucher_No: header.Voucher_No ?? '',
      endVoucher_No: header.Voucher_No ?? '',
      AssetType: header.AssetType ? [header.AssetType] : [],
      PUR_InvoiceTitle: header.Buyer_Name ?? '',
    });
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

          // 若明細API主檔資料有值，可覆蓋補全
          if (header?.InvoiceType) {
            this.fillHeaderData(header);
          }

          // 明細表格資料
          this.data = details;
          this.totalRecords = this.data.length;
        },
      });
  }

  // ======================== 下拉選單 ========================
  /** 載入買受人統一編號下拉清單 */
  loadBuyerUniformOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const list = res?.Data ?? [];
          this.Buyer_Uniform_Options = list.map((item: any) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,          // 統一編號
            VEN_No: item.VEN_No,     // 廠商編號
            VEN_Name: item.Name,     // 廠商名稱
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

  // ======================== 工具 ========================
  private formatValidDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const y = d.getFullYear();
    return y <= 1 ? null : d;
  }
  /** 轉成 yyyyMM 申報年月 */
  private formatDeclareYM(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }


  private loadAndSetupColumns(): void {
    this.columns = [
      { field: 'PLU_Name', header: '品項', type: 'input' },
      { field: 'TXN_Qty', header: '數量', type: 'input' },
      { field: 'TLT_No', header: '含稅金額(僅供參考)', type: 'input' },
      { field: 'PLU_SalePrc', header: '單價', type: 'input' },
      { field: 'TXN_SaleAmt', header: '銷售金額', type: 'input' },
    ];
  }

  // ======================== 明細操作 ========================
  onRowEdit(rowData: any) {
    const target = this.data.find((d) => d.ID === rowData.ID);
    if (target) Object.assign(target, rowData);
    if (rowData.status !== 'new' && rowData.status !== 'deleted') {
      rowData.status = 'modified';
    }
    console.log('修改明細:', rowData);
  }

  onDeleteRow(selectedItems: any[]) {
    console.log('刪除項目:', selectedItems);
  }

  onSubmit(form: FormGroup): void {
    if (!form.valid) {
      return;
    }

    const v = form.value;
    const toISO = (d: any): string | null => {
      if (!d) return null;
      const date = new Date(d);
      return isNaN(date.getTime()) ? null : date.toISOString();
    };

    const selectedBuyer = this.Buyer_Uniform_Options.find(o => o.value === v.Buyer_Uniform);
    if (!selectedBuyer) {

      return;
    }

    const invalidDetail = this.data.some((item) => !item.PLU_No || item.PLU_No.trim() === '');
    if (invalidDetail) {
      return;
    }

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
      Voucher_No: v.startVoucher_No || '',
      AssetType: v.AssetType?.[0] ?? '',
      InvoiceTime: new Date().toISOString(),
      Invoice_Cancel: 'N',
      PUR_Net: history.state?.rowdata?.PUR_Net ?? 0,
      PUR_Tax: history.state?.rowdata?.PUR_Tax ?? 0,
      PUR_Amt: history.state?.rowdata?.PUR_Amt ?? 0,
      CRT_Date: new Date().toISOString(),
      UPD_Date: new Date().toISOString(),
      Print_Date: null,
    };

    const details = this.data.map((item) => ({
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

    console.log('Update payload:', payload);

    this.fin13040Service
      .updateFIN13040(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            this.onCancel();
          }
        },
      });
  }

}
