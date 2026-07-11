import { formatDate, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { Column, createPaginationConfig, formatAmount, formatDate as tableFormatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { FIN55030Detail, fin55030request, fin55030response, Fin55030Service } from './../../../service/api/fin/fin55030.service';
import { Fin55030TableSubheaderComponent } from './fin55030-table-subheader/fin55030-table-subheader.component';

export interface GroupedFIN55030Detail extends FIN55030Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55030',
  templateUrl: './fin55030.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    MenubarComponent,
    FormsModule,
    Fin55030TableSubheaderComponent,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputTextRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule
  ]
})

// FIN55030 立沖科目餘額表
export class FIN55030Component extends BasicQueryPageComponent<any> implements OnInit {
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
    SubDetailNo: [''], // 對象別編號 GLS3002.SubDetailNo (目前都是null)
    PostFlag: [''], // 傳票狀態 GLS3001.PostFlag (0.作廢 1.建立 2.確認 3.過帳)
    IsSubDetail: [null], // 是否為對象別(是-->IS NOT NULL, 否-->IS NULL)

    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]), // 用AccNo排序
  });
  columns: Column[] = [
    // AccNo 設定為 visible: false 但保留，因為 HTML [groupRowsBy]="'AccNo'" 需要它
    { field: 'VouDate', header: '傳票日期', visible: true, format: tableFormatDate },
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'DetailNo', header: '廠商編號', visible: true, align: 'left' },
    { field: 'VEN_Name', header: '廠商名稱', visible: true, align: 'left' },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true, align: 'left' },
    { field: 'PTA', header: '立沖編號', visible: true, align: 'left' },
    { field: 'NoteDesc', header: '摘要', visible: true, align: 'left' },
    { field: 'PTA1', header: '借方金額(餘額)', visible: true, format: formatAmount, isSubTotal: true, isTotal: true, align: 'right' },
    { field: 'PTA2', header: '貸方金額(餘額)', visible: true, format: formatAmount, isSubTotal: true, isTotal: true, align: 'right' }
  ];
  data: fin55030response[] = [];
  totalRecords = 0;
  AccNo_Options: any[] = [];
  ORG_IDOptions: any[] = [];
  VenNoOptions: any[] = [];
  TargetNoListOptions: any[] = [];
  PostFlagOptions = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    // { label: '確認', value: '2' }, // 需求#566: 傳票狀態的"確認"選項，請移除
    { label: '過帳', value: '3' }
  ];
  ifOptions = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]

  btn_pdf_Loading = false;
  btn_excel_Loading = false;

  // 新增屬性以支援 subheader 功能
  lastQueryBody: any = null;
  fullData: fin55030response[] = [];
  totalData: any[] = []; // 視後端回傳格式而定
  lazyBatchSize = 30;
  accdcMap: Record<string, string> = {}; // key = Label (AccNo + " - " + AccCName), value = ACCDC

  constructor(
    private dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service,
    public fin55030Service: Fin55030Service,
    private location: Location
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55030', '/FIN/FIN55030CRU', this.queryForm, (frm) => this.onSubmit(frm));
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

  // fin55030.component.ts
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();
      const formValue = {
        ...rawValue,
        VouDate_Start: formatDate(rawValue.VouDate_Start, 'yyyy-MM-dd', 'en-US'),
        VouDate_End: formatDate(rawValue.VouDate_End, 'yyyy-MM-dd', 'en-US'),
        pageIndex: 1,
        pageSize: this.lazyBatchSize
      } as fin55030request;

      this.lastQueryBody = formValue;

      this.fin55030Service.queryFIN55030(formValue)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe(res => {
          // 讀取巢狀資料
          const nestedData = res.Data ?? [];

          // 進行資料攤平處理
          const flattenedList: FIN55030Detail[] = [];
          const newAccdcMap: Record<string, string> = {};
          nestedData.forEach((group, index) => {
            // 檢查每個科目下的明細筆數
            console.log(`科目[${index}] ${group.AccNo} 的明細筆數:`, group.data?.length);
            const label = group.AccNo + " - " + group.AccCName;
            newAccdcMap[label] = group.ACCDC ?? 'D'; // 建立 ACCDC 對照表（'D'=借方, 'C'=貸方）
            if (group.data && group.data.length > 0) {
              group.data.forEach(detail => {
                flattenedList.push({
                  ...detail,
                  AccNo: group.AccNo,       // 將父層的科目代號帶入明細
                  AccCName: group.AccCName,  // 將父層的科目名稱帶入明細
                  Label: label
                });
              });
            }
          });
          this.accdcMap = newAccdcMap;

          // 攤平後進行排序確保分組正確
          flattenedList.sort((a, b) => a.AccNo.localeCompare(b.AccNo));

          this.fullData = flattenedList;
          // 改為直接賦值：
          this.data = [...this.fullData];
          this.totalRecords = this.fullData.length;

          console.log('API回應', res);
          console.log('巢狀資料', nestedData);
          console.log('2. 攤平後總明細筆數:', flattenedList.length);
        });
    });
  }

  // 修改後的列印邏輯，使用最後一次查詢的 Body
  printPDF(isPDF: boolean) {
    if (!this.lastQueryBody) return;

    // 如果要列印全部，需要調整 PageSize
    const exportPayload = {
      ...this.lastQueryBody,
      PageIndex: 1,
      PageSize: this.totalRecords
    };

    if (isPDF) {
      this.btn_pdf_Loading = true;
      this.fin55030Service.exportFIN55030PDF(exportPayload)
        .pipe(finalize(() => this.btn_pdf_Loading = false))
        .subscribe(blob => this.downloadFile(blob, 'application/pdf', '立沖科目餘額表.pdf'));
    } else {
      this.btn_excel_Loading = true;
      this.fin55030Service.exportFIN55030Excel(exportPayload)
        .pipe(finalize(() => this.btn_excel_Loading = false))
        .subscribe(blob => this.downloadFile(blob, 'application/vnd.ms-excel', '立沖科目餘額表.xlsx'));
    }
  }

  /** 清單 → 明細（CRU）：使用 localStorage 交接資料 */
  override onDetail(row: GroupedFIN55030Detail) {
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
      console.log('[FIN55050] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN55050] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
    const finalUrl = `${globalThis.location.origin}${externalUrl}`;
    // 開新分頁
    globalThis.open(finalUrl, '_blank', 'noopener');
  }

  // 下載pdf/excel
  private downloadFile(blob: Blob, type: string, fileName: string) {
    const newBlob = new Blob([blob], { type });
    const url = URL.createObjectURL(newBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}

