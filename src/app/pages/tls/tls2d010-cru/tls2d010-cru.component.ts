import { Component, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { formatDate } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropDownListService, IDropdownItem, IAPS1003Item, ITalentOption } from './../../../service/utility/dropDownList.service';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TranslateModule } from '@ngx-translate/core';

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
  // 新增：table row 關聯 mapping（不影響原有邏輯）
  private setTableRowMapping(row: any) {
    if (row.CAP_Item !== undefined && row.CAP_Item !== null && row.CAP_Item !== '') {
      const selected = this.FilterCAP_ItemOptions.find(opt => opt.value === row.CAP_Item);
      if (selected) {
        const item = selected.data;
        // 只有在欄位為空時才覆蓋，否則保留查詢資料
        if (!row.AccNo) row.AccNo = item.AccNo;
        if (!row.GUI_FLAG) row.GUI_FLAG = item.GUI_FLAG;
        if (!row.cap_taxtype) row.cap_taxtype = item.CAP_TaxType;
      }
    }
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
      if (this.currentCreateType === 'normal' && date) {
        // 主要新增行（第一個 status=modified 或無 status）也預設日期
        let mainRowSet = false;
        this.data.forEach(row => {
          if (!mainRowSet && (row.status === 'modified' || !row.status) && row.tlt_no) {
            row.tpy_date = date;
            mainRowSet = true;
          }
          if ((row.status === 'new' || row._isAutoInsertCandidate) && row.tlt_no) {
            row.tpy_date = date;
          } else if (row.status === 'new' || row._isAutoInsertCandidate) {
            row.tpy_date = null;
          }
        });
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
              ? formatDate(new Date(row.tlt_no.tlt_contract_bdate), 'yyyy-MM-dd', 'en-US')
              : null,
            tlt_contract_edate: row.tlt_no.tlt_contract_edate
              ? formatDate(new Date(row.tlt_no.tlt_contract_edate), 'yyyy-MM-dd', 'en-US')
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
            ? formatDate(new Date(selected.tlt_contract_bdate), 'yyyy-MM-dd', 'en-US') : null,
          tlt_contract_edate: selected.tlt_contract_edate
            ? formatDate(new Date(selected.tlt_contract_edate), 'yyyy-MM-dd', 'en-US') : null,
          org_id: selected.org_id ?? '',
        }, { emitEvent: false });
        if (this.data && this.data.length) {
          this.data.forEach(row => {
            if ((row.tlt_no && row.tlt_no.tlt_no === selected.tlt_no) || !row.tlt_no) {
              row.org_id = selected.org_id ?? '';
            }
          });
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
      capItem: this.dropDownListService.queryAPS1003DropDownList({ cap_typeList: [] })
    })
      .pipe(untilDestroyed(this))
      .subscribe(({ tlt, pod, acc, org, capItem }) => {
        this.tlt_noOptions = (tlt?.Data || []).map((item: any) => ({
          ...item,
          label: `${item.tlt_no}-${item.tlt_name}`,
          tlt_contract_bdate: item.tlt_contract_bdate
            ? formatDate(new Date(item.tlt_contract_bdate), 'yyyy-MM-dd', 'en-US') : null,
          tlt_contract_edate: item.tlt_contract_edate
            ? formatDate(new Date(item.tlt_contract_edate), 'yyyy-MM-dd', 'en-US') : null,
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

        this.loadAndSetupColumns();
      });
  }

  // ===== 欄位設定 =====
  private loadAndSetupColumns(): void {
    if (this.currentCreateType === 'counter') {
      this.columnsCounter = [
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        { field: 'CAP_Type', header: '扣款類型', type: 'dropdown', width: '12rem', options: this.CAP_TypeOptions },
        {
          field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem', options: (row: any) => {
            return this.CAP_ItemOptions
              .filter(item => item.CAP_Type === row.CAP_Type)
              .map(item => ({ value: item.CAP_Item, label: `${item.CAP_Item}-${item.CAP_Name}`, data: item }));
          }
        },
        { field: 'AccNo', header: '會計科目', type: 'dropdown', width: '10rem', options: this.AccNoOptions, disabled: () => true },
        { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', options: this.org_idOptions },
        { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '9rem', options: this.GuiFlagOptions },
        { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '9rem', options: this.cap_taxtypeOptions, disabled: () => true },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    } else {
      this.columnsNormal = [
        { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', options: this.tlt_noOptions, width: '12rem' },
        { field: 'contract_no', header: '契約編號', type: 'input', width: '12rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'input', width: '15rem', disabled: () => true },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, width: '10rem' },
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
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
      cap_taxtype: selected.data.CAP_TaxType
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
  // table-edit 欄位選擇時即時關聯
  onCounterCAPItemChange(row: any, value: string, field?: string) {
    // tlt_no 欄位選擇時，標記 row._tlt_noChanged
    if (field === 'tlt_no') {
      row._tlt_noChanged = true;
    }
    // CAP_Item 欄位選擇時即時關聯
    if (field === 'CAP_Item' || !field) {
      const selected = this.FilterCAP_ItemOptions.find(opt => opt.value === value);
      if (selected) {
        const item = selected.data;
        row.AccNo = item.AccNo;
        row.GUI_FLAG = item.GUI_FLAG;
        row.cap_taxtype = item.CAP_TaxType;
      } else {
        row.AccNo = null;
        row.GUI_FLAG = null;
        row.cap_taxtype = null;
      }
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
          this.dataFormCounter.reset();
          this.dataFormNormal.reset();
          this.data = [];
          this.onCancel();
        });
    }
  }


}
