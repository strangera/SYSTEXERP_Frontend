import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55050Service, QueryFIN55050Request } from '@service/api/fin/fin55050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN55050Detail } from './fin55080Report.store';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';
export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55080-report',
  templateUrl: './fin55080report.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    TableSubheaderComponent,
    ButtonModule
  ]
})
export class FIN55080ReportComponent extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {

  constructor(
    private fin55050Service: FIN55050Service,
    private readonly dropDownListService: DropDownListService,
    private route: ActivatedRoute,
    private readonly datePipe: DatePipe
  ) {
    super();
  }
  /** 匯出 loading 共用旗標 */
  PDFBtnLoading = false;
  XLSXBtnLoading = false;

  queryForm = this.formBuilder.group({
    DateFrom: [yesterday, Validators.required],
    DateTo: [yesterday, Validators.required],
    AccNoFrom: [null],
    AccNoTo: [null],
    ...createPaginationConfig([])
  });

  data: GroupedFIN55050Detail[] = [];
  selectedItems: GroupedFIN55050Detail[] = [];
  totalRecords = 0;
  lastQuery: any = null;

  columns: Column[] = [
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
  ngOnInit(): void {
    this.initializePage('FIN55080');

    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoListOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

    this.route.queryParams.subscribe(params => {
      if (params['accno']) {
        // --- 處理日期轉換邏輯 ---
        let startDate: Date = yesterday;
        let endDate: Date = yesterday;

        if (params['datefrom']) {
          // 假設 params['DateFrom'] 是 "2026-03"
          startDate = new Date(`${params['datefrom']}-01`);
        }

        if (params['dateto']) {
          // 取得該月最後一天
          const [year, month] = params['dateto'].split('-').map(Number);
          // Date(year, month, 0) 會得到該月最後一天 (JavaScript month 是 0-indexed，所以傳入下個月數字搭配日期 0)
          endDate = new Date(year, month, 0);
        }

        this.queryForm.patchValue({
          AccNoFrom: params['accno'],
          AccNoTo: params['accno'],
          DateFrom: startDate,
          DateTo: endDate
        });

        // 執行查詢
        this.onSubmit(this.queryForm);
      }
    });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const body: QueryFIN55050Request = {
        DateFrom: this.datePipe.transform(form.value.DateFrom, 'yyyy-MM-dd') || '',
        DateTo: this.datePipe.transform(form.value.DateTo, 'yyyy-MM-dd') || '',
        AccNoFrom: form.value.AccNoFrom,
        AccNoTo: form.value.AccNoTo,
      }
      this.fin55050Service.queryFIN55050(body)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.lastQuery = body;
          // 直接展平成清單供列表顯示
          this.data = this.restructureData(response.Data);
          this.totalRecords = response.TotalCount ?? this.data.length;

          // 保存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  override onLazyLoadData(event: any, form: FormGroup) {
    form.patchValue({
      pageSize: event?.pageSize,
      pageIndex: event?.pageIndex,
      SortBy: event?.SortBy
    }, { emitEvent: false });

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
  }

  /** 從巢狀資料展平成清單 */
  restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];

    (data ?? []).forEach(parent => {
      const details = parent._Details ?? [];

      // --- 1. 插入期初餘額列 ---
      // 假設後端 parent 有提供初始餘額，若無，則取第一筆明細的 OpeningBal 減去其借貸變動
      const firstDetail = details[0];
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: parent.VouDate,
        VouNo: '', // 虛擬列不給傳票號碼，避免點擊進入明細
        NoteDesc: '【期初餘額】',
        OpeningBal: firstDetail?.OpeningBal ?? 0, // 這裡需視後端 API 實際給值邏輯調整
        VouStatus: '',
        isVirtual: true // 新增標記，用於 CSS 樣式區隔
      } as any);

      // --- 2. 插入實際明細 ---
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

      // --- 3. 插入本期合計列 ---
      const lastDetail = details[details.length - 1];
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '',
        NoteDesc: '【本期合計】',
        AccAmt_D: totalD,
        AccAmt_C: totalC,
        OpeningBal: lastDetail?.OpeningBal ?? 0, // 最終餘額
        VouStatus: '',
        isVirtual: true
      } as any);
    });

    return grouped;
  }

  // ========= 匯出 =========
  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.lastQuery;
    if (!payload) return;

    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.lastQuery;
    if (!payload) return;

    this.XLSXBtnLoading = true;
    this.fin55050Service.exportFIN55050Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.XLSXBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  AccNoListOptions: any[] = [];

  getAccNoLabel(accNo: any): string {
    return this.AccNoListOptions.find(x => x.value === accNo)?.label ?? accNo;
  }
}
