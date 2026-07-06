import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN54035Service } from '@service/api/fin/fin54035.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, tap } from 'rxjs';
import { FIN54035Data } from './fin54035.model';

@Component({
  selector: 'app-fin54035',
  templateUrl: './fin54035.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    InputNumberComponent,
    MenubarComponent,
  ]
})
export class FIN54035Component extends BasicQueryPageComponent<FIN54035Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    DisplayYM: new FormControl<Date | void>(void 0),
    TargetYM: new FormControl<string>(''),
    CntPostFlag1: new FormControl<number>(0),
    CntPostFlag3: new FormControl<number>(0),
  });
  public readonly qf = computed(() => this.queryForm.controls);
  public readonly displayYMSignal = toSignal(this.qf().DisplayYM.valueChanges);

  public readonly tableData = signal<FIN54035Data>(Object.create(null));
  public readonly tableLoading = signal<boolean>(!1);
  public readonly totalRecords = signal<number>(0);

  public readonly dataEffect = effect(() => {
    const data = this.tableData();
    if (!data?.TargetYM?.length) return;
    const ym = new Date(+data.TargetYM.slice(0, 4), +data.TargetYM.slice(4, 6) - 1, 1);
    this.logger.debug(`data`, [data, ym]);

    this.queryForm.patchValue({
      DisplayYM: ym || void 0,
      TargetYM: data.TargetYM,
      CntPostFlag1: data.CntPostFlag1,
      CntPostFlag3: data.CntPostFlag3,
    });
  });

  public readonly displayYMEffect = effect(() => {
    const date = this.displayYMSignal();
    if (!date) return;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.qf().TargetYM.setValue(`${year}${month}`, { emitEvent: !1 });
  });

  public loadingEffect = effect(() => {
    this.loading = this.tableLoading()
  }, { allowSignalWrites: true });

  constructor(
    public readonly service: FIN54035Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN54035', void 0, this.queryForm, this.onSubmit.bind(this));

    this.service.loadFIN54035().pipe(
      tap(res => this.logger.debug(`init:`, [res])),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.queryForm.patchValue({
          DisplayYM: new Date(+res.Data?.TargetYM.slice(0, 4), +res.Data?.TargetYM.slice(4, 6) - 1, 1),
          TargetYM: res.Data?.TargetYM,
          CntPostFlag1: res.Data?.CntPostFlag1,
          CntPostFlag3: res.Data?.CntPostFlag3,
        });
        this.tableData.set(res.Data || Object.create(null));
      },
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.logger.debug(`反關帳:`, []);
      if (!this.qf().TargetYM.value?.length) return this.messageService.errorBubble('請選擇目標年月');

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`onSubmit:`, [this.qf().TargetYM.value]);
      this.service.closeFIN54035(this.qf().TargetYM.value!, 2).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.messageService.successBubble('儲存成功');
        },
      });
    });
  }
}
