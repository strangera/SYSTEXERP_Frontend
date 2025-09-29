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
import { DropDownListService, IDropdownItem, IAPS1003Item } from './../../../service/utility/dropDownList.service';
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
        row.AccNo = item.AccNo;
        row.GUI_FLAG = item.GUI_FLAG;
        row.cap_taxtype = item.CAP_TaxType;
      } else {
        row.AccNo = null;
        row.GUI_FLAG = null;
        row.cap_taxtype = null;
      }
    } else {
      row.AccNo = null;
      row.GUI_FLAG = null;
      row.cap_taxtype = null;
    }
  }
  currentCreateType: 'normal' | 'counter' = 'counter';

  data: any[] = [];
  selectedItems: any[] = [];

  // 下拉選單
  tlt_noOptions: IDropdownItem[] = [];
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
    tlt_no: [''],
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
  });

  constructor(
    private dropDownListService: DropDownListService,
    private tls2d010Service: Tls2d010Service
  ) {
    super();
  }

  ngOnInit(): void {
    const rowdata = history.state?.rowdata;
    if (rowdata) {
      this.currentCreateType = rowdata.type;
      const form = this.currentCreateType === 'counter' ? this.dataFormCounter : this.dataFormNormal;
      this.initializePage('TLS2D010', form);
      if (rowdata.tpy_date) rowdata.tpy_date = new Date(rowdata.tpy_date);
      form.patchValue(rowdata);
      this.data = [rowdata];
    }

    this.loadTltAndPodOptions();
    this.loadAndSetupColumns();

    // counter → 選專櫃時帶入契約資料
    this.dataFormCounter.get('tlt_no')?.valueChanges.subscribe((selected: any) => {
      if (selected) {
        this.dataFormCounter.patchValue({
          contract_no: selected.contract_no,
          contract_subno: selected.contract_subno,
          tlt_contract_bdate: selected.tlt_contract_bdate
            ? formatDate(new Date(selected.tlt_contract_bdate), 'yyyy-MM-dd', 'en-US') : null,
          tlt_contract_edate: selected.tlt_contract_edate
            ? formatDate(new Date(selected.tlt_contract_edate), 'yyyy-MM-dd', 'en-US') : null,
          org_id: selected.org_id,
        });
      }
    });
  }

  // ===== 載入選單 =====
  private loadTltAndPodOptions(): void {
    forkJoin({
      tlt: this.dropDownListService.queryTLTTALENTDropDownList(),
      pod: this.dropDownListService.getActivityOptions({ mid: 0, str_no: '10', pod_type: [], pod_status: '' }),
      acc: this.dropDownListService.queryGLS1005_DropDownList(),
      org: this.dropDownListService.querySYS3100_DropDownList(),
      capItem: this.dropDownListService.queryAPS1003DropDownList({ cap_typeList: [] })
    })
      .pipe(untilDestroyed(this))
      .subscribe(({ tlt, pod, acc, org, capItem }) => {
        this.tlt_noOptions = tlt.Data.map((item: any) => ({
          ...item,
          value: item,
          label: `${item.tlt_no}-${item.tlt_name}`,
          tlt_contract_bdate: item.tlt_contract_bdate
            ? formatDate(new Date(item.tlt_contract_bdate), 'yyyy-MM-dd', 'en-US') : null,
          tlt_contract_edate: item.tlt_contract_edate
            ? formatDate(new Date(item.tlt_contract_edate), 'yyyy-MM-dd', 'en-US') : null,
        }));

        this.pod_noOptions = (pod?.Data || []).map((item: any) => ({
          value: item.pod_no, label: `${item.pod_no}-${item.pod_desc}`
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
          field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem',
          options: (row: any) => {
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
        { field: 'contract_no', header: '契約編號', type: 'inputNumber', width: '12rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'inputNumber', width: '15rem', disabled: () => true },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, width: '10rem' },
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
        { field: 'remarks', header: '備註', type: 'inputNumber', width: '12rem' },
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
    console.log('table-edit dataChange:', this.data);
    this.data.forEach(row => {
      this.setTableRowMapping(row);
      console.log('row after mapping:', row);
    });
  }
  // table-edit 欄位選擇時即時關聯
  onCounterCAPItemChange(row: any, value: string) {
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
  // ===== 送出 =====
  onSubmit(): void {
    this.submitted = true;
    if (this.currentCreateType === 'counter') {
      const counterValue = this.dataFormCounter.getRawValue();
      const tltObj = counterValue.tlt_no;
      const feeList = this.data.filter(i => !i._isAutoInsertCandidate).map(i => ({
        tpy_date: i.tpy_date ? formatDate(i.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
        CAP_Type: i.CAP_Type, CAP_Item: i.CAP_Item, org_id: i.org_id,
        AccNo: i.AccNo, GUI_FLAG: i.GUI_FLAG, cap_taxtype: i.cap_taxtype,
        tpy_net: Number(i.tpy_net ?? 0), remarks: i.remarks,
      }));

      const payload = {
        tltList: [{
          tlt_no: tltObj?.tlt_no || '', talent_id: tltObj?.talent_id || 0,
          contract_no: tltObj?.contract_no || '', contract_subno: tltObj?.contract_subno || '',
          tlt_contract_bdate: tltObj?.tlt_contract_bdate || '', tlt_contract_edate: tltObj?.tlt_contract_edate || '',
          org_id: tltObj?.org_id || '', pod_no: counterValue.pod_no,
        }],
        feeList,
      };
      this.tls2d010Service.insertTLS2D010(payload).subscribe();
    } else {
      const normalValue = this.dataFormNormal.getRawValue();
      const feeList = this.data.filter(i => !i._isAutoInsertCandidate).map(() => ({
        tpy_date: normalValue.tpy_date ? formatDate(normalValue.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
        CAP_Type: normalValue.CAP_Type, CAP_Item: normalValue.CAP_Item, org_id: normalValue.org_id,
        AccNo: normalValue.AccNo, GUI_FLAG: normalValue.GUI_FLAG, cap_taxtype: normalValue.cap_taxtype,
        tpy_net: Number(normalValue.tpy_net ?? 0),
      }));

      const payload = { tltList: [{ tlt_no: normalValue.tlt_no, talent_id: 0, pod_no: normalValue.pod_no }], feeList };
      this.tls2d010Service.insertTLS2D010(payload).subscribe();
    }
  }
}
