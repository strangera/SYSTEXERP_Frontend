import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ECRNoService } from '../../../service/basic/ECRNo.service';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { TLS41020Service } from '../../../service/api/tls/tls41020.service';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 本地儲存鍵：用於儲存查詢狀態
const storageKey = 'TLS41020';

// 2.4.1.2 收銀機EDC資料維護
@Component({
  selector: 'app-tls41020',
  templateUrl: './tls41020.component.html',
  styleUrl: './tls41020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    DropdownComponent,
  ],
})
export class TLS41020Component
  extends BasicQueryPageComponent<any>
  implements OnInit
{
  selectedItems: any[] = [];
  ECRNoOptions: any[] = [];
  queryForm = this.formBuilder.group({
    ECR_No: [],
    EDC_No: [],
    EDC_BegDate_From: [],
    EDC_BegDate_To: [],
    EDC_EdnDate_From: [],
    EDC_EdnDate_To: [],
    EDC_Status: [],
    ECR_TLT_No: [],
    EDC_IP1: [],
    EDC_IP2: [],
    EDC_IP3: [],
    EDC_TmID1: [],
    EDC_TmID2: [],
    EDC_TmID3: [],
    ...createPaginationConfig,
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'EDC_No', header: '信用卡刷卡機代碼', visible: true },
    {
      field: 'EDC_BegDate',
      header: '啟用日期',
      visible: true,
      format: this.formatDateTime,
    },
    {
      field: 'EDC_EndDate',
      header: '停用日期',
      visible: true,
      format: this.formatDateTime,
    },
    { field: 'EDC_Status1Name', header: '中信刷卡機狀態', visible: true },
    { field: 'EDC_Status2Name', header: '聯信刷卡機狀態', visible: true },
    { field: 'ECR_TLT_No', header: '機台所屬專櫃編號', visible: true },
    { field: 'ECR_TLT_Name', header: '機台所屬櫃位名稱', visible: true },
    { field: 'ECR_LocNo', header: '機台所屬地點代號', visible: true },
    { field: 'LOCATION_Name', header: '機台所屬地點名稱', visible: true },
    { field: 'EDC_IP1', header: '中信刷卡機IP', visible: true },
     { field: 'EDC_TmID1', header: '中信刷卡機端末機代碼', visible: true },
     { field: 'EDC_IP12', header: '聯信刷卡機IP', visible: true },
     { field: 'EDC_TmID2', header: '聯信刷卡機端末機代碼', visible: true },
    //  { field: 'EDC_IP3', header: '第三台信用卡刷卡機IP', visible: true },
    //  { field: 'EDC_TmID3', header: '第三台信用卡刷卡機端末機代碼', visible: true },
  ];

  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  constructor(
    private tls41020Service: TLS41020Service,
    private ECRNoService: ECRNoService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', '/tls/tls41020cru', this.queryForm);
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    // 🔸 讀取 localStorage 中的 SYS_StoreNo
    const userInfo = localStorage.getItem('UserInfo');
    const storeNo = userInfo ? JSON.parse(userInfo).SYS_StoreNo : null;

    const raw = form.value;
    const payload = {
      ECR_No: raw.ECR_No,
      EDC_No: raw.EDC_No,
      EDC_BegDateStart: raw.EDC_BegDate_From,
      EDC_BegDateEnd: raw.EDC_BegDate_To,
      EDC_EndDateStart: raw.EDC_EdnDate_From,
      EDC_EndDateEnd: raw.EDC_EdnDate_To,
      EDC_Status: raw.EDC_Status?.length ? raw.EDC_Status[0] : null,
      ECR_TLT_No: raw.ECR_TLT_No,
      EDC_IP1: raw.EDC_IP1,
      EDC_IP2: raw.EDC_IP2,
      EDC_IP3: raw.EDC_IP3,
      EDC_TmID1: raw.EDC_TmID1,
      EDC_TmID2: raw.EDC_TmID2,
      EDC_TmID3: raw.EDC_TmID3,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls41020Service.queryTLS41020(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);
        
      },
      error: () => {
        
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
  }

  onDelete(data: any | any[]): void {
    const items = Array.isArray(data) ? data : [data];
    const idList = items.filter((x) => x?.id).map((x) => x.id);

    if (idList.length === 0) {
      this.messageService.errorBubble('無法刪除：缺少有效 ID');
      return;
    }

    const body = { idList };

    this.tls41020Service.deleteTLS41020(body).subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        } else {
          this.messageService.errorBubble(`刪除失敗: ${res.Message}`);
        }
      },
      error: () => this.messageService.errorBubble('刪除發生錯誤'),
    });
  }
  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }
}
