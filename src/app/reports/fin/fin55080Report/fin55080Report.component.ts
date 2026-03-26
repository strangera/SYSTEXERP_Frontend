import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Data, FIN55050Service, GroupedFIN55050Detail, QueryFIN55050Request } from '@service/api/fin/fin55050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { finalize, map, switchMap, tap } from 'rxjs';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';

@UntilDestroy()
@Component({
  selector: 'app-fin55080-report',
  templateUrl: './fin55080Report.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    TableSubheaderComponent,
    ButtonModule
  ],
  providers: [DatePipe]
})
export class FIN55080ReportComponent implements OnInit {
  private readonly fin55050Service = inject(FIN55050Service);
  private readonly dropDownListService = inject(DropDownListService);
  private readonly route = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);
  private readonly fileExportService = inject(FileExportService);

  readonly isLoading = signal(false);
  readonly isPdfExporting = signal(false);
  readonly isXlsxExporting = signal(false);

  data: GroupedFIN55050Detail[] = [];
  totalRecords = 0;
  lastQuery: QueryFIN55050Request | null = null;

  readonly columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount, style: 'text-right' },
  ];

  accNoListOptions: { label: string, value: string }[] = [];
  private readonly dropdownData$ = this.dropDownListService.queryGLS1005_DropDownList().pipe(
    untilDestroyed(this),
    map(res => res.Data.map((x: any) => ({
      label: `${x.No} - ${x.Name}`,
      value: x.No
    })))
  );
  ngOnInit(): void {
    this.dropdownData$.subscribe(options => this.accNoListOptions = options);
    this.initParamSubscription();
  }

  /** 初始化參數監聽並自動查詢 */
  private initParamSubscription(): void {
    this.route.queryParams.pipe(
      untilDestroyed(this),
      map(params => this.parseParamsToRequest(params)),
      tap(request => {
        if (request) {
          this.lastQuery = request;
          this.isLoading.set(true);
        }
      }),
      switchMap(request => request ? this.fin55050Service.queryFIN55050(request) : []),
      finalize(() => this.isLoading.set(false))
    ).subscribe(response => {
      this.data = this.restructureData(response.Data);
      this.totalRecords = response.TotalCount ?? this.data.length;
      this.isLoading.set(false);
    });
  }

  /** 解析 QueryParams 並轉換日期格式 */
  private parseParamsToRequest(params: any): QueryFIN55050Request | null {
    const accNo = params['accno'] || params['AccNo'];
    const dateFrom = params['datefrom'] || params['DateFrom'];
    const dateTo = params['dateto'] || params['DateTo'];

    if (!accNo || !dateFrom || !dateTo) return null;

    try {
      // 月初
      const startDate = new Date(`${dateFrom}-01`);
      // 月末邏輯
      const [year, month] = dateTo.split('-').map(Number);
      const endDate = new Date(year, month, 0);

      return {
        AccNoFrom: accNo,
        AccNoTo: accNo,
        DateFrom: this.datePipe.transform(startDate, 'yyyy-MM-dd') || '',
        DateTo: this.datePipe.transform(endDate, 'yyyy-MM-dd') || '',
      };
    } catch (e) {
      console.error('日期解析失敗', e);
      return null;
    }
  }

  getAccNoLabel(accNo: string): string {
    return this.accNoListOptions.find(x => x.value === accNo)?.label ?? accNo;
  }

  /** 展平巢狀資料並插入【期初】與【合計】列 */
  private restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];

    (data ?? []).forEach(parent => {
      const details = parent._Details ?? [];
      if (details.length === 0) return;

      // 1. 期初餘額列
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: parent.VouDate,
        VouNo: '',
        NoteDesc: '【期初餘額】',
        OpeningBal: details[0].OpeningBal ?? 0,
        VouStatus: '',
        isVirtual: true
      } as any);

      // 2. 明細列與計算總計
      let totalD = 0;
      let totalC = 0;
      details.forEach(detail => {
        totalD += (detail.AccAmt_D ?? 0);
        totalC += (detail.AccAmt_C ?? 0);
        grouped.push({
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: parent.VouDate
        });
      });

      // 3. 本期合計列
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '',
        NoteDesc: '【本期合計】',
        AccAmt_D: totalD,
        AccAmt_C: totalC,
        OpeningBal: details[details.length - 1].OpeningBal ?? 0,
        VouStatus: '',
        isVirtual: true
      } as any);
    });
    return grouped;
  }

  // ========= 匯出事件 =========
  onExportPDF(): void {
    if (!this.lastQuery) return;
    this.fileExportService.executeFileExport(
      this.fin55050Service.exportFIN55050PDF(this.lastQuery as any),
      '.pdf',
      (loading) => this.isPdfExporting.set(loading),
    ).subscribe();
  }

  onExportXLSX(): void {
    if (!this.lastQuery) return;
    this.fileExportService.executeFileExport(
      this.fin55050Service.exportFIN55050Excel(this.lastQuery as any),
      '.xlsx',
      (loading) => this.isXlsxExporting.set(loading),
    ).subscribe();
  }
}
