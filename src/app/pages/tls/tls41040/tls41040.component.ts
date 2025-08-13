import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { yesterday } from '@shared/models/system/query-form.model';
import { CalendarComponent } from "@shared/componentkit/calendar/calendar.component";
import {Column} from '@shared/componentkit/table/table.model';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';

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
  queryForm = this.formBuilder.group({
    ECR_No: [''],                   // 收銀機號 (POS1002.ECR_No)
    NOT_BegDateTime: [yesterday],        // 開始時間
    NOT_EndDateTime: [yesterday],        // 結束時間
    NOT_Status: ['A'],              // 通告狀態：預設 A=已生效
    ECR_GrpDesc: ['', [Validators.maxLength(200)]], // 通告備註
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  ECRNoOptions: any[] = [];


  NOT_Status_Options = [
    { label: '已生效', value: 'A' },
    { label: '已刪除', value: 'D' },
    { label: '全部', value: '' },
  ];

  private statusLabel = (v: string) => (v === 'A' ? '已生效(A)' : v === 'D' ? '已刪除(D)' : v ?? '');

  columns7: Column[] = [
    { field: 'NOT_DateTime', header: '通告產生時間', visible: true },
    { field: 'NOT_BegDateTime', header: '開始日期', visible: true },
    { field: 'NOT_EndDateTime', header: '結束時間', visible: true },
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
  NOT_EndDateTime_Options = {
    // Define your options here
  };

  constructor(
    private ECRNoService: ECRNoService,
    private dropDownListService: DropDownListService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41040', '/TLS/TLS41040CRU', this.queryForm, (form) => this.onSubmit(form));

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });



  }

  // ---- 查詢（先放 demo）----
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.queryStateService.setQueryState(this.ProgNo, frm.value);
      this.loading = false;
    });
  }


}
