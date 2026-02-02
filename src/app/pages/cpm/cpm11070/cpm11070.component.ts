import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { CPM11070Data, CPM11070Service, QueryCPM11070Request } from '../../../service/api/cpm/cpm11070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-cpm11070',
  templateUrl: './cpm11070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeQuickComponent,
    DropdownComponent,
    TranslateModule,
    TableReportComponent,
    RadiobuttonComponent,
    InputTextareaComponent
  ],
})
export class CPM11070Component extends BasicQueryPageComponent<CPM11070Data> implements OnInit {
  queryForm = this.formBuilder.group({
    SeqId: ['', [Validators.maxLength(11)]],
    RecDateFrom: [new (Date), [Validators.required,]],
    RecDateTo: [null as Date | null],
    LostDateFrom: [null as Date | null],
    LostDateTo: [null as Date | null],
    FindDateFrom: [null as Date | null],
    FindDateTo: [null as Date | null],
    MsgDateFrom: [null as Date | null],
    MsgDateTo: [null as Date | null],
    ReceiveDateFrom: [null as Date | null],
    ReceiveDateTo: [null as Date | null],
    TransDateFrom: [null as Date | null],
    TransDateTo: [null as Date | null],
    DocType: [''],
    Goods: [''],
    SeqType: [''],
    Notes: ['', [Validators.maxLength(400)]],
    LocationKeyword: [''],
    ServiceUser: ['', [Validators.maxLength(20)]],
    KEY_USER: ['', [Validators.maxLength(20)]],
    BroadcastFilter: [''],
    BroadcastSituation: ['', [Validators.maxLength(100)]],
    RecaptionName: ['', [Validators.maxLength(20)]],
    RecaptionPhone: ['', [Validators.maxLength(10)]],
    RegistrantKeyword: ['', [Validators.maxLength(20)]],
    ProcessingUser: ['', [Validators.maxLength(20)]],
    IdentityKind: [''],
    Tel: ['', [Validators.maxLength(10)]],
    MobilePhone: ['', [Validators.maxLength(10)]],
    IdNo: ['', [Validators.maxLength(20)]],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'SeqId', order: 1 }]],
  });
  totalRecords = 0;
  data: CPM11070Data[] = [];
  lastQueryBody: QueryCPM11070Request | null = null;
  Type1Options = [
    { No: 'L', Name: '遺失' },
    { No: 'F', Name: '拾獲' },
  ];
  addButton: AddButton[] = [];
  Type3Options = [
    { Name: '登錄', No: '1' },
    { Name: '已通知', No: '3' },
    { Name: '領回', No: '4' },
    { Name: '轉出', No: '6' },
  ];
  Type2Options = getSYS1000Options('LOST_GOODS_TYPE');
  SPACE3Options = [ //是否廣播
    { label: '已廣播', value: 'Y' },
    { label: '不廣播', value: 'N' },
    { label: '全部', value: 'A' },
  ];
  SPACE1Options = getSYS1000Options('LOCATION');
  USER5Options = [
    { Name: '遊客', No: '1' },
    { Name: '員工', No: '2' },
  ];
  // 判斷是否為已結案(已領回/已轉出)案件
  private isClosed(row: CPM11070Data): boolean {
    const status = row.SeqStatusName?.trim();
    return status === '領回' || status === '已領回' || status === '轉出' || status === '已轉出';
  }

  // 提供給 table 綁定用：已結案則停用編輯按鈕
  editDisabled = (row: CPM11070Data): boolean => {
    return this.isClosed(row);
  };
  columns: ReportColumn[] = [
    { field: 'GoodsType', header: '物品類別', visible: true },
    { field: 'GoodsDesc', header: '物品敘述', visible: true },
    { field: 'SeqId', header: '登錄編號', visible: true },
    { field: 'RecDate', header: '登錄日期', visible: true, format: formatDate },
    { field: 'MsgDate', header: '通知日期', visible: true, format: formatDate },
    { field: 'ReceiveDate', header: '領回日期', visible: true, format: formatDate },
    { field: 'OffDate', header: '轉出日期', visible: true, format: formatDate },
    { field: 'DocTypeName', header: '失物類別', visible: true },
    { field: 'SeqStatusName', header: '失物狀態', visible: true },
    { field: 'Location', header: '地點', visible: true },
    { field: 'ServiceUser', header: '服務人員', visible: true },
    { field: 'Registrant', header: '遺失者/拾獲者姓名', visible: true },
    { field: 'Tel', header: '電話(夜)', visible: true },
    { field: 'Mobile', header: '電話(日)', visible: true },

  ];
  constructor(
    public readonly cpm11070Service: CPM11070Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('CPM11070', '/CPM/CPM11070CRU', this.queryForm, (frm) => this.onSubmit(frm));

    // 設定自訂管理按鈕：領回 -> 開啟編輯頁面以進行領回流程
    this.addButton = [
      {
        label: '領回',
        icon: 'pi pi-check-circle',
        action: (row: CPM11070Data) => {
          if (this.isClosed(row)) {
            this.messageService.errorBubble('已轉出或已領回資料不可領回');
            return;
          }
          this.onEdit({ ...row, _openMode: 'receive' } as any);
        },
        disabled: (row: CPM11070Data) => this.isClosed(row),
      },
    ];

  }

  override onEdit(data: CPM11070Data, queryConditions?: any): void {
    if (this.isClosed(data)) {
      this.messageService.errorBubble('已轉出或已領回資料不可編輯');
      return;
    }
    super.onEdit(data, queryConditions);
  }


  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const format = (d: Date | null) => d ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined : undefined;

      const payload: QueryCPM11070Request = {
        // 分頁與排序（後端欄位需大寫開頭）
        PageSize: raw.PageSize ?? raw.pageSize ?? 20,
        PageIndex: raw.PageIndex ?? raw.pageIndex ?? 1,
        SortBy: raw.SortBy ?? [],
        OrderBy: '',
        Offset: 0,

        // 查詢條件
        SeqId: raw.SeqId ?? undefined,
        RecDateFrom: format(raw.RecDateFrom),
        RecDateTo: format(raw.RecDateTo),
        LostDateFrom: format(raw.LostDateFrom),
        LostDateTo: format(raw.LostDateTo),
        FindDateFrom: format(raw.FindDateFrom),
        FindDateTo: format(raw.FindDateTo),
        MsgDateFrom: format(raw.MsgDateFrom),
        MsgDateTo: format(raw.MsgDateTo),
        ReceiveDateFrom: format(raw.ReceiveDateFrom),
        ReceiveDateTo: format(raw.ReceiveDateTo),
        TransDateFrom: format(raw.TransDateFrom),
        TransDateTo: format(raw.TransDateTo),
        DocType: raw.DocType ?? undefined,
        Goods: raw.Goods ?? undefined,
        SeqType: raw.SeqType ?? undefined,
        Notes: raw.Notes ?? undefined,
        LocationKeyword: raw.LocationKeyword ?? undefined,
        ServiceUser: raw.ServiceUser ?? undefined,
        KEY_USER: raw.KEY_USER ?? undefined,
        BroadcastFilter: raw.BroadcastFilter ?? undefined,
        BroadcastSituation: raw.BroadcastSituation ?? undefined,
        RecaptionName: raw.RecaptionName ?? undefined,
        RecaptionPhone: raw.RecaptionPhone ?? undefined,
        RegistrantKeyword: raw.RegistrantKeyword ?? undefined,
        ProcessingUser: raw.ProcessingUser ?? undefined,
        IdentityKind: raw.IdentityKind ?? undefined,
        Tel: raw.Tel ?? undefined,
        MobilePhone: raw.MobilePhone ?? undefined,
        IdNo: raw.IdNo ?? undefined,
      };

      this.cpm11070Service
        .queryCPM11070(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            this.data = res.Data || [];
            this.lastQueryBody = payload;
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          },
        });
    });
  }

  // 匯出「未領取報表」Excel
  onExportUnreceivedReport(): void {
    const raw = this.queryForm.getRawValue();

    const format = (d: Date | null) => d ? this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined : undefined;

    if (!raw.RecDateFrom) {
      this.messageService.errorBubble('「登錄日期(起)」為必填');
      return;
    }

    const payload: QueryCPM11070Request = {
      PageSize: 0,
      PageIndex: 0,
      SortBy: raw.SortBy ?? [],
      OrderBy: '',
      Offset: 0,

      SeqId: raw.SeqId ?? undefined,
      RecDateFrom: format(raw.RecDateFrom),
      RecDateTo: format(raw.RecDateTo),
      LostDateFrom: format(raw.LostDateFrom),
      LostDateTo: format(raw.LostDateTo),
      FindDateFrom: format(raw.FindDateFrom),
      FindDateTo: format(raw.FindDateTo),
      MsgDateFrom: format(raw.MsgDateFrom),
      MsgDateTo: format(raw.MsgDateTo),
      ReceiveDateFrom: format(raw.ReceiveDateFrom),
      ReceiveDateTo: format(raw.ReceiveDateTo),
      TransDateFrom: format(raw.TransDateFrom),
      TransDateTo: format(raw.TransDateTo),
      DocType: raw.DocType ?? undefined,
      Goods: raw.Goods ?? undefined,
      SeqType: raw.SeqType ?? undefined,
      Notes: raw.Notes ?? undefined,
      LocationKeyword: raw.LocationKeyword ?? undefined,
      ServiceUser: raw.ServiceUser ?? undefined,
      KEY_USER: raw.KEY_USER ?? undefined,
      BroadcastFilter: raw.BroadcastFilter ?? undefined,
      BroadcastSituation: raw.BroadcastSituation ?? undefined,
      RecaptionName: raw.RecaptionName ?? undefined,
      RecaptionPhone: raw.RecaptionPhone ?? undefined,
      RegistrantKeyword: raw.RegistrantKeyword ?? undefined,
      ProcessingUser: raw.ProcessingUser ?? undefined,
      IdentityKind: raw.IdentityKind ?? undefined,
      Tel: raw.Tel ?? undefined,
      MobilePhone: raw.MobilePhone ?? undefined,
      IdNo: raw.IdNo ?? undefined,
    };

    this.loading = true;

    this.cpm11070Service
      .exportCPM11070Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (blob) => {
          const excelBlob = new Blob([blob], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(excelBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `CPM11070_未領取報表_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
      });
  }

}
