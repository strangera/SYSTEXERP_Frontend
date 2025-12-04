import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { FIN29120Service } from '@service/api/fin/fin29120.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
//
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
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
  imports: [CommonModule, DropdownComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, InputNumberRangeComponent, ButtonComponent, TableComponent, TranslateModule]
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

  factoryIDOptions: any[] = [];
  columns: any[] = [
    { field: 'VoucherNo', header: '傳票號碼', visible: true },
    { field: 'VendorInfo', header: '廠商資訊', visible: true },
    { field: 'ACPId', header: '應付ID', visible: true, htmlFormat: true },
    { field: 'PaymentDate', header: '付款日期', visible: true, format: formatDate },
    { field: 'ACPDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'ACPAmount', header: '應付金額', visible: true },
    { field: 'SettleAmount', header: '沖帳金額', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true, htmlFormat: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'NetAmount', header: '未稅金額', visible: true },
    { field: 'TaxAmount', header: '稅額金額', visible: true },
    { field: 'AmtWithTax', header: '含稅金額', visible: true },
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
      this.factoryIDOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}`, No: item.No }));
    });
  }

  // ----------------------------------------------------------------
  onSubmit(form: FormGroup) {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      this.fin29120Service.queryFIN29120(this.buildQueryPayload(formValue))
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {

          this.data = (response.Data ?? []).map(row => ({
            ...row,
            ACPId: row.ACPId
              ? this.sanitizer.bypassSecurityTrustHtml(
                `<a href="#"
          class="acp-link"
          data-acpid="${row.ACPId}"
          onclick="window.dispatchEvent(new CustomEvent('acp-open', { detail: '${row.ACPId}' })); return false;"
        >
          ${row.ACPId}
       </a>`
              )
              : '',
            InvoiceNo: row.InvoiceNo
              ? this.sanitizer.bypassSecurityTrustHtml(
                `<a href="#"
            class="invoice-link"
            data-invoice="${row.InvoiceNo}"
            onclick="window.dispatchEvent(new CustomEvent('invoice-open', { detail: '${row.InvoiceNo}' })); return false;"
        >
          ${row.InvoiceNo}
        </a>`
              )
              : ''
          }));

          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }
  @HostListener('window:acp-open', ['$event'])
  onAcpOpen(event: any) {
    console.log(1123123)
    //  到該分頁 做 用key撈資料
  }
  @HostListener('window:invoice-open', ['$event'])
  onInvoiceOpen(event: any) {
    console.log(456)
    //  到該分頁 做 用key撈資料
  }


  private buildQueryPayload(formValue: any): any {
    return {
      PurGuiDateYyyymm: formValue.onedatemm,
      PurGuiNoPrefix: formValue.track,
      VenNoFrom: formValue.startFactoryID || null,
      VenNoTo: formValue.endFactoryID || null,
      PurGuiNoFrom: formValue.startserialticket || null,
      PurGuiNoTo: formValue.endserialticket || null
    };
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
