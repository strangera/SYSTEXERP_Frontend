import { AsyncPipe, NgClass, NgFor } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin51010Service, QueryFIN51010CountResponse, QueryFIN51010Request, QueryFIN51010Response } from '@service/api/fin/fin51010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { Accordion, AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin51010',
  templateUrl: './fin51010.component.html',
  standalone: true,
  imports: [ButtonModule, NgClass, DataViewModule, NgFor, AsyncPipe, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN51010Component extends BasicQueryPageComponent<QueryFIN51010Response> implements OnInit {
  @ViewChild('queryAccordion') queryAccordion!: Accordion;
  queryForm = this.formBuilder.group({
    SrcSheetType: [null as string | null, [Validators.required]],
    VouDate_From: [null],
    VouDate_To: [null],
    Trans_Status: [null as string | null],
    PostFlag: [null as string | null],
    VouNo: [null, [Validators.maxLength(12)]],
    Remark: [null, [Validators.maxLength(200)]],
    AccNo: [null, [Validators.maxLength(14)]],
    DetailNo: [null, [Validators.maxLength(20)]],
    NoteDesc: [null, [Validators.maxLength(160)]],
    SubDetailNo: [null, [Validators.maxLength(30)]],
    ...createPaginationConfig([{ field: 'VouDate', order: 1 }]), // 分頁和排序參數
  });

  // 下拉選單 Options
  SrcSheetTypeOptions = this.dropDown.queryGls1010();
  TransStatusOptions = getSYS1000Options('Trans_Status'); // 拋轉狀態
  PostFlagOptions = getSYS1000Options('PostFlag'); // 過帳狀態
  AccNoOptions = this.dropDown.queryGls1005_ledgerMD(); // 會計科目
  DetailNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商/明細編號
  SubDetailNoOptions = this.dropDown.queryGLS1016(); // 對象別編號

  data: QueryFIN51010Response[] = [];
  selectedItems: QueryFIN51010Response[] = [];
  totalRecords = 0;
  lastQuery: QueryFIN51010Request | null = null;

  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'SrcSheetType', header: '傳票型態', align: 'left', width: '80px' },
    { field: 'Voucher_Name', header: '傳票名稱', align: 'left', width: '80px' },
    { field: 'VouDate', header: '傳票日期', format: formatDate, align: 'left', width: '80px' },
    { field: 'Remark', header: '傳票摘要', align: 'left' },
    { field: 'Debit_Amt', header: '借方金額', format: formatAmount, align: 'right' },
    { field: 'Credit_Amt', header: '貸方金額', format: formatAmount, align: 'right' },
    { field: 'PostFlag', header: '傳票狀態', format: (value: string) => getSYS1000('PostFlag', value), align: 'left', width: '80px' },
    { field: 'Trans_Status', header: '拋轉狀態', format: (value: string) => getSYS1000('Trans_Status', value), align: 'left', width: '80px' },
  ];

  countData: QueryFIN51010CountResponse[] = [];

  constructor(
    public readonly fin51010Service: Fin51010Service,
    private readonly dropDown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN51010', 'fin/fin51010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadSheetTypeCount();
  }

  /** 載入憑證種類與儀表板 */
  loadSheetTypeCount() {
    this.fin51010Service.queryFIN51010Count('1').pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Data) {
        this.countData = res.Data; // 儲存原始統計資料供頂部儀表板使用
      }
    });
  }

  /** 2. 儀表板點擊事件：帶入種類並自動查詢 */
  onSelectType(item: QueryFIN51010CountResponse) {
    this.queryForm.patchValue({
      SrcSheetType: item.SrcSheetType,
      Trans_Status: '0',
      PostFlag: '1',
      VouNo: null,
      NoteDesc: null
    });
    // 自動收合查詢區塊，讓表格往上提
    if (this.queryAccordion) {
      this.queryAccordion.tabs[0].selected = false;
    }
    this.onSubmit(this.queryForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: QueryFIN51010Request = {
        ...frm.value,
        VouDate_From: frm.value.VouDate_From ? frm.value.VouDate_From : null,
        VouDate_To: frm.value.VouDate_To ? frm.value.VouDate_To : null
      };
      this.fin51010Service.queryFIN51010(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQuery = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  /** 執行拋轉作業 */
  onTransfer() {
    if (this.selectedItems.length === 0) return;
    this.messageService.confirm({
      header: '拋轉確認',
      message: '是否拋轉所選項目?',
      accept: () => {
        const idList = this.selectedItems.map(item => item.id).join(',');
        const body = { GLS6001_IDList: idList };
        this.btnLoading = true;

        this.fin51010Service.transferFIN51010(body).pipe(
          finalize(() => { this.btnLoading = false; }),
          untilDestroyed(this)
        ).subscribe(res => {
          // 取得訊息內容
          const msg = res.Data.ErrMsg || '';

          // 【優化判定】：即便 ErrCode 是 0，但如果沒抓到傳票編號，也視為失敗
          const isSuccess = res.Data.ErrCode === 0 && msg.includes('傳票編號');

          if (isSuccess) {
            // 換行處理
            const formattedMsg = msg.replace(/\n/g, '<br>');
            setTimeout(() => {
              this.messageService.confirm({
                header: '拋轉成功',
                message: formattedMsg,
                icon: 'pi pi-check-circle',
                acceptLabel: '確定',
                showRejectButton: false,
                accept: () => {
                  this.selectedItems = [];
                  this.onSubmit(this.queryForm);
                  this.loadSheetTypeCount();
                }
              });
            }, 200);
          } else {
            // 顯示失敗：可能是 ErrCode != 0，或者是 ErrCode 為 0 但其實沒產生單號
            setTimeout(() => {
              this.messageService.confirm({
                header: '拋轉失敗',
                // 如果 Code 是 0 但沒單號，提示「未產生傳票編號」
                message: res.Data.ErrCode === 0 ? '拋轉異常：未產生傳票編號。' : msg,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: '關閉',
                showRejectButton: false
              });
            }, 200);
          }
        });
      }
    });
  }
  onVoid() {
    if (this.selectedItems.length === 0) return;
    this.messageService.confirm({
      header: '作廢確認',
      message: '是否作廢所選項目?',
      accept: () => {
        const idList = this.selectedItems.map(item => item.id).join(',');
        const body = { GLS6001_IDList: idList };
        this.btnLoading = true;
        this.fin51010Service.voidFIN51010(body).pipe(finalize(() => { this.btnLoading = false; }), untilDestroyed(this)).subscribe(res => {
          setTimeout(() => {
            this.messageService.confirm({
              header: '作廢成功',
              message: res.Data.ErrMsg || '資料已成功作廢！',
              icon: 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false,
              accept: () => {
                this.selectedItems = [];
                this.onSubmit(this.queryForm);
                this.loadSheetTypeCount();
              }
            }
            );
          }, 200); // 延遲 200 毫秒
        });
      }
    });
  }
  /** 判斷是否「拋轉傳票」按鈕應禁用 */
  get isTransferDisabled(): boolean {
    // 1. 沒資料時禁用
    if (this.data.length === 0 || this.selectedItems.length === 0) {
      return true;
    }
    // 2. 選中的項目中，若包含「已拋轉」(Trans_Status === '1') 則禁用
    return this.selectedItems.some(item => item.Trans_Status === '1');
  }

  /** 判斷是否「作廢」按鈕應禁用 */
  get isVoidDisabled(): boolean {
    // 1. 沒資料時禁用
    if (this.data.length === 0 || this.selectedItems.length === 0) {
      return true;
    }
    // 2. 選中的項目中，若包含「未過帳」(PostFlag === '0') 則禁用 (依據您的邏輯)
    return this.selectedItems.some(item => item.PostFlag === '0');
  }

  /** 讀取HR傳票資料 */
  hrLoading = false;
  onReadHR() {
    // this.messageService.confirm({
    //   header: '匯入確認',
    //   message: '是否執行轉入雇主負擔保費項目？',
    //   icon: 'pi pi-question-circle',
    //   accept: () => {
    this.hrLoading = true; // 鎖定 UI 防止重複點擊
    this.fin51010Service.importHRVouFIN51010().pipe(finalize(() => this.hrLoading = false), untilDestroyed(this)).subscribe((res) => {
      if (res.Data?.ErrCode === 0) {
        this.messageService.successBubble(res.Data.ErrMsg);
        this.loadSheetTypeCount();
        this.queryForm.patchValue({
          SrcSheetType: 'HR', // 假設 HR 是代表 HR 傳票的類型
        });
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(res.Data?.ErrMsg);
      }
    });
    //   }
    // });
  }
}
