import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { DeleteFIN32030RecvCascadeBatchRequest, FIN32030Service, QueryFIN32030ARResponse, QueryFIN32030Response } from '../../../service/api/fin/fin32030.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmountWithFraction, formatDate } from '../../../shared/componentkit/table/table.model';

//1.3.2.3 收款沖帳維護
@Component({
  selector: 'app-fin32030',
  templateUrl: './fin32030.component.html',
  styleUrl: './fin32030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule
  ]
})
export class FIN32030Component extends BasicQueryPageComponent<QueryFIN32030Response> implements OnInit {
  queryForm = this.formBuilder.group({
    RCV_No: ['', [Validators.maxLength(20)]], // 收款單號
    DateFrom: [null], // 收款日期起
    DateTo: [null], // 收款日期迄
    AmtFrom: [null, [Validators.min(0)]], // 應收金額起
    AmtTo: [null, [Validators.min(0)]], // 應收金額迄
    VouFrom: ['', [Validators.maxLength(20)]], // 傳票單號起
    VouTo: ['', [Validators.maxLength(20)]], // 傳票單號迄
    Remark: ['', [Validators.maxLength(100)]], // 備註
    pageSize: [30], // 每頁筆數 (小寫,配合 onLazyLoadData)
    pageIndex: [1], // 頁碼 (小寫,配合 onLazyLoadData)
    SortBy: [[{ field: 'RCV_No', order: 1 }]], // 排序參數
  });

  totalRecords = 0;
  data: QueryFIN32030Response[] = [];
  selectedItems: QueryFIN32030Response[] = [];

  // AR Dialog (應收未收查詢)
  arDialogVisible = false;
  arDialogLoading = false;
  arDialogData: QueryFIN32030ARResponse[] = [];
  arDialogTotalRecords = 0;
  arSelectedItems: QueryFIN32030ARResponse[] = [];

  // AR Dialog 查詢表單
  arQueryForm = this.formBuilder.group({
    ARS_ID: ['', [Validators.maxLength(50)]], // 應收ID
    VEN_No: [null as string | null], // 廠客代號
    DateFrom: [null], // 立帳日期起
    DateTo: [null], // 立帳日期迄
    Amt: [null], // 應收金額
    NoteDesc: ['', [Validators.maxLength(160)]], // 摘要
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'VEN_No', order: 1 }]],
  });

  // AR Dialog 欄位定義
  arDialogColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'ARS_Amt', header: '應收金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'ARS_Date', header: '立帳日', visible: true, format: formatDate },
    { field: 'PaidAmt', header: '已收款金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'UnpaidAmt', header: '未收款金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'PTA_Date', header: '預計收款日', visible: true, format: formatDate },
    { field: 'NoteDesc', header: '摘要', visible: true },
  ];

  columns: Column[] = [
    { field: 'RCV_No', header: '收款單號', visible: true },
    { field: 'RCV_Date', header: '收款日期', visible: true, format: formatDate },
    // { field: 'Sales_Id', header: '業務員代號', visible: true },
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'TotalAmount', header: '總金額', visible: true, format: formatAmountWithFraction, align: 'right' },
    { field: 'Remark', header: '備註', visible: true },
  ];

  // 廠客代號下拉選項
  vendorOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly fin32030Service: FIN32030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32030', 'fin/fin32030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadVendorOptions();
  }

  /** 載入廠客下拉選項 */
  loadVendorOptions(): void {
    this.dropDownListService.queryPOS2013_DropDownList({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response.Data) {
          this.vendorOptions = response.Data.map(item => ({
            label: `${item.VEN_No || ''} - ${item.Name || ''}`,
            value: item.VEN_No || ''
          }));
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;

      // 準備 API 請求參數 (表單用小寫,後端用大寫)
      const queryParams = {
        RCV_No: formValue.RCV_No || null,
        DateFrom: formValue.DateFrom || null,
        DateTo: formValue.DateTo || null,
        AmtFrom: formValue.AmtFrom || null,
        AmtTo: formValue.AmtTo || null,
        VouFrom: formValue.VouFrom || null,
        VouTo: formValue.VouTo || null,
        Remark: formValue.Remark || null,
        // 分頁和排序參數 (轉換為大寫給後端)
        PageIndex: formValue.pageIndex,
        PageSize: formValue.pageSize,
        SortBy: formValue.SortBy,
      };

      this.fin32030Service.queryFIN32030(queryParams)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }

  /** 刪除選取的收款沖帳資料 */
  onDelete(rows: QueryFIN32030Response[]): void {
    if (!rows?.length) {
      this.messageService.errorBubble('請先勾選要刪除的資料');
      return;
    }

    const rcvNoList = rows.map(r => r.RCV_No).filter(Boolean).join('、');
    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除收款單號「${rcvNoList}」及其相關資料嗎？此操作無法復原。`,
      acceptLabel: '確定刪除',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();
        const request: DeleteFIN32030RecvCascadeBatchRequest = {
          Details: rows.map(r => ({ RCV_No: r.RCV_No! }))
        };
        this.fin32030Service.deleteFIN32030RecvCascadeBatch(request)
          .pipe(
            finalize(() => this.messageService.unblockUi()),
            untilDestroyed(this)
          )
          .subscribe({
            next: () => {
              this.messageService.successBubble(`收款單號「${rcvNoList}」已刪除`);
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            },
          });
      },
    });
  }

  /** AR Dialog 查詢 */
  onARDialogSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      const formValue = frm.value;

      const queryParams = {
        ARS_ID: formValue.ARS_ID || undefined,
        VEN_No: formValue.VEN_No || undefined,
        DateFrom: formValue.DateFrom || undefined,
        DateTo: formValue.DateTo || undefined,
        Amt: formValue.Amt || undefined,
        NoteDesc: formValue.NoteDesc || undefined,
        pageIndex: formValue.pageIndex ?? 1,
        pageSize: formValue.pageSize ?? 30,
        SortBy: formValue.SortBy || undefined,
      };

      this.arDialogLoading = true;

      this.fin32030Service.queryFIN32030AR(queryParams)
        .pipe(
          finalize(() => this.arDialogLoading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.arDialogData = response.Data;
          this.arDialogTotalRecords = response.TotalCount;
          this.queryStateService.setQueryState('queryFIN32030AR', queryParams);
          this.cdr.detectChanges();
        });
    });
  }

  /** AR Dialog 取消 */
  onARDialogCancel() {
    this.arDialogVisible = false;
  }

  /** AR Dialog 確認選擇 */
  onARDialogConfirm() {
    if (!this.arSelectedItems || this.arSelectedItems.length === 0) {
      this.messageService.errorBubble('請先勾選應收帳款資料');
      return;
    }

    // TODO: 這裡可以將選中的應收帳款資料傳遞給主頁面或進行其他處理
    // 例如：導航到新增/編輯頁面並帶入選中的應收帳款資料
    this.messageService.successBubble(`已選擇 ${this.arSelectedItems.length} 筆應收帳款`);

    this.arDialogVisible = false;
  }
}
