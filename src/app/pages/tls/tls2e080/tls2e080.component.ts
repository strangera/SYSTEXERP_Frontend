import { saveAs } from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { IQueryData, IQueryRequest, TLS2E080Service } from '@service/api/tls/tls2e080.service';
import { Column } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AsyncPipe } from '@angular/common';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { finalize, map } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';

// 2.2.14.8 專櫃對帳單
@Component({
  selector: 'app-tls2e080',
  templateUrl: './tls2e080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TranslateModule,
    MultiSelectComponent,
    AsyncPipe,
    InputTextComponent,
    TableReportComponent,
    ButtonModule
  ]
})
export class TLS2E080Component extends BasicQueryPageComponent<IQueryData> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_noList: [null], // 專櫃編號
    tlt_term_typeList: [null], // 抽成方式
    tlt_floorList: [null], // 樓層
    sam_yyymm: [null, [Validators.required]], // 查詢年月
    money_typeList: [null], //結帳方式
    sam_termnoList: [null], // 帳次
    tlt_buildingList: [null], // 館別
    check_typeList: [null], // 對帳方式
    ven_uniform: [null, [Validators.minLength(8), Validators.maxLength(8)]], // 統一編號
  });
  historyRequestBody?: IQueryRequest;
  tlt_noListOption = this.dropdown.queryTltTalent();
  tlt_term_typeListOption = getSYS1000Options('tlt_term_type');
  tlt_floorListOption = this.dropdown.querySys3900();
  money_typeListOption = getSYS1000Options('money_type');
  sam_termnoListOption = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ]
  tlt_buildingListOption = this.dropdown.querySys3800();
  check_typeListOption = getSYS1000Options('check_type');
  totalRecords = 0;
  data: IQueryData[] = [];
  selectedItems: IQueryData[] = [];
  columns: Column[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true },
    { field: 'money_type_name', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'tlt_term_type_name', header: '抽成方式', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'contract_no', header: '契約編號', visible: true },
    { field: 'contract_subno', header: '版次', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];
  btnLoading = false;
  ngOnInit(): void {
    this.initializePage('TLS2E080', 'tls/tls2e080', this.queryForm, (form) => this.onSubmit(form));
  }
  constructor(
    public readonly tls2e080Service: TLS2E080Service,
    public readonly dropdown: DropdownApiService,
  ) {
    super();
  }
  onSubmit(frm: FormGroup) {
    const formValue = frm.value;

    // 確保 sam_yyymm 有值且為 Date 物件或有效字串
    let sam_yyymm_string = '';
    if (formValue.sam_yyymm) {
      const date = new Date(formValue.sam_yyymm);
      // 格式化為 yyyy-MM
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      sam_yyymm_string = `${year}${month}`;
    }
    const body = {
      ...formValue,
      sam_yyymm: sam_yyymm_string,
      pageIndex: 1,
      pageSize: 30,
      SortBy: [{ field: 'tlt_no', order: 1 }],
    }
    this.handleSubmit(frm, () => {
      this.tls2e080Service.queryTLS2E080(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data
        this.historyRequestBody = body;
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    })
  }

  autoReport(status: string) {
    // this.loading = true;
    // const body = {
    //   ...this.historyRequestBody,
    //   pageIndex: 1,
    //   pageSize: 30,
    //   SortBy: [{ field: 'tlt_no', order: 1 }],
    // }
    // this.tls2e080Service.queryTLS2E080(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
    //   this.data = res.Data
    //   this.totalRecords = res.TotalCount || 0;
    // })
  }

  exportZip() {
    const body = {
      exportList: this.selectedItems.map(item => {
        let sam_yyymm_string = '';
        if (item.sam_yyymm) {
          const date = new Date(item.sam_yyymm);
          // 格式化為 yyyyMM
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          sam_yyymm_string = `${year}${month}`;
        }
        // 假設 sam_yyymm 格式為 'YYYYMM'，例如 '202509'
        const year = parseInt(sam_yyymm_string.substring(0, 4), 10);
        const month = parseInt(sam_yyymm_string.substring(4, 6), 10) - 1; // 月份從0開始，所以要減1
        // 啟始日：設定為該月的第一天
        const sad_date_Start = new Date(year, month, 1);
        // 結束日：透過設定為下個月的第一天，再往前推一天，來取得該月的最後一天
        const sad_date_End = new Date(year, month + 1, 0);

        return {
          talent_id: item.talent_id,
          sam_yyymm: item.sam_yyymm,
          sad_date_Start: sad_date_Start,
          sad_date_End: sad_date_End,
          money_type: item.money_type,
          money_type_name: item.money_type_name,
          sam_termno: item.sam_termno,
          tlt_term_type: item.tlt_term_type,
          tlt_term_type_name: item.tlt_term_type_name
        };
      })
    }
    this.tls2e080Service.exportTLS2E080PDF(body)
      .pipe(map(response => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = '專櫃月對帳單.zip';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }
        const blob = new Blob([response.body], { type: 'application/zip' });
        return { blob, filename };
      })).subscribe(data => { saveAs(data.blob, data.filename); });
  }
}
