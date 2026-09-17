import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Data, FIN55050Service, GroupedFIN55050Detail, QueryFIN55050Request } from '@service/api/fin/fin55050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { Column, formatAmount } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { finalize, map, switchMap, tap } from 'rxjs';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-fin55080-report',
  templateUrl: './fin55080Report.component.html',
  styleUrls: ['./fin55080Report.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    TableSubheaderComponent,
    ButtonModule
  ],
  providers: [DatePipe]
})
export class FIN55080ReportComponent implements OnInit {
  readonly brand = environment.brand;
  private readonly fin55050Service = inject(FIN55050Service);
  private readonly dropDownListService = inject(DropDownListService);
  private readonly dropdownApi = inject(DropdownApiService);
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

  orgListOptions: Option[] = [];
  private readonly orgListData$ = this.dropdownApi.querySys3100().pipe(untilDestroyed(this));

  ngOnInit(): void {
    this.dropdownData$.subscribe(options => this.accNoListOptions = options);
    this.orgListData$.subscribe(options => this.orgListOptions = options ?? []);
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
      switchMap(request => request ? this.fin55050Service.queryFIN55050({ ...request, VouStatusList: ['3'] }) : []),
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
    const orgIdParam = params['orgid'] || params['OrgId']; // 逗號分隔的部門清單
    const orgIdList = orgIdParam ? String(orgIdParam).split(',').filter(Boolean) : undefined;

    if (!accNo || !dateFrom || !dateTo) return null;

    try {
      const startDate = new Date(`${dateFrom}-01`);
      const [year, month] = dateTo.split('-').map(Number);
      const endDate = new Date(year, month, 0);

      return {
        AccNoFrom: accNo,
        AccNoTo: accNo,
        DateFrom: this.datePipe.transform(startDate, 'yyyy-MM-dd') || '',
        DateTo: this.datePipe.transform(endDate, 'yyyy-MM-dd') || '',
        OrgId: orgIdList?.join(',') ?? '', // 供畫面顯示用 (displayOrgLabel)
        OrgIdList: orgIdList // 實際查詢過濾欄位，後端以此欄位篩選部門
      };
    } catch (e) {
      console.error('日期解析失敗', e);
      return null;
    }
  }

  getAccNoLabel(accNo: string): string {
    return this.accNoListOptions.find(x => x.value === accNo)?.label ?? accNo;
  }

  getOrgLabel(orgId: string): string {
    return this.orgListOptions.find(x => x.value === orgId)?.label ?? orgId;
  }

  /** 展平巢狀資料並插入【期初】與【合計】列 */
  private restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];

    (data ?? []).forEach(parent => {
      const allDetails = parent._Details ?? [];
      if (allDetails.length === 0) return;

      // API 已包含 DataType='期初'/'總計' 的摘要列，排除後只保留明細列計算合計
      const detailsOnly = allDetails.filter(d => d.DataType !== '期初' && d.DataType !== '總計');

      // 開期餘額：優先取 DataType='期初' 的 row，否則取第一筆
      const openingRow = allDetails.find(d => d.DataType === '期初');
      const openingBal = openingRow?.OpeningBal ?? allDetails[0]?.OpeningBal ?? 0;

      // 1. 期初餘額列
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: parent.VouDate,
        VouNo: '',
        NoteDesc: '【期初餘額】',
        OpeningBal: openingBal,
        VouStatus: '',
        isVirtual: true
      } as any);

      // 2. 明細列與計算總計
      let totalD = 0;
      let totalC = 0;
      detailsOnly.forEach(detail => {
        totalD += (detail.AccAmt_D ?? 0);
        totalC += (detail.AccAmt_C ?? 0);
        grouped.push({
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: parent.VouDate
        });
      });

      // 結束餘額：優先取 DataType='總計' 的 row，否則取最後一筆明細
      const totalRow = allDetails.find(d => d.DataType === '總計');
      const closingBal = totalRow?.OpeningBal ?? detailsOnly[detailsOnly.length - 1]?.OpeningBal ?? 0;

      // 3. 本期合計列
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '',
        NoteDesc: '【本期合計】',
        AccAmt_D: totalD,
        AccAmt_C: totalC,
        OpeningBal: closingBal,
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

  /** 取得顯示用的日期區間文字 */
  get displayDateRange(): string {
    if (!this.lastQuery) return '';
    // 將 yyyy-MM-dd 轉為 yyyy/MM/dd 顯示感較佳
    const from = this.lastQuery.DateFrom.replace(/-/g, '/');
    const to = this.lastQuery.DateTo.replace(/-/g, '/');
    return `${from} ～ ${to}`;
  }

  /** 取得當前會計科目的完整標籤 */
  get currentAccNoLabel(): string {
    if (!this.lastQuery) return '';
    return this.getAccNoLabel(this.lastQuery.AccNoFrom ?? '');
  }

  get displayOrgLabel(): string {
    const orgIdList = this.lastQuery?.OrgIdList;
    if (!orgIdList || orgIdList.length === 0) return '全部';
    return orgIdList.map(id => this.getOrgLabel(id)).join('、');
  }
}
