import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS57030Service } from '../../../service/api/tls/tls57030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  styleUrls: ['./tls57030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    RadiobuttonComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent
  ],
})
export class TLS57030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [''],
    LOGO_No: [''],
    PLU_MagNo: [''],
    PLU_No: [''],
    PLU_OrgPLUNo: [''],
    STK_Date: [new Date()],
    radiolist: [1],
    DisplayRowNumber: [20],
  });

  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  stockRangeOptions = [
    { value: 1, label: '全顯示' },
    { value: 2, label: '僅顯示不為零庫存' },
    { value: 3, label: '僅顯示零庫存' },
    { value: 4, label: '僅顯示負庫存' }
  ];

  data: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  columnGroup = [{ field: '合計', header: '合計' }];
  scrollLock = false;

  columns = [
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },
    { field: 'PLU_MagNo', header: '管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'MID', header: '廠商編號', visible: true },
    { field: 'CAT_LName', header: '大分類', visible: true },
    { field: 'CAT_MName', header: '中分類', visible: true },
    { field: 'CAT_SName', header: '小分類', visible: true },
    { field: 'PLU_OrderPrc', header: '進價(未稅)', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價(含稅)', visible: true, format: formatAmount },
    { field: 'sumCount', header: '數量合計', visible: true, format: formatAmount },
    { field: 'sumPLU_OrderPrc', header: '進價(未稅)', visible: true, groupField: '合計' },
    { field: 'sumPLU_SalePrc', header: '售價(含稅)', visible: true, groupField: '合計' },
  ];

  constructor(
    public readonly tls57030Service: TLS57030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57030');

    this.queryForm.get('DisplayRowNumber')?.valueChanges.subscribe(value => {
      if (value && this.historyRequestBody) {
        this.historyRequestBody.PageSize = value;
        this.historyRequestBody.DisplayRowNumber = value;
      }
    });
  }

  onSubmit(frm: FormGroup, event?: any) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const pageIndex = event?.pageIndex ?? 1;
      const pageSize = event?.pageSize ?? formValue.DisplayRowNumber ?? 20;

      const requestBody = {
        PageSize: pageSize,
        PageIndex: pageIndex,
        OrderBy: '',
        Offset: 0,
        SortBy: [],
        HOS_No: formValue.HOS_No ?? '',
        LOGO_No: formValue.LOGO_No ?? '',
        PLU_MagNo: formValue.PLU_MagNo ?? '',
        PLU_No: formValue.PLU_No ?? '',
        PLU_OrgPLUNo: formValue.PLU_OrgPLUNo ?? '',
        STK_Date: formValue.STK_Date ?? null,
        ShowStockRange: (formValue.radiolist ?? 1).toString(),
        DisplayRowNumber: pageSize.toString(),
      };

      if (pageIndex === 1) {
        this.data = [];
      }

      this.loading = true;
      this.tls57030Service.queryTLS57030(requestBody)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: res => {
            if (res?.Status === '0000' && res.Data) {
              this.data = pageIndex === 1 ? res.Data : [...this.data, ...res.Data];
              this.totalRecords = res.TotalCount ?? this.data.length;
              this.historyRequestBody = requestBody;
              console.log(`第 ${pageIndex} 頁載入完成，共 ${this.data.length} 筆`);
            }
          }
        });
    });
  }

  // 加載滾動事件，不動原邏輯
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.scrollLock || this.loading) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= docHeight - 200) {
      const currentCount = this.data.length;
      const total = this.totalRecords;

      if (currentCount >= total) return;

      this.scrollLock = true; //
      const nextPage = (this.historyRequestBody?.PageIndex ?? 1) + 1;
      const pageSize = this.queryForm.value.DisplayRowNumber ?? 20;

      console.log(`準備載入第 ${nextPage} 頁`);

      this.onSubmit(this.queryForm, { pageIndex: nextPage, pageSize });

      setTimeout(() => (this.scrollLock = false), 1000);
    }
  }
}
