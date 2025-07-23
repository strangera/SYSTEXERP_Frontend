
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent, CalendarComponent, CalendarRangeComponent, DropdownComponent, InputTextComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { Column } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '@shared/index';
import { ApprovalStatus } from '@shared/models';
import { AccordionModule } from 'primeng/accordion';
import { TLS26080Data } from './tls26080.model';

@Component({
  selector: 'app-tls26080',
  templateUrl: './tls26080.component.html',
  styleUrl: './tls26080.component.scss',
  standalone: true,
  imports: [
    TranslateModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class TLS26080Component extends BasicQueryPageComponent<TLS26080Data> implements OnInit {
  // 查詢表單
  public queryForm = this.formBuilder.group({
    pod_no: ['', Validators.maxLength(9)], // 活動單號
    pod_status: [ApprovalStatus.未核准], // 核准狀態
    org_id: [''], // 部門
    cap_item: [[]], // 扣款項目
    podSdateS: [''], // 起始日期(起)
    podSdateE: [''], // 起始日期(迄)
    podEdateS: [''], // 截止日期(起)
    podEdateE: [''], // 截止日期(迄)
  });

  public columns: Column[] = [
    { field: 'pod_no', header: '活動單號', visible: true },
    { field: 'pod_name', header: '活動名稱', visible: true },
    { field: 'org_id', header: '部門', visible: true },
    { field: 'org_name', header: '部門名稱', visible: true },
    { field: 'cap_no', header: '扣款編號', visible: true },
    { field: 'cap_name', header: '扣款項目', visible: true },
    { field: 'pod_sdate', header: '活動期間(起日)', visible: true },
    { field: 'pod_edate', header: '活動期間(迄日)', visible: true },
    { field: 'pod_status', header: '狀態', visible: true, format: this.service.approvalStatus.bind(this) },
  ];

  public totalRecords = signal<number>(0);
  public data: TLS26080Data[] = [];
  public selectedItems: TLS26080Data[] = [];

  constructor(public service: TLS26080Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080CRU', this.queryForm, this.onSubmit.bind(this));
    this.mocks();
  }

  mocks(): void {
    // 模擬資料`
    this.service.loadTLS26080({});
    this.totalRecords.set(this.data.length);
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }


  onClearForm(): void {
    this.queryForm.reset();
  };

  onSubmitQuery(): void {
    this.onSubmit(this.queryForm);
  };

  // 提交查詢
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      // 模擬 API 查詢
      // setTimeout(() => {
      //   const formValues = frm.value;
      //   let filteredData = [...this.service.mockData];

      //   // 篩選邏輯
      //   if (formValues.activityType) {
      //     filteredData = filteredData.filter(item =>
      //       item.activityType === formValues.activityType
      //     );
      //   }
      //   if (formValues.department) {
      //     filteredData = filteredData.filter(item =>
      //       item.department === formValues.department
      //     );
      //   }
      //   if (formValues.activityGroup) {
      //     filteredData = filteredData.filter(item =>
      //       item.activityGroup === formValues.activityGroup
      //     );
      //   }
      //   if (formValues.activityName) {
      //     filteredData = filteredData.filter(item =>
      //       item.activityName === formValues.activityName
      //     );
      //   }
      //   if (formValues.activityStartDate) {
      //     filteredData = filteredData.filter(item =>
      //       new Date(item.activityStartDate) >= new Date(formValues.activityStartDate)
      //     );
      //   }
      //   if (formValues.activityEndDate) {
      //     filteredData = filteredData.filter(item =>
      //       new Date(item.activityEndDate) <= new Date(formValues.activityEndDate)
      //     );
      //   }
      //   if (formValues.activityOfficialDate) {
      //     filteredData = filteredData.filter(item =>
      //       item.activityOfficialDate === formValues.activityOfficialDate
      //     );
      //   }

      //   this.data = filteredData;
      //   this.totalRecords = filteredData.length;
      //   this.queryStateService.setQueryState(this.ProgNo, frm.value);
      // }, 1000);
    });
  }

  // 刪除項目
  onDelete(data: TLS26080Data | TLS26080Data[]): void {
    //   const items = Array.isArray(data) ? data : [data];
    //   if (items.length === 0) return;

    //   const idList = items
    //     .filter(item => item && item.id != null)
    //     .map(item => item.id);

    //   if (idList.length === 0) {
    //     this.messageService.warnBubble('未找到有效的刪除項目');
    //     return;
    //   }

    //   // 模擬 API 刪除
    //   setTimeout(() => {
    //     this.mockData = this.mockData.filter(item => !idList.includes(item.id));
    //     this.messageService.successBubble('選中項目刪除成功');
    //     this.onSubmit(this.queryForm); // 刷新資料
    //   }, 500);

    //   this.selectedItems = [];
  }

  // isRowSelectable(rowData: Tls26080Data): boolean {
  //   return rowData.CanDel;
  // }
}
