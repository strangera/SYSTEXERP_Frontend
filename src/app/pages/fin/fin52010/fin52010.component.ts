import { DatePipe } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52010Service } from '@service/api/fin/fin52010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, forkJoin, map, tap } from 'rxjs';
import { FIN52010Data, FIN52010UpdatePayload } from './fin52010.model';

@Component({
  selector: 'app-fin52010',
  templateUrl: './fin52010.component.html',
  styleUrl: './fin52010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52010Component extends BasicQueryPageComponent<FIN52010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    AccYear: new FormControl<string | void>(void 0, [Validators.required]),
    OpenDate: new FormControl<Date | void>(void 0, [Validators.required]),
    CloseDate: new FormControl<Date | void>(void 0, [Validators.required]),
    DefaultVouDate: new FormControl<Date | void>(void 0),
    ORG_ID: new FormControl<string | void>(void 0, [Validators.required]),
    AccNoTotPL: new FormControl<string | void>(void 0, [Validators.required]),
    AccNoCurPL: new FormControl<string | void>(void 0, [Validators.required]),
    CashAccNo: new FormControl<string | void>(void 0),
    AccNoAR: new FormControl<string | void>(void 0),
    AccNoAP: new FormControl<string | void>(void 0),
    AccNoInTax: new FormControl<string | void>(void 0),
    AccNoOutTax: new FormControl<string | void>(void 0),
    AccNoPost: new FormControl<string | void>(void 0),
    AccNoRemitFee: new FormControl<string | void>(void 0),
    advanceExpenseAccNo: new FormControl<string | void>(void 0),
    billTransferCon: new FormControl<'N' | 'Y'>('N'),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly canSave = computed(() => {
    return this.dataForm.valid;
  });

  constructor(
    public service: FIN52010Service,
    private readonly logger: NGXLogger,
    private readonly date: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52010', void 0, this.dataForm);
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.dataForm.setValue(store.value);

    forkJoin([
      this.service.getTblUsrOrgList(),
      this.service.getGLS1005DropDownList(),
      this.service.loadFIN52010(this.user!.CompNo),
    ]).pipe(
      map(([tblUsrOrg, gls1005, { OpenDate, CloseDate, ...rest }]) => ({
        ...rest,
        OpenDate: OpenDate ? new Date(+OpenDate.slice(0, 4), +OpenDate.slice(4, 6) - 1, 1) : void 0,
        CloseDate: CloseDate ? new Date(+CloseDate.slice(0, 4), +CloseDate.slice(4, 6) - 1, 1) : void 0,
        // advanceExpenseAccNo: res.advanceExpenseAccNo,
        // billTransferCon: res.billTransferCon as 'N' | 'Y',
        tblUsrOrg,
        gls1005,
      })),
      finalize(() => this.logger.debug(`init:`, [this.user, this.service.FIN52010Data()]))
    ).subscribe(({ tblUsrOrg, gls1005, ...res }) => {
      const orgLoading = this.service.tblUsrOrgLoading();
      const gls1005Loading = this.service.gls1005Loading();

      if (tblUsrOrg.length >= 0 && gls1005.length >= 0 && !orgLoading && !gls1005Loading) {
        this.logger.debug(`patched:`, [res]);
        this.dataForm.patchValue(res);
      }
    });
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const { OpenDate, CloseDate, ...raw } = this.dataForm.getRawValue();
      const payload = <FIN52010UpdatePayload>{
        ...raw,
        OpenDate: this.date.transform(OpenDate ?? new Date(), 'yyyyMM') ?? '',
        CloseDate: this.date.transform(CloseDate ?? new Date(), 'yyyyMM') ?? '',
        CompNo: this.user!.CompNo,
      };

      this.logger.debug(`onSubmit:`, [raw, payload]);

      this.service.updateFIN52010Data(payload).pipe(
        tap(({ Status }) => {
          if (Status === '0000') this.messageService.successBubble('更新成功');
        }),
        finalize(() => this.loading = !1),
      ).subscribe(res => {
        this.logger.debug(`updateFIN52010Data result:`, [res]);
      });
      this.queryStateService.setQueryState(this.ProgNo, this.dataForm.getRawValue());
    });
  };
}
