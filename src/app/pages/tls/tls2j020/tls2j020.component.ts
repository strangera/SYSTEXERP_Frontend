
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TLS2J020Service } from '@service/api/tls/tls2j020.service';
import { finalize, Observable } from 'rxjs';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

// 2.2.18.2 大分類換開品項維護作業
@Component({
  selector: 'app-tls2j020',
  templateUrl: './tls2j020.component.html',
  styleUrl: './tls2j020.component.scss',
  standalone: true,
  imports: [DropdownComponent, MultiSelectComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TableReportComponent, TranslateModule]
})
export class TLS2J020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
    bus_type: [[]],
    Item_TaxType: [['1']],
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  });

  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  busTypeOptions: any[] = [];
  Item_TaxType_Option = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' }
  ];
  columns: ReportColumn[] = [
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類', visible: true },
    { field: 'CHG_ItemName', header: '品項名稱', visible: true },
    { field: 'Item_TaxType_Desc', header: '稅別', visible: true },
    // 其他欄位
  ];

  lastQueryBody: any = {};

  queryFunction = (body: any): Observable<any> => {
    return this.tls2j020Service.queryTLS2J020(body);
  };

  constructor(
    private dropDownListService: DropDownListService,
    private tls2j020Service: TLS2J020Service
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
  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const payload = {
        bus_type: v.bus_type?.length ? v.bus_type : [],
        CHG_ItemName: v.CHG_ItemName?.trim() || '',
        Item_TaxType: v.Item_TaxType?.length ? v.Item_TaxType : [],
        pageSize: 30,
        pageIndex: 1,
      };

      this.lastQueryBody = {
        bus_type: v.bus_type?.length ? v.bus_type : [],
        CHG_ItemName: v.CHG_ItemName?.trim() || '',
        Item_TaxType: v.Item_TaxType?.length ? v.Item_TaxType : [],
        pageSize: 30,
        pageIndex: 1,
      };

      this.loading = true;
      this.tls2j020Service
        .queryTLS2J020(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data || [];
              this.totalRecords = res.TotalCount || this.data.length;
              // 儲存查詢狀態
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            } else {
              this.messageService.errorBubble(res.Message || '查詢失敗');
              this.data = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }

}
