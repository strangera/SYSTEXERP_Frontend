import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { Tls22030Service } from '../../../service/api/tls/tls22030.service';
import { DisplayService } from '../../../service/basic/display.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { WhetherService } from './../../../service/basic/whether.service';
import { ButtonModule } from 'primeng/button';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls22030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ButtonModule, ReactiveFormsModule, CalendarRangeQuickComponent, MultiSelectComponent, RadiobuttonComponent, ButtonComponent, TableComponent, DropdownComponent, TranslateModule],
})

export class TLS22030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [''],
    TLT_NoList: [null],
    TXN_DateStart: [yesterday, Validators.required],
    TXN_DateEnd: [yesterday, Validators.required],
    IsLossStatus: [null], // 預設值為 '0000'，表示全部
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])

  });
  totalRecords = 0;
  tltNoOptions: IDropdownItem[] = [];
  data: any[] = [];
  ECRNoOptions: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [

    { field: 'TXN_Date', header: '日期', visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'MIN_TXN_No', header: '後台交易起號', visible: true },
    { field: 'MAX_TXN_No', header: '後台交易迄號', visible: true },
    { field: 'SLE_TxnBegNo', header: '前台清機起號', visible: true },
    { field: 'SLE_TxnEndNo', header: '前台清機迄號', visible: true },
    { field: 'SLE_GUIBegNo', header: '發票起始(起)', visible: true },
    { field: 'SLE_GUIEndNo', header: '發票結束(迄)', visible: true },
    {
      field: 'IsPerDayLoss', header: '當日是否欠落', visible: true,
      format: (val: string) => val === '1' ? 'Y' : '--'
    },
    {
      field: 'IsCrossDayLoss', header: '跨日是否欠落', visible: true,
      format: (val: string) => val === '1' ? 'Y' : '--'
    },
  ];
  btnLoading = false;
  listZeroDifferenceOptions: any[] = [];
  displayConditionOptions: any[] = [];
  tlt_no?: string;

  constructor(
    private ECRNoService: ECRNoService,
    private whetherService: WhetherService,
    private displayService: DisplayService,
    private tls22030Service: Tls22030Service,
    private dropDownListService: DropDownListService,
    private service: Tls22030Service,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22030', '/TLS/TLS22030cru', this.queryForm);
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.listZeroDifferenceOptions = data;
    });

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res && res.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No} ${item.Name}`,   // 假設 item 有 Name 欄位
            value: item.No,     // 假設 item 有 No 欄位
            No: item.No,        // 確保包含 No 屬性
            Name: item.Name     // 確保包含 Name 屬性
          }));
        }
      });
  }

  /** 處理文件上傳事件 */
  onImportExcel(event: any): void {
    const file = event.files[0];
    if (!file) {
      console.error('No file selected for import');
      return;
    }
  }

  onExportExcel(): void {
    const condition = this.queryForm.getRawValue();

    // 準備與查詢相同格式的參數
    const payload = {
      ...condition,
      TXN_DateStart: this.toYMD(condition.TXN_DateStart),
      TXN_DateEnd: this.toYMD(condition.TXN_DateEnd),
    };

    console.log('匯出 Excel 請求參數:', payload);

    this.btnLoading = true;

    this.tls22030Service.exportTLS22030(payload).subscribe({
      next: (blob: Blob) => {

        if (blob.size === 0) {
          alert('匯出失敗：沒有資料可匯出');
          this.btnLoading = false;
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TLS22030_序號異常報表_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.btnLoading = false;
      },
    });
  }

  onExportPDF(): void {
    const condition = this.queryForm.getRawValue();

    // 組 payload：跟 Excel 類似，但只要帶查詢條件
    const payload = {
      ...condition,
      TXN_DateStart: this.toYMD(condition.TXN_DateStart),
      TXN_DateEnd: this.toYMD(condition.TXN_DateEnd),
    };

    this.tls22030Service.exportTLS22030PDF(payload).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TLS22030_${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  }

  private toYMD(date: Date | string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();

      // 組 payload，日期轉 yyyy/MM/dd
      const payload = {
        ...raw,
        TXN_DateStart: this.toYMD(raw.TXN_DateStart),
        TXN_DateEnd: this.toYMD(raw.TXN_DateEnd),
      };

      this.tls22030Service.queryTLS22030(payload).subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.loading = false;

          // 儲存查詢條件
          this.queryStateService.setQueryState(this.ProgNo, payload);
        },
      });
    });
  }




}
