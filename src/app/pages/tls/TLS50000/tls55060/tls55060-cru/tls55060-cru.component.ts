import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Gls6002, TLS55060QueryItem, TLS55060Service } from '@service/api/tls/tls55060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls55060-cru',
  templateUrl: './tls55060-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
    TableReportComponent
  ]
})
export class TLS55060CRUComponent extends BasicCruPageComponent<TLS55060QueryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: '', disabled: true }],                     // 傳票編號
    VouType: [{ value: '', disabled: true }],                   // 傳票種類
    SrcSheetType: [{ value: '', disabled: true }],              // 傳票型態
    VouDate: [{ value: '', disabled: true }],                   // 傳票日期
    Remark: [{ value: '', disabled: true }],                          // 傳票摘要
    No: [{ value: '', disabled: true }],                        // 結帳單號
    PostFlag: [{ value: '', disabled: true }],                  // 傳票狀態
    CRT_USR_No: [{ value: '', disabled: true }],                // 建立人員
    CRT_Date: [{ value: '', disabled: true }],                  // 建立日期
    UPD_USR_No: [{ value: '', disabled: true }],                // 修改人員
    UPD_Date: [{ value: '', disabled: true }],                  // 修改日期
  });
  vouTypeOptions = getSYS1000Options('VouType')// 傳票型態
  srcSheetTypeOptions = getSYS1000Options('ENTRY_TYPE')// 傳票種類
  postFlagOptions = getSYS1000Options('PostFlag')// 傳票狀態
  orgOptions$ = this.dropDown.querySys3100();
  accnoOptions$ = this.dropDown.queryGls1005();
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent
  data: any[] = [];
  footerData: any = {};
  columns: ReportColumn[] = [];
  totalRecords = 0;
  // 定義三種不同的欄位結構
  readonly defaultColumns: ReportColumn[] = [
    { field: 'SerNo', header: '序號', align: 'left' },
    { field: 'AccNo', header: '科目代號', align: 'left' },
    { field: 'ACCCNAME', header: '科目名稱', align: 'left' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'DAccAmt', header: '借方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'CAccAmt', header: '貸方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'ORG_ID', header: '組織編號', align: 'left' },
    { field: 'DetailNo', header: '廠商編號', align: 'left' },
    { field: 'VEN_NAME', header: '廠商名稱', align: 'left' },
    { field: 'ProjectNo', header: '活動代號', align: 'left' },
    { field: 'PTA', header: '立沖代號' },
  ];

  readonly arColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應收帳款代號', align: 'left' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate },
    { field: 'perget_date', header: '預計收款日期', align: 'left', format: formatDate },
    { field: 'ar_amt', header: '應收金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'org_id', header: '組織代碼', align: 'left' },
    { field: 'CustomerNo', header: '客戶代碼', align: 'left' },
    { field: 'notedesc', header: '備註', align: 'left' },
  ];

  readonly apColumns: ReportColumn[] = [
    { field: 'VOUNO', header: '應付帳款代號', align: 'left' },
    { field: 'accno', header: '會計科目', align: 'left' },
    { field: 'ent_date', header: '立帳日期', align: 'left', format: formatDate },
    { field: 'ap_amt', header: '應付金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'pta_amt', header: '沖帳金額', format: formatAmount, align: 'right' },
    { field: 'org_id', header: '組織代碼', align: 'left' },
    { field: 'DetailNo', header: '廠商代碼', align: 'left' },
    { field: 'AP_Status', header: '狀態', align: 'left' }, // 可以再透過 pipe 轉義 0/2
    { field: 'notedesc', header: '備註', align: 'left' },
  ];
  constructor(
    private readonly tls55060Service: TLS55060Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55060', this.dataForm);

    if (this.rowdata && this.rowdata.VouNo) {
      const body = { VouNo: this.rowdata.VouNo };
      this.loading = true;

      if (this.queryData === '應付') {
        this.columns = this.apColumns; // 切換欄位
        this.tls55060Service.queryTLS2C040_GLS6005({ id: this.rowdata.id }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
          if (res.Data) {
            this.data = res.Data._GLS6005List;
            this.totalRecords = res.Data._GLS6005List.length;
            // 依照要求設定 footerData 欄位名
            this.footerData = { ap_amt: res.Data.Total_AP_Amt };
          }
        });

      } else if (this.queryData === '應收') {
        this.columns = this.arColumns; // 切換欄位
        this.tls55060Service.queryTLS2C040_GLS6004({ id: this.rowdata.id }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
          if (res.Data) {
            this.data = res.Data._GLS6004List;
            this.totalRecords = res.Data._GLS6004List.length;
            // 依照要求設定 footerData 欄位名
            this.footerData = { ar_amt: res.Data.Total_ar_amt };
          }
        });

      } else {
        this.columns = this.defaultColumns; // 原有傳票欄位
        if (this.rowdata?.SrcSheetType === 'WD') {
          this.tls55060Service.queryTLS55010({
            TXN_Date: this.datePipe.transform(this.rowdata?.VouDate, 'yyyy-MM-dd') || ''
          }).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
            this.processGls6002Response(res.Data.Data._gls6002s);
          });
        } else if (this.rowdata?.SrcSheetType === 'WT') {
          this.tls55060Service.queryTLS55050M_D(body)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe((res) => {
              if (res.Data) {
                this.dataForm.patchValue(res.Data.Data._gls6001);
                this.processGls6002Response(res.Data.Data._gls6002s);
              }
            });
        } else {
          this.loading = false;
        }
      }
    }
  }

  private processGls6002Response(list: Gls6002[]) {
    this.data = list.map(item => ({
      ...item,
      DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
      CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
    }));
    this.totalRecords = list?.length || 0;
    // 原有合計邏輯保持不變
    this.footerData = this.data.reduce((acc, cur) => {
      acc.DAccAmt += (Number(cur.DAccAmt) || 0);
      acc.CAccAmt += (Number(cur.CAccAmt) || 0);
      return acc;
    }, { DAccAmt: 0, CAccAmt: 0 });
  }
}
