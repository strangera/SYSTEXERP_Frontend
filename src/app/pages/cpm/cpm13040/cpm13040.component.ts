import { formatDate } from './../../../shared/componentkit/table-report/table-report.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatAmount, LazyLoadEvent} from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { ButtonModule } from 'primeng/button';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { CPM13040Service } from '@service/api/cpm/cpm13040.service';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { getSYS1000Options } from '@service/system/sys1000.service';
@Component({
  selector: 'app-cpm13040',
  templateUrl: './cpm13040.component.html',
  styleUrls: ['./cpm13040.component.scss'],
  standalone: true,
  imports: [
    DropdownComponent,
    ButtonModule,
    CalendarRangeQuickComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomFooterTableComponent,
    TableComponent,
  ]
})
export class CPM13040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [new Date(), [Validators.required]],
    TXN_Date_End: [new Date(), [Validators.required]],
    CRD_Kind: [''],
    Org_ID: [''],
    TLT_No: [''],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = []; // 明細表資料
  headerData: any[] = []; // 上方表格資料
  footerData: any = {};
  btnLoading = false;
  btnLoading2 = false;
  loadingHeader = false;
  CRD_Kind_Options = getSYS1000Options('CRD_Kind')
    .filter(opt => ['P', 'I', 'S'].includes(opt.value));

  org_id_Options: any[] = [];
  TLT_No_Options: { No: string, Name: string, label: string }[] = [];

  // 第一張表格：卡別彙總
  headerColumns: Column[] = [
    { field: 'CardType', header: '卡別', visible: true },
    { field: 'FreeHours', header: '時數', visible: true, format: formatAmount },
    { field: 'CardCounts', header: '卡數', visible: true, format: formatAmount },
  ];

  // 第二張表格：卡別明細
  columns: Column[] = [
    { field: 'TXN_Date', header: '日期', visible: true ,format: formatDate},
    { field: 'CardType', header: '卡別', visible: true },
    { field: 'TXN_PayDesc', header: '聯名卡號', visible: true },
    { field: 'Org_ID', header: '組織名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_PayAmt', header: '刷卡總金額', visible: true, format: formatAmount, isTotal: true },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly cpm13040Service: CPM13040Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM13040', '/CPM/CPM13040CRU', this.queryForm, (frm) => this.onSubmit(frm));

    // 組織下拉
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Options = (res.Data || []).map(item => ({
          ...item,
          label: `${item.No} ${item.Name}`,
          value: item.No
        }));
      });

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.TLT_No_Options = res.Data.map(item => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
          ...item
        }));
      });

  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;

    const v = frm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: v.CRD_Kind || '',
      Org_ID: v.Org_ID || '',
      TLT_No: v.TLT_No || '',
    };

    this.loading = true;
    this.loadingHeader = true;
    this.messageService.blockUi();

    // 重置分頁狀態
    this.totalRecords = 0;
    this.data = [];

    // 第一個 API: 卡別彙總表（headerColumns）
    this.cpm13040Service.queryCPM13040(payload)
      .pipe(finalize(() => this.loadingHeader = false))
      .subscribe({
        next: (res) => {
          this.headerData = res?.Data || [];
          console.log('Header 資料:', this.headerData);
        },
        error: (err) => console.error('Header 查詢失敗:', err)
      });

    // 第二個 API: 卡別明細表（columns）- 初始載入第一頁
    const detailPayload = {
      pageSize: v.pageSize || 20,
      pageIndex: v.pageIndex || 1,
      ...payload
    };

    this.cpm13040Service.queryCPM13040Detail(detailPayload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          console.log('完整 API 回應:', res);

          // 處理不同的 API 響應結構
          if (res?.Data) {
            // 情況1: res.Data 直接包含 QueryData 和 TotalData
            if (res.Data.QueryData) {
              this.data = res.Data.QueryData;
              if (res.Data.TotalData) {
                this.footerData = [{
                  group_name: '總計',
                  TXN_PayAmt: res.Data.TotalData.Total_TXN_PayAmt
                }];
              }
            }
            // 情況2: res.Data 就是陣列資料
            else if (Array.isArray(res.Data)) {
              this.data = res.Data;
              this.footerData = [];
            }
            // 情況3: 其他結構
            else {
              this.data = res.Data || [];
              this.footerData = [];
            }
          }
          // 直接在根層級有 QueryData
          else if (res?.QueryData) {
            this.data = res.QueryData;
            if (res.TotalData) {
              this.footerData = [{
                group_name: '總計',
                TXN_PayAmt: res.TotalData.Total_TXN_PayAmt
              }];
            }
          }
          else {
            this.data = [];
            this.footerData = [];
          }

          // 設定總筆數，優先使用 TotalCount，其次使用 data 長度
          this.totalRecords = res?.TotalCount || res?.Data?.TotalCount || this.data.length || 0;

          console.log('處理後 Detail 資料:', this.data, '長度:', this.data.length);
          console.log('處理後 Footer 資料:', this.footerData);
          console.log('處理後總筆數:', this.totalRecords);

          // 儲存查詢狀態，以便後續操作能恢復
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        },
      });
  }

  // 處理分頁載入事件
  override onLazyLoadData(event: LazyLoadEvent, frm: FormGroup) {
    if (!frm.valid) return;

    const v = frm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: v.CRD_Kind || '',
      Org_ID: v.Org_ID || '',
      TLT_No: v.TLT_No || '',
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
    };

    this.loading = true;
    this.messageService.blockUi();

    console.log('分頁載入事件:', event);
    console.log('分頁載入 payload:', payload);

    this.cpm13040Service.queryCPM13040Detail(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          console.log('分頁載入完整 API 回應:', res);

          // 處理不同的 API 響應結構（與上面相同邏輯）
          if (res?.Data) {
            if (res.Data.QueryData) {
              this.data = res.Data.QueryData;
              if (res.Data.TotalData) {
                this.footerData = [{
                  group_name: '總計',
                  TXN_PayAmt: res.Data.TotalData.Total_TXN_PayAmt
                }];
              }
            }
            else if (Array.isArray(res.Data)) {
              this.data = res.Data;
              this.footerData = [];
            }
            else {
              this.data = res.Data || [];
              this.footerData = [];
            }
          }
          else if (res?.QueryData) {
            this.data = res.QueryData;
            if (res.TotalData) {
              this.footerData = [{
                group_name: '總計',
                TXN_PayAmt: res.TotalData.Total_TXN_PayAmt
              }];
            }
          }
          else {
            this.data = [];
            this.footerData = [];
          }

          this.totalRecords = res?.TotalCount || res?.Data?.TotalCount || this.data.length || 0;

          console.log('分頁處理後 Detail 資料:', this.data, '長度:', this.data.length);
          console.log('分頁處理後 Footer 資料:', this.footerData);
          console.log('分頁處理後總筆數:', this.totalRecords);
        },
      });
  }
  /** 匯出 PDF */
  onExportPDF() {
    if (this.data.length === 0) return;

    const v = this.queryForm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: v.CRD_Kind || '',
      Org_ID: v.Org_ID || '',
      TLT_No: v.TLT_No || '',
    };

    this.btnLoading = true;
    this.messageService.blockUi();

    this.cpm13040Service.exportCPM13040PDF(payload)
      .pipe(finalize(() => {
        this.btnLoading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          if (res.body) {
            const blob = new Blob([res.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // 建立 <a> 元素以觸發下載
            const a = document.createElement('a');
            a.href = url;
            a.download = `阜爾APS停車抵扣表_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        },
      });
  }

  /** 匯出 Excel */
  onExportExcel() {
    if (this.data.length === 0) return;

    const v = this.queryForm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: v.CRD_Kind || '',
      Org_ID: v.Org_ID || '',
      TLT_No: v.TLT_No || '',
    };

    this.btnLoading2 = true;
    this.messageService.blockUi();

    this.cpm13040Service.exportCPM13040Excel(payload)
      .pipe(finalize(() => {
        this.btnLoading2 = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          if (res.body) {
            const blob = new Blob([res.body], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);

            // 建立 <a> 元素以觸發下載
            const a = document.createElement('a');
            a.href = url;
            a.download = `阜爾APS停車抵扣表_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        },

      });
  }

}
