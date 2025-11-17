import { Component, computed, effect, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN54030Service } from '@service/api/fin/fin54030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { FIN54030Data } from './fin54030.model';

@Component({
  selector: 'app-fin54030',
  templateUrl: './fin54030.component.html',
  styleUrl: './fin54030.component.scss',
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
export class FIN54030Component extends BasicQueryPageComponent<FIN54030Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    DisplayYM: new FormControl<Date | void>(void 0),
    TargetYM: new FormControl<string>(''),
    CntPostFlag1: new FormControl<number>(0),
    CntPostFlag3: new FormControl<number>(0),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly dataEffect = effect(() => {
    const data = this.service.FIN54030Data();
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

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.closeLoading();
  });

  constructor(
    public readonly service: FIN54030Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN54030', void 0, this.queryForm, this.onSubmit.bind(this));
    this.service.loadFIN54030();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.logger.debug(`onSubmit:`, [this.queryForm.getRawValue(), this.qf().TargetYM.value]);
      if (!this.qf().TargetYM.value?.length) return;
      this.qf().CntPostFlag1.value! > 0
        ? this.messageService.errorBubble('已建立傳票大於0，不允許關帳')
        : this.service.closeFIN54030(this.qf().TargetYM.value!, '1');
    });
  }
}
