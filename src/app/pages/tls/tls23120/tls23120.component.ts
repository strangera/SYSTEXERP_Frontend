/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
import saveAs from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { debounceTime, distinctUntilChanged, finalize, map, Subject, takeUntil } from 'rxjs';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { RegionService } from '../../../service/basic/querySYS3A00.service';
import { BigCategoryCodeService } from '../../../service/basic/queryTLTBUSTYPE.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

type FilterMode = 'location' | 'busType' | 'org' | 'counter';

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    RadiobuttonComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    DropdownComponent,
    TableReportComponent,
    ButtonModule,
    DialogComponent,
  ],
})
export class TLS23120Component extends BasicQueryPageComponent<any> implements OnInit, OnDestroy {
  private readonly QUERY_KEY = this.ProgNo || 'TLS23120';
  private destroy$ = new Subject<void>();


  data: any[] = [];
  totalRecords = 0;

  btnLoading = false;
  historyRequestBody: any | null = null;

  private pendingNavigateAfterQuery = false;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    filterMode: ['counter' as FilterMode],
    TLT_No: [null as string | null],
    bus_type: [],                 // 大分類（可能單選/多選）
    ShowBusType: true,
    tlt_building: [],             // 館別（可能單選/多選）
    area_no: [[] as string[]],    // 區域（多選）
    tlt_floor: [[] as string[]],  // 樓層（多選）
    org_id: [],                   // 組織（可能單選/多選）
    PageSize: [30],
    PageIndex: [1],
  });
  dialogForm = this.formBuilder.group({
    SMTP_No: [null, [Validators.required]], // 寄件者
  })

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
  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ];
  SMTP_NoOptions = this.dropdown.queryNTY1001_DropDownList();
  selectedItems: any[] = [];
  dialogVisible = false;
  dialogLoading = false;

  constructor(
    public readonly tls23120Service: TLS23120Service,
    public readonly dropdown: DropdownApiService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    // const fromCru = !!history.state?.fromCru;
    this.initializePage('TLS23120', 'tls/tls23120cru', this.queryForm, (form) => this.onSubmit(form));

    // if (fromCru) {
    //   // ✅ 只有從 CRU 回來才還原
    //   this.restoreQueryForm();
    // } else {
    //   // ✅ 其他頁回來：清掉舊狀態 + 回預設
    //   try {
    //     this.queryStateService.clearQueryState(this.QUERY_KEY);
    //   } catch { }
    //   this.resetToDefault();
    // }

    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);

    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    // ShowBusType → 控制欄位顯示（你原本那套）
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
    // ❌ 不要在 destroy 時存查詢條件
    // this.saveQueryForm();

    this.destroy$.next();
    this.destroy$.complete();
  }

  override onDetail(event: any): void {
    this.saveQueryForm();

    // this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;
    // const payload = this.buildQueryPayload(event); // ✅ 查詢需要分頁
    const payload: any = {
      TXN_Date: formatDateToYYYY_MM_DD(event?.sad_date),
      TLT_No: (event?.tlt_no),
      ShowBusType: val?.ShowBusType ?? null,
    };
    // this.historyRequestBody = { ...payload };

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23120Service.queryDetailTLS23120(payload).pipe(
      finalize(() => {
        this.loading = false;
        this.messageService?.unblockUi();
      })
    ).subscribe({
      next: (res: any) => {
        const details = this.extractDetails(res);
        this.data = details.map((r: any, i: number) => {
          const row = this.normalizeRow(r);
          return { ...row, _rowKey: `${row?.TLT_NO ?? ''}|${row?.TXN_DATE ?? ''}|${i}` };
        });

        // this.totalRecords =
        //   (typeof res?.TotalCount === 'number' && res.TotalCount >= 0)
        //     ? res.TotalCount
        //     : this.data.length;

        if (this.pendingNavigateAfterQuery) {
          this.pendingNavigateAfterQuery = false;

          if (!this.data?.length) {
            this.messageService?.warnBubble?.('查無資料');
            return;
          }

          const formRaw = this.queryForm.getRawValue() as any;

          // ✅ 給 CRU：除了 data/queryFormValue/pageSize，再多帶 exportBody
          const exportBody = this.buildQueryPayload(event); // ✅ 匯出不要分頁

          this.router.navigate(['/account/tls/tls23120cru'], {
            state: {
              data: this.data,
              queryFormValue: formRaw,
              pageSize: 30,
              exportBody, // ✅ 新增：CRU 匯出 PDF 直接用這個打後端
            },
          });
        }
      },
      error: () => {
        this.pendingNavigateAfterQuery = false;
        this.data = [];
        // this.totalRecords = 0;
      },
    });
    // });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: formatDateToYYYY_MM_DD(frm.value.TXN_Date),
      };
      this.tls23120Service.queryTLS23120(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.historyRequestBody = body;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  onQueryAndOpen(event: any): void {
    if (this.loading) return;
    this.pendingNavigateAfterQuery = true;
    this.onDetail(event);
  }

  // ========= 核心：組 payload（查詢/匯出共用） =========
  private buildQueryPayload(rowData: any): any {
    const val = this.queryForm.getRawValue() as any;
    // const fm = this.queryForm.controls.filterMode.value as FilterMode;

    const payload: any = {
      TXN_Date: formatDateToYYYY_MM_DD(rowData?.sad_date),
      TLT_No: (rowData?.tlt_no),
      // TLT_No: (fm === 'counter') ? (val?.TLT_No ?? null) : null,
      // tlt_building: (fm === 'location') ? (val?.tlt_building ?? null) : null,
      // area_no: (fm === 'location') ? (Array.isArray(val?.area_no) ? val.area_no : null) : null,
      // tlt_floor: (fm === 'location') ? (Array.isArray(val?.tlt_floor) ? val.tlt_floor : null) : null,
      // bus_type: (fm === 'busType') ? (val?.bus_type ?? null) : null,
      // org_id: (fm === 'org') ? (val?.org_id ?? null) : null,
      ShowBusType: val?.ShowBusType ?? null,
    };

    // if (withPaging) {
    //   payload.pageIndex = 1;
    //   payload.PageSize = 30;
    // }

    // 清除空值
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    return payload;
  }

  // ===== extractDetails / normalizeRow / syncBusTypeColumns / applyFilterMode (保留你原本) =====
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
    this.columns = this.columns.map(col =>
      target.has(col.field) ? { ...col, visible: !!show } : col
    );
  }

  private applyFilterMode(mode: FilterMode): void {
    const setGroup = (names: string[], enabled: boolean) => {
      names.forEach(n => {
        const c = this.queryForm.get(n);
        if (!c) return;
        if (enabled) c.enable({ emitEvent: false });
        else {
          const next = Array.isArray(c.value) ? [] : undefined;
          c.reset(next, { emitEvent: false });
          c.disable({ emitEvent: false });
        }
      });
    };

    const location = ['tlt_building', 'area_no', 'tlt_floor'];
    const busType = ['bus_type'];
    const org = ['org_id'];
    const counter = ['TLT_No'];

    setGroup(location, mode === 'location');
    setGroup(busType, mode === 'busType');
    setGroup(org, mode === 'org');
    setGroup(counter, mode === 'counter');

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
  moneyFormat = (value: any): string =>
    value != null && value !== '' ? Number(value || 0).toLocaleString('en-US') : '0';

  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }


  // TLS23120Component
  private resetToDefault(): void {
    // 先把整個表單回到你想要的預設
    this.queryForm.reset(
      {
        TXN_Date: this.yesterday,
        filterMode: 'counter' as FilterMode,

        TLT_No: null,
        bus_type: null,
        ShowBusType: true,

        tlt_building: null,
        area_no: [],
        tlt_floor: [],
        org_id: null,
      },
      { emitEvent: false },
    );

    // 依預設 filterMode 做 enable/disable + required
    this.applyFilterMode('counter');

    // ShowBusType 預設顯示/隱藏欄位同步一次
    this.syncBusTypeColumns(true);
  }

  private reviveDate(x: any) {
    if (!x) return x;
    const d = new Date(x);
    return isNaN(d.getTime()) ? x : d;
  }

  private restoreQueryForm(): void {
    try {
      const saved = this.queryStateService.getQueryStateValue(this.QUERY_KEY);
      if (saved) {
        if (saved.TXN_Date) saved.TXN_Date = this.reviveDate(saved.TXN_Date);
        this.queryForm.patchValue(saved, { emitEvent: false });
      }
    } catch { }
  }

  private saveQueryForm(): void {
    try {
      const v = this.queryForm.getRawValue();
      this.queryStateService.setQueryState(this.QUERY_KEY, v);
    } catch { }
  }

  /** 只回 YYYY-MM-dd（本地時區） */
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  exportZip() {
    const body: any = {
      selectList: this.selectedItems.map(item => ({
        TXN_Date: formatDateToYYYY_MM_DD(item.sad_date),
        TLT_No: item.tlt_no,
      }))
    };

    const firstDate = this.selectedItems[0].sad_date.replace(/-/g, '');
    const customFileName = `專櫃日對帳單${firstDate}.zip`;
    this.loading = true;
    this.btnLoading = true;
    this.tls23120Service.exportTLS23120Zip(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => [this.btnLoading = false, this.loading = false])
      )
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body || response], { type: 'application/zip' });
          saveAs(blob, customFileName);
        },
        error: (err) => {
          console.error('ZIP 匯出失敗:', err);
        }
      });
  }

  netReport() {
    const body: any = {
      selectList: this.selectedItems.map(item => ({
        TXN_Date: formatDateToYYYY_MM_DD(item.sad_date),
        TLT_No: item.tlt_no,
      }))
    };
    this.loading = true
    this.btnLoading = true;
    this.tls23120Service.onlineTLS23120(body).pipe(untilDestroyed(this), finalize(() => [this.btnLoading = false, this.loading = false])).subscribe(res => {
      this.messageService.successBubble(res.Data || '網路對帳執行成功');
    });
  }

  autoMail(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: any = {
        SMTP_No: frm.value.SMTP_No,
        selectList: this.selectedItems.map(item => ({
          TXN_Date: formatDateToYYYY_MM_DD(item.sad_date),
          TLT_No: item.tlt_no,
          VEN_Name: item.VEN_Name,
          email: item.email,
        }))
      };
      this.loading = true;
      this.btnLoading = true;
      this.dialogLoading = true;
      this.tls23120Service.autoMailTLS23120(body).pipe(untilDestroyed(this), finalize(() => [this.btnLoading = false, this.loading = false, this.dialogLoading = false, this.dialogVisible = false])).subscribe(res => {
        this.messageService.successBubble(res.Message);
      });
    })
  }
}
