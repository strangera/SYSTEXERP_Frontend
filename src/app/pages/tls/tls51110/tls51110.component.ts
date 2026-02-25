import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { Tls51110Service } from '../../../service/api/tls/tls51110.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import {
  AddButton,
  Column,
  createPaginationConfig,
  formatAmount,
} from '../../../shared/componentkit/table/table.model';

interface LogoOption {
  No: string;
  Name: string;
  label?: string;
}

interface LogoBudget {
  id: number;
  LOGO_No: string;
  LOGO_CH_NAME?: string;
  YYYYMM: string;
  BUDGET: number;
  BUDGET_Cost: number | null;
  BUD_Status: string;
  BUD_Remark: string | null;
}


@Component({
  selector: 'app-tls51110',
  templateUrl: './tls51110.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS51110Component extends BasicQueryPageComponent<LogoBudget> implements OnInit {
  queryForm = this.formBuilder.group({
    LOGO_No: [''],
    YYYYMM: [''],
    YYYYMM2: [new Date(), Validators.required],

    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
    pageSize: [30], // 本頁預設送後端每頁 30 筆
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  BUD_StatusOptions = getSYS1000Options('BUD_Status');

  columns: Column[] = [
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'YYYYMM', header: '年月', visible: true },
    { field: 'BUDGET', header: '預算', visible: true, format: formatAmount },
    { field: 'BUDGET_Cost', header: '預算成本', visible: true, format: formatAmount },
    {
      field: 'BUD_Status',
      header: '審核狀態',
      visible: true,
      format: (value: string) =>
        this.BUD_StatusOptions.find(x => x.value === value)?.label ?? value,
    },
    { field: 'BUD_Remark', header: '備註說明', visible: true },
  ];

  LOGO_No_Option: LogoOption[] = [];
  totalRecords = 0;
  data: LogoBudget[] = [];
  selectedItems: LogoBudget[] = [];

  editDisabled(rowData: LogoBudget) {
    return rowData.BUD_Status === "1";
  }
  actionLoadingId: string | number | null = null;

  // ====== Row Buttons ======
  addButton: AddButton[] = [
    {
      label: '單據審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (row: LogoBudget) => {
        if (this.actionLoadingId) return;
        if (row.BUD_Status !== "0") {
          this.messageService.warnBubble('狀態不是「未審核」，無法審核');
          return;
        }
        this.statusChange(row, "1");
      },
      disabled: (row: LogoBudget) => row.BUD_Status === "1", // 已審核 → 審核按鈕 disable
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (row: LogoBudget) => {
        if (this.actionLoadingId) return;
        if (row.BUD_Status !== "1") {
          this.messageService.warnBubble('狀態不是「已審核」，無法反審核');
          return;
        }
        this.statusChange(row, "0");
      },
      disabled: (row: LogoBudget) => row.BUD_Status === "0", // 未審核 → 反審核按鈕 disable
    },
  ];


  constructor(
    private apiService: Tls51110Service,
    private tls51070Service: Tls51070Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51110', '/TLS/TLS51110CRU', this.queryForm, (form) => this.onSubmit(form));
    this.tls51070Service.queryPLULOGO_DropDownList({}).subscribe({
      next: (res) => {
        this.LOGO_No_Option = res.Data.map((item: LogoOption) => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
        }));
      },
      error: (err) => {
        console.error('載入品牌失敗', err);
      },
    });
  }

  formatYYYYMM(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{6}$/.test(dateStr)) {
      return dateStr;
    }
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    return `${year}${month}`;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const formattedYYYYMM = this.formatYYYYMM(formValue.YYYYMM2);
      frm.patchValue({
        ...frm.value,
        YYYYMM: formattedYYYYMM,
      });

      console.log('查詢參數:', frm.value);

      this.apiService.queryTLS51110(frm.value).subscribe({
        next: (response) => {
          console.log('查詢成功', response);
          console.log('回傳資料筆數:', response.Data?.length, '總筆數:', response.TotalCount);

          this.loading = false;
          this.data = response.Data.map((item: any) => ({
            ...item,
            YYYYMM2: frm.value.YYYYMM2
          }));
          this.totalRecords = response.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        },
      });
    });
  }

  /** 匯入 Excel 並產生錯誤檔 */
  onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.apiService.uploadTLS51110(formData).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        const data = res?.Data;

        if (data) {
          if (data.ErrorFilePath) {
            // 有錯誤檔：顯示錯誤提示
            this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
            // 自動下載錯誤檔
            this.downloadErrorFile(data.ErrorFilePath);
          } else {
            // 沒有錯誤檔：顯示成功筆數
            this.messageService.infoBubble(`匯入成功，筆數：${data.SuccessCount}`);
          }
        }
      },
    });
  }

  /** 自動下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }



  // 下載範例檔案
  onExportExcel() {
    this.apiService.downloadTemplate().subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'TLS51110_Template.xlsx');
      },
    });
  }
  statusChange(row: LogoBudget, status: string) {
    const id = row.id;
    if (id == null || Number.isNaN(Number(id))) {
      this.messageService.errorBubble(`找不到有效的 id`);
      return;
    }

    if (this.actionLoadingId) return;
    this.actionLoadingId = id;

    const payload = {
      id: Number(id),
      LOGO_No: row.LOGO_No,
      YYYYMM: row.YYYYMM,
      BUDGET: row.BUDGET,
      BUDGET_Cost: row.BUDGET_Cost ?? 0,
      BUD_Remark: row.BUD_Remark ?? '',
      BUD_Status: status === "1" ? "0" : "1"
    };

    this.apiService.approveTLS51110(payload).pipe(finalize(() => (this.actionLoadingId = null))).subscribe({
      next: () => {
        const msg = status === "1" ? '審核成功' : '反審核成功';
        this.onSubmit(this.queryForm);
        this.messageService.successBubble(`${msg}（ID: ${id}）`);
      },
    });
  }
}
