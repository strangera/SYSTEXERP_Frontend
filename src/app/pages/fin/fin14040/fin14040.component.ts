import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin14040Service } from '@service/api/fin/fin14040.service';
import { FIN15080Service } from '@service/api/fin/fin15080.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

const today = new Date();
let invoiceYear = today.getFullYear();
let invoiceMonth = today.getMonth() + 1;

if (invoiceMonth % 2 !== 0) {
  invoiceMonth += 1;

  if (invoiceMonth > 12) {
    invoiceMonth = 1;
    invoiceYear += 1;
  }
}

export const invoiceDate =
  invoiceYear.toString() + invoiceMonth.toString().padStart(2, '0');

interface REP_TaxNo_list {
  No: string;
  Label: string;
  STO_Status: string;
  STO_TaxNo: string;
  STO_TaxName: string;
  REP_BegGUIYM?: string;
  REP_EndGUIYM?: string;
}

@Component({
  selector: 'app-fin14040',
  templateUrl: './fin14040.component.html',
  styleUrl: './fin14040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TableComponent,
    TranslateModule,
    YearMonthComponent,
  ],
})
export class FIN14040Component
  extends BasicQueryPageComponent<unknown>
  implements OnInit
{
  pageReady = false;

  queryForm = this.formBuilder.group({
    Mid: [this.authService.getUserInfo()?.mid ?? null, [Validators.required]],
    STO_No: [
      this.authService.getUserInfo()?.SYS_StoreNo ?? null,
      [Validators.required],
    ],
    INV_DeclareYM: [invoiceDate, Validators.required],
    Tax_No: ['' as string, Validators.required],
  });

  totalRecords = 0;
  data: Record<string, string>[] = [];
  selectedItems: Record<string, string> = {};

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  REP_TaxNo_Options: REP_TaxNo_list[] = [];

  columns: Column[] = [{ field: 'field', header: '欄位' }];

  constructor(
    private fin14040Service: Fin14040Service,
    private fin15080Service: FIN15080Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.pageReady = false;

    this.initializePage(
      'FIN14040',
      '/FIN/FIN14040cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    this.loadOptions();
  }

  loadOptions(): void {
    const mid = Number(this.queryForm.get('Mid')?.value ?? 0);
    const STO_No = String(this.queryForm.get('STO_No')?.value ?? '');

    this.pageReady = false;
    this.loading = true;

    this.fin15080Service
      .getStoTaxNoOptions({
        mid,
        STO_No,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.pageReady = true;
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (rows) => {
          this.REP_TaxNo_Options = this.buildTaxNoOptions(rows);

          const active =
            this.REP_TaxNo_Options.find(
              (x) => String(x.STO_Status).trim() === '1'
            ) ?? this.REP_TaxNo_Options[0];

          if (active) {
            this.queryForm.controls.Tax_No.setValue(active.No);
          }
        },
        error: (error) => {
          console.error('取得稅籍編號下拉失敗:', error);
          this.REP_TaxNo_Options = [];
          this.messageService.errorBubble('稅籍編號清單取得失敗');
        },
      });
  }

  private buildTaxNoOptions(rows: any[]): REP_TaxNo_list[] {
    const map = new Map<string, REP_TaxNo_list>();

    rows.forEach((x) => {
      const taxNo = String(x?.STO_TaxNo ?? '').trim();
      const taxName = String(x?.STO_TaxName ?? '').trim();
      const status = String(x?.STO_Status ?? '').trim();

      if (!taxNo) return;

      const option: REP_TaxNo_list = {
        Label: `${taxNo}-${taxName}`,
        No: taxNo,
        STO_Status: status,
        STO_TaxNo: taxNo,
        STO_TaxName: taxName,
        REP_BegGUIYM: String(x?.REP_BegGUIYM ?? '').trim(),
        REP_EndGUIYM: String(x?.REP_EndGUIYM ?? '').trim(),
      };

      const exists = map.get(taxNo);

      if (!exists) {
        map.set(taxNo, option);
        return;
      }

      if (status === '1') {
        map.set(taxNo, option);
      }
    });

    return Array.from(map.values());
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        Mid: Number(frm.value.Mid),
        INV_DeclareYM: this.convertDateToYYYYMM(frm.value.INV_DeclareYM),
      };

      console.log('形成媒體申報檔request', body);

      this.loading = true;

      this.fin14040Service
        .printFIN14040(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              console.log('形成媒體申報檔 response', response.Data);

              if (response.Data?.ZipUrl) {
                window.open(
                  environment.BaseUrl + response.Data.ZipUrl,
                  '_blank'
                );
              }
            }

            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
    });
  }

  private convertDateToYYYYMM(value: any): string {
    if (!value) return '';

    if (typeof value === 'string' && /^\d{6}$/.test(value)) {
      return value;
    }

    if (value instanceof Date) {
      return (
        value.getFullYear() +
        String(value.getMonth() + 1).padStart(2, '0')
      );
    }

    return String(value);
  }
}