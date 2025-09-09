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

// 2.2.16.2 專櫃預估業績維護作業
@Component({
  selector: 'app-tls2g020',
  templateUrl: './tls2g020.component.html',
  styleUrl: './tls2g020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, MultiSelectComponent, TranslateModule, TableComponent]
})

export class TLS2G020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TLT_NoList: [''],
    budget_yymm: [new Date()],

    ...createPaginationConfig([{ field: 'TLT_NoList', order: 1 }]),
  });

  // 表格
  data7 = [
    {
      budget_yymm: '2025', // 年
      tlt_no: 'A001',
      tlt_name: '威秀影城',
      details: [
        { budget_yymm: '01', M_budget: '500000', cag_charge_rate: '20000', M_bud: '30000' },
        { budget_yymm: '02', M_budget: '480000', cag_charge_rate: '19000', M_bud: '28000' },
        { budget_yymm: '03', M_budget: '510000', cag_charge_rate: '21000', M_bud: '32000' },
      ]
    },
    {
      budget_yymm: '2025',
      tlt_no: 'B002',
      tlt_name: 'Lucky Girl',
      details: [
        { budget_yymm: '01', M_budget: '400000', cag_charge_rate: '20000', M_bud: '25000' },
        { budget_yymm: '02', M_budget: '420000', cag_charge_rate: '21000', M_bud: '26000' },
      ]
    },
    {
      budget_yymm: '2025',
      tlt_no: 'C003',
      tlt_name: '川島之味',
      details: [] // 沒有月資料
    },
    {
      budget_yymm: '2025',
      tlt_no: 'D004',
      tlt_name: 'POLLY GRACE',
      details: [
        { budget_yymm: '01', M_budget: '300000', cag_charge_rate: '20000' ,M_bud:'15000'},
        { budget_yymm: '02', M_budget: '310000', cag_charge_rate: '21000' ,M_bud:'16000'},
        { budget_yymm: '03', M_budget: '290000', cag_charge_rate: '19000' ,M_bud:'14000'},
        { budget_yymm: '04', M_budget: '320000', cag_charge_rate: '22000' ,M_bud:'17000'},
      ]
    },
  ];


  columns7: Column[] = [
    { field: 'budget_yymm', header: '年', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  expansionColumns7: Column[] = [
    { field: 'budget_yymm', header: '月' },
    { field: 'M_budget', header: '月預算', visible: true },
    { field: 'cag_charge_rate', header: '抽成額' },
    { field: 'M_bud', header: '抽成額' },

  ];
  // ----------------------------------------------------------------
  counterOptions: any[] = [];
  totalRecords = 0;
  tltNoOptions: IDropdownItem[] = [];
  constructor(
    private dropDownListService: DropDownListService,
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
        if (res && res.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No} ${item.Name}`,   // 假設 item 有 Name 欄位
            value: item.No,     // 假設 item 有 No 欄位
            No: item.No,        // 確保包含 No 屬性
            Name: item.Name     // 確保包含 Name 屬性
          }));
        }
      });
  }


  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();


    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }



}
