import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55130Service, QueryFIN55050DetailRequest, VoucherDetailRow } from '@service/api/fin/fin55130.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-fin55130-detail',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    TranslateModule,
    TableReportComponent,
  ],
  templateUrl: './fin55130-detail.component.html'
})
export class Fin55130DetailComponent extends BasicCruPageComponent<unknown> implements OnInit {
  vouNo: string | null = null;
  detailData: VoucherDetailRow[] = [];
  footerData: VoucherDetailRow | null = null;
  meta: VoucherDetailRow | null = null;

  // 定義明細表的欄位
  columns: ReportColumn[] = [
    { field: 'ACCNO', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'Remark', header: '備註', visible: true },
  ];

  constructor(
    public readonly fin55130Service: Fin55130Service,
    private readonly route: ActivatedRoute,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.previousRoute = '/account/fin/fin55130';
    this.formTitle = '分類帳明細';
    this.crudstatus = CRUDStatus.Read;
    this.initializePage('FIN55130');

    const params = this.route.snapshot.queryParamMap;
    this.vouNo = params.get('vouno');

    if (this.vouNo) {
      this.search();
    }
  }

  search(): void {
    if (!this.vouNo) return;

    this.loading = true;
    const body: QueryFIN55050DetailRequest = { VouNo: this.vouNo };

    this.fin55130Service.queryFIN55050Detail(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        this.detailData = response.Data._VoucherDetails || [];
        const head = response.Data._VoucherDetails[0];
        this.meta = {
          ...head,
          VouDate: head.VouDate ?? '',
          VouType_Name: head.VouType_Name ?? '',
          VouNo: head.VouNo ?? this.vouNo,
          VouStatus: head.VouStatus ?? '',
        };
        this.footerData = {
          VouDate: '',
          VouNo: '',
          UPD_Date: '',
          VouType_Name: '',
          VouStatus: '',
          VoucherType_Name: '',
          ACCNO: '',
          AccCName: '',
          Org_Name: '',
          NoteDesc: '',
          AccAmt_D: response.Data.SUM_AccAmt_D,
          AccAmt_C: response.Data.SUM_AccAmt_C,
          Ven_Name: '',
          Remark: '',
        }
        // 如果有需要，也可以把 response.Data.SUM_AccAmt_D 存起來做頁尾總計
      });
  }
  PDFBtnLoading = false;
  onExportPDF() {
    if (!this.detailData.length || !this.vouNo) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin55130Service.exportFIN55050DetailPDF({ VouNo: this.vouNo });
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.PDFBtnLoading = isLoading);
  }
}
