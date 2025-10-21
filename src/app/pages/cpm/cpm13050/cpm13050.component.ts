import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatAmount,formatDateTime } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Cpm13050Service, QueryCPM13050Request } from '@service/api/cpm/cpm13050.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cpm13050',
  templateUrl: './cpm13050.component.html',
  styleUrls: ['./cpm13050.component.scss'],
  standalone: true,
  imports: [
    DropdownComponent,
    ButtonModule,
    TableReportComponent,
    CalendarRangeQuickComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule
  ]
})
export class CPM13050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_BDATE: [new Date(), [Validators.required]],
    TXN_EDATE: [new Date(), [Validators.required]],
    PKG_disc_shop_name: [''],
    PKG_disc_rule_name: [''],
    displayMode: ['M'],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });

  totalRecords = 0;
  data: any[] = [];
  footerData: any = {};
  subTotalData: any[] = [];
  groupRowsBy = 'TXN_Date';
  historyRequestBody: any = null;

  btnLoading = false;
  btnLoading2 = false;


  PKG_disc_shop_name_Options: { label: string; value: string }[] = [];
  PKG_disc_rule_name_Options: { label: string; value: string }[] = [];

  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];

  columns: Column[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly cpm13050Service: Cpm13050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM13050', '/CPM/CPM13050cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadDropdowns();

    // 初始化欄位
    this.updateTableColumns(this.queryForm.value.displayMode!);

    // 監聽報表格式切換
    this.queryForm.controls.displayMode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(mode => {
        this.updateTableColumns(mode!);

        // 如果已經有查詢過的資料，自動重新查詢
        if (this.historyRequestBody) {
          console.log('切換顯示模式，自動重新查詢:', mode);
          this.autoRequery();
        }
      });
  }

  /** 讀取下拉資料 */
  loadDropdowns(): void {
    // 店家名稱
    this.dropDownListService.queryCPM13050_ShopNameDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          this.PKG_disc_shop_name_Options = res.Data.map(item => ({
            label: item.Name,
            value: item.No
          }));
        }
      });

    // 折扣名稱
    this.dropDownListService.queryCPM13050_RuleNameDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Status === '0000' && res.Data) {
          this.PKG_disc_rule_name_Options = res.Data.map(item => ({
            label: item.Name,
            value: item.No
          }));
        }
      });
  }

  /** 根據顯示模式切換欄位 */
  updateTableColumns(showType: string): void {
    if (showType === 'D') {
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true, showSort: true },
        { field: 'PKG_disc_shop_name', header: '店家名稱', visible: true },
        { field: 'PKG_entrance_uuid', header: '入場紀錄ID', visible: true },
        { field: 'PKG_pricing_start_at', header: '入場時間', visible: true, format: formatDateTime },
        { field: 'PKG_pricing_end_at', header: '出場時間', visible: true, format: formatDateTime },
        { field: 'PKG_license_plate_no', header: '車牌號碼', visible: true },
        { field: 'PKG_disc_rule_name', header: '折扣名稱', visible: true },
        { field: 'PKG_discount_time', header: '折抵時數', visible: true, format: formatAmount, isSubTotal: true },
        { field: 'PKG_discount_fee', header: '折抵金額', visible: true, format: formatAmount, isSubTotal: true },
      ];
    } else {
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true, showSort: true },
        { field: 'PKG_disc_shop_name', header: '店家名稱', visible: true },
        { field: 'PKG_disc_rule_name', header: '折扣名稱', visible: true },
        { field: 'CNT', header: '筆數', visible: true, isSubTotal: true },
        { field: 'PKG_discount_time', header: '總折抵時數', visible: true,format: formatAmount, isSubTotal: true  },
        { field: 'PKG_discount_fee', header: '總折抵金額', visible: true, format: formatAmount, isSubTotal: true },
      ];
    }
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;
      const body: QueryCPM13050Request = {
        PageSize: 30,
        PageIndex: 1,
        OrderBy: '',
        Offset: 0,
        SortBy: [{ field: 'TXN_Date', order: 1 }],
        TXN_BDATE: v.TXN_BDATE || undefined,
        TXN_EDATE: v. TXN_EDATE || undefined,
        shop_nameList: v.PKG_disc_shop_name ? [v.PKG_disc_shop_name] : [],
        rule_nameList: v.PKG_disc_rule_name ? [v.PKG_disc_rule_name] : [],
        ShowType: v.displayMode
      };

      this.executeQuery(body);
    });
  }

  /** 自動重新查詢 (切換顯示模式時使用) */
  autoRequery(): void {
    if (!this.historyRequestBody) return;

    // 更新 ShowType 為當前選擇的模式
    const updatedBody = {
      ...this.historyRequestBody,
      ShowType: this.queryForm.value.displayMode
    };

    console.log('自動重新查詢參數:', updatedBody);
    this.executeQuery(updatedBody);
  }

  /** 執行查詢的共用方法 */
  private executeQuery(body: QueryCPM13050Request): void {
    this.loading = true;
    this.cpm13050Service.queryCPM13050(body)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          if (res?.Data?.Datas?.length > 0) {
            this.data = res.Data.Datas;
            this.footerData = res.Data.SumData ?? {};
            this.subTotalData = res.Data.DetailSumData ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
            this.historyRequestBody = body;
            this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          } else {
            this.data = [];
            this.footerData = {};
            this.subTotalData = [];
            this.totalRecords = 0;
            this.messageService.warnBubble(res.Message || '查無資料。');
          }
        },
      });
  }

  /** 匯出 PDF */
  onExportPDF(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先查詢再匯出。');
      return;
    }

    this.btnLoading = true;
    this.cpm13050Service.exportCPM13050PDF(this.historyRequestBody)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe({
        next: (res) => this.downloadFile(res.body ?? new Blob(), 'CPM13050_專櫃停車折扣報表.pdf'),
      });
  }

  /** 匯出 Excel */
  onExportExcel(): void {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先查詢再匯出。');
      return;
    }

    this.btnLoading2 = true;
    this.cpm13050Service.exportCPM13050(this.historyRequestBody)
      .pipe(finalize(() => this.btnLoading2 = false))
      .subscribe({
        next: (res) => this.downloadFile(res.body ?? new Blob(), 'CPM13050_專櫃停車折扣報表.xlsx'),
      });
  }

  /** 共用下載方法 */
  private downloadFile(blob: Blob, filename: string): void {
    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('無可匯出的資料。');
      return;
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
