import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls2d010',
  templateUrl: './tls2d010.component.html',
  styleUrl: './tls2d010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, MultiSelectComponent, CalendarComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class TLS2D010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    tlt_no: [[]], // 專櫃編號
    CAP_Item: [[]],
    AccNo: [, [Validators.maxLength(8)]], // 會計科目代號
    org_id: [[] as number[], [Validators.required]], // 組織
    tpy_date: [], // 扣款年月
    CRT_USR_No: [], // 扣款日期
    pod_no: [], // 維護日
    GUI_FLAG: [], // 建立者
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  columns: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_no', header: '專櫃名稱', visible: true },
    { field: 'CAP_Item', header: '扣款項目', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'org_id', header: '組織名稱', visible: true },
    { field: 'pod_no', header: '活動名稱', visible: true },
    { field: 'Date', header: '扣款年月', visible: true },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true },
    { field: 'tpy_net', header: '扣款(未稅)', visible: true },
    { field: 'remarks', header: '備註', visible: true },

  ];

  totalRecords = 0;
  data: any[] = [];

  tlt_noOptions: any[] = [];
  org_idOptions: any[] = []
  CAP_ItemOptions: any[] = [];
  CRT_USR_NoOptions: any[] = [];
  pod_noOptions: any[] = [];

  get f() {
    return this.queryForm.controls;
  }

  constructor(

  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('TLS2D010', '/TLS/TLS2D010CRU', this.queryForm, (form) => this.onSubmit(form));

  }


  onSubmit(frm: FormGroup) {
    console.log(frm.value);

  }


}

