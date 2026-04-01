import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29120Service } from '@service/api/fin/fin29120.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { formatDate } from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-fin29120',
  templateUrl: './fin29120.component.html',
  styleUrl: './fin29120.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DropdownRangeComponent,
    InputTextRangeComponent,
  ]
})
export class FIN29120Component extends BasicQueryPageComponent<any> implements OnInit {
  data: any[] = [];
  totalRecords = 0;

  queryForm = this.formBuilder.group({
    onedatemm: ['', [Validators.required]],
    track: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}$/),
        Validators.maxLength(2),
        Validators.minLength(2)
      ]
    ],
    startFactoryID: [''],
    endFactoryID: [''],
    startserialticket: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}[0-9]{8}$/),
        Validators.maxLength(10),
        Validators.minLength(10)
      ]
    ],
    endserialticket: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}[0-9]{8}$/),
        Validators.maxLength(10),
        Validators.minLength(10)
      ]
    ]
  });

  factoryIDOptions: any[] = [];

  columns: any[] = [
    { field: 'VoucherNo', header: '傳票號碼', visible: true },
    { field: 'VendorInfo', header: '廠商資訊', visible: true },
    { field: 'ACPId', header: '應付ID', visible: true, htmlFormat: true },
    { field: 'PaymentDate', header: '付款日期', visible: true, format: formatDate },
    { field: 'ACPDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACPAmount', header: '應付金額', visible: true, format: this.moneyFormat.bind(this) },
    { field: 'SettleAmount', header: '沖帳金額', visible: true, format: this.moneyFormat.bind(this) },
    { field: 'InvoiceNo', header: '發票號碼', visible: true, htmlFormat: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'NetAmount', header: '未稅金額', visible: true, format: this.moneyFormat.bind(this) },
    { field: 'TaxAmount', header: '稅額金額', visible: true, format: this.moneyFormat.bind(this) },
    { field: 'AmtWithTax', header: '含稅金額', visible: true, format: this.moneyFormat.bind(this) },
    { field: 'VoucherType', header: '憑證類別', visible: true },
  ];

  constructor(
    private fin29120Service: FIN29120Service,
    private dropDownListService: DropDownListService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29120', '/FIN/FIN29120CRU', this.queryForm, (form) => this.onSubmit(form));

    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.factoryIDOptions = (response?.Data ?? []).map((item: any) => ({
          ...item,
          label: `${item.VEN_No} - ${item.ShortName}`,
          value: item.VEN_No
        }));
      });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();

    this.handleSubmit(form, () => {
      this.fin29120Service.queryFIN29120(this.buildQueryPayload(formValue))
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false))
        )
        .subscribe((response) => {
          this.data = (response.Data ?? []).map((row: any) => {
            const acpId = String(row.ACPId ?? '').trim();
            const guiNo = String(row.InvoiceNo ?? '').trim().toUpperCase();

            const acpIdUrl = `./account/fin/fin24010cru?acpId=${encodeURIComponent(acpId)}`;
            const invoiceNoUrl = `./account/fin/fin13050cru?GUI_No=${encodeURIComponent(guiNo)}`;

            return {
              ...row,
              ACPId: acpId
                ? this.sanitizer.bypassSecurityTrustHtml(
                    `<a href="#"
                      class="acp-link"
                      data-acpid="${acpId}"
                      onclick="window.open('${acpIdUrl}', '_blank'); return false;"
                    >
                      ${acpId}
                    </a>`
                  )
                : '',
              InvoiceNo: guiNo
                ? this.sanitizer.bypassSecurityTrustHtml(
                    `<a href="#"
                      class="invoice-link"
                      data-invoice="${guiNo}"
                      onclick="window.open('${invoiceNoUrl}', '_blank'); return false;"
                    >
                      ${guiNo}
                    </a>`
                  )
                : ''
            };
          });

          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }

  private buildQueryPayload(formValue: any): any {
    return {
      PurGuiDateYyyymm: this.formatYearMonth(formValue.onedatemm),
      PurGuiNoPrefix: formValue.track || null,
      VenNoFrom: formValue.startFactoryID || null,
      VenNoTo: formValue.endFactoryID || null,
      PurGuiNoFrom: formValue.startserialticket || null,
      PurGuiNoTo: formValue.endserialticket || null
    };
  }

  private formatYearMonth(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const str = String(value).trim();

    if (/^\d{6}$/.test(str)) return str;

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    return null;
  }

  openNewWindow(value: string, type: string) {
    let url = '';
    if (type === 'ACP') {
      url = `/account/fin/fin24010cru?acpId=${encodeURIComponent(String(value ?? '').trim())}`;
    } else if (type === 'Invoice') {
      url = `/account/fin/fin13050cru?GUI_No=${encodeURIComponent(String(value ?? '').trim().toUpperCase())}`;
    }
    window.open(url, '_blank');
  }
}