import { ChangeDetectionStrategy, Component, computed, effect, OnInit } from '@angular/core';
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
import { finalize, tap } from 'rxjs';
import { FIN52010Data, FIN52010UpdatePayload } from './fin52010.model';

@Component({
  selector: 'app-fin52010',
  templateUrl: './fin52010.component.html',
  styleUrl: './fin52010.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    OriOpenDate: new FormControl<string | void>(void 0),
    CloseDate: new FormControl<Date | void>(void 0, [Validators.required]),
    OriCloseDate: new FormControl<string | void>(void 0),
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

  public readonly dataEffect = effect(() => {
    const orgUsr = this.service.orgUsrList();
    const gls1005 = this.service.gls1005List();
    const { OpenDate, CloseDate, ...rest } = this.service.FIN52010Data();

    if (!orgUsr.length || !gls1005.length) return;
    const orgLoading = this.service.orgUsrLoading();
    const gls1005Loading = this.service.gls1005Loading();

    if (orgLoading || gls1005Loading) return;
    this.dataForm.patchValue({
      ...rest,
      OpenDate: OpenDate ? new Date(+OpenDate.slice(0, 4), +OpenDate.slice(4, 6) - 1, 1) : void 0,
      CloseDate: CloseDate ? new Date(+CloseDate.slice(0, 4), +CloseDate.slice(4, 6) - 1, 1) : void 0,
      OriOpenDate: OpenDate,
      OriCloseDate: CloseDate,
      // advanceExpenseAccNo: res.advanceExpenseAccNo,
      // billTransferCon: res.billTransferCon as 'N' | 'Y',
    });
  }, { allowSignalWrites: !0 });

  constructor(
    public service: FIN52010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.getUserInfo();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52010', void 0, this.dataForm);

    this.service.getTblUsrOrgList();
    this.service.getGLS1005DropDownList();
    this.service.loadFIN52010(this.user!.CompNo);

    this.logger.debug(`init:`, [this.user]);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const { OriOpenDate, OriCloseDate, ...rest } = this.dataForm.value;
      const payload = <FIN52010UpdatePayload>{
        ...rest,
        AccYear: this.df().AccYear.value,
        OpenDate: OriOpenDate,
        CloseDate: OriCloseDate,
        CompNo: this.user!.CompNo,
      };

      this.logger.debug(`onSubmit:`, [rest, payload]);

      this.service.updateFIN52010Data(payload).pipe(
        tap(res => this.messageService.successBubble(res.Message)),
        finalize(() => this.loading = !1),
      ).subscribe(res => {
        this.logger.debug(`updateFIN52010Data result:`, [res]);
      });
    });
  };
}
