import { formatDate, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN55040Detail, fin55040request, fin55040response, Fin55040Service } from '@service/api/fin/fin55040.service';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { Column, createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { Fin29060TableSubheaderComponent } from './fin29060-table-subheader/fin29060-table-subheader.component';

export interface GroupedFIN55040Detail extends FIN55040Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55040',
  templateUrl: './fin55040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    MenubarComponent,
    FormsModule,
    Fin29060TableSubheaderComponent,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputTextComponent,
    InputTextRangeComponent,
    ButtonComponent,
    TranslateModule,
    MultiSelectComponent,
  ]
})
// FIN55040立沖科目明細表
export class FIN55040Component extends BasicQueryPageComponent<fin55040response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VouDate_Start: [new Date(), [Validators.required]], // 日期 GLS3001.VOUDATE
    VouDate_End: [new Date(), [Validators.required]],
    ORG_ID: [''],   // 部門代碼 GLS3001.ORG_ID
    AccNo_Start: [''], // 科目代號 GLS3003.ACCNO
    AccNo_End: [''],
    DetailNo_Start: [''], // 廠商編號 GLS3001.DetailNo
    DetailNo_End: [''],
    PTA_Start: [''], // 立沖代號 GLS3003.PTA
    PTA_End: [''],
    SubDetailNo: [''], // 對象別編號 GLS3001.SubDetailNo
    PostFlag: [[] as string[]], // 傳票狀態 GLS3001.PostFlag (0.作廢 1.建立 2.確認 3.過帳)
    IsSubDetail: [null], // 是否為對象別(是-->IS NOT NULL, 否-->IS NULL)
    ACCT_KEY: [''], // 帳鍵 GLS3002.ACCT_KEY
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  columns: Column[] = [
    // AccNo 設定為 visible: false 但保留，因為 HTML [groupRowsBy]="'AccNo'" 需要它
    { field: 'PTA', header: '立沖編號', visible: true },
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'PTA1', header: '借方金額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'PTA2', header: '貸方金額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'PTA3', header: '餘額', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'ACCT_KEY', header: '對帳KEY值', visible: true, align: 'left' },
  ];
  data: fin55040response[] = [];
  totalRecords = 0;
  AccNo_Options: any[] = [];
  ORG_IDOptions: any[] = [];
  VenNoOptions: any[] = [];
  TargetNoListOptions: any[] = [];
  PostFlagOptions = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '過帳', value: '3' }
  ];
  ifOptions = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]

  readonly formatAmount = formatAmount;

  btn_pdf_Loading = false;
  btn_excel_Loading = false;

  // 新增屬性以支援 subheader 功能
  lastQueryBody: any = null;
  fullData: fin55040response[] = [];
  totalData: any[] = []; // 視後端回傳格式而定
  lazyBatchSize = 30;

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
    private readonly dropDownListService: DropDownListService,
    private readonly fin55050Service: FIN55050Service,
    public readonly fin55040Service: Fin55040Service,
    private readonly location: Location
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55040', '/FIN/FIN55040CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    this.fin55070Service.getAccNoList().subscribe(res => {
      this.AccNo_Options = res;
    });
    this.dropdown.querySys3100().subscribe(res => {
      this.ORG_IDOptions = res || [];
    });
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VenNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    this.fin55050Service.queryGLS1016_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.TargetNoListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }

  // 新增點擊明細處理 (參考 29060)
  onDetailWithColValue(event: { row: any; col: any; value: any }) {
    if (event.col.field === 'VouNo') {
      // 範例：導向傳票維護介面
      const vouNo = event.row?.VouNo;
      const handoff = { vouNo, fromRoute: globalThis.location.pathname, ts: Date.now() };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      // ... 導向邏輯
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();
      const formValue = {
        ...rawValue,
        VouDate_Start: formatDate(rawValue.VouDate_Start, 'yyyy-MM-dd', 'en-US'),
        VouDate_End: formatDate(rawValue.VouDate_End, 'yyyy-MM-dd', 'en-US')
      } as fin55040request;
      this.lastQueryBody = formValue;
      this.fin55040Service.queryFIN55040(formValue)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(res => {
          // 讀取巢狀資料
          const nestedData = res.Data ?? [];
          // 進行資料攤平處理
          const flattenedList: FIN55040Detail[] = [];
          nestedData.forEach((group) => {
            if (group.data && group.data.length > 0) {
              group.data.forEach(detail => {
                flattenedList.push({
                  ...detail,
                  AccNo: group.AccNo,       // 將父層的科目代號帶入明細
                  AccCName: group.AccCName  // 將父層的科目名稱帶入明細
                });
              });
            }
          });
          // 後端 groupData 已按 raw PTA ASC + Status DESC 排序，攤平後順序不變，無需前端再排
          this.fullData = flattenedList;
          // 改為直接賦值：
          this.data = [...this.fullData];
          this.totalRecords = this.fullData.length;
          // 帶入後端算好的各科目彙總（PTA3 是累計餘額，需用後端算好的「最後一筆」值，不可逐筆加總）
          this.totalData = nestedData.map(group => ({
            AccNo: group.AccNo,
            PTA1_Total: group.summary?.PTA1_Total ?? 0,
            PTA2_Total: group.summary?.PTA2_Total ?? 0,
            PTA3_Total: group.summary?.PTA3_Total ?? 0,
          }));
        });
    });
  }

  /** 清單 → 明細（CRU）：使用 localStorage 交接資料 */
  override onDetail(row: GroupedFIN55040Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    // 儲存交接資料到 localStorage（含 ProgNo）
    try {
      const handoff = {
        vouNo,
        fromRoute: globalThis.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050'); // ✅ 存 ProgNo
    } catch {
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
    const finalUrl = `${globalThis.location.origin}${externalUrl}`;
    // 開新分頁
    globalThis.open(finalUrl, '_blank', 'noopener');
  }

  getAccSubtotal(accNo: string, field: string): number {
    return this.fullData
      .filter(d => d.AccNo === accNo)
      .reduce((sum, row) => sum + (Number((row as any)[field]) || 0), 0);
  }

  // 列印 PDF 或 Excel
  printPDF(isPDF: boolean) {
    const rawValue = this.queryForm.getRawValue();
    const formValue = {
      ...rawValue,
      VouDate_Start: formatDate(rawValue.VouDate_Start, 'yyyy-MM-dd', 'en-US'),
      VouDate_End: formatDate(rawValue.VouDate_End, 'yyyy-MM-dd', 'en-US')
    }

    if (isPDF) {
      this.btn_pdf_Loading = true;
      this.fin55040Service.exportFIN55040PDF(formValue).pipe(finalize(() => this.btn_pdf_Loading = false))
        .subscribe(resp => this.handleFileExport(resp, '.pdf', '立沖科目明細表'));
    } else {
      this.btn_excel_Loading = true;
      this.fin55040Service.exportFIN55040Excel(formValue).pipe(finalize(() => this.btn_excel_Loading = false))
        .subscribe(resp => this.handleFileExport(resp, '.xlsx', '立沖科目明細表'));
    }
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
