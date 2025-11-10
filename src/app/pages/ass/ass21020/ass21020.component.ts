import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
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
import { tap } from 'rxjs';
import { ASS2100ENGMeterType, EngType } from '../ass21010/ass21010.model';
import { ASS21020Data, ASS21020Query, TLTByFlag } from './ass21020.model';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  styleUrl: './ass21020.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    KeyFilterModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<ASS21020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENG_Type: new FormControl<EngType[] | void>(void 0),
    ENG_MeterNo: new FormControl<string | void>(void 0),
    TLT_No: new FormControl<string | void>(void 0),
    Location_No: new FormControl<string>(''),
    TLT_Name: new FormControl<string>(''),
    NET_SPACE: new FormControl<string | void>(void 0),
    ENG_Rate: new FormControl<number | void>(void 0),
    ...createPaginationConfig([{ field: 'ENG_Type', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly tltNoSignal = toSignal(this.qf().TLT_No.valueChanges);

  public readonly ratePtn = /^(100(?:\.0{1,2})?|0*(?:\d{1,2}))$/;

  private suppressEngTypeEffect = !1;

  public readonly filteredMeterNo = signal<ASS2100ENGMeterType[]>([]);

  private readonly usrData = computed(() => ({
    SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
    Mid: Number(this.authService.currentUserValue!.mid),
  }));

  /** ENG_Type 改變時,篩選 MeterNo 選項 */
  public engTypeEffect = effect(() => {
    const engTypes = this.engTypeSignal() ?? void 0;
    const MeterNos = this.service.engMeterNoOptions();
    this.logger.debug(`filteredMeterNo:`, [engTypes, MeterNos]);

    if (!this.suppressEngTypeEffect) this.queryForm.patchValue({
      ENG_MeterNo: void 0,
      Location_No: void 0,
    });

    if (!engTypes?.length || engTypes.length === 3) return this.filteredMeterNo.set(MeterNos);

    this.filteredMeterNo.set(MeterNos.filter(m => m.ENG_Type
      && this.service.engTypeMap.get(m.ENG_Type)
      && engTypes.includes(this.service.engTypeMap.get(m.ENG_Type)!)));
  }, { allowSignalWrites: !0 });

  /** MeterNo 改變時,帶出 Location_No 並清除 ENG_Type */
  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal() ?? void 0;
    const typeString = meterNo && this.service.engMeterNoMap().get(meterNo)?.ENG_Type || void 0;
    const engType = typeString && this.service.engTypeMap.get(typeString);
    if (!meterNo || !typeString || !engType) return;

    const Location_No = this.service.engMeterNoMap().get(meterNo)?.Location_No;
    Location_No && this.qf().Location_No.setValue(Location_No);

    this.suppressEngTypeEffect = !0;
    queueMicrotask(() => this.suppressEngTypeEffect = !1);

    this.logger.debug(`meterNoEffect:`, [meterNo, typeString, engType, Location_No]);
  }, { allowSignalWrites: !0 });

  /** TLT_No 改變時，帶出TLT_Name、NET_SPACE */
  public readonly tltNoEffect = effect(() => {
    const tltNo = this.tltNoSignal() ?? void 0;
    const tltByFlag = tltNo?.length && this.service.tltByFlagMap().get(tltNo) || void 0;
    this.logger.debug(`tltNoEffect:`, [tltNo, tltByFlag]);
    if (!tltByFlag) return;

    this.queryForm.patchValue({
      TLT_No: tltByFlag.TLT_No,
      TLT_Name: tltByFlag.TLT_Name,
      NET_SPACE: tltByFlag.NET_SPACE ? String(tltByFlag.NET_SPACE) : void 0
    }, { emitEvent: !1 });
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.engMeterNoLoading()
      || this.service.tltByFlagLoading();
  });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof ASS21020Data; })[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];

  public readonly extColumns: (Omit<Column, 'field'> & { field: keyof TLTByFlag; })[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', format: (v, i, r) => `${v}${r?.TLT_Name ? '-' + r.TLT_Name : ''}` },
    { field: 'ENG_Rate', header: '面積比率(%)', format: v => `${v}%` },
    { field: 'ENG_Remark', header: '備註' },
  ];

  public readonly meterColumns: Column[] = [
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '設備位置編號' },
    { field: 'ENG_Type', header: '能源類型' },
  ];

  public readonly tltNoColumns: (Omit<Column, 'field'> & { field: keyof TLTByFlag; })[] = [
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
    this.user = this.authService.currentUserValue!;
  }

  public ngOnInit(): void {
    this.service.ASS21020Data.set([]);
    this.initializePage('ASS21020', '/ASS/ASS21020CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.getEngMeterNos();
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const { Location_No, NET_SPACE, ...rest } = this.queryForm.getRawValue();
      const raw = {
        ...rest,
        ...this.usrData(),
      };

      const payload = (Object.keys(raw) as (keyof typeof raw)[]).reduce<Record<string, unknown>>((acc, key) => {
        const v = raw[key];
        if (v !== null && v !== void 0 && v !== '' && !(Array.isArray(v) && !v.length)) acc[key] = v;
        return acc;
      }, {}) as ASS21020Query;

      this.logger.debug(`onSubmit:`, [payload]);
      this.service.loadASS21020(payload).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  public onDelete(items: ASS21020Data[]): void {
    Array.isArray(items) || (items = [items]);
    this.logger.debug(`Deleting:`, [items]);

    let deletedCount = 0;
    const totalItems = items.length;

    for (const item of items) {
      this.service.deleteASS21020({ ENG_Type: this.service.engTypeMap.get(item.ENG_Type)!, ENG_MeterNo: item.ENG_MeterNo }).pipe(
        tap(() => {
          deletedCount++;
          if (deletedCount === totalItems) this.onSubmit();
        }),
      ).subscribe({
        next: () => this.messageService.successBubble(`刪除錶號 ${item.ENG_MeterNo} 成功`),
        error: () => this.messageService.errorBubble(`刪除錶號 ${item.ENG_MeterNo} 發生錯誤`),
      });
    }
  }
}
