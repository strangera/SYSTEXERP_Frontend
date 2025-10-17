import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '@shared/componentkit/table/table.model';

//5.1.3.5  專櫃停車費折抵設定作業
@Component({
  selector: 'app-cpm13060',
  templateUrl: './cpm13060.component.html',
  styleUrl: './cpm13060.component.scss',
  standalone: true,
  imports: [DropdownComponent, CalendarRangeQuickComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, TableComponent, TranslateModule]
})

export class CPM13060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [""],  // 交易日期
    TXN_DateEnd: [""],  // 交易日期
    ...createPaginationConfig([{ field: 'PKNG_SeqNo', order: 1 }]), // 預設依序號排序

  });
  totalRecords = 0;

  data: any[] = [];
  columns: Column[] = [
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'ECR_SubGroup', header: '繳費機編號', visible: true },
    { field: 'PKG_disc_rule_name', header: '折扣規則', visible: true },
    { field: 'Total_Fee', header: '金額', visible: true },
    { field: 'Total_Time', header: '時數', visible: true },
    { field: 'count', header: '筆數', visible: true },

  ];
  constructor(

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM13060', '/CPM/CPM13060cru', this.queryForm, (frm) => this.onSubmit(frm));
  }



  // 表單提交邏輯 (查詢)
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }

}
