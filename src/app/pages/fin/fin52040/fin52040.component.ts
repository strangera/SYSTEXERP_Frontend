import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin52040Request, Fin52040Response, FIN52040Service } from '@service/api/fin/fin52040.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';


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
export class FIN52040Component extends BasicQueryPageComponent<Fin52040Request> implements OnInit {
  queryForm = this.formBuilder.group({
    UniformNo: ['', [Validators.maxLength(10)]], //  統一編號 
    RefCode: ['', [Validators.maxLength(30)]], // 對象別代碼
    RefName: ['', [Validators.maxLength(30)]], // 對象別名稱

    CRT_USR_No: ['', [Validators.maxLength(16)]], //  建立人員姓名
    UPD_USR_No: ['', [Validators.maxLength(16)]], //  變更人員姓名

    ...createPaginationConfig([{ field: 'RefCode', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Fin52040Response[] = [];
  selectedRows: Fin52040Response[] = [];

  tblUserOptions: apiOption[] = []; // 人員 下拉選單

  columns: Column[] = [ //先放可視範圍內的
    { field: 'UniformNo', header: '統一編號', visible: true }, // 統一編號
    { field: 'RefCode', header: '對象別代碼', visible: true }, // 對象別代碼
    { field: 'RefName', header: '對象別名稱', visible: true }, // 對象別名稱

    // { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    // { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    // { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    // { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    // { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    // { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];

  constructor(
    private fin52040Service: FIN52040Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52040', '/FIN/FIN52040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
      }

      console.log('對象及對帳維護作業 request', body);

      this.fin52040Service.queryFIN52040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        console.log('對象及對帳維護作業response', res.Data);
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, body);
      })
    });
  }
  // 刪除控制_Grace 9/9: 
  onDelete(selectedRows: Fin52040Response[]) {
    const refCodeList = selectedRows.map(row => row.RefCode);
    const requestBody = {
      RefCodes: refCodeList
    };

    console.log('delete request', requestBody);
    this.fin52040Service.deleteFIN52040(requestBody).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  isRowSelectable(row: Fin52040Response) {
    // return row.CanDel;
    return true
  }

  // 讀取下拉選單
  loadOptions() {
    this.fin52040Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
      this.tblUserOptions = res.Data.map((item: { No: string; Name: string; Label: string }) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '_' + item.Name
      }));
      console.log('人員下拉選單', this.tblUserOptions);
    });
  }
}
