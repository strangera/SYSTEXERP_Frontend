import { Tls51110Service } from '../../../service/api/tls/tls51110.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  Column,
  createPaginationConfig,
} from '../../../shared/componentkit/table/table.model';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { FileSelectEvent } from 'primeng/fileupload';
import { saveAs } from 'file-saver';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

interface LogoOption {
  No: string;
  Name: string;
  label?: string;
}

interface LogoBudget {
  id: number;
  LOGO_CH_NAME?: string;
  YYYYMM: string;
  BUDGET: number;
  BUDGET_Cost: number;
  BUD_Status: string;
  BUD_Remark: string;
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
    YYYYMM2: ['', Validators.required],

    ...createPaginationConfig([{ field: 'LOGO_No', order: 1 }]),
  });

  columns: Column[] = [
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'YYYYMM', header: '年月', visible: true },
    { field: 'BUDGET', header: '預算', visible: true },
    { field: 'BUDGET_Cost', header: '預算成本', visible: true },
    {
      field: 'BUD_Status',
      header: '審校狀態',
      visible: true,
      format: (value: string) =>
        this.BUD_Status_Option.find((item) => item.value === value)?.label || value,
    },
    { field: 'BUD_Remark', header: '備註說明', visible: true },
  ];

  LOGO_No_Option: LogoOption[] = [];
  totalRecords = 0;
  data: LogoBudget[] = [];
  selectedItems: LogoBudget[] = [];

  editDisabled(rowData: LogoBudget) {
    return rowData.BUD_Status === '1';
  }

  BUD_Status_Option = [
    { value: '0', label: '未審核' },
    { value: '1', label: '已審核' },
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
      this.apiService.queryTLS51110(frm.value).subscribe({
        next: (response) => {
          console.log('查詢成功', response);
          this.loading = false;
          this.data = response.Data.map((item: any) => ({
            ...item,
            YYYYMM2: frm.value.YYYYMM2
          }));
          this.totalRecords = response.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        },
        error: (err) => {
          console.error('查詢失敗', err);
          this.loading = false;
        },
      });
    });
  }

  // 匯入 Excel
  onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    if (!file) return;

    this.apiService.uploadTLS51110(file).subscribe({
      next: (res) => {
        console.log('匯入成功', res);
        // 成功後可自動重新查詢
        this.onSubmit(this.queryForm);
      },
      error: (err) => {
        console.error('匯入失敗', err);
      }
    });
  }

  // 下載範例檔案
  onExportExcel() {
    this.apiService.downloadTemplate().subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'TLS51110_Template.xlsx');
      },
      error: (err) => {
        console.error('下載範例檔案失敗', err);
      }
    });
  }
}
