import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls52010Service } from '@service/api/tls/tls52010.service';
import { QueryTLS57030Request, TLS57030Detail, TLS57030Service } from '@service/api/tls/tls57030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatAmountCN } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ProductAutocompleteComponent } from 'src/app/shared/biz-components/product-autocomplete/product-autocomplete';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    AsyncPipe,
    RadiobuttonComponent,
    ButtonModule,
    ProductAutocompleteComponent
  ],
})
export class TLS57030Component extends BasicQueryPageComponent<TLS57030Detail> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [null, [Validators.required]],
    LOGO_No: [null, [Validators.required]],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_No: [null as string | null],
    PLU_OrgPLUNo: [null, [Validators.maxLength(30)]],
    STK_Date: [new Date(), [Validators.required]],
    ShowStockRange: ['1'],
    SortBy: [[
      { field: 'LOGO_CH_NAME', order: 1 },
      { field: 'HOS_NAME', order: 1 },
      { field: 'PLU_MagNo', order: 1 },
    ]],
  });

  warehouseOptions = this.dropdown.queryPos2034();
  brandCodeOptions = this.dropdown.queryPluLogo();
  stockRangeOptions = [
    { value: '1', label: '全顯示' },
    { value: '2', label: '僅顯示不為零庫存' },
    { value: '3', label: '僅顯示零庫存' },
    { value: '4', label: '僅顯示負庫存' }
  ];
  btnLoading = false;
  data: TLS57030Detail[] = [];
  footerData: TLS57030Detail | null = null;
  totalRecords = 0;
  historyRequestBody: QueryTLS57030Request | null = null;
  columnGroup = [{ field: '合計', header: '合計' }];
  columns: ReportColumn[] = [
    { field: 'LOGO_CH_NAME', header: '品牌名稱', align: 'left' },
    { field: 'HOS_NAME', header: '倉別', align: 'left', width: '55px' },
    { field: 'PLU_MagNo', header: '商品管理編號', align: 'left', width: '105px' },
    { field: 'PLU_Name', header: '商品名稱', align: 'left', width: '105px' },
    { field: 'PLU_No', header: '國際條碼', align: 'left', width: '105px' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號', align: 'left' },
    { field: 'CAT_LName', header: '大分類', align: 'left', width: '55px' },
    { field: 'CAT_MName', header: '中分類', align: 'left', width: '55px' },
    { field: 'CAT_SName', header: '小分類', align: 'left', width: '80px' },
    { field: 'PLU_OrderPrc', header: '進價(未稅)', format: formatAmountCN, align: 'right' },
    { field: 'PLU_SalePrc', header: '售價(含稅)', format: formatAmountCN, align: 'right' },
    { field: 'STK_CurrentQty', header: '數量合計', format: formatAmount, align: 'right', width: '35px' },
    { field: 'sumPLU_OrderPrc', header: '進價(未稅)', groupField: '合計', format: formatAmount, align: 'right' },
    { field: 'sumPLU_SalePrc', header: '售價(含稅)', groupField: '合計', format: formatAmount, align: 'right' },
  ];

  constructor(
    public readonly tls57030Service: TLS57030Service,
    private readonly dropdown: DropdownApiService,
    private readonly tls52010Service: Tls52010Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57030');
    // 在 ngOnInit 或是專門的初始化方法中加入
    this.queryForm.controls.LOGO_No.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((logoNo) => {
        if (logoNo) {
          // 呼叫 API 查詢該品牌對應的倉別
          this.dropdown.queryLogoAccorHOS({ LOGO_No: logoNo }).subscribe((res) => {
            if (res && res.length > 0) {
              // 邏輯 A：如果該品牌只對應一個倉別，直接自動帶入
              if (res.length === 1) {
                this.queryForm.patchValue({ HOS_No: res[0]['HOS_No'] });
              }
              // 邏輯 B：如果有多個倉別，通常會讓使用者選，但你可以決定是否清空舊值
              // else { this.queryForm.patchValue({ HOS_No: null }); }
            }
          });
        }
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_Date: this.datePipe.transform(frm.value.STK_Date, 'yyyy-MM-dd'),
        pageSize: frm.value.pageSize || 30
      }

      this.tls57030Service.queryTLS57030(body).pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.footerData = res.AllData[0] || null;
        this.totalRecords = res.TotalCount ?? this.data.length;
        this.historyRequestBody = body;
      });
    });
  }
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57030Service.exportTLS57030PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57030Service.exportTLS57030Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}
