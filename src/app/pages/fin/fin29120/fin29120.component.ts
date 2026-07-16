import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29120Service } from '@service/api/fin/fin29120.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin29120',
  templateUrl: './fin29120.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    YearMonthComponent,
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

  pageIndex = 1;
  pageSize = 30;
  sortMeta: unknown = null;

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
    private readonly fin29120Service: FIN29120Service,
    private readonly dropDownListService: DropDownListService,
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
                ?
                `<a href="#"
                      class="acp-link"
                      data-acpid="${acpId}"
                      onclick="globalThis.open('${acpIdUrl}', '_blank'); return false;"
                    >
                      ${acpId}
                    </a>`
                : '',
              InvoiceNo: guiNo
                ?
                `<a href="#"
                      class="invoice-link"
                      data-invoice="${guiNo}"
                      onclick="globalThis.open('${invoiceNoUrl}', '_blank'); return false;"
                    >
                      ${guiNo}
                    </a>`
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
      PurGuiDateYyyymm: formValue.onedatemm || null,
      PurGuiNoPrefix: formValue.track || null,
      VenNoFrom: formValue.startFactoryID || null,
      VenNoTo: formValue.endFactoryID || null,
      PurGuiNoFrom: formValue.startserialticket || null,
      PurGuiNoTo: formValue.endserialticket || null,
      PageIndex: this.pageIndex ?? 1,
      PageSize: this.pageSize ?? 30,
      SortBy: this.sortMeta ?? null
    };
  }

  openNewWindow(value: string, type: string) {
    let url = '';
    if (type === 'ACP') {
      url = `/account/fin/fin24010cru?acpId=${encodeURIComponent(String(value ?? '').trim())}`;
    } else if (type === 'Invoice') {
      url = `/account/fin/fin13050cru?GUI_No=${encodeURIComponent(String(value ?? '').trim().toUpperCase())}`;
    }
    globalThis.open(url, '_blank');
  }
}
