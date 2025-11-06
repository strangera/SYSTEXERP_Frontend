
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';


// 2.2.18.2 大分類換開品項維護作業
@Component({
  selector: 'app-tls2j020',
  templateUrl: './tls2j020.component.html',
  styleUrl: './tls2j020.component.scss',
  standalone: true,
  imports: [DropdownComponent, MultiSelectComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableComponent, TranslateModule]
})
export class TLS2J020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
    bus_type: [''],
    Item_TaxType: [1],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  busTypeOptions: any[] = [];
  Item_TaxType_Option = [
    { label: '免稅', value: 0 },
    { label: '應稅', value: 1 }
  ];
  columns: any[] = [
    { field: 'bus_type', header: '大分類', visible: true },
    { field: 'CHG_ItemName', header: '品項名稱', visible: true },
    { field: 'Item_TaxType', header: '稅別', visible: true },
    // 其他欄位
  ];

  constructor(
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J020', '/TLS/TLS2J020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    this.dropDownListService.queryTLTBUSTYPE_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.busTypeOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
