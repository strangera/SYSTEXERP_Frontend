import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
//

//1.2.9.6 廠商付款明細表
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  styleUrl: './fin29060.component.scss',
  standalone: true,
  imports: [DropdownRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VendorNoFrom: [""],
    VendorNoTo: [""],
    BillingDateFrom: [""],
    BillingDateTo: [""],
    startTransferDate: [""],
    endTransferDate: [""],
    AccNoFrom: [""],
    AccNoTo: [""],
    showUp: [1],
    noPay: [1],
    summary: [""],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  VendorNoOptions: any[] = []; // 廠客代號選項
  AccNoOptions: any[] = []; // 科目代號選項
  selectedItems: any[] = [];
  totalRecords = 0
  data: any[] = [];
  columns: any[] = [
    { field: 'col1', header: '廠商代號', visible: true },
    { field: 'col2', header: '廠商名稱	', visible: true },
    { field: 'col3', header: '應付帳款單號', visible: true },
    { field: 'col4', header: '科目代號', visible: true },
    { field: 'col5', header: '摘要', visible: true },
    { field: 'col6', header: '立帳日期', visible: true },
    { field: 'col7', header: '立帳金額', visible: true },
    { field: 'col8', header: '電匯/開票/單號', visible: true },
    { field: 'col9', header: '開票/匯款日期', visible: true },
    { field: 'col10', header: '傳票號碼', visible: true },
    { field: 'col11', header: '付款金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  showUpOptions: any[] = [
    { value: 1, label: '顯示' },
    { value: 2, label: '不顯示' },
  ];

  constructor(
    private dropDownListService: DropDownListService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN29060', '/FIN/FIN29060CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  private loadOptions(): void {
    // 廠客代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;


    });
  }
}
