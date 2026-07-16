import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12060Data, Cpm12060Service } from '@service/api/cpm/cpm12060.service';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig, formatDate } from '../../../others/component/table/table.model';
//

//5.1.2.6  顧客意見處理狀況表
@Component({
  selector: 'app-cpm12060',
  templateUrl: './cpm12060.component.html',
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
    CalendarRangeComponent,
  ]
})
export class CPM12060Component extends BasicQueryPageComponent<CPM12060Data> implements OnInit {
  queryForm = this.formBuilder.group({
    COMPLAIN_DATE_S: [null], // 接件日期(起)
    COMPLAIN_DATE_E: [null], // 接件日期(迄)
    ALERT_DATE_S: [null],    // 派單日期(起)
    ALERT_DATE_E: [null],    // 派單日期(迄)
    STATUS: ['', [Validators.maxLength(1)]],          // 處理狀態(1:已建立,2:已派單,3:處理中,4:結案)
    ...createPaginationConfig([{ field: 'SEQ_ID', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;
  data: CPM12060Data[] = [];
  selectedItems: CPM12060Data[] = [];

  // 處理狀態 下拉選單
  statusOptions: option[] = [
    { label: '已建立', value: '1' },
    { label: '已派單', value: '2' },
    { label: '處理中', value: '3' },
    { label: '結案', value: '4' },
  ]

  columns: Column[] = [
    { field: 'SEQ_ID', header: '顧客意見編號', visible: true },
    { field: 'CUST_NAME', header: '客戶名稱', visible: true },
    { field: 'SEX', header: '性別', visible: true },
    { field: 'COMPLAIN_DATE', header: '提供日期', visible: true, format: formatDate },
    { field: 'ALERT_DATE', header: '通知日期', visible: true, format: formatDate },
    { field: 'ANSWER_NAME', header: '處理者', visible: true },
    { field: 'ANSWER_YN', header: '處理狀況', visible: true },
    { field: 'STATUS', header: '是否結案', visible: true },
    { field: 'CLASS_ID', header: '處理單位代碼', visible: true },
    { field: 'CLASS_NAME', header: '處理單位', visible: true },
  ];

  constructor(
    private readonly cpm12060Service: Cpm12060Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12060', 'cpm/cpm12060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.cpm12060Service.queryCPM12060(frm.value)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);

          console.log('查詢結果:', response.Data);
        });
    });
  }
}
