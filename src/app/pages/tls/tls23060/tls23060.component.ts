import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, timeout, debounceTime, takeUntil } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrls: ['./tls23060.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  private readonly STORAGE_KEY = 'TLS23060:queryForm';
  private destroy$ = new Subject<void>();           // ✅ 自動退訂用
  querySubscription: Subscription | null = null;

  data: any[] = [];
  totalRecords = 0;
  showPageSizeDialog = false;
  customPageSize = 1000;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列型欄位改用 control<any[]>([])，避免 never[] 型別
  queryForm = this.formBuilder.group({
  
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }])
  });

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23060Service: TLS23060Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private whetherService: WhetherService,
    private columnLabelService: ColumnLabelService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'TLS23060cru', this.queryForm);

    // ✅ 從 localStorage 還原
    this.restoreQueryFromStorage();

    // ✅ valueChanges：debounce + 自動退訂 儲存查詢條件
    this.queryForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.saveQueryToStorage());

    // ❌ 刪掉錯誤的 'TLS23010_queryForm' 讀取（用 restoreQueryFromStorage 即可）

    // ✅ 下拉資料加 takeUntil，避免 memory leak
    this.whetherService.getWhetherOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.WhetherOptions = data));

    this.typeService.getTypeOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.typeOptions = data));

    this.floorService.getFloors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.floorOptions = data));

    this.tls11010Service.getBuildingOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.BUILDING_NO_Options = data));

    this.tls11010Service.getOrgOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.OrganizationCodeOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.ECRNoService.getECRNo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.ECRNoOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.counterNameService.getCounters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.CounterOptions =
          data?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
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

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize,
    });

    this.loading = true;
    this.messageService.blockUi();

    this.tls23060Service
      .queryTLS23060(queryFormValue)
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
            this.router.navigate(['account/tls/tls23060cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: res.Data || [],
              },
            });
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        },
      });
  }

  private cleanFormPayload(payload: any): any {
    for (const key in payload) {
      const val = payload[key];
      if (val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
        payload[key] = null;
      }
    }

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ECR_No', order: 1 }],
    };
  }

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
