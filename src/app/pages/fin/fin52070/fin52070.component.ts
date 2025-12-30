import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52070Service } from '@service/api/fin/fin52070.service';
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

export interface GLS1005 {
  ClassNo: string, // 三碼代號
  ClassCName: string, // 三碼名稱
  ClassEname: string, // 三碼英文名稱
  ParentClass: string, // 中類代碼

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

// 科目中類GLS1003 格式
export interface ClassAttr {
  ClassNo: string, // 大類代碼
  ClassCName: string, // 大類代碼
  Label?: string, // 查詢頁顯示內容
}

@Component({
  selector: 'app-fin52070',
  templateUrl: './fin52070.component.html',
  styleUrl: './fin52070.component.scss',
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
// FIN52070 科目三碼代號維護
export class FIN52070Component extends BasicQueryPageComponent<GLS1005> implements OnInit {
  queryForm = this.formBuilder.group({
    // 科目三碼代號維護
    ClassNo: ['', [Validators.maxLength(14)]], //  三碼代號
    ClassCName: ['', [Validators.maxLength(100)]], // 三碼名稱
    ClassEname: ['', [Validators.maxLength(100)]], // 三碼英文名稱 (非必填)
    ParentClass: ['', [Validators.maxLength(3)]], //  中類代碼

    ...createPaginationConfig([{ field: 'ClassNo', order: 1 }]), // 分頁和排序參數
  });

  ClassAttr_Option: ClassAttr[] = []; //中類代碼

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: GLS1005[] = [];
  selectedRows: GLS1005[] = [];

  columns: Column[] = [ //先放可視範圍內的
    { field: 'ClassNo', header: '三碼代號', visible: true, exportFormat: [] }, // 三碼代號
    { field: 'ClassCName', header: '三碼名稱', visible: true }, // 三碼名稱
    { field: 'ClassEname', header: '三碼英文名稱', visible: true }, // 三碼英文名稱
    { field: 'ParentClass', header: '中類代碼', visible: true, options: this.ClassAttr_Option }, // 中類代碼

    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];

  constructor(
    private fin52070Service: Fin52070Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52070', '/FIN/FIN52070cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOption();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }

      console.log('科目三碼代號 body', body);

      this.fin52070Service.queryFIN52070(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data;
          console.log('科目三碼代號 response', response);
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    });
  }
  // 刪除控制_Grace 9/9: 
  // GLS6002 GLS3002若有對象別編號不可刪除
  // 9/9 SA註明: 該作業不可修改/刪除
  onDelete(selectedRows: GLS1005[]) {
    // const ids = selectedRows.map(row => row.id);
    // this.fin14010Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
    //   next: () => {
    //     this.onSubmit(this.queryForm);
    //     this.selectedRows = [];
    //   },
    //   error: () => { this.loading = false; },
    // });
  }

  isRowSelectable(row: GLS1005) {
    // return row.CanDel;
    return true
  }

  //讀取下拉
  loadOption() {
    this.fin52070Service.queryParentClassDropdown({}).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        this.ClassAttr_Option = response.Data.map((item: any) => ({
          ...item,
          Label: item.ClassNo + '-' + item.ClassCName, // 組合成顯示用的Label
        }));

        console.log('中類 下拉', this.ClassAttr_Option);
      },
      error: () => { this.loading = false; },
    });
  }
}
