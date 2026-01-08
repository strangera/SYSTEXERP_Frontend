import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52050Service } from '@service/api/fin/fin52050.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';

export interface GLS1003 {
  ClassAttr: string, // 大類代碼
  ClassAttrCName: string, // 大類名稱
  ClassAttrEname: string, // 大類英文名稱

  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

@Component({
  selector: 'app-fin52050',
  templateUrl: './fin52050.component.html',
  styleUrl: './fin52050.component.scss',
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

// 科目大分類代號維護
export class FIN52050Component extends BasicQueryPageComponent<GLS1003> implements OnInit {
  queryForm = this.formBuilder.group({
    // GLS1003 科目大類設定檔
    ClassAttr: ['', [Validators.maxLength(1)]], //  大類代碼
    ClassAttrCName: ['', [Validators.maxLength(100)]], // 大類名稱
    ClassAttrEname: ['', [Validators.maxLength(100)]], // 大類英文名稱 (非必填)

    ...createPaginationConfig([{ field: 'ClassAttr', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: GLS1003[] = [];
  selectedRows: GLS1003[] = [];

  columns: Column[] = [ //先放可視範圍內的
    { field: 'ClassAttr', header: '大類代碼', visible: true, exportFormat: [] }, // 大類代碼
    { field: 'ClassAttrCName', header: '大類名稱', visible: true }, // 大類名稱
    { field: 'ClassAttrEname', header: '大類英文名稱', visible: true }, // 大類英文名稱

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];

  constructor(
    private fin52050Service: Fin52050Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52050', '/FIN/FIN52050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }
      console.log('科目大類 request', body);

      this.fin52050Service.queryFIN52050(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data;
          console.log('科目大類設定檔 response', response.Data);
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
  onDelete(selectedRows: GLS1003[]) {
    const ids = selectedRows.map(row => row.ClassAttr);
    this.fin52050Service.deleteFIN52050(ids).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  isRowSelectable(row: GLS1003) {
    // return row.CanDel;
    return true
  }
}
