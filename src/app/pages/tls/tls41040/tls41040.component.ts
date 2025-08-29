import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { yesterday } from '@shared/models/system/query-form.model';
import { CalendarComponent } from "@shared/componentkit/calendar/calendar.component";
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { Tls41040Service } from '../../../service/api/tls/tls41040.service'; // 引入剛剛做的 service

@Component({
  selector: 'app-tls41040',
  templateUrl: './tls41040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
    InputTextareaComponent
  ],
})
export class TLS41040Component extends BasicQueryPageComponent<any> implements OnInit {

  // ---- 表單 ----
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [''], // 收銀機號
    NOT_BegDateTime: [yesterday], // 開始時間
    NOT_EndDateTime: [yesterday], // 結束時間
    NOT_Status: ['A'], // 通告狀態
    NOT_Remark: ['', [Validators.maxLength(200)]], // 改成和後端一樣
    ...createPaginationConfig([{ field: 'NOT_SeqNo', order: 1 }]),
  });

  ECRNoOptions: any[] = [];

  NOT_Status_Options = [
    { label: '已生效', value: 'A' },
    { label: '已刪除', value: 'D' },
    { label: '全部', value: '' },
  ];

  private statusLabel = (v: string) => (v === 'A' ? '已生效(A)' : v === 'D' ? '已刪除(D)' : v ?? '');

  toColumnDateTimeFormat(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}-${hh}:${min}:${ss}`;
  }
  columns7: Column[] = [
    { field: 'NOT_DateTime', header: '通告產生時間', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_BegDateTime', header: '開始日期', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_EndDateTime', header: '結束時間', visible: true, format: (v) => this.toColumnDateTimeFormat(v) },
    { field: 'NOT_Desc', header: '通告內容', visible: true },
    { field: 'NOT_Status', header: '通告狀態', visible: true, format: (v: string) => this.statusLabel(v) },
    { field: 'NOT_Remark', header: '通告備註', visible: true },
  ];

  expansionColumns7: Column[] = [
    { field: 'NOT_SeqNo', header: '通告序號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'ECR_Type', header: '機台類別', visible: true },
    { field: 'ECR_GrpNo', header: '機台群組編號', visible: true },
    { field: 'BUILDING_No', header: '館別', visible: true },
    { field: 'FLOOR_No', header: '樓層', visible: true },
    { field: 'Area_No', header: '區域', visible: true },
  ];

  data: any[] = [];
  totalRecords = 0;

  constructor(
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,
    private tls41040Service: Tls41040Service // 注入 Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', '/TLS/TLS41040CRU', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }


  // ---- 查詢 ----
  onSubmit(frm: FormGroup, lazyEvent?: any) {
    this.handleSubmit(frm, () => {
      const payload = {
        PageSize: lazyEvent?.pageSize || 10,
        PageIndex: (lazyEvent?.pageIndex ?? 1) - 1,
        OrderBy: '',
        Offset: ((lazyEvent?.pageIndex ?? 1) - 1) * (lazyEvent?.pageSize || 10),
        SortBy: lazyEvent?.SortBy || [{ field: 'NOT_SeqNo', order: 0 }],
        ECR_No: frm.value.ECR_No || '',
        NOT_BegDateTime: frm.value.NOT_BegDateTime,
        NOT_EndDateTime: frm.value.NOT_EndDateTime,
        NOT_Status: frm.value.NOT_Status || '',
        NOT_Remark: frm.value.NOT_Remark || ''
      };


      this.loading = true;
      this.tls41040Service.queryTLS41040(payload).subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? 0;   // 分頁必填
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: (err) => {
          console.error('TLS41040 查詢失敗:', err);
          this.loading = false;
        }
      });
    });
  }



}
