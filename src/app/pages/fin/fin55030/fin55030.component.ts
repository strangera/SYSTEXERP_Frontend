import { AsyncPipe, formatDate } from '@angular/common';
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
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, createPaginationConfig, formatAmount, formatDate as tableFormatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Fin29060TableSubheaderComponent } from '../fin29060/fin29060-table-subheader/fin29060-table-subheader.component';
import { FIN55030Data, FIN55030Detail, fin55030request, fin55030response, Fin55030Service } from './../../../service/api/fin/fin55030.service';

export interface GroupedFIN55030Detail extends fin55030response {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55030',
  templateUrl: './fin55030.component.html',
  styleUrl: './fin55030.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    MultiSelectComponent,
    MenubarComponent,
    FormsModule,
    Fin29060TableSubheaderComponent,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputNumberRangeComponent,
    InputTextRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
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
    DetailNo_Start: [''], // 廠商代號 GLS3001.DetailNo
    DetailNo_End: [''],
    PTA_Start: [''], // 立沖代號 GLS3003.PTA
    PTA_End: [''],
    SubDetailNo: [''], // 對象別編號 GLS3002.SubDetailNo (目前都是null)
    PostFlag: [''], // 傳票狀態 GLS3001.PostFlag (0.作廢 1.建立 2.確認 3.過帳)
    IsSubDetail: [true], // 是否為對象別(是-->IS NOT NULL, 否-->IS NULL)

    ...createPaginationConfig([{ field: 'PTA', order: 1 }]),
  });
  columns: Column[] = [
    // AccNo 設定為 visible: false 但保留，因為 HTML [groupRowsBy]="'AccNo'" 需要它
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true, format: tableFormatDate },
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'ORG_ID', header: '部門名稱', visible: true },
    { field: 'DetailNo', header: '廠商代號', visible: true },
    { field: 'PTA', header: '立沖編號', visible: true },
    { field: 'PTA1', header: '借方金額(餘額)', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
    { field: 'PTA2', header: '貸方金額(餘額)', visible: true, format: formatAmount, isSubTotal: true, isTotal: true }
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
    { label: '確認', value: '2' },
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

  constructor(
    private dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service,
    public fin55030Service: Fin55030Service,
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
      const handoff = { vouNo, fromRoute: window.location.pathname, ts: Date.now() };
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
          // 假設後端回傳的是 FIN55030Data[] (巢狀)
          const nestedData = (res.Data as unknown as FIN55030Data[]) ?? [];


          // 進行資料攤平處理
          const flattenedList: FIN55030Detail[] = [];
          nestedData.forEach((group, index) => {
            // 檢查每個科目下的明細筆數
            console.log(`科目[${index}] ${group.AccNo} 的明細筆數:`, group.data?.length);
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

          // 攤平後進行排序確保分組正確
          flattenedList.sort((a, b) => a.AccNo.localeCompare(b.AccNo));

          this.fullData = flattenedList;
          // 確保 totalRecords 是所有明細的總筆數，而非科目數
          this.totalRecords = flattenedList.length;

          // 這裡的 totalData 通常是指報表最後的總合計，可選
          this.totalData = (res as any).totalData || [];

          console.log('API回應', res);
          console.log('巢狀資料', nestedData);
          console.log('2. 攤平後總明細筆數:', flattenedList.length);

          // 初始顯示
          this.data = this.fullData.slice(0, this.lazyBatchSize);
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

  private downloadFile(blob: Blob, type: string, fileName: string) {
    const newBlob = new Blob([blob], { type });
    const url = URL.createObjectURL(newBlob);
    if (type === 'application/pdf') {
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  }
}

