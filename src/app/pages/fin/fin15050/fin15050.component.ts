import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15050PrintRequest, FIN15050Service } from '@service/api/fin/fin15050.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin15050',
  templateUrl: './fin15050.component.html',
  standalone: true,
  providers: [DatePipe],
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
    YearMonthComponent,
  ],
})
export class FIN15050Component extends BasicQueryPageComponent<unknown> implements OnInit {
  private readonly fin15050Service = inject(FIN15050Service);
  private readonly validationService = inject(ValidationService);
  private readonly datePipe = inject(DatePipe);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    REP_GUIYM: ['', Validators.required],
    GUI_Track: ['', [Validators.maxLength(2)]],
    SAL_Type: [null as string | null],
    INV_GUINumber_S: ['', [Validators.maxLength(10), this.validationService.numberValidator]],
    INV_GUINumber_E: ['', [Validators.maxLength(10), this.validationService.numberValidator]],
  });

  usageTypeOptions = getSYS1000Options('T205');
  pdfUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    this.initializePage('FIN15050', 'fin/fin15050cru', this.queryForm, (form) => this.onSubmit(form));
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.queryForm.get('REP_GUIYM')?.setValue(this.datePipe.transform(currentDate, 'yyyyMM'));
  }

  onSubmit(frm: FormGroup): void {
    const payload: FIN15050PrintRequest = {
      ...frm.getRawValue(),
      Mid: 0,
      STO_No: '10',
    };

    this.handleSubmit(frm, () => {
      this.fin15050Service.printFIN15050(payload)
        .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Status === '0000' && response.Data?.Print_URL) {
            const rawUrl = response.Data.Print_URL.startsWith('http')
              ? response.Data.Print_URL
              : `${environment.BaseUrl}${response.Data.Print_URL}`;
            this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(rawUrl));
          } else if (response.Status === '0000') {
            this.messageService.warnBubble(response.Data?.Message ?? '查無資料');
          } else {
            this.messageService.errorBubble(response.Message);
          }
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}
