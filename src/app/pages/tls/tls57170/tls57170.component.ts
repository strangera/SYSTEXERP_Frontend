import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { TLS57170Data, TLS57170Service } from '@service/api/tls/tls57170.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CustomFooterTableComponent } from "@shared/componentkit/custom-footer-table/customFooterTable.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { FieldsConfig, MultiselectTableComponent } from '../../../shared/componentkit/multiselect-table/multiselect-table.component';

@Component({
  selector: 'app-tls57170',
  templateUrl: './tls57170.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarComponent,
    InputTextComponent,
    MultiSelectComponent,
    CustomFooterTableComponent,
    CommonModule,
    ButtonModule,
    MultiselectTableComponent
  ]
})
export class TLS57170Component extends BasicQueryPageComponent<TLS57170Data> implements OnInit {
  constructor(
    private tls57170Service: TLS57170Service,
    private datepipe: DatePipe,
    private dropdown: DropdownApiService,
    private tls52010Service: Tls52010Service
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    STK_YM: [null, Validators.required],    // 存貨年月 - 必填
    HOS_No: [null],                         // 倉別
    LOGO_No: [null],                        // 品牌
    PLU_MagNo: [null], // 商品管理編號/國際條碼/廠商貨號
    // PLU_No: [null],                         // 國際條碼
    // PLU_OrgPLUNo: [null],                   // 廠商貨號
    FeeRate: ['1', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],                        // 推銷費用率
    ...createPaginationConfig([])
  });

  data: TLS57170Data[] = [];
  selectedItems: TLS57170Data[] = [];
  totalRecords = 0;
  exportPDFbtnLoading = false;
  exportExcelbtnLoading = false;
  subTotalData: any[] = [];

  // 下拉選單選項
  HOS_NOOptions = this.dropdown.queryPos2034();
  LOGO_NoOptions = this.dropdown.queryPluLogo();

  columns: Column[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'LOGO_No', header: '品牌編號', visible: true },
    { field: 'LOGO_CH_NAME', header: '品名', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'Amt_A', header: '期末存貨售價(A)', visible: true, format: formatAmount },
    { field: 'FeeRate_B', header: '推銷費用率(B)', visible: true },
    { field: 'Amt_C', header: '淨變現價值(C)', visible: true, format: formatAmount },
    { field: 'STK_UnitCost_D', header: '期末成本價(D)', visible: true, format: formatAmount },
    { field: 'UP_PORFIT', header: '回升利益', visible: true, format: formatAmount, isSubTotal: true },
    { field: 'DOWN_COST', header: '跌價損失', visible: true, format: formatAmount, isSubTotal: true },
  ];

  ngOnInit(): void {
    this.initializePage('TLS57170', 'tls/tls57170cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.tls57170Service.queryTLS57170({
        ...form.getRawValue(),
        SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
        STK_YM: this.datepipe.transform(form.value.STK_YM, 'yyyyMM'),
      })
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(response => {
          this.data = response.Data.mainData || [];
          this.subTotalData = response.Data.totalData
            .map(item =>
            ({
              LOGO_No: item.LOGO_No,
              UP_PORFIT: item.UP_PORFIT_Total,
              DOWN_COST: item.DOWN_COST_Total,
            }));
          this.totalRecords = response.TotalCount
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  // ========= 匯出 =========
  onExportPDF(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.STK_YM) {
      this.messageService?.warnBubble?.('請輸入存貨年月');
      return;
    }

    this.exportPDFbtnLoading = true;
    this.tls57170Service.exportTLS57170PDF({
      ...form.getRawValue(),
      SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
      STK_YM: this.datepipe.transform(form.value.STK_YM, 'yyyyMM'),
    })
      .pipe(untilDestroyed(this), finalize(() => (this.exportPDFbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '存貨評價分析表'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportExcel(form: FormGroup) {
    const formValue = form.getRawValue();
    if (!formValue.STK_YM) {
      this.messageService?.warnBubble?.('請輸入存貨年月');
      return;
    }

    this.exportExcelbtnLoading = true;
    this.tls57170Service.exportTLS57170Excel({
      ...form.getRawValue(),
      SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
      STK_YM: this.datepipe.transform(form.value.STK_YM, 'yyyyMM'),
    })
      .pipe(untilDestroyed(this), finalize(() => (this.exportExcelbtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '存貨評價分析表'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    if (!resp) {
      this.messageService?.warnBubble?.('匯出失敗，無回應資料。');
      return;
    }
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    if (!blob || !(blob instanceof Blob)) {
      this.messageService?.warnBubble?.('匯出失敗，檔案格式錯誤。');
      return;
    }
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  //#region 商品管理編號下拉選單相關
  // 管理編號
  opLoading = false;
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opTotalRecords = 0;
  suggestions: IQueryPOS2004DetailResponse[] = [];

  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });

  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];

  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];

  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No + ' - ' + item.PLU_OrgPLUNo,
      }))];
    });
  }

  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  //#endregion
}