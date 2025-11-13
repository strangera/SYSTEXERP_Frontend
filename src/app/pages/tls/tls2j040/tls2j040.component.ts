import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TLS2J040Request, TLS2j040Service } from '@service/api/tls/tls2j040.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls2j040',
  templateUrl: './tls2j040.component.html',
  styleUrl: './tls2j040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, TranslateModule, CalendarComponent, CommonModule
  ]
})
export class TLS2J040Component extends BasicQueryPageComponent<any> implements OnInit {
  
  // Updated form group to match the fields in TLS2J040Request
  queryForm = this.formBuilder.group({
    TxnDate: ['', Validators.required],               // 換開日期 (TxnDate)
    TxnGUINo: ['', [Validators.maxLength(20)]],        // 三聯式發票號碼 (TxnGUINo)
    TxnUniform: ['', [Validators.maxLength(8)]],       // 買受人統一編號 (TxnUniform)
  });

  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  constructor(
    private readonly service: TLS2j040Service,
    private readonly validationService: ValidationService,
    private readonly datePipe: DatePipe,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J040', '/TLS/TLS2J040', this.queryForm, (form) => this.onSubmit(form));
  }

  // Updated onSubmit method to match new payload structure
  onSubmit(frm: FormGroup): void {
    const payload: TLS2J040Request = {
      TxnDate: frm.get('TxnDate')?.value,             // 換開日期
      TxnGUINo: frm.get('TxnGUINo')?.value,           // 三聯式發票號碼
      TxnUniform: frm.get('TxnUniform')?.value,       // 買受人統一編號
    }

    this.handleSubmit(frm, () => {
      this.service.print(payload)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Status === '0000' && response.Data?.Print_URL) {
            let rawUrl = response.Data.Print_URL.startsWith('http')
              ? response.Data.Print_URL
              : `${environment.BaseUrl}${response.Data.Print_URL}`;
            rawUrl = decodeURIComponent(rawUrl);
            console.log('rawUrl', rawUrl);
            // ⬇️ 用 sanitizer 包裝
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
          }
          else {
            this.messageService.errorBubble(response.Message);
          }
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}
