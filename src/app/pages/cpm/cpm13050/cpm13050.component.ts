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
  selector: 'app-cpm13050',
  templateUrl: './cpm13050.component.html',
  styleUrl: './cpm13050.component.scss',
  standalone: true,
  imports: [DropdownComponent, CalendarRangeQuickComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, TableComponent, TranslateModule]
})

export class CPM13050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DateStart: [""],  // 交易日期
    TXN_DateEnd: [""],  // 交易日期
    PKG_disc_shop_name: [""],  // 店家名稱
    PKG_disc_rule_name: [""],  // 折扣名稱
    displayMode: [""],  // 報表格式
    ...createPaginationConfig([{ field: 'PKNG_SeqNo', order: 1 }]), // 預設依序號排序

  });
  totalRecords = 0;
  PKG_disc_shop_name_Options = []; // 店家名稱下拉選單選項
  PKG_disc_rule_name_Options = []
  reportOptions = []; // 報表格式下拉選單選項
  data: any[] = [];
  columns: Column[] = [];
  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];


  /**  根據顯示模式切換欄位 */
  updateTableColumns(showType: string) {

    if (showType === 'D') {
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true, showSort: true },
        { field: 'PKG_disc_shop_name', header: '店家名稱', visible: true, showSort: true },
        { field: 'PKG_entrance_uuid', header: '入場紀錄ID', visible: true, showSort: true },
        { field: 'PKG_pricing_start_at', header: '入場時間', visible: true },
        { field: 'PKG_pricing_end_at', header: '出場時間', visible: true },
        { field: 'PKG_license_plate_no', header: '車牌', visible: true },
        { field: 'PKG_disc_rule_name', header: '折扣名稱', visible: true },
        { field: 'PKG_discount_time', header: '實際抵扣時數', visible: true },
        { field: 'PKG_discount_fee', header: '實際抵扣金額', visible: true },

      ];
    } else {
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true, showSort: true },
        { field: 'PKG_disc_shop_name', header: '店家名稱', visible: true, showSort: true },
        { field: 'PKG_disc_rule_name', header: '折扣名稱', visible: true },
        { field: 'count', header: '筆數', visible: true },
        { field: 'PKG_discount_time', header: '實際抵扣時數', visible: true },
        { field: 'PKG_discount_fee', header: '實際抵扣金額', visible: true },
      ]
    }
  }

  constructor(

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('CPM13050', '/CPM/CPM13050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }



  // 表單提交邏輯 (查詢)
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }

}
