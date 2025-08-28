import { Component, OnInit, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EngType } from '@service/api/ass/ass21010.service';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { ASS21020Data } from './ass21020.model';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  styleUrl: './ass21020.component.scss',
  standalone: true,
  imports: [
    PanelModule,
    AccordionModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    MenubarComponent,
    ButtonComponent,
    TableComponent,
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENGType: new FormControl<EngType[]>([]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    TLT_No: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string>(''),
    ENG_Rate: new FormControl<number>(0),
    TLT_Name: new FormControl<string>(''),
    NET_SPACE: new FormControl<number>(0),
    NET_SPACE_Ratio: new FormControl<number>(0),
    ...createPaginationConfig([{ field: '', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);
  public readonly totalRecord = computed(() => this.service.ASS21020Data().length);

  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly tltNoSignal = toSignal(this.qf().TLT_No.valueChanges);

  public readonly totalRecords = computed(() => this.service.ASS21020Data().length);

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    const selected = meterNo && this.service.engMeterNoMap.get(meterNo) || { Location_No: '', ENG_MeterNo: '' };
    meterNo && this.service.queryTltByFlag(selected.ENG_MeterNo);
    this.qf().Location_No.patchValue(selected.Location_No);
    this.logger.debug(`meterNo changes:`, [meterNo, selected]);
  });

  public readonly tltNoEffect = effect(() => {
    const tltNo = this.tltNoSignal();
    const selected = tltNo && this.service.tltByFlagMap.get(tltNo) || { TLT_Name: '', NET_SPACE: 0 };
    this.qf().TLT_Name.patchValue(selected.TLT_Name);
    this.qf().NET_SPACE.patchValue(selected.NET_SPACE);

    // 計算所有專櫃面積總和
    const totalNetSpace = Array.from(this.service.tltByFlagMap.values())
      .reduce((sum, tlt) => sum + (tlt.NET_SPACE ?? 0), 0);

    // 計算選中專櫃比例
    const currentNetSpace = selected?.NET_SPACE ?? 0;
    const ratio = totalNetSpace > 0 ? (currentNetSpace / totalNetSpace) * 100 : 0;

    this.qf().NET_SPACE_Ratio.patchValue(Math.round(ratio * 100) / 100);
    this.logger.debug(`tltNo changes:`, [tltNo, selected]);
  });

  public readonly columns: Column[] = [
    { field: 'EngType', header: '能源類型', format: v => this.service.engTypeSignal().find(t => t.No === v)?.Name || v },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'ENG_Rate', header: '面積比率(%)', format: v => `${v}%` },
    { field: 'ENG_Remark', header: '備註' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', '/ASS/ASS21020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadEngType();
    this.service.loadEngMeterNo();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.service.loadASS21020({
        EngTypes: this.qf().ENGType.value?.join() ?? '',
        ENG_MeterNo: this.service.engMeterNoMap.get(this.qf().ENG_MeterNo.value!)?.ENG_MeterNo ?? '',
        Location_No: this.service.engMeterNoMap.get(this.qf().ENG_MeterNo.value!)?.Location_No ?? '',
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo ?? '',
        Mid: Number(this.authService.currentUserValue?.mid) ?? 0,
      });

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.loading = !1;
    });
  }

  public onDelete(event: ASS21020Data): void {
    this.logger.debug(`Deleting:`, [event]);

    this.confirmationService.confirm({
      message: '是否確認刪除?',
      accept: () => {

        this.messageService.successBubble('刪除成功');
        this.loading = !1;
      },
    });
  }
}
