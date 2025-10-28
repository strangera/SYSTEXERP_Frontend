import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { forkJoin, map } from 'rxjs';

// 1.1.4.3 形成申報書
@Component({
  selector: 'app-fin14030-cru',
  templateUrl: './fin14030-cru.component.html',
  styleUrl: './fin14030-cru.component.scss',
  standalone: true,
  imports: [TableComponent, InputTextRangeComponent, MultiSelectComponent, CalendarRangeComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, CalendarComponent, ButtonComponent, TranslateModule]
})
export class FIN14030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    InvoiceType: [''],
    SAL_Type: [''],
    INV_GUITrack: [''],
    PUR_TaxType: [''],
    AssetType: [[]],
    InvoiceDate_End: [null],
    InvoiceDate_Start: [null],
    Buyer_Uniform: [''],
    PUR_Amt: [''],
    endPUR_Amt: [''],
    startVoucher_No: [''],
    endVoucher_No: [''],
    INV_GUINumber: [''],
    PUR_InvoiceTitle: [''],
  });
  InvoiceType_Options: any[] = [];
  SAL_Type_Options = getSYS1000Options('SAL_Type');
  AssetNoteOptions = getSYS1000Options('AssetType');
  isTableDisabled = false;
  Buyer_Uniform_Options: any[] = [];
  taxTypeOptions: any[] = [];
  selectedRows: any[] = [];
  columns: Column[] = [];
  data: any[] = [];
  totalRecords = 0;
  // ----------------------------------------------------------------
  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN14030', this.dataForm);
    this.loadAndSetupColumns();
  }
  // ===== 載入下拉並設定 columns =====
  private loadAndSetupColumns(): void {
    this.columns = [
      { field: 'PLU_Name', header: '品項', type: 'input' },
      { field: 'TXN_Qty', header: '數量', type: 'input' },
      { field: 'TLT_No', header: '含稅金額(僅供參考)', type: 'input' },
      { field: 'PLU_SalePrc', header: '單價', type: 'input' },
      { field: 'TXN_SaleAmt', header: '銷售金額', type: 'input' },
    ];
  }

  onRowEdit(rowData: any) {
    const target = this.data.find(d => d.ID === rowData.ID);
    if (target) {
      Object.assign(target, rowData);
    }

    if (rowData.status !== 'new' && rowData.status !== 'deleted') {
      rowData.status = 'modified';
    }

    console.log('修改明細:', rowData);
  }
  onSubmit(form: FormGroup): void {
    if (form.valid) {

    }

  }

  onDeleteRow(selectedItems: any[]) {
    for (const item of selectedItems) {
    }

  }
}
