import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15050PrintRequest, FIN15050Service } from '@service/api/fin/fin15050.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin15050',
  templateUrl: './fin15050.component.html',
  styleUrl: './fin15050.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextRangeComponent,
    DropdownComponent,
    TranslateModule,
    CommonModule,
    YearMonthComponent
  ]
})
export class FIN15050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    REP_GUIYM: ['', Validators.required],                                                          // 申報年月
    GUI_Track: ['', [Validators.maxLength(2)]],                                                   // 字軌
    SAL_Type: [null],                                                                             // 使用別
    INV_GUINumber_S: ['', [Validators.maxLength(10), this.validationService.numberValidator]],   // 發票號碼起
    INV_GUINumber_E: ['', [Validators.maxLength(10), this.validationService.numberValidator]],   // 發票號碼訖
  });

  usageTypeOptions = getSYS1000Options('T205');
  pdfUrl: import('@angular/platform-browser').SafeResourceUrl | null = null;

  constructor(
    private readonly fin15050Service: FIN15050Service,
    private readonly validationService: ValidationService,
    private readonly datePipe: DatePipe,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15050', 'fin/fin15050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    const payload: FIN15050PrintRequest = {
      ...frm.getRawValue(),
      Mid: 0,
      STO_No: '10',
    }

    this.handleSubmit(frm, () => {
      this.fin15050Service.printFIN15050(payload)
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