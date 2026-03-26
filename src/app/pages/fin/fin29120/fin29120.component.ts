import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { FIN29120Service } from '@service/api/fin/fin29120.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
//
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { formatDate } from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

//1.2.9.12 應付帳款進項發票對應表
@Component({
  selector: 'app-fin29120',
  templateUrl: './fin29120.component.html',
  styleUrl: './fin29120.component.scss',
  standalone: true,
  imports: [CommonModule, DropdownComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule, DropdownRangeComponent, InputTextRangeComponent,]
})
export class FIN29120Component extends BasicQueryPageComponent<any> implements OnInit {
  data: any[] = [
  ];
  totalRecords = 0;
  //
  queryForm = this.formBuilder.group({
    onedatemm: ['', [Validators.required]],
    track: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}$/), Validators.maxLength(2), Validators.minLength(2)
      ]
    ],
    startFactoryID: [''],
    endFactoryID: [''],
    startserialticket: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}[0-9]{8}$/), Validators.maxLength(10), Validators.minLength(10)
      ]
    ],
    endserialticket: [
      '',
      [
        Validators.pattern(/^[A-Za-z]{2}[0-9]{8}$/), Validators.maxLength(10), Validators.minLength(10)
      ]
    ]
  });
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }

  factoryIDOptions: any[] = [];
  columns: any[] = [
    { field: 'VoucherNo', header: '傳票號碼', visible: true },
    { field: 'VendorInfo', header: '廠商資訊', visible: true },
    { field: 'ACPId', header: '應付ID', visible: true, htmlFormat: true },
    { field: 'PaymentDate', header: '付款日期', visible: true, format: formatDate },
    { field: 'ACPDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACPAmount', header: '應付金額', visible: true, format:this.moneyFormat },
    { field: 'SettleAmount', header: '沖帳金額', visible: true, format:this.moneyFormat },
    { field: 'InvoiceNo', header: '發票號碼', visible: true, htmlFormat: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'NetAmount', header: '未稅金額', visible: true, format:this.moneyFormat },
    { field: 'TaxAmount', header: '稅額金額', visible: true, format:this.moneyFormat },
    { field: 'AmtWithTax', header: '含稅金額', visible: true, format:this.moneyFormat },
    { field: 'VoucherType', header: '憑證類別', visible: true },
  ];


  constructor(
    private fin29120Service: FIN29120Service,
    private dropDownListService: DropDownListService,
    private sanitizer: DomSanitizer

  ) {
    super(); // 呼叫父類建構子
  }


  ngOnInit(): void {

    this.initializePage('FIN29120', '/FIN/FIN29120CRU', this.queryForm, (form) => this.onSubmit(form));

    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.factoryIDOptions = response.Data.map(item => ({ ...item, label: `${item.VEN_No} - ${item.ShortName}`, value: item.VEN_No }));
    });
  }

  // ----------------------------------------------------------------
  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29120Service.queryFIN29120(this.buildQueryPayload(formValue))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {

          this.data = (response.Data ?? []).map(row => {

            // 構建 ACPId 的目標 URL (FIN24010CRU)
            // 使用 Query String 參數: ?acpId=XXX
            const acpIdUrl = `./account/fin/fin24010cru?acpId=${row.ACPId}`;

            // 構建 InvoiceNo 的目標 URL (FIN13050CRU)
            // 使用 Query String 參數: ?invoiceNo=XXX
            const invoiceNoUrl = `./account/fin/fin13050cru?invoiceNo=${row.InvoiceNo}`;

            return {
              ...row,
              // *** 重點修改：直接在 onclick 中執行 window.open，並傳入完整的 URL ***
              ACPId: row.ACPId
                ? this.sanitizer.bypassSecurityTrustHtml(
                  // 移除 window.dispatchEvent，直接使用 window.open(url, '_blank')
                  `<a href="#"
                    class="acp-link"
                    data-acpid="${row.ACPId}"
                    onclick="window.open('${acpIdUrl}', '_blank'); return false;"
                  >
                    ${row.ACPId}
                  </a>`
                )
                : '',
              InvoiceNo: row.InvoiceNo
                ? this.sanitizer.bypassSecurityTrustHtml(
                  // 移除 window.dispatchEvent，直接使用 window.open(url, '_blank')
                  `<a href="#"
                    class="invoice-link"
                    data-invoice="${row.InvoiceNo}"
                    onclick="window.open('${invoiceNoUrl}', '_blank'); return false;"
                  >
                    ${row.InvoiceNo}
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
  // @HostListener('window:acp-open', ['$event'])
  // onAcpOpen(event: any) {
  //   const acpId = event.detail;
  //   const url = `/account/fin/fin24010cru?acpId=${acpId}`;
  //   window.open(url, '_blank', 'noopener');
  // }

  // @HostListener('window:invoice-open', ['$event'])
  // onInvoiceOpen(event: any) {
  //   const invoiceNo = event.detail;
  //   const url = `/account/fin/fin13050cru?invoiceNo=${invoiceNo}`;
  //   window.open(url, '_blank', 'noopener');
  // }

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

    // 已經是 YYYYMM
    if (/^\d{6}$/.test(str)) return str;

    // YYYY-MM-DDTHH:mm:ss 或 YYYY/MM/DD 或 YYYY-MM
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
      url = `/FIN/FIN29120ACPCRU?acpId=${value}`;  // 根據你的實際 URL 修改
    } else if (type === 'Invoice') {
      url = `/FIN/FIN29120INVC?invoiceNo=${value}`; // 根據你的實際 URL 修改
    }
    window.open(url, '_blank');
  }
}
