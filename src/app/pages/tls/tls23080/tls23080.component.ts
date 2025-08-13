import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of, firstValueFrom } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  styleUrls: ['./tls23080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule
  ]
})
export class TLS23080Component extends BasicQueryPageComponent<any> {
  private readonly STORAGE_KEY = 'TLS23080:queryForm';
  private destroy$ = new Subject<void>();         // ✅ 自動退訂
  querySubscription: Subscription | null = null;

  showPageSizeDialog = false;
  customPageSize = 1000;

  data: any[] = [];
  totalRecords = 0;

  WhetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_openflag: ['Y'],
    ECR_No: [],

    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    // TXN_Year: [],
    // TXN_Month: [],
    // queryMonthYear: [],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }])
  });
  constructor(
    private whetherService: WhetherService,
    private tls23080Service: TLS23080Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'TLS23080cru', this.queryForm);

    // 從 localStorage 還原
    this.restoreQueryFromStorage();

    // ✅ 表單變更 300ms 後存檔 + 自動退訂
    this.queryForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.saveQueryToStorage());

    // ❌ 刪除錯誤的 'TLS23010_queryForm' 讀取

    // ✅ 下拉資料：全部 takeUntil
    this.whetherService.getWhetherOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.WhetherOptions = (data || []).filter((opt: any) => opt.value !== null);
      });

    this.floorService.getFloors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.ECRNoService.getECRNo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ECRNoOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.counterNameService.getCounters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  goToReportMode(): void {
    this.customPageSize = 1000;
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = {
      ...this.queryForm.value,
      pageSize: this.customPageSize
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls23080Service.queryTLS23080(queryFormValue)
      .pipe(
        timeout(30000),
        catchError(() => {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [] });
        })
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
            this.router.navigate(['account/tls/tls23080cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: res.Data || [],
              }
            });
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        }
      });
  }

  // ✅ 改用 firstValueFrom；並加上 takeUntil
  fetchDetailFn = async (payload: { TXN_Date: string }): Promise<any[]> => {
    if (!payload?.TXN_Date) return [];
    try {
      const result = await firstValueFrom(
        this.tls23080Service
          .queryTLS23080Detail({ TXN_Date: payload.TXN_Date })
          .pipe(takeUntil(this.destroy$))
      );
      if (result?.Status === '0000') {
        return result.Data ?? [];
      } else {
        this.messageService.warnBubble('查詢明細失敗');
        return [];
      }
    } catch {
      this.messageService.errorBubble('明細查詢錯誤');
      return [];
    }
  };

  /** 立即把目前表單狀態存進 LocalStorage（日期會轉 ISO 字串） */
  private saveQueryToStorage(): void {
    const raw = this.queryForm.getRawValue();
    const payload = JSON.stringify(raw, (k, v) => (v instanceof Date ? v.toISOString() : v));
    localStorage.setItem(this.STORAGE_KEY, payload);
  }

  /** 從 LocalStorage 還原進表單（把 ISO 字串還原成 Date 物件） */
  private restoreQueryFromStorage(): void {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return;

    const parsed = JSON.parse(json, (_k, v) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v);
        return isNaN(d.getTime()) ? v : d;
      }
      return v;
    });

    this.queryForm.patchValue(parsed, { emitEvent: false });
  }

  /** 清除 LocalStorage 內儲存的查詢條件 */
  private clearQueryStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.querySubscription?.unsubscribe();
  }
}
