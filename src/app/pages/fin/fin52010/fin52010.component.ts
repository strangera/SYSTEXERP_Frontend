import { ChangeDetectionStrategy, Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52010Service } from '@service/api/fin/fin52010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN52010Data, FIN52010UpdatePayload } from './fin52010.model';

@Component({
  selector: 'app-fin52010',
  templateUrl: './fin52010.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52010Component extends BasicQueryPageComponent<FIN52010Data> implements OnInit {

  private formatYmDisplay(value?: string | null): string | undefined {
    if (!value) return value as any;
    const v = value.toString();
    if (/^\d{6}$/.test(v)) {
      return `${v.substring(0, 4)}/${v.substring(4, 6)}`;
    }
    return v;
  }

  private normalizeYmPayload(value?: string | null): string | undefined {
    if (!value) return value as any;
    const v = value.toString();
    // 將 yyyy/mm 還原為 yyyymm
    return v.replace('/', '');
  }

  public readonly dataForm = this.formBuilder.nonNullable.group({
    AccYear: new FormControl<string | void>(void 0, [Validators.required]),
    OpenDate: new FormControl<string | void>(void 0, [Validators.required]),
    CloseDate: new FormControl<string | void>(void 0, [Validators.required]),
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

  public readonly tableData = signal<FIN52010Data>(Object.create(null));
  public readonly tableLoading = signal<boolean>(!1);

  public org_id_Options: any[] = [];

  public readonly dataEffect = effect(() => {
    const gls1005 = this.service.gls1005Options();
    const table = this.tableData();

    // 尚未有後端資料或科目下拉尚未載入完成時，不做 patch
    if (!table || Object.keys(table as any).length === 0 || !gls1005.length) return;
    if (this.service.gls1005Loading()) return;

    const { OpenDate, CloseDate, ...rest } = table;

    this.dataForm.patchValue({
      ...rest,
      OpenDate: this.formatYmDisplay(OpenDate),
      CloseDate: this.formatYmDisplay(CloseDate),
    });
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
  }, { allowSignalWrites: true });

  constructor(
    public readonly service: FIN52010Service,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.getUserInfo();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52010', void 0, this.dataForm);
    this.tableLoading.set(!0);

    // 組織下拉改用 SYS3100
    this.dropDownListService.querySYS3100_DropDownList().subscribe(res => {
      this.org_id_Options = (res.Data || []).map((item: any) => ({
        ...item,
        label: `${item.No}-${item.Name}`,
        value: item.No,
      }));
    });

    this.service.getGLS1005DropDownOptions();
    this.service.loadFIN52010(this.user!.CompNo).pipe(
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.tableData.set(res.Data);
      }
    });

    this.logger.debug(`init:`, [this.user]);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const data = this.dataForm.getRawValue();
      const raw = {
        ...data,
        OpenDate: this.normalizeYmPayload(data.OpenDate as any),
        CloseDate: this.normalizeYmPayload(data.CloseDate as any),
        CompNo: this.user!.CompNo,
      } as FIN52010UpdatePayload;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      ));

      this.tableLoading.set(!0);
      this.logger.debug(`onSubmit:`, [raw, payload]);
      this.service.updateFIN52010Data(payload).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe(res => {
        this.tableData.set(res.Data);
        this.messageService.successBubble(res.Message || '更新成功');
      });
    });
  };
}
