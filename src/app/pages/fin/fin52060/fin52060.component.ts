import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52060Service } from '@service/api/fin/fin52060.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

export interface GLS1004 {
  ClassNo: string, // 中類代碼
  ClassCName: string, // 中類名稱
  ClassEname: string, // 中類英文名稱
  ClassAttr: string, // 大類代碼

  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

// 科目大類GLS1003 格式
export interface ClassAttr {
  ClassAttr: string, // 大類代碼
  ClassAttrCName: string, // 大類代碼
  Label: string, // 顯示
}

@Component({
  selector: 'app-fin52060',
  templateUrl: './fin52060.component.html',
  styleUrl: './fin52060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextRangeComponent,
    TableComponent,
    TranslateModule
  ]
})
export class FIN52060Component extends BasicQueryPageComponent<GLS1004> implements OnInit {
  queryForm = this.formBuilder.group({
    // 大+中分類不可重複
    ClassNo: ['', [Validators.maxLength(3)]], //  中類代碼
    ClassCName: ['', [Validators.maxLength(100)]], // 中類名稱
    ClassEname: ['', [Validators.maxLength(100)]], // 中類英文名稱 (非必填)
    ClassAttr: ['', [Validators.maxLength(2)]], //  大類代碼

    ...createPaginationConfig([{ field: 'ClassNo', order: 1 }]), // 分頁和排序參數
  });

  ClassAttr_Option: ClassAttr[] = []; //大分類選單

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: GLS1004[] = [];
  selectedRows: GLS1004[] = [];

  columns: Column[] = [
    { field: 'ClassNo', header: '中類代號', visible: true, exportFormat: [] }, // 中類代號
    { field: 'ClassCName', header: '中類名稱', visible: true }, // 中類名稱
    { field: 'ClassEname', header: '中類英文名稱', visible: true }, // 中類英文名稱
    { field: 'ClassAttr', header: '大類代號', visible: false }, // 大類代號
    { field: 'ClassAttrCName', header: '大類名稱', visible: true }, // 大類名稱

    // { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    // { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    // { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    // { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    // { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    // { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];

  constructor(
    private fin52060Service: Fin52060Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52060', '/FIN/FIN52060cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOption();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }

      console.log('科目中類 request', body);

      this.fin52060Service.queryFIN52060(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data;
          console.log('科目中類 response', response);
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    });
  }
  // 刪除控制_Grace 9/9: 
  // 9/9 SA註明: 該作業不可修改/刪除
  onDelete(selectedRows: GLS1004[]) {
    const ids = selectedRows.map(row => row.ClassNo);
    this.fin52060Service.deleteFIN52060({ ids }).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  isRowSelectable(row: GLS1004) {
    // return row.CanDel;
    return true
  }

  //讀取下拉
  loadOption() {
    this.fin52060Service.queryClassAttrDropdown({}).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        console.log('大類下拉 response', response);
        this.ClassAttr_Option = response.Data.map((item: ClassAttr) => ({
          ...item,
          Label: item.ClassAttr + '-' + item.ClassAttrCName,
        }));
      },
      error: () => { this.loading = false; },
    });
  }
}
