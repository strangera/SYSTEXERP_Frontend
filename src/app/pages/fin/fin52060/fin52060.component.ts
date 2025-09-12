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
  ClassNo: string, // 中類代碼
  ClassCname: string, // 中類名稱
  ClassEname: string, // 中類英文名稱
  ClassAttr: string, // 大類代碼

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
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
export class FIN52060Component extends BasicQueryPageComponent<testDorm> implements OnInit {
  queryForm = this.formBuilder.group({
        // 大+中分類不可重複
        ClassNo: ['', [Validators.maxLength(2)]], //  中類代碼
        ClassCname: ['', [ Validators.maxLength(20)]], // 中類名稱
        ClassEname: ['', [Validators.maxLength(100)]], // 中類英文名稱 (非必填)
        ClassAttr: ['', [Validators.maxLength(1)]], //  大類代碼
                
        ...createPaginationConfig([{ field: 'CompNo', order: 1 }]), // 分頁和排序參數
      });

      ClassAttr_Option: apiOption[] = [ //大分類選單
        {No: '1', Name: '大分類1'},
        {No: '2', Name: '大分類2'},
        {No: '3', Name: '大分類3'}
      ]
          
      totalRecords = 0;// 分頁和排序參數 // 排序需要
      data: testDorm[] = [];
      selectedRows: testDorm[] = [];
                  
      columns: Column[] = [ //先放可視範圍內的
        { field: 'ClassNo', header: '中類代碼', visible: true }, // 中類代碼
        { field: 'ClassCname', header: '中類名稱', visible: true }, // 中類名稱
        { field: 'ClassEname', header: '中類英文名稱', visible: true }, // 中類英文名稱
        { field: 'ClassAttr', header: '大類代碼', visible: true }, // 大類代碼
          
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
        this.initializePage('FIN52060', '/FIN/FIN52060cru', this.queryForm, (form) => this.onSubmit(form));
      }
            
      onSubmit(frm: FormGroup) {
        this.handleSubmit(frm, () => {
          const body = {
            ...frm.value,
          }
          
          console.log('對象及對帳維護作業 request', body);
    
          this.data = [
            { 
              "ClassNo": "中類代碼1",
              "ClassCname": "中類名稱1",
              "ClassEname": "中類英文名稱1",
              "ClassAttr": "1",
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
