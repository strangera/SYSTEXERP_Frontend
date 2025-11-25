import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { Tls57080Service } from '@service/api/tls/tls57080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls57080',
  templateUrl: './tls57080.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableReportComponent,
    ButtonModule,
    TranslateModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    DropdownTableComponent
  ],
})
export class TLS57080Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    StartDate: [null as Date | null],
    EndDate: [null as Date | null],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_No: [null, [Validators.maxLength(20)]],
    HOS_No: [null],
    PLU_Name: [null, [Validators.maxLength(50)]],
    SQLType: [null], // 預設為 1: 售價 2: 單位成本
  });
  HOS_NoOptions = this.dropdown.queryPos2034();
  data: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  columns: ReportColumn[] = [
    { field: 'trndate', header: '日期' },
    { field: 'nos', header: '單號' },
    { field: 'VEN_NO', header: '廠商編號' },
    { field: 'HOS_NO', header: '倉別' },
    { field: 'Trntype', header: '作業' },
    { field: 'qty', header: '異動量' },
    { field: 'stockQuantity', header: '庫存量' },
    { field: 'GUINO', header: '發票號碼' },
    { field: 'PLU_NO', header: '國際條碼' },
    { field: 'PLU_Name', header: '品牌' },
    { field: 'TRN_BuyPrc', header: '進單價(未稅)' },
    { field: 'TRN_SalePrc', header: '售單價(含稅)' },
    { field: 'TRN_BuyAmt', header: '期初成本' },
  ];

  constructor(
    public readonly tls57080Service: Tls57080Service,
    private readonly tls52010Service: Tls52010Service,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57080');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls57080Service.queryTLS57080(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = res.QueryBody;
      })
    });
  }

  btnLoading = false;
  onExportPDF() {

  }
  onExportXLSX() {

  }
  // 管理編號
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '管理編號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
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
}
