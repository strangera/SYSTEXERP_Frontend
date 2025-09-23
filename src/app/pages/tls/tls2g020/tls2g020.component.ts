import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Tls2g020Service } from '../../../service/api/tls/tls2g020.service';

@Component({
  selector: 'app-tls2g020',
  templateUrl: './tls2g020.component.html',
  styleUrl: './tls2g020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    TranslateModule,
    TableComponent
  ]
})
export class TLS2G020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TLT_NoList: [[]],
    budget_yymm: [new Date()],
    ...createPaginationConfig([{ field: 'TLT_NoList', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  tltNoOptions: IDropdownItem[] = [];

  columns: Column[] = [
    { field: 'budget_yy', header: '年度', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  expansionColumns: Column[] = [
    { field: 'Month', header: '月' },
    { field: 'budget', header: '月預算', visible: true },
    { field: 'avg_cag_charge_rate', header: '抽成額' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private tls2g020Service: Tls2g020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G020', '/TLS/TLS2G020CRU', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No} ${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name
          }));
        }
      });
  }
 onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    const raw = frm.getRawValue();
    const payload = {
      budget_yy: raw.budget_yymm
        ? new Date(raw.budget_yymm).getFullYear().toString()
        : '',
      tlt_no: raw.TLT_NoList || [],
      PageSize: raw.PageSize,
      PageIndex: raw.PageIndex,
      Offset: raw.Offset,
      SortBy: raw.SortBy
    };

    this.tls2g020Service.queryTLS2G020(payload).subscribe({
      next: (res) => {
        this.data = (res?.Data || []).map((item: any) => ({
          ...item,
          details: item.Mdeatil ?? []
        }));
        this.totalRecords = res?.TotalCount || 0;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }


  // 展開行時查明細
  onRowExpand(event: any) {
    const row = event.data;
    const payload = {
      budget_yy: row.budget_yy,
      tlt_no: [row.tlt_no]
    };

    this.tls2g020Service.queryTLS2G020Detail(payload).subscribe({
      next: (res) => {
        row.details = res?.Data || [];
      },
    });
  }

  onClearForm() {
    this.queryForm.reset();
  }
}
