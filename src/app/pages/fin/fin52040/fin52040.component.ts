import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatDateTime, formatYYYYMM } from '../../../shared/componentkit/table/table.model';
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
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

/** GLS1016 對象別設定檔 */
export interface GLS1016 {
  CompNo: string, // VARCHAR(06)      Not null, /*公司代號*/
  RefCode: string, // VARCHAR(20)     not null, /*對象別代碼*/
  RefName: string, // VARCHAR(30)     not null, /*對象別名稱*/
  SubRefName: string, // VARCHAR(30)      null, /*代送商名稱*/

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

@Component({
  selector: 'app-fin52040',
  templateUrl: './fin52040.component.html',
  styleUrl: './fin52040.component.scss',
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
// 對象及對帳維護作業
export class FIN52040Component extends BasicQueryPageComponent<GLS1016> implements OnInit {
  queryForm = this.formBuilder.group({
    CompNo: ['', [Validators.maxLength(6)]], //  公司代號
    RefCode: ['', [ Validators.maxLength(20)]], // 對象別代碼
    RefName: ['', [Validators.maxLength(30)]], // 對象別名稱

    CRT_USR_Name: ['', [Validators.maxLength(20)]], //  建立人員姓名
    UPD_USR_Name: ['', [Validators.maxLength(20)]], //  變更人員姓名
            
    ...createPaginationConfig([{ field: 'CompNo', order: 1 }]), // 分頁和排序參數
  });
      
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: GLS1016[] = [];
  selectedRows: GLS1016[] = [];
              
  columns: Column[] = [ //先放可視範圍內的
    { field: 'CompNo', header: '公司代號', visible: true }, // 公司代號
    { field: 'RefCode', header: '對象別代碼', visible: true }, // 對象別代碼
    { field: 'RefName', header: '對象別名稱', visible: true }, // 對象別名稱
    { field: 'SubRefName', header: '代送商名稱', visible: true }, // 代送商名稱
      
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
    this.initializePage('FIN52040', '/FIN/FIN52040cru', this.queryForm, (form) => this.onSubmit(form));
  }
        
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }
      
      console.log('對象及對帳維護作業 request', body);

      this.data = [
        { 
          "CompNo": "公司代號1",
          "RefCode": "對象別代碼1",
          "RefName": "對象別名稱1",
          "SubRefName": "代送商名稱1"
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
  onDelete(selectedRows: GLS1016[]) {
    // const ids = selectedRows.map(row => row.id);
    // this.fin14010Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
    //   next: () => {
    //     this.onSubmit(this.queryForm);
    //     this.selectedRows = [];
    //   },
    //   error: () => { this.loading = false; },
    // });
  }
        
  isRowSelectable(row: GLS1016) {
    // return row.CanDel;
    return true
  }
}
