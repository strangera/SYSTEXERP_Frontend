
import { DatePipe } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
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
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class TLS26080Component extends BasicQueryPageComponent<TLS26080Data> implements OnInit {
  // 查詢表單
  public queryForm = this.formBuilder.group({
    pod_no: ['', Validators.maxLength(10)], // 活動單號
    pod_desc: ['', Validators.maxLength(100)], // 活動名稱
    pod_status: [ApprovalStatus.未核准], // 核准狀態
    org_id: [''], // 部門
    cap_item: [[] as string[]], // 扣款代碼
    pod_sdate: [new Date()], // 起始日期(起)
    pod_edate: [new Date()], // 起始日期(迄)
    pod_busdate: [new Date()], // 活動正檔日期
  });

  public columns: Column[] = [
    { field: 'pod_no', header: '活動單號', visible: true },
    { field: 'pod_desc', header: '活動名稱', visible: true },
    { field: 'pod_sdate', header: '活動期間(起日)', visible: true, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '活動期間(迄日)', visible: true, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'cap_item', header: '扣款代碼', visible: true },
    { field: 'pod_type', header: '扣款名稱', visible: true },
    { field: 'pod_status', header: '狀態', visible: true, format: this.service.approvalStatus.bind(this) },
  ];

  public readonly editDisabled = (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.未核准;
  public readonly isEditable = (rowData: TLS26080Data) => rowData.CanEdit == '1';
  public readonly isRowSelectable = (rowData: TLS26080Data) => rowData.CanDelete == '0';

  public totalRecords = signal<number>(0);
  public data: TLS26080Data[] = [];
  public selectedItems: TLS26080Data[] = [];

  private queryTLS26080 = computed(() => {
    const formValues = this.queryForm.value;
    const result = {};
    formValues.pod_no && (Reflect.set(result, 'pod_no', formValues.pod_no));
    formValues.pod_desc && (Reflect.set(result, 'pod_desc', formValues.pod_desc));
    formValues.pod_status && (Reflect.set(result, 'pod_status', formValues.pod_status));
    formValues.pod_sdate && (Reflect.set(result, 'pod_sdate', this.datePipe.transform(formValues.pod_sdate, 'YYYY/MM/dd')));
    formValues.pod_edate && (Reflect.set(result, 'pod_edate', this.datePipe.transform(formValues.pod_edate, 'YYYY/MM/dd')));
    formValues.pod_busdate && (Reflect.set(result, 'pod_busdate', this.datePipe.transform(formValues.pod_busdate, 'YYYY/MM/dd')));
    return result;
  });

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080CRU', this.queryForm, this.onSubmit.bind(this));
  }

  public canQuery(): boolean {
    return true;
  }

  public canAdd(): boolean {
    return true;
  }

  public canEdit(): boolean {
    return true;
  }

  public onClearForm(): void {
    this.queryForm.reset();
  };

  public onSubmitQuery(): void {
    this.onSubmit(this.queryForm);
  };

  // 提交查詢
  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      frm.valid && this.canQuery() && this.service.loadTLS26080(this.queryTLS26080());
      this.loading = !1;
    });
  }

  // 刪除項目
  public onDelete(data: TLS26080Data | TLS26080Data[]): void {
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
}
