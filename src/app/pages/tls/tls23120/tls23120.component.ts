/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import saveAs from 'file-saver';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, shareReplay, takeUntil } from 'rxjs/operators';

// 服務與模型
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { RegionService } from '../../../service/basic/querySYS3A00.service';
import { BigCategoryCodeService } from '../../../service/basic/queryTLTBUSTYPE.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatDate,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableReportComponent } from 'src/app/shared/componentkit/table-report/table-report.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

type FilterMode = 'location' | 'busType' | 'org' | 'counter';

@UntilDestroy()
@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  standalone: true,
  imports: [
    CommonModule, RadioButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    MultiSelectComponent, RadiobuttonComponent, InputTextModule, ButtonComponent, TranslateModule,
    CalendarComponent, DropdownComponent, TableReportComponent, ButtonModule, DialogComponent, DialogModule,
  ],
})
export class TLS23120Component extends BasicQueryPageComponent<any> implements OnInit, OnDestroy {
  private readonly QUERY_KEY = this.ProgNo || 'TLS23120';
  private readonly destroy$ = new Subject<void>();

  // ===== 表格與資料集狀態 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  selectedItems: any[] = [];
  dialogVisible = false;
  dialogLoading = false;

  private pendingNavigateAfterQuery = false;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    filterMode: ['counter' as FilterMode],
    TLT_No: [null as string | null],
    bus_type: [],
    ShowBusType: [true],
    tlt_building: [],
    area_no: [[] as string[]],
    tlt_floor: [[] as string[]],
    org_id: [],
    PageSize: [1000],   // ⬅️ 調整為 1000 規格
    PageIndex: [1],     // ⬅️ 調整初始頁碼為 1
  });

  dialogForm = this.formBuilder.group({
    SMTP_No: [null, [Validators.required]],
  });

  // 報表欄位定義
  columns: ReportColumn[] = [
    { field: 'sad_date', header: '銷售日期', format: formatDate },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'org_Name', header: '組織名稱' },
    { field: 'location_no', header: '櫃位' },
    { field: 'tlt_building_name', header: '館別' },
    { field: 'area_name', header: '區域' },
    { field: 'tlt_floor_name', header: '樓層' },
    { field: 'bus_type_name', header: '大分類' },
    { field: 'bus_class_name', header: '中分類' },
    { field: 'bus_sclass_name', header: '小分類' },
  ];

  // ===== 下拉選項選單記憶體 =====
  bus_typeOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly WhetherOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ];

  SMTP_NoOptions = this.dropdown.queryNTY1001_DropDownList();
  private dropdownInit$?: Observable<any>;

  constructor(
    public readonly tls23120Service: TLS23120Service,
    public readonly dropdown: DropdownApiService,
    private readonly counterNameService: CounterNameService,
    private readonly bigCategoryCodeService: BigCategoryCodeService,
    private readonly floorService: FloorService,
    private readonly regionService: RegionService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23120', 'tls/tls23120cru', this.queryForm, (form) => this.onSubmit(form));

    this.initDropdownData();

    // 欄位大分類顯示動態聯動
    this.syncBusTypeColumns(!!this.queryForm.controls.ShowBusType.value);
    this.queryForm.controls.ShowBusType.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        map(v => JSON.stringify(v)),
        distinctUntilChanged()
      )
      .subscribe(v => this.syncBusTypeColumns(!!v));

    const modeCtrl = this.queryForm.controls['filterMode'];
    this.applyFilterMode((modeCtrl.value as FilterMode) ?? 'counter');
    modeCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.applyFilterMode(((value ?? 'counter') as FilterMode));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 載入機制最佳化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      regions: this.regionService.getRegionOptions().pipe(catchError(() => of([]))),
      floors: this.floorService.getFloors().pipe(catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      busTypes: this.bigCategoryCodeService.getSystemTypes().pipe(catchError(() => of([]))),
      orgs: this.tls11010Service.getOrgOptions().pipe(catchError(() => of([]))),
      counters: this.counterNameService.getCounters().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.regionOptions = res.regions || [];
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];
      this.bus_typeOptions = res.busTypes || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
    });
  }

  // ========= 詳情穿透追蹤查詢（分頁亦套用 1000 基準） =========
  override onDetail(event: any): void {
    this.saveQueryForm();
    const val = this.queryForm.getRawValue() as any;

    const payload: any = {
      TXN_Date: this.toDateOnly(event?.sad_date),
      TLT_No: event?.tlt_no,
      ShowBusType: val?.ShowBusType ?? null,
      pageIndex: 1,
      pageSize: 1000, // ⬅️ 同步更新為 1000 規格
    };

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23120Service.queryDetailTLS23120(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService?.unblockUi();
      }))
      .subscribe({
        next: (res: any) => {
          const details = this.extractDetails(res);
          this.data = details.map((r: any, i: number) => {
            const row = this.normalizeRow(r);
            return { ...row, _rowKey: `${row?.TLT_NO ?? ''}|${row?.TXN_DATE ?? ''}|${i}` };
          });

          if (this.pendingNavigateAfterQuery) {
            this.pendingNavigateAfterQuery = false;
            if (!this.data?.length) {
              this.messageService?.warnBubble?.('查無資料');
              return;
            }
            const formRaw = this.queryForm.getRawValue() as any;
            const exportBody = this.buildQueryPayload(event);

            this.router.navigate(['/account/tls/tls23120cru'], {
              state: {
                data: this.data,
                queryFormValue: formRaw,
                pageSize: 1000, // ⬅️ 跳轉資訊同步 1000 規格
                exportBody,
              },
            });
          }
        },
        error: () => {
          this.pendingNavigateAfterQuery = false;
          this.data = [];
        },
      });
  }

  // ========= 查詢主控制器（送出） =========
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: this.toDateOnly(frm.value.TXN_Date),
        pageIndex: 1,
        pageSize: 1000, // ⬅️ 調整為全域指定的 1000 規格
      };

      this.loading = true;
      this.tls23120Service.queryTLS23120(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => { this.loading = false; })
        )
        .subscribe({
          next: (res: any) => {
            this.data = res?.Data || [];
            this.historyRequestBody = body;
            this.totalRecords = res?.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
          }
        });
    });
  }

  onQueryAndOpen(event: any): void {
    if (this.loading) return;
    this.pendingNavigateAfterQuery = true;
    this.onDetail(event);
  }

  // ========= 輔助整理工廠方法群 =========
  private buildQueryPayload(rowData: any): any {
    const val = this.queryForm.getRawValue() as any;
    const payload: any = {
      TXN_Date: this.toDateOnly(rowData?.sad_date),
      TLT_No: rowData?.tlt_no,
      ShowBusType: val?.ShowBusType ?? null,
    };

    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
        delete payload[k];
      }
    });
    return payload;
  }

  private extractDetails(res: any): any[] {
    const out: any[] = [];
    const dataArr = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
    for (const item of dataArr) {
      const subTotalsArr = Array.isArray(item?.SubTotals) ? item.SubTotals : [];
      for (const sub of subTotalsArr) {
        const list = sub?.tLS23120Details ?? sub?.TLS23120Details ?? sub?.tls23120Details ?? [];
        if (!Array.isArray(list)) continue;
        for (const d of list) {
          out.push({
            ...d,
            TLT_ID: sub?.TLT_ID ?? d?.TLT_ID ?? null,
            bus_type: item?.bus_type ?? d?.bus_type ?? null,
            bus_type_name: item?.bus_type_name ?? d?.bus_type_name ?? null,
            sad_date: item?.sad_date ?? d?.sad_date ?? null,
            TLT_NO: item?.TLT_NO ?? d?.TLT_NO ?? null,
            tlt_name: item?.tlt_name ?? d?.tlt_name ?? null,
            floor_desc: item?.floor_desc ?? d?.floor_desc ?? null,
            area_no: item?.area_no ?? d?.area_no ?? null,
            total_count: item?.total_count ?? d?.total_count ?? 0,
            return_qty: item?.return_qty ?? d?.return_qty ?? 0,
            return_amt: item?.return_amt ?? d?.return_amt ?? 0,
            day_lock: item?.day_lock ?? d?.day_lock ?? 'N',
          });
        }
      }
    }
    return out;
  }

  private normalizeRow(r: any) {
    return {
      ...r,
      FLOOR_NO: r?.FLOOR_NO ?? r?.floor_desc ?? null,
      AREA_NO: r?.AREA_NO ?? r?.area_no ?? null,
      TXN_DATE: r?.TXN_DATE ?? r?.sad_date ?? null,
    };
  }

  private syncBusTypeColumns(show: boolean): void {
    const target = new Set(['bus_type', 'bus_type_name']);
    this.columns = this.columns.map(col => target.has(col.field) ? { ...col, visible: !!show } : col);
  }

  private applyFilterMode(mode: FilterMode): void {
    const setGroup = (names: string[], enabled: boolean) => {
      names.forEach(n => {
        const c = this.queryForm.get(n);
        if (!c) return;
        if (enabled) c.enable({ emitEvent: false });
        else {
          c.reset(Array.isArray(c.value) ? [] : undefined, { emitEvent: false });
          c.disable({ emitEvent: false });
        }
      });
    };

    setGroup(['tlt_building', 'area_no', 'tlt_floor'], mode === 'location');
    setGroup(['bus_type'], mode === 'busType');
    setGroup(['org_id'], mode === 'org');
    setGroup(['TLT_No'], mode === 'counter');

    const tlt = this.queryForm.get('TLT_No');
    if (tlt) {
      if (mode === 'counter') tlt.addValidators(Validators.required);
      else {
        tlt.removeValidators(Validators.required);
        tlt.setErrors(null);
      }
      tlt.updateValueAndValidity({ emitEvent: false });
    }
    this.queryForm.updateValueAndValidity({ emitEvent: false });
  }

  // ===== 功能批次執行面板機制 =====
  exportZip(): void {
    const body: any = {
      selectList: this.selectedItems.map(item => ({
        TXN_Date: this.toDateOnly(item.sad_date),
        TLT_No: item.tlt_no,
      }))
    };
    const firstDate = this.selectedItems[0]?.sad_date ? String(this.selectedItems[0].sad_date).replace(/-/g, '') : '';
    const customFileName = `專櫃日對帳單${firstDate}.zip`;

    this.loading = true;
    this.btnLoading = true;

    this.tls23120Service.exportTLS23120Zip(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => { this.btnLoading = false; this.loading = false; })
      )
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body || response], { type: 'application/zip' });
          saveAs(blob, customFileName);
        },
        error: (err) => { console.error('ZIP 匯出失敗:', err); }
      });
  }

  netReport(): void {
    const body: any = {
      selectList: this.selectedItems.map(item => ({
        TXN_Date: this.toDateOnly(item.sad_date),
        TLT_No: item.tlt_no,
      }))
    };
    this.loading = true;
    this.btnLoading = true;

    this.tls23120Service.onlineTLS23120(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => { this.btnLoading = false; this.loading = false; })
      )
      .subscribe(res => {
        this.messageService.successBubble(res.Data || '網路對帳執行成功');
      });
  }

  autoMail(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body: any = {
        SMTP_No: frm.value.SMTP_No,
        selectList: this.selectedItems.map(item => ({
          TXN_Date: this.toDateOnly(item.sad_date),
          TLT_No: item.tlt_no,
          VEN_Name: item.VEN_Name,
          email: item.email,
        }))
      };

      this.loading = true;
      this.btnLoading = true;
      this.dialogLoading = true;

      this.tls23120Service.autoMailTLS23120(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.btnLoading = false;
            this.loading = false;
            this.dialogLoading = false;
            this.dialogVisible = false;
          })
        )
        .subscribe(res => {
          this.messageService.successBubble(res.Message);
        });
    });
  }

  private resetToDefault(): void {
    this.queryForm.reset({
      TXN_Date: this.yesterday, filterMode: 'counter' as FilterMode, TLT_No: null,
      bus_type: null, ShowBusType: true, tlt_building: null, area_no: [], tlt_floor: [], org_id: null,
    }, { emitEvent: false });
    this.applyFilterMode('counter');
    this.syncBusTypeColumns(true);
  }

  private restoreQueryForm(): void {
    try {
      const saved = this.queryStateService.getQueryStateValue(this.QUERY_KEY);
      if (saved) {
        if (saved.TXN_Date) saved.TXN_Date = saved.TXN_Date instanceof Date ? saved.TXN_Date : new Date(saved.TXN_Date);
        this.queryForm.patchValue(saved, { emitEvent: false });
      }
    } catch { }
  }

  private saveQueryForm(): void {
    try {
      this.queryStateService.setQueryState(this.QUERY_KEY, this.queryForm.getRawValue());
    } catch { }
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
