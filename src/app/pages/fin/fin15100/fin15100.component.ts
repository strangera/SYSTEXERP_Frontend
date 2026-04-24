import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FIN15100Service } from '../../../service/api/fin/fin15100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';





@Component({
  selector: 'app-fin15100',
  templateUrl: './fin15100.component.html',
  styleUrls: ['./fin15100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    InputTextRangeComponent,
    InputTextComponent,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    YearMonthComponent
  ],
})
export class FIN15100Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_DeclareYM: ['', Validators.required], // 申報年月
    TXN_Ret_NoS: [null, [Validators.maxLength(20)]], // 退出/折讓單號(起)
    TXN_Ret_NoE: [null, [Validators.maxLength(20)]],   // 退出/折讓單號(迄)
    InvoiceTrack: ['', [Validators.maxLength(2)]],//字軌
    InvoiceNumberS: [null, [Validators.maxLength(8)]], //發票起始號碼
    InvoiceNumberE: [null, [Validators.maxLength(8)]], //發票結束號碼
  }, {
    validators: [this.atLeastOneSelectionValidator()]
  });
  constructor(
    private fin15100Service: FIN15100Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15100', '/fin/fin15100cru', this.queryForm, () => this.onSubmit());
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.queryForm.get('INV_DeclareYM')?.setValue(this.datePipe.transform((currentDate), 'yyyyMM'));
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = {
        ...this.queryForm.getRawValue(),
        Mid: this.authService.currentUserValue?.mid ?? 0,
        STO_No: this.authService.currentUserValue?.SYS_StoreNo ?? '10',
      };
      this.fin15100Service.printFIN15100(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        const rawUrl = res.Data.Print_URL;
        const finalUrl = rawUrl.startsWith('http') ? rawUrl : this.joinUrlNoEncode(environment.ApiUrl, rawUrl);
        window.open(finalUrl, '_blank', 'noopener');
      });
    });
  }
  private joinUrlNoEncode(base: string, path: string): string {
    const cleanBase = base.replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  private atLeastOneSelectionValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const txnS = group.get('TXN_Ret_NoS')?.value;
      const txnE = group.get('TXN_Ret_NoE')?.value;
      const invS = group.get('InvoiceNumberS')?.value;
      const invE = group.get('InvoiceNumberE')?.value;

      // 判斷折讓單號組是否有值
      const hasTxn = !!(txnS || txnE);
      // 判斷發票號碼組是否有值
      const hasInv = !!(invS || invE);

      // 如果兩者都沒有填寫，回傳錯誤標記
      return (hasTxn || hasInv) ? null : { requireOneGroup: true };
    };
  }
}
