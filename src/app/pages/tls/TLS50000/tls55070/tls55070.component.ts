import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS55070Service } from '@service/api/tls/tls55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { TableReportComponent } from './table-report/table-report.component';
import { formatAmount2 } from './table-report/table-report.model';

@Component({
  selector: 'app-tls55070',
  standalone: true,
  templateUrl: './tls55070.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    CheckboxModule,
    ButtonModule,
    InputTextRangeComponent,
    TableReportComponent,
    AsyncPipe
  ],
})
export class TLS55070Component extends BasicQueryPageComponent<any> implements OnInit {
  btnLoadingExcel = false;
  btnLoadingPDF = false;
  data: any[] = [];
  footerData: any = null;
  totalRecords = 0;
  historyRequestBody: any = null;
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, [Validators.required]],
    TXN_DateEnd: [yesterday, [Validators.required]],
    TXN_SaleNoteNo: [null],
    ECR_No: [null],
    TXN_GUIBegNoStart: [null],
    TXN_GUIBegNoEnd: [null],
    TXN_NoStart: [null, [this.validationService.numberValidator, Validators.maxLength(6)]],
    TXN_NoEnd: [null, [this.validationService.numberValidator, Validators.maxLength(6)]],
    LOGO_No: [null],
    TLT_No: [null],
    HOS_NO: [null],
    USR_No: [null],
    TXN_Status: [null],
    IsShowStatus: ['0'],
    ...createPaginationConfig([{ field: 'TXN_SaleNoteNo', order: 1 }, { field: 'TXN_Date', order: 1 }, { field: 'ECR_No', order: 1 },]),
  });
  columns: ReportColumn[] = [
    { field: 'TXN_SaleNoteNo', header: '銷售單號', width: '11rem', align: 'left' },
    { field: 'TXN_Date', header: '銷售日期', format: formatDate, align: 'left', width: '5rem' },
    { field: 'ECR_No', header: '收銀機號', align: 'left', width: '5rem' },
    { field: 'TLT_No', header: '專櫃編號', align: 'left', width: '5rem' },
    { field: 'HOS_NO', header: '倉別', align: 'left', width: '5rem' },
    { field: 'HOS_NAME', header: '倉別名稱', align: 'left', width: '5rem' },
    { field: 'TXN_TaxType', header: '稅別', align: 'left', width: '3rem' },
    { field: 'GUINO', header: '發票號碼', align: 'left', width: '5rem' },
    { field: 'PLU_MagNo', header: '商品管理編號', align: 'left', width: '5rem' },
    { field: 'PLU_Name', header: '商品名稱', align: 'left', width: '10rem' },
    { field: 'TXN_Qty', header: '數量', align: 'right', width: '3rem' },
    { field: 'TXN_Disc', header: '折讓金額', align: 'right', width: '5rem' },
    { field: 'DiscRate', header: '折扣率', align: 'right', width: '5rem' },
    { field: 'TXN_SaleAmt', header: '單項小計', align: 'right', width: '10rem', format: formatAmount2, isTotal: true, isSubTotal: true, },
  ];
  ECRNoOptions = this.dropdown.queryOwnPOS1002();
  cashierOptions = this.dropdown.queryPos2001();
  logoOptions = this.dropdown.queryPluLogo();
  hosOptions = this.dropdown.queryPos2034();
  txnStatusOptions = [{ value: '1', label: '一般交易' }, { value: '2', label: '一般作廢' }, { value: '3', label: '退貨' },];
  yesNoOptions = [{ value: '0', label: '全部' }, { value: '1', label: '顯示' },];
  CounterOptions: any[] = [];
  constructor(
    public readonly tls55070Service: TLS55070Service,
    private readonly validationService: ValidationService,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS55070');
    this.dropDownListService.queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList().subscribe((res) => {
      this.CounterOptions = res?.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No, })) || [];
    });
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = {
        ...form.getRawValue(),
      };
      this.tls55070Service.queryTLS55070(payload).pipe(finalize(() => (this.loading = false)),).subscribe((res: any) => {
        this.data = res?.Data || [];
        console.log(res);
        this.footerData = { TXN_SaleAmt: res.TotalData };
        this.totalRecords = res?.TotalCount || 0;
        this.historyRequestBody = payload;
      })
    });
  }

  // === 匯出 Excel ===
  onExportExcel() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls55070Service.exportTLS55070Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoadingExcel = isLoading).subscribe();
  }

  // === 匯出 PDF ===
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls55070Service.exportTLS55070PDF(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoadingPDF = isLoading).subscribe();
  }
}
