import { NgIf } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EngType } from '@service/api/ass/ass21010.service';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
// import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PanelModule } from 'primeng/panel';
import { ASS2100ENGMeterType } from '../ass21010/ass21010.model';
import { ASS21020Data } from './ass21020.model';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  styleUrl: './ass21020.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    PanelModule,
    AccordionModule,
    TranslateModule,
    FormsModule,
    KeyFilterModule,
    ButtonComponent,
    // DialogComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    ReactiveFormsModule,
    TableComponent,
    InputNumberComponent,
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<unknown> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[]>([]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0),
    TLT_No: new FormControl<string | undefined>(void 0),
    Location_No: new FormControl<string>(''),
    TLT_Name: new FormControl<string>(''),
    NET_SPACE: new FormControl<number | undefined>(void 0),
    ENG_Rate: new FormControl<number | undefined>(void 0),
    ...createPaginationConfig([{ field: '', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);
  public readonly totalRecord = computed(() => this.service.ASS21020Data().length);

  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly locNoSignal = toSignal(this.qf().Location_No.valueChanges);
  private readonly tltNoSignal = toSignal(this.qf().TLT_No.valueChanges);

  public readonly ratePtn = /^(100(?:\.0{1,2})?|0*(?:\d{1,2}))$/;

  public filteredMeterNo: ASS2100ENGMeterType[] = [];

  public readonly totalRecords = computed(() => this.service.ASS21020Data().length);

  public readonly engTypeEffect = effect(() => {
    this.filteredMeterNo = this.service.engMeterNoSignal().filter(i => {
      if (!this.engTypeSignal()?.length) return !0;
      return this.service.engTypeSignal()!.some(t => t.Name === i.ENG_Type
        && this.qf().ENG_Type.value?.some(v => v === t.No));
    });
    this.logger.debug(`engTypeEffect:`, [this.filteredMeterNo]);
  });

  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal();
    if (!meterNo) return;
    this.service.queryTltByFlag(meterNo);
    if (this.qf().ENG_Type.value?.length) return;
    const type = this.service.engMeterNoMap.get(meterNo)?.ENG_Type;
    const current = this.service.engTypeSignal().find(t => t.Name === type);
    current && this.qf().ENG_Type.patchValue([current.No as EngType]);
    this.logger.debug(`meterNo changes:`, [meterNo, current]);
  }, { allowSignalWrites: !0 });

  public readonly locNoEffect = effect(() => {
    const locNo = this.service.tltNoSignal().find(t => t.TLT_No === this.tltNoSignal());
    if (!locNo?.Location_No) return;
    this.qf().Location_No.patchValue(locNo!.Location_No);
    this.logger.debug(`locNo changes:`, [locNo]);
  });

  public readonly tltNoEffect = effect(() => {
    const tltNo = this.tltNoSignal();
    if (!tltNo?.length) return;
    const selected = this.service.tltByFlagMap.get(tltNo);
    if (!selected) return;
    this.qf().TLT_Name.patchValue(selected.TLT_Name);
    this.qf().NET_SPACE.patchValue(selected.NET_SPACE);
  });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'TLT_Name', header: '專櫃編號/名稱' },
    { field: 'ENG_Rate', header: '面積比率(%)', format: v => `${v}%` },
    { field: 'ENG_Remark', header: '備註' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];

  public readonly meterColumns: Column[] = [
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Type', header: '能源類型' },
  ];

  public tltNoColumns: Column[] = [
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'NET_SPACE', header: '專櫃面積坪數' },
    { field: 'Apply_No', header: '招募編號' },
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
        ENG_Type: this.qf().ENG_Type.value!.join(),
        ENG_Rate: this.qf().ENG_Rate.value!,
        ENG_MeterNo: this.qf().ENG_MeterNo.value!,
        Location_No: this.qf().Location_No.value!,
        SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo!,
        Mid: Number(this.authService.currentUserValue?.mid)!,
      });

      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.loading = !1;
    });
  }

  public onDelete(items: ASS21020Data[]): void {
    this.logger.debug(`Deleting:`, [items]);
    for (const item of items) {
      this.service.deleteASS21020(String(item.ID)).subscribe(res => {
        if (res.IsUpdateSuccess) this.messageService.successBubble('刪除成功');
        else this.messageService.errorBubble(res.ErrorMsg, '刪除失敗');
        this.loading = !1;
      });
    }
  }
}
