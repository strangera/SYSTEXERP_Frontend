import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FIN15050PrintRequest, FIN15050Service } from '@service/api/fin/fin15050.service';
import { environment } from 'src/environments/environment';
import { getSYS1000Options } from '@service/system/sys1000.service';

@Component({
  selector: 'app-fin15050',
  templateUrl: './fin15050.component.html',
  styleUrl: './fin15050.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, InputTextRangeComponent, DropdownComponent, TranslateModule,
    CalendarComponent
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

  constructor(
    private readonly fin15050Service: FIN15050Service,
    private readonly validationService: ValidationService,
    private readonly datePipe: DatePipe,
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
      REP_GUIYM: this.datePipe.transform(frm.get('REP_GUIYM')?.value, 'yyyyMM') || '',
    }
    this.handleSubmit(frm, () => {
      this.fin15050Service.printFIN15050(payload)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.openDownloadWindow(response.Data.Print_URL);
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    window.open(downloadUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  }
}