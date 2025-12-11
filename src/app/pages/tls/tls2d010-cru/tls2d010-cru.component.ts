import { formatDate, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
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
  ],
})
export class TLS2D010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
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
  selectedItems: any[] = [];

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

  // 表單
  dataFormCounter = this.formBuilder.group({
    tlt_no: [null as any],
    CAP_Item: [''],
    AccNo: [''],
    org_id: [{ value: null, disabled: true }],
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

  constructor(
    private dropDownListService: DropDownListService,
    private tls2d010Service: Tls2d010Service
  ) {
    super();
  }

  ngOnInit(): void {
    // normal模式 form日期選擇時同步到 table-edit 新增行
    this.dataFormNormal.get('tpy_date')?.valueChanges.subscribe((date: any) => {
      if (this.currentCreateType === 'normal') {
        // 主要新增行（第一個 status=modified 或無 status）也預設日期；候選行也會被帶入（以便使用者可直接編輯）
        let mainRowSet = false;
        this.data.forEach(row => {
          if (!mainRowSet && (row.status === 'modified' || !row.status)) {
            row.tpy_date = date ?? row.tpy_date;
            mainRowSet = true;
          }
          if (row.status === 'new' || row._isAutoInsertCandidate) {
            // 對於新增候選列，若上方有值則帶入，否則保留原有（或清空）
            row.tpy_date = date ?? null;
          }
        });
        // 重新指定陣列引用以觸發 table-edit 的 ngOnChanges，使 UI 立即更新
        this.data = Array.isArray(this.data) ? [...this.data] : this.data;
      }
    });

    // normal模式 form金額輸入時同步到 table-edit 新增行（預設帶入，但仍可編輯）
    this.dataFormNormal.get('tpy_net')?.valueChanges.subscribe((amount: any) => {
      // amount 可能為 0，因此檢查 !== null/undefined
      if (this.currentCreateType === 'normal') {
        // 當上方輸入金額時，帶入主要列與新增候選列，並保留使用者後續可編輯的權限
        if (amount === null || amount === undefined) {
          // 若沒有值，則清除新增候選列的預設金額
          this.data.forEach(row => {
            if (row.status === 'new' || row._isAutoInsertCandidate) {
              row.tpy_net = null;
            }
          });
        } else {
          let mainRowSet = false;
          this.data.forEach(row => {
            if (!mainRowSet && (row.status === 'modified' || !row.status)) {
              row.tpy_net = Number(amount);
              mainRowSet = true;
            }
            if (row.status === 'new' || row._isAutoInsertCandidate) {
              row.tpy_net = Number(amount);
            }
          });
        }
        // 讓 table-edit 觀察到資料參考改變，立即重繪 table
        this.data = Array.isArray(this.data) ? [...this.data] : this.data;
        // 若是在 counter 模式或需要更新總金額，也嘗試更新一次總金額（無副作用）
        try {
          this.updateTotalCash();
        } catch (e) {
          // 忽略錯誤
        }
      }
    });

    // 把 router 帶進來的 rowdata 拿來做初始化
    const rowdata = history.state?.rowdata;
    if (rowdata) {
      this.currentCreateType = rowdata.type;
      const form = this.currentCreateType === 'counter' ? this.dataFormCounter : this.dataFormNormal;

      // 共用初始化
      this.initializePage('TLS2D010', form);

      // ===== 判斷 detail 模式 =====
      if (rowdata.mode === 'detail') {
        this.isDetailMode = true;
        form.disable(); // 表單直接唯讀
      }

      // counter模式補齊所有table-edit行欄位
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
        this.data = rowdata.map(row => ({ ...row, ...counterMapping(row) }));
      } else {
        form.patchValue(rowdata);
        this.data = [{ ...rowdata, ...counterMapping(rowdata) }];
      }
    }

    // 載入下拉選單
    this.loadTltAndPodOptions();
    this.loadAndSetupColumns();


    // counter → 選專櫃時帶入契約資料
    this.dataFormCounter.get('tlt_no')?.valueChanges.subscribe((selected: any) => {
      if (selected) {
        // 自動帶入 contract_no, contract_subno, org_id, tlt_contract_bdate, tlt_contract_edate
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
          // 重新指定陣列引用以觸發 table-edit 的 ngOnChanges，使 UI 立即更新 org_id
          this.data = Array.isArray(this.data) ? [...this.data] : this.data;
        }
      }
    });
  }

  // ===== 載入選單 =====
  private loadTltAndPodOptions(): void {
    forkJoin({
      tlt: this.dropDownListService.queryTLTTALENTDropDownList(),
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

        // normal form control
        const normalCtrl = this.dataFormNormal.get('tlt_no');
        if (normalCtrl) {
          const v = normalCtrl.value;
          const n = normalizeTltValue(v);
          if (n !== v) {
            normalCtrl.setValue(n, { emitEvent: false });
          }
        }

        // data rows (table-edit data)
        if (this.data && Array.isArray(this.data) && this.data.length) {
          this.data = this.data.map(row => {
            const n = normalizeTltValue(row.tlt_no);
            // 若 row 尚未有 org_id，且 tlt_no 被正規化為物件，則自動帶入 org_id
            const orgFromTlt = (n && typeof n === 'object') ? (n.org_id ?? '') : row.org_id;
            return { ...row, tlt_no: n, org_id: row.org_id || orgFromTlt };
          });
        }

        // 將表單中原本可能含時間的契約日期轉成 yyyy/MM/dd
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
          this.data = this.data.map(row => ({
            ...row,
            tlt_contract_bdate: row.tlt_contract_bdate ? formatToYMD(row.tlt_contract_bdate) : row.tlt_contract_bdate,
            tlt_contract_edate: row.tlt_contract_edate ? formatToYMD(row.tlt_contract_edate) : row.tlt_contract_edate,
          }));
        }

        // Normalize AccNo in form controls and table rows so dropdown can match optionValue 'No'
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
          this.data = this.data.map(row => ({
            ...row,
            AccNo: row.AccNo ? normalizeAcc(row.AccNo) : row.AccNo
          }));
        }

        this.loadAndSetupColumns();
        // 初始載入時計算並填入總金額
        this.updateTotalCash();
      });
  }

  // ===== 欄位設定 =====
  private loadAndSetupColumns(): void {
    if (this.currentCreateType === 'counter') {
      this.columnsCounter = [
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        // 明確指定 optionLabel/optionValue，讓 p-dropdown 與 row value 的比對一致
        { field: 'CAP_Type', header: '扣款類型', type: 'dropdown', width: '12rem', options: this.CAP_TypeOptions, optionLabel: 'label', optionValue: 'value' },
        {
          field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'value', options: (row: any) => {
            return this.CAP_ItemOptions
              .filter(item => item.CAP_Type === row.CAP_Type)
              .map(item => ({ value: item.CAP_Item, label: `${item.CAP_Item}-${item.CAP_Name}`, data: item }));
          }
        },
        {
          field: 'AccNo',
          header: '會計科目',
          type: 'dropdown',
          width: '10rem',
          options: this.AccNoOptions,
          optionLabel: 'label',
          optionValue: 'No',
          disabled: () => true
        }, { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '9rem', options: this.GuiFlagOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '9rem', options: this.cap_taxtypeOptions, optionLabel: 'label', optionValue: 'value', disabled: () => true },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem', textAlign: 'right' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    } else {
      this.columnsNormal = [
        // tlt_no 保持以物件為值 (包含 contract/org 等)，因此不設定 optionValue（以物件方式綁定）
        { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', options: this.tlt_noOptions, optionLabel: 'label', width: '12rem' },
        { field: 'contract_no', header: '契約編號', type: 'input', width: '12rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'input', width: '15rem', disabled: () => true },
        { field: 'org_id', header: '組織代號/名稱', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, optionLabel: 'label', optionValue: 'value', width: '10rem' },
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
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
    this.dataFormNormal.patchValue(selected ? {
      CAP_Name: selected.data.CAP_Name,
      AccNo: selected.data.AccNo,
      GUI_FLAG: selected.data.GUI_FLAG,
      cap_taxtype: selected.data.CAP_TaxType != null ? String(selected.data.CAP_TaxType) : selected.data.CAP_TaxType
    } : { CAP_Name: null, AccNo: null, GUI_FLAG: null, cap_taxtype: null });
  }
  // table-edit 的資料有變動時會觸發
  onCounterDataChange(updatedData: any[]): void {
    this.data = updatedData;
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
      this.data.forEach(row => {
        if (row.tlt_no && typeof row.tlt_no === 'object') {
          // 若 contract_no/subno/org_id 尚未填入或 tlt_no 有變動就補值
          if (
            row.contract_no !== row.tlt_no.contract_no ||
            row.contract_subno !== row.tlt_no.contract_subno ||
            row.org_id !== row.tlt_no.org_id
          ) {
            row.contract_no = row.tlt_no.contract_no ?? '';
            row.contract_subno = row.tlt_no.contract_subno ?? '';
            row.org_id = row.tlt_no.org_id ?? '';
          }
        }
      });
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
  onCounterCAPItemChange(row: any, value: any, field?: string) {

    if (field === 'CAP_Item' || !field) {

      let compareValue = value;
      if (compareValue && typeof compareValue === 'object') {
        compareValue = compareValue.value ?? compareValue.CAP_Item ?? null;
      }
      compareValue = compareValue != null ? String(compareValue).trim() : null;

      const candidates = this.CAP_ItemOptions.filter(
        it => !row.CAP_Type || it.CAP_Type === row.CAP_Type
      );

      const match = candidates.find(it => String(it.CAP_Item).trim() === compareValue);

      if (match) {
        // 關鍵修正：後端 AccNo 去空白（trim）
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

    // MM/DD/YYYY 或 M/D/YYYY
    const m1 = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m1) {
      const month = Number(m1[1]);
      const day = Number(m1[2]);
      const year = Number(m1[3]);
      return new Date(year, month - 1, day);
    }

    // YYYY-MM-DD
    const m2 = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m2) {
      const year = Number(m2[1]);
      const month = Number(m2[2]);
      const day = Number(m2[3]);
      return new Date(year, month - 1, day);
    }

    // fallback to Date parser
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  onSubmit(): void {
    if (this.isDetailMode) {
      return; // 檢視模式下不做任何動作
    }
    this.submitted = true;

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
        .subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });

    } else {
      // ===== 新增 =====
      let payload: any;

      if (this.currentCreateType === 'counter') {
        // counter 從 form 抓
        const counterValue = this.dataFormCounter.getRawValue();
        const tltInfo = this.buildTltInfo(counterValue.tlt_no, counterValue.pod_no);
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

        payload = { tltList: [tltInfo], feeList };

      } else {
        // normal 從 table-edit 抓
        const normalValue = this.dataFormNormal.getRawValue();
        const selectedRow = this.data.find(i => i.tlt_no); // 取 table 第一筆有 tlt_no 的
        const tltInfo = this.buildTltInfo(
          selectedRow?.tlt_no || normalValue.tlt_no,
          normalValue.pod_no
        );

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

        payload = { tltList: [tltInfo], feeList };
      }

      console.log('insert payload', payload);

      this.tls2d010Service.insertTLS2D010(payload)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.messageService.successBubble('新增成功');
          // 清空表單與 table-edit 資料，但保留在當前畫面
          this.dataFormCounter.reset();
          this.dataFormNormal.reset();
          this.data = [];
          // 更新總金額顯示（會把 totalCash 設為 0）
          this.updateTotalCash();
        });
    }
  }


}
