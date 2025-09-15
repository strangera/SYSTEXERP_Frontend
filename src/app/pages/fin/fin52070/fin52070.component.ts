import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FIN15090Service } from '@service/api/fin/fin15090.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { apiOption } from '@shared/models/sys/sysb000.model';

export interface testDorm {
  AccNo: string, // 三碼代號
  AccCname: string, // 三碼名稱
  AccEname: string, // 三碼英文名稱
  ClassNo: string, // 中類代碼

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
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
export class FIN52070Component extends BasicQueryPageComponent<testDorm> implements OnInit {
  queryForm = this.formBuilder.group({
    // 科目三碼代號維護
    AccNo: ['', [Validators.maxLength(3)]], //  三碼代號
    AccCname: ['', [ Validators.maxLength(24)]], // 三碼名稱
    AccEname: ['', [Validators.maxLength(50)]], // 三碼英文名稱 (非必填)
    ClassNo: ['', [Validators.maxLength(1)]], //  中類代碼
                  
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]), // 分頁和排序參數
  });
  
  ClassNo_Option: apiOption[] = [ //中類代碼
    {No: '1', Name: '中類1'},
    {No: '2', Name: '中類2'},
    {No: '3', Name: '中類3'}
  ]
            
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: testDorm[] = [];
  selectedRows: testDorm[] = [];
                    
  columns: Column[] = [ //先放可視範圍內的
    { field: 'AccNo', header: '三碼代號', visible: true }, // 三碼代號
    { field: 'AccCname', header: '三碼名稱', visible: true }, // 三碼名稱
    { field: 'AccEname', header: '三碼英文名稱', visible: true }, // 三碼英文名稱
    { field: 'ClassNo', header: '中類代碼', visible: true, options: this.ClassNo_Option }, // 中類代碼
            
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
            
  constructor(
    private fin15090Service: FIN15090Service,
    private validationService: ValidationService
    ) {
      super(); // 呼叫父類建構子
  }
              
  ngOnInit(): void {
    this.initializePage('FIN52070', '/FIN/FIN52070cru', this.queryForm, (form) => this.onSubmit(form));
  }
              
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
         ...frm.value,
      }
            
      console.log('對象及對帳維護作業 request', body);
      
      this.data = [
        { 
          "AccNo": "三碼代號",
          "AccCname": "三碼名稱",
          "AccEname": "三碼英文名稱",
          "ClassNo": "1",
        }
      ];
      
      this.loading = false;
            
      // this.fin15090Service.PrintFIN15090(body).pipe(untilDestroyed(this)).subscribe({
      //   next: (response) => {
      //     this.data = response.Data;
      //     console.log('對象及對帳維護作業 response', response);
      //     this.totalRecords = response.TotalCount;
      //     this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     this.loading = false;
      //   },
      //   error: () => { this.loading = false; },
      // });
    });
  }
  // 刪除控制_Grace 9/9: 
  // GLS6002 GLS3002若有對象別編號不可刪除
  onDelete(selectedRows: testDorm[]) {
    // const ids = selectedRows.map(row => row.id);
    // this.fin14010Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
    //   next: () => {
    //     this.onSubmit(this.queryForm);
    //     this.selectedRows = [];
    //   },
    //   error: () => { this.loading = false; },
    // });
  }
              
  isRowSelectable(row: testDorm) {
    // return row.CanDel;
    return true
  }
}
