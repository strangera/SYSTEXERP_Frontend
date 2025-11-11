import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls2j030-cru',
  templateUrl: './tls2j030-cru.component.html',
  styleUrl: './tls2j030-cru.component.scss',
  standalone: true,
  imports: [
    TableEditComponent, MenubarComponent,
    PanelModule, ReactiveFormsModule, ButtonComponent, TranslateModule, InputTextComponent, TableComponent],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    TXN_GUIBegNo: [''],
  });
  selectedItems: any[] = [];
  data: any[] = [];
  columnsnatural: EditColumn[] = [
    { field: 'TXN_DATE', header: '發票日期' },
    { field: 'TXN_GUIPAPER', header: '發票聯式' },
    { field: 'TXN_GUINO', header: '發票號碼' },
    { field: 'PLU_TAXTYPE', header: '稅別' },
    { field: 'TXN_SALETAX', header: '應稅金額' },
    { field: 'TXN_SALENOTAX', header: '免稅金額' },
    { field: 'TXN_NET', header: '未稅金額' },
    { field: 'TXN_TAX', header: '稅額' },
    { field: 'TXN_SaleAmt', header: '發票金額' },
    { field: 'TXN_UNIFORM', header: '統一編號' },
    { field: 'INV_NoneTax', header: '零稅註記' },
    { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號' },
    { field: 'GUI_DingType', header: '是否為丁種發票' },
    { field: 'TXN_GUIRemark', header: '電子發票隨機碼' },
    { field: 'txn_notes', header: '備註' },

  ];
  columnschange: EditColumn[] = [
    { field: 'TXN_DATE', header: '發票日期' },
    { field: 'TXN_GUIPAPER', header: '發票聯式' },
    { field: 'TXN_GUINO', header: '發票號碼' },
    { field: 'PLU_TAXTYPE', header: '稅別' },
    { field: 'TXN_SALETAX', header: '應稅金額' },
    { field: 'TXN_SALENOTAX', header: '免稅金額' },
    { field: 'TXN_NET', header: '未稅金額' },
    { field: 'TXN_TAX', header: '稅額' },
    { field: 'TXN_SaleAmt', header: '發票金額' },
    { field: 'TXN_UNIFORM', header: '統一編號' },
    { field: 'INV_NoneTax', header: '零稅註記' },
    { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號' },
    { field: 'GUI_DingType', header: '是否為丁種發票' },
    { field: 'TXN_GUIRemark', header: '電子發票隨機碼' },
    { field: 'txn_notes', header: '備註' },
  ];
  columnsdetail: EditColumn[] = [
    { field: 'txn_item', header: '項次' },
    { field: 'txn_itemname', header: '項目名稱' },
    { field: 'inv_qty', header: '數量' },
    { field: 'txn_saleamt', header: '金額' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }
}
