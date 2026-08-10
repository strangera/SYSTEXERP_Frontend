import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@others/component/table/table.model';
import { Fin23070Data, Fin23070DetailData, FIN23070Service } from '@service/api/fin/fin23070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { combineLatest, finalize, map } from 'rxjs';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ValidationService } from '../../../shared/service/validation.service';

// 1.2.3.7 暫付款核銷報表
@Component({
  selector: 'app-fin23070',
  templateUrl: './fin23070.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    InputNumberRangeComponent,
    TableReportComponent,
    TranslateModule,
    AsyncPipe,
  ],
})
export class FIN23070Component extends BasicQueryPageComponent<Fin23070Data> implements OnInit {
  private readonly dropdown = inject(DropdownApiService);
  private readonly validationService = inject(ValidationService);

  // 查詢
  queryForm = this.formBuilder.group({
    STO_No: [this.authService.currentUserValue?.SYS_StoreNo || null], // 分店編號（隱藏，預設帶入登入者門市）
    PREP_NO: [null, [Validators.maxLength(16)]],  // 預支單號
    VEN_No: [null],                                // 申請廠商/員工
    APPY_DateS: [null], // 申請日期(起)
    APPY_DateE: [null], // 申請日期(迄)
    ActClose_DateS: [null], // 實際核銷日期(起)
    ActClose_DateE: [null], // 實際核銷日期(迄)
    PREP_AmtS: [null, [this.validationService.numberValidator]], // 預支金額(起)
    PREP_AmtE: [null, [this.validationService.numberValidator]], // 預支金額(迄)
    VEN_PayType: [null], // 付款方式
    ShowDetail: ['N'],   // 顯示核銷明細

    // 分頁查詢
    ...createPaginationConfig([{ field: 'PrepNo', order: 1 }]),
  });

  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;
  lastQueryBody: any = null;

  data: Fin23070Data[] = [];
  detailData: Fin23070DetailData[] = [];

  columns: Column[] = [
    { field: 'PrepNo', header: '預支單號' },
    { field: 'VenNo', header: '廠商/員工代號' },
    { field: 'VenName', header: '廠商/員工名稱' },
    { field: 'ApplyDate', header: '申請日期', format: formatDate },
    { field: 'PlanCloseDate', header: '預計核銷日', format: formatDate },
    { field: 'PlanPayDate', header: '預計付款日', format: formatDate },
    { field: 'PrepAmt', header: '預支金額', format: formatAmount },
    { field: 'PostedAmt', header: '已拋轉核銷金額', format: formatAmount },
    { field: 'UnpostedAmt', header: '未拋轉核銷金額', format: formatAmount },
    { field: 'DiffAmt', header: '差額', format: formatAmount },
    { field: 'CloseStatus', header: '結案狀態' },
  ];

  detailColumns: Column[] = [
    { field: 'PrepNo', header: '預支單號' },
    { field: 'VenNo', header: '廠商/員工代號' },
    { field: 'VenName', header: '廠商/員工名稱' },
    { field: 'ApplyDate', header: '申請日期', format: formatDate },
    { field: 'PlanCloseDate', header: '預計核銷日', format: formatDate },
    { field: 'PlanPayDate', header: '預計付款日', format: formatDate },
    { field: 'PrepAmt', header: '預支金額', format: formatAmount },
    { field: 'PostedAmt', header: '已拋轉核銷金額', format: formatAmount },
    { field: 'UnpostedAmt', header: '未拋轉核銷金額', format: formatAmount },
    { field: 'DiffAmt', header: '差額', format: formatAmount },
    { field: 'RedeemNo', header: '核銷單號' },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'RedeemAmt', header: '核銷金額', format: formatAmount },
    { field: 'ActCloseDt', header: '實際核銷日期', format: formatDate },
    { field: 'CloseStatus', header: '結案狀態' },
  ];

  // 申請廠商/員工：廠商(POS2013) + 員工(TBLUSER) 合併為單一下拉，value 直接對應後端 VEN_No
  vendorOrEmployeeOptions = combineLatest([
    this.dropdown.queryPos2013({ VEN_Flag: '' }),
    this.dropdown.queryTblUser(),
  ]).pipe(
    map(([vendors, employees]) => [
      ...(vendors ?? []).map(v => ({ ...v, label: `廠商-${v.label}` })),
      ...(employees ?? []).map(e => ({ ...e, label: `員工-${e.label}` })),
    ])
  );

  payTypeOptions = [
    { value: '1', label: '電匯' },
    { value: '2', label: '開票' },
    { value: '3', label: '現金' },
  ];

  showDetailOptions = [
    { value: 'Y', label: '顯示' },
    { value: 'N', label: '不顯示' },
  ];

  btnPdfLoading = false;
  btnExcelLoading = false;

  constructor(public fin23070Service: FIN23070Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN23070', '', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const payload = frm.value;
      this.fin23070Service.queryFIN23070(payload).pipe(
        this.withLoading(),
        untilDestroyed(this),
      ).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = payload;
            this.data = response.Data.QueryData;
            this.detailData = response.Data.DetailList ?? [];
            this.totalRecords = response.TotalCount;
            this.queryStateService.setQueryState(this.ProgNo, payload);
          }
        },
        error: (err: unknown) => {
          console.error('查詢FIN23070失敗:', err);
        },
      });
    });
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  queryFunction = (body: any) => {
    return this.fin23070Service.queryFIN23070(body).pipe(
      map((response) => {
        this.detailData = response.Data.DetailList ?? [];
        return {
          Data: response.Data.QueryData,
          TotalCount: response.TotalCount,
        };
      })
    );
  };

  printExport(isPDF: boolean) {
    const exportPayload = {
      ...this.lastQueryBody,
      PageIndex: 1,
      PageSize: this.totalRecords,
    };

    if (isPDF) {
      this.btnPdfLoading = true;
      this.fin23070Service.exportPDFFIN23070(exportPayload)
        .pipe(finalize(() => this.btnPdfLoading = false), untilDestroyed(this))
        .subscribe(blob => this.downloadBlob(blob, `暫付款核銷報表_${this.getTimestamp()}.pdf`));
    } else {
      this.btnExcelLoading = true;
      this.fin23070Service.exportExcelFIN23070(exportPayload)
        .pipe(finalize(() => this.btnExcelLoading = false), untilDestroyed(this))
        .subscribe(blob => this.downloadBlob(blob, `暫付款核銷報表_${this.getTimestamp()}.xlsx`));
    }
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }
}
