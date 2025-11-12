import { Component, OnInit, computed, effect, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  standalone: true,
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
    Location_No: new FormControl<string | void>(void 0),
    TLT_Name: new FormControl<string | void>(void 0),
    NET_SPACE: new FormControl<string | void>(void 0),
    ENG_Rate: new FormControl<number | void>(void 0),
    ...createPaginationConfig([{ field: 'ENG_Type', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly engTypeSignal = toSignal(this.qf().ENG_Type.valueChanges);
  private readonly meterNoSignal = toSignal(this.qf().ENG_MeterNo.valueChanges);
  private readonly tltNoSignal = toSignal(this.qf().TLT_No.valueChanges);

  public readonly ratePtn = /^(100(?:\.0{1,2})?|0*(?:\d{1,2}))$/;

  private readonly usrData = computed(() => ({
    SYS_StoreNo: this.authService.currentUserValue!.SYS_StoreNo,
    Mid: Number(this.authService.currentUserValue!.mid),
  }));

  //  改用 computed 來過濾錶號選項
  public readonly filteredMeterNo = computed(() => {
    const type = this.engTypeSignal() ?? void 0;
    const options = this.service.engMeterNoOptions();

    if (!type?.length || type.length === 3) {
      return options;
    }

    return options.filter(o =>
      type.some(t => this.service.engTypeMap.get(o.ENG_Type) === t)
    );
  });

  private previousEngType: EngType[] | void = void 0;
  private previousMeterNo: string | void = void 0;

  /** 改變engType 更新錶號選項 */
  public readonly engTypeEffect = effect(() => {
    const type = this.engTypeSignal() ?? void 0;

    //  只在真正改變時才清空錶號（這是清空邏輯，需要判斷）
    const hasChanged = JSON.stringify(this.previousEngType) !== JSON.stringify(type);
    if (hasChanged && this.previousEngType !== void 0) {
      untracked(() => this.qf().ENG_MeterNo.setValue(void 0));
    }
    this.previousEngType = type;
  }, { allowSignalWrites: !0 });

  /** 改變錶號 更新設備位置編號 */
  public readonly meterNoEffect = effect(() => {
    const meterNo = this.meterNoSignal() ?? void 0;

    //  只在真正改變時才清空（這是清空邏輯，需要判斷）
    const hasChanged = this.previousMeterNo !== meterNo;
    if (hasChanged && this.previousMeterNo !== void 0) {
      untracked(() => {
        this.qf().TLT_No.setValue(void 0);
        if (!meterNo) {
          this.qf().Location_No.setValue(void 0);
        }
      });
    }
    this.previousMeterNo = meterNo;

    // 如果有錶號，載入專櫃選項
    if (meterNo) {
      const engTypes = this.qf().ENG_Type.value || [];
      const engTypesApi = engTypes.map(type => this.service.engTypeMap.get(type)).filter(Boolean) as string[];
      this.service.getTltByFlags(meterNo, this.usrData().Mid, engTypesApi);
    }
  }, { allowSignalWrites: !0 });

  /** 改變專櫃編號 更新相關欄位 */
  public readonly tltNoEffect = effect(() => {
    const tltNo = this.tltNoSignal() ?? void 0;
    const tltByFlag = tltNo?.length && this.service.tltByFlagMap().get(tltNo) || void 0;
    this.logger.debug(`tltNoEffect:`, [tltNo, tltByFlag]);

    //  不需要判斷是否改變，因為這是「帶出資料」的邏輯
    // 每次 TLT_No 變化都應該更新這些欄位
    this.queryForm.patchValue({
      TLT_No: tltByFlag ? tltByFlag.TLT_No : void 0,
      TLT_Name: tltByFlag ? tltByFlag.TLT_Name : void 0,
      Location_No: tltByFlag ? tltByFlag.Location_No : void 0,
      NET_SPACE: tltByFlag ? String(tltByFlag.NET_SPACE) : void 0,
    });
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
    // ❌ 移除這行
    // this.service.ASS21020Data.set([]);

    //  修改為傳入 form 參數的方式
    this.initializePage('ASS21020', '/ASS/ASS21020CRU', this.queryForm, (form) => this.onSubmit(form));

    this.service.getEngMeterNos();
  }

  //  加上可選參數
  public onSubmit(frm?: FormGroup): void {
    const form = frm || this.queryForm;

    this.handleSubmit(form, () => {
      const { Location_No, NET_SPACE, ...rest } = form.getRawValue();
      const raw = {
        ...rest,
        ...this.usrData(),
      };

      const payload = Object.entries(raw).reduce<Record<string, unknown>>((acc, [key, v]) => {
        if (v !== null && v !== void 0 && v !== '' && !(Array.isArray(v) && !v.length)) acc[key] = v;
        return acc;
      }, {}) as ASS21020Query;

      this.logger.debug(`onSubmit:`, [payload]);
      this.service.loadASS21020(payload).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
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
