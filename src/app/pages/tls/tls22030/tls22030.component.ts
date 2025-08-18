import { WhetherService } from './../../../service/basic/whether.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplayService } from '../../../service/basic/display.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22030Service } from '../../../service/api/tls/tls22030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls22030',
  templateUrl: './tls22030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, MultiSelectComponent, RadiobuttonComponent, ButtonComponent, TableComponent, DropdownComponent, TranslateModule],
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
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'ECR_No', header: '後台交易電腦', visible: true },
    { field: 'MIN_TXN_No', header: '後台交易起號', visible: true },
    { field: 'MAX_TXN_No', header: '後台交易迄號', visible: true },
    { field: 'SLE_TxnBegNo', header: '前台清機電腦', visible: true },
    { field: 'SLE_TxnEndNo', header: '前台清機記錄', visible: true },
    { field: 'SLE_GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'SLE_GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'IsPerDayLoss', header: '當日是否欠落', visible: true },
    { field: 'IsCrossDayLoss', header: '跨日是否欠落', visible: true },
  ];


  listZeroDifferenceOptions: any[] = [];
  displayConditionOptions: any[] = [];
  tlt_no?: string;
  constructor(
    private ECRNoService: ECRNoService,
    private whetherService: WhetherService,
    private displayService: DisplayService,
    private tls22030Service: Tls22030Service,
    private dropDownListService: DropDownListService,
    private service: Tls22030Service, // Added service property
    private http: HttpClient, // Inject HttpClient service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22030', '/TLS/TLS22030cru', this.queryForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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
    const condition = this.queryForm.getRawValue();  // ''保證是純物件

    const payload = {
      query_condition: {
        ServiceName: 'queryTLS22030',
        Conditions: condition
      },
      report_title: 'TLS22030 序號異常報表',
      file_name: `TLS22030_${new Date().toISOString().slice(0, 10)}`,
      columns: this.columns.filter(c => c.visible),
      config: {
        print_reportTitle: 'Y',
        print_reportTitle_per_page: 'N',
        print_eject: 'Y',
        print_field_title: 'Y',
        print_field_title_per_page: 'N'
      }
    };

    this.http.post(`${environment.ApiUrl}/exportExcel`, payload, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payload.file_name}.xlsx`;
        a.click();
      },
      error: (err) => {
        console.error('Excel 匯出失敗', err);
      }
    });
  }


  onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    this.tls22030Service.queryTLS22030(form.value).subscribe({
      next: (res) => {
        // 把 Data 取出來
        this.data = (res?.Data ?? []).map((item: { TXN_Date?: string }) => {
          // 預設直接回傳
          const newItem = { ...item };

          // 日期轉換 (08/05/2025 00:00:00 → 2025/08/05)
          if (item.TXN_Date) {
            const [month, day, year] = item.TXN_Date.split(" ")[0].split("/");
            newItem.TXN_Date = `${year}/${month}/${day}`;
          }

          return newItem;
        });

        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;

        // 儲存查詢條件
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      },
      error: (err) => {
        console.error('TLS22030 查詢失敗', err);
        this.loading = false;
      }
    });
  });
}


}

