import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { formatDate as columnDateFormat } from '../../../shared/componentkit/table/table.model';
import { DropDownListService, IAPS1003Item, IDropdownItem, ITalentOption } from './../../../service/utility/dropDownList.service';

@UntilDestroy()
@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  styleUrl: './tls2d010-cru.component.scss',
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

  // 專櫃選擇 Dialog 相關
  talentDialogVisible = false;
  talentDialogLoading = false;
  talentDialogData: any[] = [];
  selectedTalents: any[] = [];
  talentDialogColumns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'contract_no', header: '契約編號' },
    { field: 'contract_subno', header: '版次' },
    { field: 'tlt_contract_bdate', header: '契約起日', format: columnDateFormat },
    { field: 'tlt_contract_edate', header: '契約迄日', format: columnDateFormat },
  ];
  talentTotalRecords = 0;
  talentLastQueryBody: any | null = null;

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
    contract_no: [{ value: null, disabled: true }],
    contract_subno: [{ value: null, disabled: true }],
    tlt_contract_bdate: [{ value: null as string | null, disabled: true }],
    tlt_contract_edate: [{ value: null as string | null, disabled: true }],
  });

  dataFormNormal = this.formBuilder.group({
    tlt_no: [null as any],
    pod_no: [],
    CAP_Type: [],
    tpy_date: [null as null | Date, [Validators.required]],
    CAP_Item: [],
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
    private dropDownListService: DropDownListService,
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

  private loadTalentDialogData(): void {
    this.talentDialogLoading = true;
    const body: any = {
      pageIndex: 1,
      pageSize: 30,
    };
    this.talentLastQueryBody = body;
    this.dropDownListService
      .queryTLTTALENTDropDownList({ isNewData: true })
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
    return this.dropDownListService.queryTLTTALENTDropDownList(body);
  };

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
    const tpyDate = this.dataFormNormal.get('tpy_date')?.value ?? null;
    const tpyNet = this.dataFormNormal.get('tpy_net')?.value ?? null;

    const newRows = this.selectedTalents.map((item: any) => {
      const matchedOption = this.tlt_noOptions.find(opt => opt.tlt_no === item.tlt_no || opt.No === item.tlt_no);
      const tltValue = matchedOption ?? {
        ...item,
        label: `${item.tlt_no}-${item.tlt_name}`,
      };
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

  ngOnInit(): void {
    this.dataFormNormal.get('tpy_date')?.valueChanges.subscribe((date: any) => {
      this.syncNormalTpyDateToRows(date);
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
      const counterMapping = (row: any) => {
        if (row.tlt_no && typeof row.tlt_no === 'object') {
          return {
            contract_no: row.tlt_no.contract_no ?? '',
            contract_subno: row.tlt_no.contract_subno ?? '',
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
      if (selected) {
        this.dataFormCounter.patchValue({
          contract_no: selected.contract_no ?? '',
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

  // ===== 載入選單 =====
  private loadTltAndPodOptions(): void {
    forkJoin({
      tlt: this.dropDownListService.queryTLTTALENTDropDownList({ isNewData: true }),
      pod: this.dropDownListService.queryTALPORDERM_DropDownList(),
      acc: this.dropDownListService.queryGLS1005_DropDownList(),
      org: this.dropDownListService.querySYS3100_DropDownList(),
      capItem: this.dropDownListService.queryAPS1003DropDownList({ CAP_ItemList: [] })
    })
      .pipe(untilDestroyed(this))
      .subscribe(({ tlt, pod, acc, org, capItem }) => {
        this.tlt_noOptions = (tlt?.Data || []).map((item: any) => ({
          ...item,
          label: `${item.tlt_no}-${item.tlt_name}`,
          tlt_contract_bdate: item.tlt_contract_bdate
            ? (this.parseBackendDate(item.tlt_contract_bdate) ? formatDate(this.parseBackendDate(item.tlt_contract_bdate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
          tlt_contract_edate: item.tlt_contract_edate
            ? (this.parseBackendDate(item.tlt_contract_edate) ? formatDate(this.parseBackendDate(item.tlt_contract_edate) as Date, 'yyyy/MM/dd', 'en-US') : null) : null,
          org_id: item.org_id ?? null,
        }));

        this.pod_noOptions = (pod?.Data || []).map((item: any) => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));

        this.AccNoOptions = (acc?.Data || []).map((item: any) => ({
          No: item.No,
          Name: item.Name,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));
        this.org_idOptions = (org?.Data || []).map((item: any) => ({
          No: item.No,
          Name: item.Name,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));

        this.CAP_ItemOptions = capItem?.Data || [];
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
          validate: [
            (value: any, rowData: any, data: any[], field: string, header: string) => {
              const isValid = !!value;
              return { isValid, errorMessage: isValid ? [] : [`${header}為必填`] };
            }
          ]
        },
        {
          field: 'CAP_Item',
          header: '扣款項目',
          type: 'dropdown',
          width: '16rem',
          optionLabel: 'label',
          optionValue: 'value',
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
        { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '6rem', options: this.GuiFlagOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '6rem', options: this.cap_taxtypeOptions, optionLabel: 'label', optionValue: 'value', disabled: () => true },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '10rem', textAlign: 'right' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    } else {
      this.columnsNormal = [
        // tlt_no 保持以物件為值 (包含 contract/org 等)，因此不設定 optionValue（以物件方式綁定）
        { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', options: this.tlt_noOptions, optionLabel: 'label', width: '15rem' },
        { field: 'contract_no', header: '契約編號', type: 'input', width: '1rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'input', width: '1rem', disabled: () => true },
        { field: 'org_id', header: '組織代號/名稱', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, optionLabel: 'label', optionValue: 'value', width: '18rem' },
        {
          field: 'tpy_date',
          header: '扣款日期',
          type: 'date',
          width: '12rem',
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

    this.dataFormNormal.patchValue(selected ? {
      CAP_Name: selected.data.CAP_Name,
      AccNo: accValue,
      GUI_FLAG: selected.data.GUI_FLAG,
      cap_taxtype: selected.data.CAP_TaxType != null ? String(selected.data.CAP_TaxType) : selected.data.CAP_TaxType
    } : { CAP_Name: null, AccNo: null, GUI_FLAG: null, cap_taxtype: null });
  }
  // table-edit 的資料有變動時會觸發
  onCounterDataChange(updatedData: any[]): void {
    this.data = this.ensureRowIds(updatedData ?? []);
    // counter模式 table-edit mapping
    if (this.currentCreateType === 'counter') {
      this.data.forEach(row => {
        this.setTableRowMapping(row);
      });
      // 更新總金額（使用共用方法）
      this.updateTotalCash();
    }
    // normal模式 table-edit tlt_no欄位有新值就自動補 contract_no/contract_subno/org_id
    if (this.currentCreateType === 'normal') {
      // 取得上方表單選擇的 tlt_no（可能為物件或字串），以便在新增列時帶入 org_id
      const formTltVal = this.dataFormNormal.get('tlt_no')?.value;
      let normalizedFormTlt: any = formTltVal;
      if (normalizedFormTlt && typeof normalizedFormTlt === 'object' && normalizedFormTlt.value) {
        normalizedFormTlt = normalizedFormTlt.value;
      }
      if (typeof normalizedFormTlt === 'string') {
        const found = this.tlt_noOptions.find(opt => opt.tlt_no === normalizedFormTlt || opt.No === normalizedFormTlt || opt.value === normalizedFormTlt);
        if (found) normalizedFormTlt = found;
      }

      // 目前上方表單選擇的扣款日期，讓新/空白明細自動帶入
      const formTpyDate = this.dataFormNormal.get('tpy_date')?.value ?? null;
      this.data.forEach(row => {
        const isNewCandidate = row.status === 'new' || row._isAutoInsertCandidate;
        const hasNoOrg = row.org_id === null || row.org_id === undefined || row.org_id === '';
        if (isNewCandidate && normalizedFormTlt && normalizedFormTlt.org_id && hasNoOrg) {
          row.org_id = normalizedFormTlt.org_id;
        }

        if (row.tlt_no && typeof row.tlt_no === 'object') {
          if (
            row.contract_no !== row.tlt_no.contract_no ||
            row.contract_subno !== row.tlt_no.contract_subno ||
            row.org_id !== row.tlt_no.org_id
          ) {
            row.contract_no = row.tlt_no.contract_no ?? '';
            row.contract_subno = row.tlt_no.contract_subno ?? '';
            row.org_id = row.tlt_no.org_id ?? '';
          }
        } else {
          if (normalizedFormTlt && normalizedFormTlt.org_id) {
            if (hasNoOrg) {
              row.org_id = normalizedFormTlt.org_id;
            }
          }
        }

        // 若該列尚未有扣款日期，且表單已有選擇日期，則自動帶入
        const hasNoDate = !row.tpy_date;
        if (formTpyDate && hasNoDate) {
          row.tpy_date = formTpyDate;
        }
      });
      // 讓 table-edit 感知資料變更，立即更新 UI
      this.data = Array.isArray(this.data) ? [...this.data] : this.data;
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

  /** normal 模式：上方表單扣款金額變更事件（直接由 template 綁定） */
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
        row.AccNo = match.AccNo ? String(match.AccNo).trim() : '';

        row.GUI_FLAG = match.GUI_FLAG ?? null;
        row.cap_taxtype =
          match.CAP_TaxType != null ? String(match.CAP_TaxType) : null;
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

  /** 依 CAP_Item 取得對應的 CAP_Name（從後端下拉資料中找） */
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
    console.log('>>> buildTltInfo input selectedTltNo:', selectedTltNo);

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

  /**
   * 解析後端可能的日期字串格式，回傳 Date 或 null。
   * 支援格式：MM/DD/YYYY[ HH:mm:ss]、YYYY-MM-DD[ ...]、以及 ISO 可被 Date.parse 辨識者。
   */
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

    // 判斷是否為更新
    const mainRow = this.data?.find(row => row.tlt_no) || this.data[0];
    const isUpdate = !!(mainRow?.id && mainRow.id > 0);

    if (isUpdate) {
      // ===== 更新 =====
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
        const feeList = this.data
          .filter(i => !i._isAutoInsertCandidate)
          .map(i => ({
            tpy_date: i.tpy_date ? formatDate(i.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
            CAP_Type: i.CAP_Type || '',
            CAP_Item: i.CAP_Item || '',
            org_id: this.normalizeValue(i.org_id),
            AccNo: this.normalizeValue(i.AccNo),
            GUI_FLAG: i.GUI_FLAG || '',
            cap_taxtype: i.cap_taxtype || '',
            tpy_net: Number(i.tpy_net ?? 0),
            remarks: i.remarks || ''
          }));

        const tltList = [{
          tlt_no: tltInfoFull?.tlt_no || '',
          talent_id: Number(tltInfoFull?.talent_id ?? 0),
          pod_no: tltInfoFull?.pod_no || ''
        }];

        payload = { tltList, feeList };


      } else {
        // normal 從 table-edit 抓
        const normalValue = this.dataFormNormal.getRawValue();
        const feeList = this.data
          .filter(i => !i._isAutoInsertCandidate)
          .map(i => ({
            tpy_date: i.tpy_date ? formatDate(i.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
            CAP_Type: i.CAP_Type || normalValue.CAP_Type || '',
            CAP_Item: i.CAP_Item || normalValue.CAP_Item || '',
            org_id: this.normalizeValue(i.org_id || normalValue.org_id),
            AccNo: this.normalizeValue(i.AccNo || normalValue.AccNo),
            GUI_FLAG: i.GUI_FLAG || normalValue.GUI_FLAG || '',
            cap_taxtype: i.cap_taxtype || normalValue.cap_taxtype || '',
            tpy_net: Number(i.tpy_net ?? normalValue.tpy_net ?? 0),
            remarks: i.remarks || normalValue.remarks || ''
          }));

        // 根據 table 中實際出現的專櫃，動態產生多筆 tltList，符合後端 spec
        const tltMap = new Map<string, { tlt_no: string; talent_id: number; pod_no: string }>();
        for (const row of this.data.filter(i => !i._isAutoInsertCandidate)) {
          const rowTlt = row.tlt_no || normalValue.tlt_no;
          if (!rowTlt) {
            continue;
          }
          const podNo = this.normalizeValue(row.pod_no || normalValue.pod_no);
          const full = this.buildTltInfo(rowTlt, podNo);
          const tlt_no = full?.tlt_no || '';
          const talent_id = Number(full?.talent_id ?? 0);
          const pod_no = full?.pod_no || '';
          const key = `${tlt_no}|${talent_id}|${pod_no}`;
          if (!tltMap.has(key)) {
            tltMap.set(key, { tlt_no, talent_id, pod_no });
          }
        }

        const tltList = Array.from(tltMap.values());
        if (tltList.length === 0) {
          this.messageService.errorBubble('請先選擇至少一筆專櫃');
          return;
        }

        payload = { tltList, feeList };
      }

      console.log('insert payload', payload);

      this.tls2d010Service.insertTLS2D010(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this.messageService.successBubble('新增成功');
            this.onCancel();
          },
        });
    }
  }

}
