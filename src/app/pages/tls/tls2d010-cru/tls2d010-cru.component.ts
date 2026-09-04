import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin, map, of } from 'rxjs';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { formatDate as columnDateFormat, formatDateToYYYY_MM_DD } from '../../../others/component/table/table.model';
import { IAPS1003Item, IDropdownItem, ITalentOption } from './../../../service/utility/dropDownList.service';

@UntilDestroy()
@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  standalone: true,
  imports: [
    TableEditComponent, CalendarComponent, InputTextComponent, RadiobuttonComponent, MenubarComponent,
    PanelModule, ReactiveFormsModule, DropdownComponent,
    InputNumberComponent, ButtonComponent, NgIf, TranslateModule,
    DialogComponent, TableReportComponent,
  ],
})
export class TLS2D010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild('counterTable') counterTable?: TableEditComponent;
  @ViewChild('normalTable') normalTable?: TableEditComponent;
  private setTableRowMapping(row: any) {
    if (!row.CAP_Item) return;

    const candidates = this.CAP_ItemOptions
      ? this.CAP_ItemOptions.filter(it => !row.CAP_Type || it.CAP_Type === row.CAP_Type)
      : [];

    const match = candidates.find((it: any) => {
      if (String(it.CAP_Item) === String(row.CAP_Item)) return true;
      if (String((it as any).value) === String(row.CAP_Item)) return true;
      return false;
    });

    if (!match) return;

    row.AccNo = match.AccNo ? String(match.AccNo).trim() : '';
    row.GUI_FLAG = match.GUI_FLAG ?? null;
    row.cap_taxtype =
      match.CAP_TaxType != null ? String(match.CAP_TaxType) : null;
  }

  currentCreateType: 'normal' | 'counter' = 'counter';
  isDetailMode = false;
  // 當讀取後端資料時，若需要把 GUI_FLAG 設為唯讀，使用此旗標控制
  guiFlagReadonly = false;
  data: any[] = [];
  // 各模式獨立選取狀態，避免互相干擾
  counterSelectedItems: any[] = [];
  normalSelectedItems: any[] = [];

  // 下拉選單
  tlt_noOptions: ITalentOption[] = [];
  pod_noOptions: any[] = [];
  org_idOptions: IDropdownItem[] = [];
  CAP_TypeOptions = getSYS1000Options('CAP_Type');
  CAP_ItemOptions: IAPS1003Item[] = [];
  FilterCAP_ItemOptions: { value: string; label: string; data: IAPS1003Item }[] = [];
  AccNoOptions: IDropdownItem[] = [];
  GuiFlagOptions = getSYS1000Options('YES_NO');
  cap_taxtypeOptions = getSYS1000Options('CAP_TaxType');

  columnsCounter: EditColumn[] = [];
  columnsNormal: EditColumn[] = [];

  // 本頁專用：提供給 table-edit 的唯一列 key
  private rowIdCounter = 1;
  // 月結鎖定年月快取（格式 yyyymm 整數）
  private maxClsMonthNum: number | null = null;
  // 拋轉狀態快取（key 為 yyyymm 整數，value 為 Trans_Status）
  private transStatusMap = new Map<number, string>();

  // 專櫃選擇 Dialog 相關
  talentDialogVisible = false;
  talentDialogLoading = false;
  talentDialogData: any[] = [];
  selectedTalents: any[] = [];
  talentDialogQueryForm = this.formBuilder.group({
    tlt_no: [null],
    tpy_date: [null as Date | null],
  });
  talentDialogColumns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'apply_no', header: '招募編號' },
    { field: 'contract_subno', header: '版次' },
    { field: 'tlt_contract_bdate', header: '契約起日', format: columnDateFormat },
    { field: 'tlt_contract_edate', header: '契約迄日', format: columnDateFormat },
  ];
  talentTotalRecords = 0;
  talentLastQueryBody: any | null = null;

  // 專櫃模式（counter）：專櫃編號/名稱改為唯讀顯示，實際值仍存在 dataFormCounter.tlt_no
  counterTltDisplayControl = new FormControl('');

  // 表單
  dataFormCounter = this.formBuilder.group({
    tlt_no: [null as any],
    CAP_Item: [''],
    AccNo: [''],
    // org_id should be editable in counter mode so users can change or see the org selection.
    org_id: [null],
    tpy_date: [null],
    GUI_FLAG: [''],
    tpy_net: [null],
    remarks: [''],
    pod_no: [],
    totalCash: [{ value: null, disabled: true }, [Validators.required]],
    apply_no: [{ value: null, disabled: true }],
    contract_subno: [{ value: null, disabled: true }],
    tlt_contract_bdate: [{ value: null as string | null, disabled: true }],
    tlt_contract_edate: [{ value: null as string | null, disabled: true }],
  });

  dataFormNormal = this.formBuilder.group({
    tlt_no: [null as any],
    pod_no: [],
    CAP_Type: [],
    tpy_date: [null as null | Date, [Validators.required]],
    CAP_Item: [null, [Validators.required]],
    CAP_Name: [{ value: null as string | null, disabled: true }],
    tpy_net: [],
    cap_taxtype: [{ value: null as string | null, disabled: true }],
    GUI_FLAG: [null as string | null],
    AccNo: [{ value: null as string | null, disabled: true }],
    org_id: [],
    remarks: [''],
  });

  /** 本地取消：清空表單下方的扣款項目清單（table 資料） */
  onLocalCancel(mode: 'counter' | 'normal'): void {
    this.data = [];
    if (mode === 'counter') {
      this.counterSelectedItems = [];
    } else {
      this.normalSelectedItems = [];
    }
    try {
      this.updateTotalCash();
    } catch {
      // 忽略錯誤，避免因尚未初始化造成例外
    }
  }

  constructor(
    private readonly dropdown: DropdownApiService,
    private tls2d010Service: Tls2d010Service
  ) {
    super();
  }

  /** 確保每筆 row 都有唯一的 rowId，供 dataKey 使用（只影響本頁） */
  private ensureRowIds(rows: any[]): any[] {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => {
      if (!row.rowId) {
        row.rowId = this.rowIdCounter++;
      }
      return row;
    });
  }

  // 開啟專櫃選擇視窗
  onOpenTalentDialog(): void {
    if (this.isDetailMode) {
      return;
    }
    this.talentDialogVisible = true;
    this.loadTalentDialogData();
  }

  /** 依現有選擇的資料項目，組出跟 tlt_noOptions 一致的物件結構（label、契約期間格式化、org_id） */
  private mapTalentItemToOption(item: ITalentOption): ITalentOption {
    return {
      ...item,
      label: `${item.tlt_no}-${item.tlt_name}-${item.contract_subno}`,
      tlt_contract_bdate: item.tlt_contract_bdate
        ? (this.parseBackendDate(item.tlt_contract_bdate) ? formatDate(this.parseBackendDate(item.tlt_contract_bdate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
      tlt_contract_edate: item.tlt_contract_edate
        ? (this.parseBackendDate(item.tlt_contract_edate) ? formatDate(this.parseBackendDate(item.tlt_contract_edate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
      org_id: item.org_id ?? null,
    };
  }

  private loadTalentDialogData(): void {
    this.talentDialogLoading = true;
    // 將畫面的扣款日期同步到開窗的扣款日期（counter 模式看 dataFormCounter，normal 模式看 dataFormNormal）
    const normalTpyDate = this.currentCreateType === 'counter'
      ? this.dataFormCounter.get('tpy_date')?.value ?? null
      : this.dataFormNormal.get('tpy_date')?.value ?? null;
    this.talentDialogQueryForm.patchValue({ tpy_date: normalTpyDate });
    const formTpyDate = this.talentDialogQueryForm.get('tpy_date')?.value ?? null;
    if (!formTpyDate) {
      this.talentDialogData = [];
      this.talentTotalRecords = 0;
      this.selectedTalents = [];
      this.talentDialogLoading = false;
      return;
    }
    const body: any = {
      tlt_date: formTpyDate ? formatDateToYYYY_MM_DD(formTpyDate) : null,
    };
    this.talentLastQueryBody = body;
    this.tls2d010Service
      .queryTLS2D010TLTTALENTList({ ...body })
      .pipe(untilDestroyed(this), finalize(() => (this.talentDialogLoading = false)))
      .subscribe((res: any) => {
        const raw = res?.Data ?? [];
        this.talentDialogData = raw;
        this.talentTotalRecords = res?.TotalCount ?? raw.length;
        this.selectedTalents = [];
      });
  }
  // 提供給 app-table-report 的查詢函式（滾動載入下一頁專櫃資料）
  queryTalentDialog = (body: any) => {
    // 若 dialog 上方有輸入 tlt_no，轉成 tlt_noList
    try {
      const val: any = this.talentDialogQueryForm?.get('tlt_no')?.value;
      let tlt_noList: string[] | undefined;
      if (val != null) {
        if (Array.isArray(val)) {
          tlt_noList = (val as any[]).map((v: any) => this.normalizeValue(v)).filter((x: any) => !!x) as string[];
        } else {
          const nv = this.normalizeValue(val);
          if (nv) tlt_noList = [nv];
        }
      }
      const payload = { ...body, ...(tlt_noList ? { tlt_noList } : {}) };
      return this.tls2d010Service.queryTLS2D010TLTTALENTList(payload);
    } catch (e) {
      return this.tls2d010Service.queryTLS2D010TLTTALENTList({ ...body });
    }
  };

  // Dialog 查詢表單提交（只用於專櫃編號簡易查詢）
  onTalentDialogQuery(form: any): void {
    const tltNoVal: any = form?.value?.tlt_no ?? null;
    const tpyDateVal: any = form?.value?.tpy_date ?? null;
    this.talentDialogLoading = true;
    const normalizedVal = tltNoVal ? this.normalizeValue(tltNoVal) : null;
    const tlt_noList = normalizedVal ? [normalizedVal] : null;
    const body: any = {
      tlt_date: tpyDateVal ? formatDateToYYYY_MM_DD(tpyDateVal) : null,
      ...(tlt_noList ? { tlt_noList } : {}),
    };
    this.talentLastQueryBody = body;
    this.tls2d010Service.queryTLS2D010TLTTALENTList(body)
      .pipe(untilDestroyed(this), finalize(() => (this.talentDialogLoading = false)))
      .subscribe((res: any) => {
        const raw = res?.Data ?? [];
        this.talentDialogData = raw;
        this.talentTotalRecords = res?.TotalCount ?? raw.length;
        this.selectedTalents = [];
      });
  }

  // Dialog 列是否可選
  isTalentRowSelectable(row: any): boolean {
    if (!row || !this.data || !this.data.length) {
      return true;
    }
    const target = row.tlt_no != null ? String(row.tlt_no) : '';
    if (!target) {
      return true;
    }
    return !this.data.some(existing => {
      const v = existing.tlt_no;
      if (!v) { return false; }
      if (typeof v === 'object') {
        const key = v.tlt_no ?? v.No ?? v.value;
        return key != null && String(key) === target;
      }
      return String(v) === target;
    });
  }

  // 選取的專櫃加入「新增扣款」table 資料
  onTalentDialogSave(): void {
    if (!this.selectedTalents || this.selectedTalents.length === 0) {
      this.talentDialogVisible = false;
      return;
    }
    // 僅在一般扣款模式下處理
    if (this.currentCreateType !== 'normal') {
      this.talentDialogVisible = false;
      this.selectedTalents = [];
      return;
    }
    const tpyDate = this.talentDialogQueryForm.get('tpy_date')?.value ?? null;
    const tpyNet = this.dataFormNormal.get('tpy_net')?.value ?? null;

    const newRows = this.selectedTalents.map((item: any) => {
      const matchedOption = this.tlt_noOptions.find(opt => opt.tlt_no === item.tlt_no || opt.No === item.tlt_no);
      const tltValue = matchedOption ?? this.mapTalentItemToOption(item);
      return {
        rowId: this.rowIdCounter++,
        tlt_no: tltValue,
        tpy_date: tpyDate,
        tpy_net: tpyNet,
        remarks: '',
        status: 'new',
      };
    });
    const baseData = Array.isArray(this.data)
      ? this.data.filter(row => {
        if (row._isAutoInsertCandidate) return false;
        const noTlt = !row.tlt_no;
        const noContract = !row.contract_no && !row.contract_subno;
        const noOrg = !row.org_id;
        const noAmount = row.tpy_net === null || row.tpy_net === undefined || row.tpy_net === '';
        const noDate = !row.tpy_date;
        return !(noTlt && noContract && noOrg && noAmount && noDate);
      })
      : [];
    const updatedData = this.ensureRowIds([...baseData, ...newRows]);
    this.onCounterDataChange(updatedData);
    this.talentDialogVisible = false;
    this.selectedTalents = [];
  }

  // 專櫃模式：點選 Dialog 內某一列，直接代入原本下拉選到會代入的欄位（比照 dataFormCounter.tlt_no 的 valueChanges 邏輯）
  onTalentDialogRowClick(row: ITalentOption): void {
    if (this.currentCreateType !== 'counter') {
      return;
    }
    const tltOption = this.mapTalentItemToOption(row);
    this.dataFormCounter.get('tlt_no')?.setValue(tltOption);
    this.talentDialogVisible = false;
    this.selectedTalents = [];
  }

  ngOnInit(): void {
    this.initMaxClsMonth(); // 取得月結鎖定年月
    this.initTransStatus(); // 取得各年月拋轉狀態
    this.dataFormNormal.get('tpy_date')?.valueChanges.subscribe((date: any) => {
      this.syncNormalTpyDateToRows(date);
    });
    // counter 模式：監聽表單上的扣款日期變更，嘗試驗證（會用於 header 日期變動時）
    this.dataFormCounter.get('tpy_date')?.valueChanges.subscribe((date: any) => {
      // 讓 existing rows 更新（若需要），並做驗證
      if (this.currentCreateType === 'counter') {
        // 若 header 日期變動，先把變更帶回 rows（若有未填的 row）
        if (Array.isArray(this.data) && this.data.length) {
          this.data.forEach(row => {
            if (!row.tpy_date) row.tpy_date = date ?? null;
          });
          this.data = [...this.data];
        }
        this.runInstantValidation();
      }
    });
    // normal 模式：當上方表單的扣款金額變更時，預設同步到下方所有明細列
    this.dataFormNormal.get('tpy_net')?.valueChanges.subscribe((amount: any) => {
      this.syncNormalTpyNetToRows(amount);
    });
    // 把 router 帶進來的 rowdata 拿來做初始化
    const rowdata = history.state?.rowdata;
    if (rowdata) {
      this.currentCreateType = rowdata.type;
      const form = this.currentCreateType === 'counter' ? this.dataFormCounter : this.dataFormNormal;
      this.initializePage('TLS2D010', form);
      if (this.crudstatus === CRUDStatus.Read) {
        this.isDetailMode = true;
      }
      // 若有從 router 帶入的資料，視為已讀取後端資料，將 GUI_FLAG 設為唯讀
      this.guiFlagReadonly = true;
      try {
        this.dataFormCounter.get('GUI_FLAG')?.disable({ emitEvent: false });
      } catch { }
      try {
        this.dataFormNormal.get('GUI_FLAG')?.disable({ emitEvent: false });
      } catch { }
      const counterMapping = (row: any) => {
        if (row.tlt_no && typeof row.tlt_no === 'object') {
          return {
            contract_no: row.tlt_no.contract_no ?? '',
            contract_subno: row.tlt_no.contract_subno ?? '',
            apply_no: row.tlt_no.apply_no ?? '',
            org_id: row.tlt_no.org_id ?? '',
            tlt_contract_bdate: row.tlt_no.tlt_contract_bdate
              ? (this.parseBackendDate(row.tlt_no.tlt_contract_bdate) ? formatDate(this.parseBackendDate(row.tlt_no.tlt_contract_bdate) as Date, 'yyyy/MM/dd', 'en-US') : null)
              : null,
            tlt_contract_edate: row.tlt_no.tlt_contract_edate
              ? (this.parseBackendDate(row.tlt_no.tlt_contract_edate) ? formatDate(this.parseBackendDate(row.tlt_no.tlt_contract_edate) as Date, 'yyyy/MM/dd', 'en-US') : null)
              : null,
          };
        }
        return {};
      };
      if (Array.isArray(rowdata)) {
        form.patchValue(rowdata[0]);
        this.data = this.ensureRowIds(rowdata.map(row => ({ ...row, ...counterMapping(row) })));
      } else {
        form.patchValue(rowdata);
        this.data = this.ensureRowIds([{ ...rowdata, ...counterMapping(rowdata) }]);
      }
    }

    this.loadTltAndPodOptions();
    this.loadAndSetupColumns();


    this.dataFormCounter.get('tlt_no')?.valueChanges.subscribe((selected: any) => {
      this.counterTltDisplayControl.setValue(selected?.label ?? '', { emitEvent: false });
      if (selected) {
        this.dataFormCounter.patchValue({
          apply_no: selected.apply_no ?? '',
          contract_subno: selected.contract_subno ?? '',
          tlt_contract_bdate: selected.tlt_contract_bdate
            ? (this.parseBackendDate(selected.tlt_contract_bdate) ? formatDate(this.parseBackendDate(selected.tlt_contract_bdate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
          tlt_contract_edate: selected.tlt_contract_edate
            ? (this.parseBackendDate(selected.tlt_contract_edate) ? formatDate(this.parseBackendDate(selected.tlt_contract_edate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
          org_id: selected.org_id ?? '',
        }, { emitEvent: false });
        if (this.data && this.data.length) {
          this.data.forEach(row => {
            if ((row.tlt_no && row.tlt_no.tlt_no === selected.tlt_no) || !row.tlt_no) {
              row.org_id = selected.org_id ?? '';
            }
          });
          this.data = Array.isArray(this.data) ? [...this.data] : this.data;
        }
      }
    });
    this.dataFormNormal.get('tlt_no')?.valueChanges.subscribe((selected: any) => {
      if (selected) {
        // normalize selected to object when possible
        let sel: any = selected;
        if (typeof sel === 'object' && sel.value) sel = sel.value;
        if (typeof sel === 'string') {
          const found = this.tlt_noOptions.find(opt => opt.tlt_no === sel || opt.No === sel || opt.value === sel);
          if (found) sel = found;
        }

        if (this.data && this.data.length) {
          this.data.forEach(row => {
            if ((row.tlt_no && row.tlt_no.tlt_no === sel.tlt_no) || !row.tlt_no) {
              row.org_id = sel.org_id ?? '';
            }
          });
          this.data = Array.isArray(this.data) ? [...this.data] : this.data;
        }
      }
    });
  }

  /** 初始化月結鎖定 */
  private initMaxClsMonth() {
    this.tls2d010Service.queryMaxClsMonth().pipe(untilDestroyed(this)).subscribe(res => {
      this.maxClsMonthNum = this.parseLockYmFromResponse(res);
    });
  }

  /** 初始化各年月拋轉狀態 */
  private initTransStatus() {
    this.tls2d010Service.queryTransStatusTLS2D010().pipe(untilDestroyed(this)).subscribe(res => {
      const raw = res?.Data ?? [];
      this.transStatusMap = new Map(
        raw.map(item => [Number(item.Trans_yyyymm), item.Trans_Status])
      );
    });
  }

  // ===== 載入選單 =====
  private loadTltAndPodOptions(): void {
    forkJoin({
      tlt: this.currentCreateType === 'counter' ? this.tls2d010Service.queryTLS2D010TLTTALENTList() : of(null),
      pod: this.dropdown.queryTALPORDERM_DropDownList(),
      acc: this.dropdown.queryGls1005(),
      org: this.dropdown.querySys3100(),
      capItem: this.dropdown.queryAps1003ForTls2d010({ CAP_ItemList: [] })
    })
      .pipe(untilDestroyed(this))
      .subscribe(({ tlt, pod, acc, org, capItem }) => {
        this.tlt_noOptions = (tlt?.Data || []).map((item: ITalentOption) => this.mapTalentItemToOption(item));

        this.pod_noOptions = (pod || []).map((item: any) => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));

        this.AccNoOptions = (acc || []).map((item: any) => ({
          No: item.No,
          Name: item.Name,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));
        this.org_idOptions = (org || []).map((item: any) => ({
          No: item.No,
          Name: item.Name,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));

        this.CAP_ItemOptions = (capItem || []).filter(item => item.CAP_Type !== '0');
        this.FilterCAP_ItemOptions = this.CAP_ItemOptions.map(item => ({
          value: item.CAP_Item, label: `${item.CAP_Item}-${item.CAP_Name}`, data: item
        }));

        const normalizeTltValue = (val: any) => {
          if (!val) return val;
          if (typeof val === 'object') return val;
          // try to match by tlt_no or No
          const found = this.tlt_noOptions.find(opt => opt.tlt_no === val || opt.No === val || opt.value === val || opt.tlt_no === (val as any));
          return found || val;
        };

        // counter form control
        const counterCtrl = this.dataFormCounter.get('tlt_no');
        if (counterCtrl) {
          const v = counterCtrl.value;
          const n = normalizeTltValue(v);
          if (n !== v) {
            counterCtrl.setValue(n, { emitEvent: false });
          }
          this.counterTltDisplayControl.setValue(n?.label ?? '', { emitEvent: false });
        }

        const normalCtrl = this.dataFormNormal.get('tlt_no');
        if (normalCtrl) {
          const v = normalCtrl.value;
          const n = normalizeTltValue(v);
          if (n !== v) {
            normalCtrl.setValue(n, { emitEvent: false });
          }
        }

        if (this.data && Array.isArray(this.data) && this.data.length) {
          this.data = this.ensureRowIds(this.data.map(row => {
            const n = normalizeTltValue(row.tlt_no);
            const orgFromTlt = (n && typeof n === 'object') ? (n.org_id ?? '') : row.org_id;
            return { ...row, tlt_no: n, org_id: row.org_id || orgFromTlt };
          }));
        }

        const formatToYMD = (val: any) => {
          const d = this.parseBackendDate(val);
          return d ? formatDate(d, 'yyyy/MM/dd', 'en-US') : null;
        };

        const bCtrl = this.dataFormCounter.get('tlt_contract_bdate');
        const eCtrl = this.dataFormCounter.get('tlt_contract_edate');
        if (bCtrl && bCtrl.value) {
          const formatted = formatToYMD(bCtrl.value);
          if (formatted !== bCtrl.value) bCtrl.setValue(formatted, { emitEvent: false });
        }
        if (eCtrl && eCtrl.value) {
          const formatted = formatToYMD(eCtrl.value);
          if (formatted !== eCtrl.value) eCtrl.setValue(formatted, { emitEvent: false });
        }

        // 同步更新 table rows裡的 tlt_contract_* 欄位（如果有）
        if (this.data && Array.isArray(this.data) && this.data.length) {
          this.data = this.ensureRowIds(this.data.map(row => ({
            ...row,
            tlt_contract_bdate: row.tlt_contract_bdate ? formatToYMD(row.tlt_contract_bdate) : row.tlt_contract_bdate,
            tlt_contract_edate: row.tlt_contract_edate ? formatToYMD(row.tlt_contract_edate) : row.tlt_contract_edate,
          })));
        }

        const normalizeAcc = (val: any) => {
          if (!val && val !== 0) return val;
          if (typeof val === 'string' || typeof val === 'number') return String(val);
          // if it's an object like { No: '730011', Name: '...' }
          if (typeof val === 'object') return val.No ?? val.value ?? null;
          return val;
        };

        // form controls
        const accCtrlCounter = this.dataFormCounter.get('AccNo');
        if (accCtrlCounter) {
          const v = accCtrlCounter.value;
          const n = normalizeAcc(v);
          if (n !== v) accCtrlCounter.setValue(n, { emitEvent: false });
        }
        const accCtrlNormal = this.dataFormNormal.get('AccNo');
        if (accCtrlNormal) {
          const v = accCtrlNormal.value;
          const n = normalizeAcc(v);
          if (n !== v) accCtrlNormal.setValue(n, { emitEvent: false });
        }

        // table rows
        if (this.data && Array.isArray(this.data) && this.data.length) {
          this.data = this.ensureRowIds(this.data.map(row => ({
            ...row,
            AccNo: row.AccNo ? normalizeAcc(row.AccNo) : row.AccNo
          })));
        }

        this.loadAndSetupColumns();
        this.updateTotalCash();
      });
  }

  // ===== 欄位設定 =====
  private loadAndSetupColumns(): void {
    if (this.currentCreateType === 'counter') {
      this.columnsCounter = [
        {
          field: 'tpy_date',
          header: '扣款日期',
          type: 'date',
          width: '8rem',
          validate: [validateRequired]
        },
        {
          field: 'CAP_Item',
          header: '扣款項目',
          type: 'dropdown',
          width: '16rem',
          optionLabel: 'label',
          optionValue: 'value',
          validate: [validateRequired],
          options: () => {
            return this.CAP_ItemOptions.map(item => ({
              value: item.CAP_Item,
              label: `${String(item.CAP_Item ?? '').trim()}-${item.CAP_Name ?? ''}`,
              data: item
            }));
          }
        },
        {
          field: 'AccNo',
          header: '會計科目',
          type: 'dropdown',
          width: '20rem',
          options: this.AccNoOptions,
          optionLabel: 'label',
          optionValue: 'No',
          disabled: () => true
        },
        // { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '6rem', options: this.GuiFlagOptions, optionLabel: 'label', optionValue: 'value', disabled: () => this.guiFlagReadonly },
        { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '6rem', options: this.cap_taxtypeOptions, optionLabel: 'label', optionValue: 'value', disabled: () => true },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '10rem', textAlign: 'right' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    } else {
      this.columnsNormal = [
        // tlt_no 保持以物件為值 (包含 contract/org 等)，因此不設定 optionValue（以物件方式綁定）
        {
          field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', optionsAsync: true,
          triggerFields: ['tpy_date'],
          options: (rowData: any) => {
            if (!rowData?.tpy_date) {
              return of([]);
            }
            return this.tls2d010Service.queryTLS2D010TLTTALENTList({
              tlt_date: formatDateToYYYY_MM_DD(rowData.tpy_date)
            }).pipe(
              map(res => {
                const items = res?.Data || [];
                return items.map(item => ({
                  ...item,
                  label: `${item.tlt_no}-${item.tlt_name}-${item.contract_subno}`,
                  tlt_contract_bdate: item.tlt_contract_bdate
                    ? (this.parseBackendDate(item.tlt_contract_bdate) ? formatDate(this.parseBackendDate(item.tlt_contract_bdate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
                  tlt_contract_edate: item.tlt_contract_edate
                    ? (this.parseBackendDate(item.tlt_contract_edate) ? formatDate(this.parseBackendDate(item.tlt_contract_edate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
                  org_id: item.org_id ?? null,
                }));
              })
            );
          },
          showClear: false,
          optionLabel: 'label',
          width: '15rem', validate: [validateRequired]
        },
        { field: 'apply_no', header: '招募編號', type: 'input', width: '1rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'input', width: '1rem', disabled: () => true },
        { field: 'org_id', header: '組織代號/名稱', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, optionLabel: 'label', optionValue: 'value', width: '18rem' },
        {
          field: 'tpy_date',
          header: '扣款日期',
          type: 'date',
          width: '12rem',
          calculate: () => {
            // 扣款日期改變時，該列的專櫃需要重選，一併清空跟著專櫃帶出來的欄位，避免殘留舊資料
            return { tlt_no: null, contract_no: '', contract_subno: '', apply_no: '', org_id: '' };
          },
          validate: [
            (value: any, rowData: any, data: any[], field: string, header: string) => {
              const isValid = !!value;
              return { isValid, errorMessage: isValid ? [] : [`${header}為必填`] };
            }
          ]
        },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem', textAlign: 'right' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    }
  }

  // ===== normal: 扣款類型切換 =====
  onCAP_TypeChange(type: string): void {
    this.FilterCAP_ItemOptions = this.CAP_ItemOptions
      .filter(item => item.CAP_Type === type)
      .map(item => ({ value: item.CAP_Item, label: `${item.CAP_Item}-${item.CAP_Name}`, data: item }));

    this.dataFormNormal.patchValue({ CAP_Item: null, CAP_Name: null, AccNo: null, GUI_FLAG: null, cap_taxtype: null });
  }

  // ===== normal: 扣款項目切換 =====
  onCAP_ItemChange(selectedCAP_Item: string): void {
    const selected = this.FilterCAP_ItemOptions.find(opt => opt.value === selectedCAP_Item);

    let accValue: string | null = null;
    if (selected && selected.data?.AccNo) {
      const accNoCode = String(selected.data.AccNo).trim();
      const accOption = this.AccNoOptions.find(opt => {
        const optValue = opt.value != null ? String(opt.value).trim() : null;
        const optNo = opt.No != null ? String(opt.No).trim() : null;
        return optValue === accNoCode || optNo === accNoCode;
      });

      if (accOption) {
        accValue = (accOption.value != null ? String(accOption.value) : (accOption.No != null ? String(accOption.No) : accNoCode));
      } else {
        accValue = accNoCode;
      }
    }

    // 同步將後端回傳欄位帶入上方表單（包含 CAP_Type/ CAP_Name / AccNo / GUI_FLAG / cap_taxtype）
    this.dataFormNormal.patchValue(selected ? {
      CAP_Type: selected.data.CAP_Type,
      CAP_Name: selected.data.CAP_Name,
      AccNo: accValue,
      GUI_FLAG: selected.data.GUI_FLAG,
      cap_taxtype: selected.data.CAP_TaxType != null ? String(selected.data.CAP_TaxType) : selected.data.CAP_TaxType
    } as any : { CAP_Type: null, CAP_Name: null, AccNo: null, GUI_FLAG: null, cap_taxtype: null } as any);
  }
  // table-edit 的資料有變動時會觸發
  onCounterDataChange(updatedData: any[]): void {
    this.data = this.ensureRowIds(updatedData ?? []);
    // counter模式 table-edit mapping
    if (this.currentCreateType === 'counter') {
      this.data.forEach(row => this.setTableRowMapping(row));
      this.updateTotalCash(); // 更新總金額（使用共用方法）
    } else {
      const formTpyDate = this.dataFormNormal.get('tpy_date')?.value ?? null;
      this.data.forEach(row => {
        // 選專櫃編號，帶入對應預設值（但不覆蓋使用者已修改的 org_id)
        if (row.tlt_no) {
          row.org_id = row.tlt_no.org_id ?? '';
          row.contract_no = row.tlt_no.contract_no ?? '';
          row.contract_subno = row.tlt_no.contract_subno ?? '';
          row.apply_no = row.tlt_no.apply_no ?? '';
        } else {
          row.org_id = '';
          row.contract_no = '';
          row.contract_subno = '';
          row.apply_no = '';
        }
        // 若該列尚未有扣款日期，且表單已有選擇日期，則自動帶入
        if (formTpyDate && !row.tpy_date) {
          row.tpy_date = formTpyDate;
        }
      });
      // 讓 table-edit 感知資料變更，立即更新 UI
      this.data = Array.isArray(this.data) ? [...this.data] : this.data;
    }
    // --- 觸發即時日期校驗 (通用) ---
    this.runInstantValidation();
  }

  onFieldChange(event: { field?: string, rowData: any, index?: number }) {
    if (this.currentCreateType === 'normal' && event.field === 'tlt_no') {
      // 只處理被改動的那一列，避免覆蓋其他列已存在的資料
      const row = event.rowData;
      if (row.tlt_no) {
        row.org_id = row.tlt_no.org_id ?? '';
        row.contract_no = row.tlt_no.contract_no ?? '';
        row.contract_subno = row.tlt_no.contract_subno ?? '';
        row.apply_no = row.tlt_no.apply_no ?? '';
      } else {
        row.org_id = '';
        row.contract_no = '';
        row.contract_subno = '';
        row.apply_no = '';
      }
      // 換新陣列參考，確保 table-edit (OnPush) 能立即感知並重繪
      this.data = Array.isArray(this.data) ? [...this.data] : this.data;
    }
  }

  /**
 * 即時驗證：檢查 Table 內每一筆資料的扣款日期是否合法
 */
  private runInstantValidation(): void {
    const rowsToCheck = this.data.filter(r => !r._isAutoInsertCandidate);
    if (!rowsToCheck.length) return;

    const normalValue = this.dataFormNormal.getRawValue();
    const counterValue = this.dataFormCounter.getRawValue();

    for (const row of rowsToCheck) {
      // 1. 取得扣款日期 (優先拿 row 自己的，沒有才拿表單的)
      const tpyDateRaw = row.tpy_date || (this.currentCreateType === 'counter' ? counterValue.tpy_date : normalValue.tpy_date);
      if (!tpyDateRaw) continue; // 尚未填寫則跳過即時檢查

      const d = this.parseBackendDate(tpyDateRaw) ?? new Date(tpyDateRaw);
      if (!d || isNaN(d.getTime())) continue;

      // 2. 校驗月結鎖定、拋轉狀態
      const tpyYm = d.getFullYear() * 100 + (d.getMonth() + 1);
      if (this.maxClsMonthNum != null) {
        if (tpyYm <= this.maxClsMonthNum) {
          this.messageService.errorBubble(`扣款年月 ${tpyYm} 需大於月結鎖定年月 ${this.maxClsMonthNum}`);
          return;
        }
      }
      if (this.transStatusMap.get(tpyYm) === 'Y') {
        this.messageService.errorBubble(`${tpyYm} 已拋轉 無法再輸入扣款資料`);
        return;
      }

      // 3. 取得專櫃資訊
      const rowTlt = row.tlt_no || (this.currentCreateType === 'counter' ? counterValue.tlt_no : normalValue.tlt_no);
      if (!rowTlt) continue;

      // 4. 取得契約期間
      // Normal 模式要拿每一筆專櫃自己的 buildTltInfo
      const fullTlt = this.buildTltInfo(rowTlt, row.pod_no || (this.currentCreateType === 'counter' ? counterValue.pod_no : normalValue.pod_no));
      const bDate = this.currentCreateType === 'counter' ? counterValue.tlt_contract_bdate : fullTlt.tlt_contract_bdate;
      const eDate = this.currentCreateType === 'counter' ? counterValue.tlt_contract_edate : fullTlt.tlt_contract_edate;

      const contractB = this.parseBackendDate(bDate);
      const contractE = this.parseBackendDate(eDate);

      if (contractB && contractE) {
        const start = new Date(contractB.getFullYear(), contractB.getMonth(), contractB.getDate(), 0, 0, 0, 0);
        const end = new Date(contractE.getFullYear(), contractE.getMonth(), contractE.getDate(), 23, 59, 59, 999);
        if (d < start || d > end) {
          this.messageService.errorBubble(
            `扣款日期 ${formatDate(d, 'yyyy/MM/dd', 'en-US')} 不在專櫃 ${fullTlt.tlt_no} 的契約期間內 ${formatDate(start, 'yyyy/MM/dd', 'en-US')} ~ ${formatDate(end, 'yyyy/MM/dd', 'en-US')}`
          );
          return;
        }
      }
    }
  }

  /** 計算所有 tpy_net 的總和並回填到 dataFormCounter.totalCash */
  private updateTotalCash(): void {
    try {
      if (!this.data || !Array.isArray(this.data)) return;
      const total = this.data
        .filter(i => !i._isAutoInsertCandidate)
        .reduce((sum, i) => sum + Number(i.tpy_net ?? 0), 0);
      const totalCtrl = this.dataFormCounter.get('totalCash');
      if (totalCtrl) {
        totalCtrl.setValue(total, { emitEvent: false });
      }
    } catch (e) {
      console.warn('updateTotalCash error', e);
    }
  }

  /** normal 模式：將表單上的扣款日期同步到下方明細列的 tpy_date，並立即更新畫面 */
  private syncNormalTpyDateToRows(date: any): void {
    if (this.currentCreateType !== 'normal') return;
    if (!Array.isArray(this.data)) return;

    // 需求：上方日期一變更，所有明細列的扣款日期都要即時改成同一天
    this.data.forEach(row => {
      // 日期一變更就一併清空已選過的專櫃跟著帶出來的欄位，比照該欄位在 table 內自己編輯時的 calculate 邏輯，
      // 避免舊專櫃在新日期已不在契約期間內，卻仍殘留舊選取物件（下拉會因對不到新選項而把整個物件當字串顯示成 [object Object]）
      if (row.tlt_no) {
        row.tlt_no = null;
        row.contract_no = '';
        row.contract_subno = '';
        row.apply_no = '';
        row.org_id = '';
      }
      row.tpy_date = date ?? null;
    });

    // 更新父元件的 data 參考，讓 Input 變化被偵測
    this.data = [...this.data];

    // 額外：主動觸發 table-edit 的 dataChange 流程，
    // 等同於使用者在 table 內異動資料，確保畫面立即刷新
    if (this.normalTable) {
      this.normalTable.dataChange.emit(this.data.filter(r => !r._isAutoInsertCandidate));
    }
  }

  /** normal 模式：將表單上的扣款金額同步到下方明細列的 tpy_net，並立即更新畫面 */
  private syncNormalTpyNetToRows(amount: any): void {
    if (this.currentCreateType !== 'normal') return;
    if (!Array.isArray(this.data)) return;

    // 金額一變更，所有明細列的扣款金額都要即時改成同一金額
    this.data.forEach(row => {
      row.tpy_net = amount != null ? Number(amount) : null;
    });

    // 更新父元件的 data 參考，讓 Input 變化被偵測
    this.data = [...this.data];

    // 讓 table-edit 也能即時收到資料變動並刷新
    if (this.normalTable) {
      this.normalTable.dataChange.emit(this.data.filter(r => !r._isAutoInsertCandidate));
    }

    // 更新專櫃模式總金額欄位（沿用共用計算邏輯）
    try {
      this.updateTotalCash();
    } catch {
      // 忽略錯誤，避免在尚未初始化時噴錯
    }
  }

  onNormalFormAmountChange(amount: any): void {
    const ctrl = this.dataFormNormal.get('tpy_net');
    if (ctrl) {
      ctrl.setValue(amount, { emitEvent: false });
    }
    this.syncNormalTpyNetToRows(amount);
  }

  /** normal 模式：上方表單扣款日期變更事件（直接由 template 綁定） */
  onNormalFormDateChange(date: any): void {
    const ctrl = this.dataFormNormal.get('tpy_date');
    if (ctrl) {
      ctrl.setValue(date, { emitEvent: false });
    }
    this.syncNormalTpyDateToRows(date);
  }
  onCounterCAPItemChange(row: any, value: any, field?: string) {

    if (field === 'CAP_Item' || !field) {

      let compareValue = value;
      if (compareValue && typeof compareValue === 'object') {
        compareValue = compareValue.value ?? compareValue.CAP_Item ?? null;
      }
      compareValue = compareValue != null ? String(compareValue).trim() : null;
      const match = this.CAP_ItemOptions.find(it => String(it.CAP_Item).trim() === compareValue);

      if (match) {
        // 帶入扣款項目相關欄位
        row.CAP_Type = match.CAP_Type ?? null;
        row.CAP_Item = match.CAP_Item ?? row.CAP_Item;
        row.CAP_Name = match.CAP_Name ?? null;

        // 會計科目：嘗試以現有 AccNoOptions 找到對應的顯示值（並保留 code）
        const accNoCode = match.AccNo != null ? String(match.AccNo).trim() : null;
        if (accNoCode) {
          const accOption = this.AccNoOptions.find(opt => {
            const optValue = opt.value != null ? String(opt.value).trim() : null;
            const optNo = opt.No != null ? String(opt.No).trim() : null;
            return optValue === accNoCode || optNo === accNoCode;
          });
          row.AccNo = accOption ? (accOption.value != null ? String(accOption.value) : (accOption.No != null ? String(accOption.No) : accNoCode)) : accNoCode;
          row.AccCName = accOption ? (accOption.Name ?? accOption.label ?? '') : '';
        } else {
          row.AccNo = null;
          row.AccCName = null;
        }

        row.GUI_FLAG = match.GUI_FLAG ?? null;
        row.cap_taxtype = match.CAP_TaxType != null ? String(match.CAP_TaxType) : null;
      } else {
        row.AccNo = null;
        row.GUI_FLAG = null;
        row.cap_taxtype = null;
      }
      this.data = [...this.data];
    }
  }


  /** 下拉欄位轉字串，避免傳整個物件 */
  private normalizeValue(field: any): string {
    if (!field) return '';
    if (typeof field === 'object') {
      return field.value || field.No || field.tlt_no || '';
    }
    return String(field);
  }

  private getCAPNameByItem(capItem: any): string | null {
    if (capItem == null || capItem === '') return null;
    let code: string | null = null;
    if (typeof capItem === 'object') {
      code = capItem.value ?? capItem.CAP_Item ?? null;
    } else {
      code = String(capItem);
    }
    if (!code) return null;
    const found = this.CAP_ItemOptions.find(it => String(it.CAP_Item).trim() === String(code).trim());
    return found?.CAP_Name ?? null;
  }

  private buildTltInfo(selectedTltNo: any, podNo: any) {
    let tltObj: any;

    if (selectedTltNo && typeof selectedTltNo === 'object') {
      tltObj = selectedTltNo.value ? selectedTltNo.value : selectedTltNo;
    } else if (typeof selectedTltNo === 'string') {
      tltObj = this.tlt_noOptions.find(opt => opt.tlt_no === selectedTltNo);
    }

    return {
      tlt_no: tltObj?.tlt_no || '',
      talent_id: tltObj?.talent_id || 0,
      contract_no: tltObj?.contract_no || '',
      contract_subno: tltObj?.contract_subno || '',
      tlt_contract_bdate: tltObj?.tlt_contract_bdate || '',
      tlt_contract_edate: tltObj?.tlt_contract_edate || '',
      org_id: tltObj?.org_id || '',
      pod_no: podNo || ''
    };
  }

  private parseBackendDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;

    const m1 = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m1) {
      const month = Number(m1[1]);
      const day = Number(m1[2]);
      const year = Number(m1[3]);
      return new Date(year, month - 1, day);
    }
    const m2 = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m2) {
      const year = Number(m2[1]);
      const month = Number(m2[2]);
      const day = Number(m2[3]);
      return new Date(year, month - 1, day);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private parseLockYmFromResponse(res: any): number | null {
    try {
      const raw = res?.Data ?? res;
      let ym: string | null = null;
      if (typeof raw === 'string' || typeof raw === 'number') {
        ym = String(raw);
      } else if (raw && typeof raw === 'object') {
        ym = raw.maxClsMonth || raw.maxCls_YearMonth || raw.MaxClsMonth || raw.yyyymm || raw.yearMonth || raw.year_month || null;
        if (!ym) {
          if (Array.isArray(raw) && raw.length && (typeof raw[0] === 'string' || typeof raw[0] === 'number')) {
            ym = String(raw[0]);
          }
        }
      }
      if (!ym) return null;
      const m = ym.match(/(\d{4})[^\d]?(\d{1,2})/);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]);
        return y * 100 + mo;
      }
      if (/^\d{6}$/.test(ym)) return Number(ym);
    } catch (e) {
      // ignore
    }
    return null;
  }

  onSubmit(): void {
    if (this.isDetailMode) {
      return;
    }
    this.submitted = true;

    const currentForm = this.currentCreateType === 'counter' ? this.dataFormCounter : this.dataFormNormal;
    if (currentForm.invalid) {
      this.messageService.errorBubble('請填寫必填欄位');
      return;
    }

    const tableComp = this.currentCreateType === 'counter' ? this.counterTable : this.normalTable;
    if (tableComp && !tableComp.validateAndShowErrors()) {
      return;
    }

    const hasDetail = Array.isArray(this.data) && this.data.some(r => !r._isAutoInsertCandidate);
    if (!hasDetail) {
      this.messageService.errorBubble('明細列表至少需一筆資料');
      return;
    }

    // 扣款日期規則檢核
    if (!this.checkDateValidation()) {
      return;
    }

    const mainRow = this.data?.find(row => row.tlt_no) || this.data[0];
    const isUpdate = !!(mainRow?.id && mainRow.id > 0);

    if (isUpdate) {
      let payload: any;

      if (this.currentCreateType === 'counter') {
        const counterValue = this.dataFormCounter.getRawValue();
        payload = {
          id: mainRow?.id || 0,
          tlt_no: this.normalizeValue(counterValue.tlt_no),
          talent_id: typeof counterValue.tlt_no === 'object' ? counterValue.tlt_no?.talent_id : mainRow?.talent_id || 0,
          pod_no: this.normalizeValue(counterValue.pod_no),
          tpy_date: mainRow?.tpy_date ? formatDate(mainRow.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
          CAP_Type: mainRow?.CAP_Type || '',
          CAP_Item: mainRow?.CAP_Item || '',
          CAP_Name: this.getCAPNameByItem(mainRow?.CAP_Item) || null,
          org_id: this.normalizeValue(mainRow?.org_id),
          AccNo: this.normalizeValue(mainRow?.AccNo),
          GUI_FLAG: mainRow?.GUI_FLAG || '',
          cap_taxtype: mainRow?.cap_taxtype || '',
          tpy_net: Number(mainRow?.tpy_net ?? 0),
          remarks: mainRow?.remarks || ''
        };
      } else {
        const normalValue = this.dataFormNormal.getRawValue();
        payload = {
          id: mainRow?.id || 0,
          tlt_no: this.normalizeValue(mainRow?.tlt_no || normalValue.tlt_no),
          talent_id: typeof mainRow?.tlt_no === 'object'
            ? mainRow?.tlt_no?.talent_id
            : (normalValue.tlt_no as any)?.talent_id || 0,
          pod_no: this.normalizeValue(mainRow?.pod_no || normalValue.pod_no),
          tpy_date: mainRow?.tpy_date ? formatDate(mainRow.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
          CAP_Type: mainRow?.CAP_Type || normalValue.CAP_Type || '',
          CAP_Item: mainRow?.CAP_Item || normalValue.CAP_Item || '',
          CAP_Name: this.getCAPNameByItem(mainRow?.CAP_Item || normalValue.CAP_Item) || null,
          org_id: this.normalizeValue(mainRow?.org_id || normalValue.org_id),
          AccNo: this.normalizeValue(mainRow?.AccNo || normalValue.AccNo),
          GUI_FLAG: mainRow?.GUI_FLAG || normalValue.GUI_FLAG || '',
          cap_taxtype: mainRow?.cap_taxtype || normalValue.cap_taxtype || '',
          tpy_net: Number(mainRow?.tpy_net ?? normalValue.tpy_net ?? 0),
          remarks: mainRow?.remarks || normalValue.remarks || ''
        };
      }

      this.tls2d010Service.updateTLS2D010(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this.messageService.successBubble('更新成功');
            this.onCancel();
          },
        });

    } else {
      // ===== 新增 =====
      let payload: any;

      if (this.currentCreateType === 'counter') {
        // counter 從 form 抓
        const counterValue = this.dataFormCounter.getRawValue();
        const tltInfoFull = this.buildTltInfo(counterValue.tlt_no, counterValue.pod_no);
        // 建立 feeItems 後再去重，避免當同一筆費用套用到多個專櫃時被重複送出
        const feeItems = this.data
          .filter(i => !i._isAutoInsertCandidate)
          .map(i => {
            // 若 row 未帶 CAP_Type，嘗試以 CAP_Item 反查
            let capType = i.CAP_Type;
            const capItemVal = i.CAP_Item || '';
            if ((!capType || capType === '') && capItemVal) {
              const found = this.CAP_ItemOptions.find(it => String(it.CAP_Item) === String(capItemVal) || String((it as any).value) === String(capItemVal));
              if (found) capType = found.CAP_Type ?? capType;
            }
            return ({
              tpy_date: i.tpy_date ? formatDate(i.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
              CAP_Type: capType || '',
              CAP_Item: i.CAP_Item || '',
              org_id: this.normalizeValue(i.org_id),
              AccNo: this.normalizeValue(i.AccNo),
              GUI_FLAG: i.GUI_FLAG || '',
              cap_taxtype: i.cap_taxtype || '',
              tpy_net: Number(i.tpy_net ?? 0),
              remarks: i.remarks || ''
            });
          });

        const feeMap = new Map<string, any>();
        for (const f of feeItems) {
          const key = `${f.tpy_date || ''}|${f.CAP_Type}|${f.CAP_Item}|${f.org_id}|${f.AccNo}|${f.GUI_FLAG}|${f.cap_taxtype}|${f.tpy_net}|${f.remarks || ''}`;
          if (!feeMap.has(key)) {
            feeMap.set(key, f);
          }
        }
        const feeList = Array.from(feeMap.values());
        const tltList = [{
          tlt_no: tltInfoFull?.tlt_no || '',
          talent_id: Number(tltInfoFull?.talent_id ?? 0),
          pod_no: tltInfoFull?.pod_no || '',
          org_id: tltInfoFull?.org_id ?? '',
        }];

        payload = { tltList, feeList };
      } else {
        const normalFormValue = this.dataFormNormal.getRawValue();
        let tltList: any[] = [];
        let feeList: any[] = [];
        // 找扣款類型
        let capType = normalFormValue.CAP_Type || '';
        if (!capType && normalFormValue.CAP_Item) {
          const found = this.CAP_ItemOptions.find(it =>
            String(it.CAP_Item) === String(normalFormValue.CAP_Item) ||
            String((it as any).value) === String(normalFormValue.CAP_Item)
          );
          if (found) capType = found.CAP_Type ?? '';
        }

        // 組扣款資料
        feeList = [{
          tpy_date: normalFormValue.tpy_date ? formatDate(normalFormValue.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
          CAP_Type: capType,
          CAP_Item: normalFormValue.CAP_Item || '',
          AccNo: this.normalizeValue(normalFormValue.AccNo),
          GUI_FLAG: normalFormValue.GUI_FLAG || '',
          cap_taxtype: normalFormValue.cap_taxtype || '',
          tpy_net: Number(normalFormValue.tpy_net ?? 0),
          remarks: normalFormValue.remarks || null
        }];

        // 組專櫃資料
        const gridData = this.data.filter(i => !i._isAutoInsertCandidate);
        tltList = gridData.map(row => {
          const rowTltNo = typeof row.tlt_no === 'object' ? row.tlt_no?.tlt_no : row.tlt_no;
          const tltInfo = this.buildTltInfo(row.tlt_no, row.pod_no);
          return {
            tlt_no: tltInfo?.tlt_no || rowTltNo || '',
            talent_id: Number(tltInfo?.talent_id ?? 0),
            pod_no: row.pod_no || '',
            org_id: row.org_id || '',
            tpy_date: row.tpy_date ? formatDate(row.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
            tpy_net: Number(row.tpy_net ?? 0),
            remarks: row.remarks || ''
          };
        });
        payload = { tltList, feeList };
      }

      console.log('給後端的參數', payload);

      this.tls2d010Service.insertTLS2D010(payload).pipe(untilDestroyed(this)).subscribe({
        next: () => {
          this.messageService.successBubble('新增成功');
          this.onCancel();
        },
      });
    }
  }

  /**
   * 共用日期驗證邏輯
   * @param feeList 欲檢查的費用清單
   * @param bDateStr 契約起日
   * @param eDateStr 契約迄日
   */
  private checkDateValidation(): boolean {
    const rowsToValidate = this.data.filter(i => !i._isAutoInsertCandidate);
    const normalValue = this.dataFormNormal.getRawValue();
    const counterValue = this.dataFormCounter.getRawValue();

    for (const row of rowsToValidate) {
      // 1. 取得扣款日期：優先取 row 上的，若無則取表單上的
      const tpyDateRaw = row.tpy_date || (this.currentCreateType === 'counter' ? counterValue.tpy_date : normalValue.tpy_date);
      const d = this.parseBackendDate(tpyDateRaw) ?? new Date(tpyDateRaw);

      if (!tpyDateRaw || !d || isNaN(d.getTime())) {
        this.messageService.errorBubble('扣款日期格式錯誤或未填寫');
        return false;
      }

      // 2. 月結鎖定、拋轉狀態校驗
      const tpyYm = d.getFullYear() * 100 + (d.getMonth() + 1);
      if (this.maxClsMonthNum != null) {
        if (tpyYm <= this.maxClsMonthNum) {
          this.messageService.errorBubble(`扣款年月 ${tpyYm} 需大於月結鎖定年月 ${this.maxClsMonthNum}`);
          return false;
        }
      }
      if (this.transStatusMap.get(tpyYm) === 'Y') {
        this.messageService.errorBubble(`${tpyYm} 已拋轉 無法再輸入扣款資料`);
        return false;
      }

      // 3. 決定專櫃來源
      const rowTlt = row.tlt_no || (this.currentCreateType === 'counter' ? counterValue.tlt_no : normalValue.tlt_no);
      if (!rowTlt) continue;

      // 4. 取得該筆專櫃的完整資訊 (包含契約起迄)
      const fullTlt = this.buildTltInfo(rowTlt, row.pod_no || (this.currentCreateType === 'counter' ? counterValue.pod_no : normalValue.pod_no));

      // 5. 決定契約日期來源
      // Counter 模式：契約日期統一看表單上方
      // Normal 模式：契約日期看該列專櫃自己的 (fullTlt)
      const bDate = this.currentCreateType === 'counter' ? counterValue.tlt_contract_bdate : fullTlt.tlt_contract_bdate;
      const eDate = this.currentCreateType === 'counter' ? counterValue.tlt_contract_edate : fullTlt.tlt_contract_edate;

      const contractB = this.parseBackendDate(bDate);
      const contractE = this.parseBackendDate(eDate);

      if (!contractB || !contractE) {
        this.messageService.errorBubble(`專櫃 ${fullTlt.tlt_no} 契約期間資料不全，無法驗證`);
        return false;
      }

      const start = new Date(contractB.getFullYear(), contractB.getMonth(), contractB.getDate(), 0, 0, 0, 0);
      const end = new Date(contractE.getFullYear(), contractE.getMonth(), contractE.getDate(), 23, 59, 59, 999);

      // 6. 專櫃期間驗證：扣款日期必須在契約期間內
      if (d < start || d > end) {
        this.messageService.errorBubble(
          `扣款日期 ${formatDate(d, 'yyyy/MM/dd', 'en-US')} 不在專櫃 ${fullTlt.tlt_no} 的契約期間內 ${formatDate(start, 'yyyy/MM/dd', 'en-US')} ~ ${formatDate(end, 'yyyy/MM/dd', 'en-US')}`
        );
        return false;
      }
    }
    return true;
  }
}
