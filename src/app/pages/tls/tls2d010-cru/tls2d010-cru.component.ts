import { Component, OnInit } from '@angular/core';
import { Validators, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem, IAPS1003Item } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { forkJoin } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { formatDate } from '@angular/common';
@UntilDestroy()
@Component({
  selector: 'app-tls2d010-cru',
  templateUrl: './tls2d010-cru.component.html',
  styleUrl: './tls2d010-cru.component.scss',
  standalone: true,
  imports: [
    TableEditComponent,
    CalendarComponent,
    InputTextComponent,
    DropdownTableComponent,
    RadiobuttonComponent,
    MenubarComponent,
    PanelModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputNumberComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS2D010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  currentCreateType: 'normal' | 'counter' = 'counter';

  // 資料
  data: any[] = [];
  selectedItems: any[] = [];
  // 共用下拉選單
  tlt_noOptions: IDropdownItem[] = []; // 專櫃
  pod_noOptions: any[] = []; // 活動
  org_idOptions: IDropdownItem[] = []; // 組織
  CAP_TypeOptions = getSYS1000Options('CAP_Type'); // 扣款類型
  CAP_ItemOptions: IAPS1003Item[] = [];          //原始資料 - 扣款項目
  FilterCAP_ItemOptions: IAPS1003Item[] = [];   // 篩選後資料 - 扣款項目
  AccNoOptions: IDropdownItem[] = []; // 會計科目
  GuiFlagOptions = getSYS1000Options('YES_NO'); // 是否開立發票
  cap_taxtypeOptions = getSYS1000Options('CAP_TaxType');
  // 欄位設定
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
    tlt_contract_bdate: [{ value: null, disabled: true }],
    tlt_contract_edate: [{ value: null, disabled: true }],
  });

  dataFormNormal = this.formBuilder.group({
    tlt_no: [''],
    pod_no: [],
    CAP_Type: [],
    tpy_date: [null as null | Date, [Validators.required]],
    CAP_Item: [],
    tpy_net: [],
    cap_taxtype: [{ value: null, disabled: true }],
    GUI_FLAG: [],
    AccNo: [{ value: null, disabled: true }],
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
      if (this.currentCreateType === 'counter') {
        this.initializePage('TLS2D010', this.dataFormCounter);
        if (rowdata.tpy_date) rowdata.tpy_date = new Date(rowdata.tpy_date);// 日期轉型
        this.dataFormCounter.patchValue(rowdata); // 之後刪掉看看，因為initializePage做過了
        this.data = [rowdata]; // 檢查一下
      } else if (this.currentCreateType === 'normal') {
        this.initializePage('TLS2D010', this.dataFormNormal);
        this.dataFormNormal.patchValue(rowdata);// 之後刪掉看看，因為initializePage做過了
        this.data = [rowdata]; // 檢查一下
      }
    }
    // 載入專櫃 & 活動
    this.loadTltAndPodOptions();
    this.loadAndSetupColumns();
    this.dataFormCounter.get('tlt_no')?.valueChanges.subscribe((selected: any) => {
      console.log('Selected tlt_no:', selected);
      if (selected) {
        this.dataFormCounter.patchValue({
          contract_no: selected.contract_no,
          contract_subno: selected.contract_subno,
          tlt_contract_bdate: selected.tlt_contract_bdate,
          tlt_contract_edate: selected.tlt_contract_edate,
          org_id: selected.org_id,
        });
      }
    });
  }

  // ===== 專櫃 & 活動選單 =====
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
        }));

        this.pod_noOptions = (pod?.Data || []).map((item: any) => ({
          ...item,
          value: item.pod_no,
          label: `${item.pod_no}-${item.pod_desc}`
        }));

        this.AccNoOptions = (acc?.Data || []).map((item: any) => ({
          ...item,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));

        this.org_idOptions = (org?.Data || []).map((item: any) => ({
          ...item,
          value: item.No,
          label: `${item.No}-${item.Name}`,
        }));

        this.CAP_ItemOptions = (capItem?.Data || []).map((item: any) => ({
          value: item.CAP_Item,
          label: `${item.CAP_Item}-${item.CAP_Name}`,
          CAP_Type: item.CAP_Type,   // 扣款類型

          CAP_Item: item.CAP_Item,  // 扣款項目代碼
          CAP_Name: item.CAP_Name,    // 顯示名稱

          AccNo: item.AccNo,      // 會計科目
          GUI_FLAG: item.GUI_FLAG,  // 是否開立發票
          CAP_TaxType: item.CAP_TaxType,  // 課稅別
        }));

        // ✅ 等所有 API 都完成後才綁欄位
        this.loadAndSetupColumns();
      });
  }
  // ===== 載入 Counter 欄位動態下拉 =====
  private loadAndSetupColumns(): void {
    if (this.currentCreateType === 'counter') {
      this.columnsCounter = [
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        { field: 'CAP_Type', header: '扣款類型', type: 'dropdown', width: '12rem', options: this.CAP_TypeOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem', options: this.CAP_ItemOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'AccNo', header: '會計科目', type: 'dropdown', width: '10rem', options: this.AccNoOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', options: this.org_idOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '9rem', options: this.GuiFlagOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '9rem', options: this.cap_taxtypeOptions, optionLabel: 'label', optionValue: 'value' },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
        { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
      ];
    } else if (this.currentCreateType === 'normal') {
      this.columnsNormal = [
        { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', options: this.tlt_noOptions, width: '12rem', optionLabel: 'label', optionValue: 'No' },
        { field: 'contract_no', header: '契約編號', type: 'inputNumber', width: '12rem', disabled: () => true },
        { field: 'contract_subno', header: '版次', type: 'inputNumber', width: '15rem', disabled: () => true },
        { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', options: this.pod_noOptions, width: '10rem', optionLabel: 'SYS_Name', optionValue: 'SYS_Code' },
        { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
        { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
        { field: 'remarks', header: '備註', type: 'inputNumber', width: '12rem' },
      ];
    }
  }

  onCAP_TypeChange(event: string): void {
    console.log(this.CAP_ItemOptions);
    console.log('CAP_Type changed:', event); // A B C ...
    this.FilterCAP_ItemOptions = this.CAP_ItemOptions.filter(item => item.CAP_Type === event);
    console.log('Filtered CAP_ItemOptions:', this.FilterCAP_ItemOptions);
    this.dataFormNormal.patchValue({ CAP_Item: null }); // 清除已選擇的 CAP_Item
  }

  onCAP_ItemChange(event: string): void {
    console.log('CAP_Item changed:', event);
    console.log(this.CAP_ItemOptions);
    // 要改變的欄位
    // dataForm.....cap_taxtype
    // dataForm.....AccNo
    // dataForm.....GUI_FLAG
  }

  // ===== 送出 =====
  onSubmit(): void {
    this.submitted = true;

    if (this.currentCreateType === 'counter') {
      const counterValue = this.dataFormCounter.getRawValue();
      const tltObj = counterValue.tlt_no;
      const feeList = this.data
        .filter((item) => !item._isAutoInsertCandidate)
        .map((item) => ({
          tpy_date: item.tpy_date ? formatDate(item.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
          CAP_Type: item.CAP_Type,
          CAP_Item: item.CAP_Item,
          org_id: item.org_id,
          AccNo: item.AccNo,
          GUI_FLAG: item.GUI_FLAG,
          cap_taxtype: item.cap_taxtype,
          tpy_net: Number(item.tpy_net ?? 0),
          remarks: item.remarks,
        }));

      const payload = {
        tltList: [
          {
            tlt_no: tltObj?.tlt_no || '',
            talent_id: tltObj?.talent_id || 0,
            contract_no: tltObj?.contract_no || '',
            contract_subno: tltObj?.contract_subno || '',
            tlt_contract_bdate: tltObj?.tlt_contract_bdate || '',
            tlt_contract_edate: tltObj?.tlt_contract_edate || '',
            org_id: tltObj?.org_id || '',
            pod_no: counterValue.pod_no,
          },
        ],
        feeList,
      };

      this.tls2d010Service.insertTLS2D010(payload).subscribe({
        next: (res) => console.log('新增成功', res),
        error: (err) => console.error('新增失敗', err),
      });
    } else {
      const normalValue = this.dataFormNormal.getRawValue();

      const feeList = this.data
        .filter((item) => !item._isAutoInsertCandidate)
        .map((item) => ({
          tpy_date: item.tpy_date ? formatDate(item.tpy_date, 'yyyy-MM-dd', 'en-US') : null,
          CAP_Type: normalValue.CAP_Type,
          CAP_Item: normalValue.CAP_Item,
          org_id: normalValue.org_id,
          AccNo: normalValue.AccNo,
          GUI_FLAG: normalValue.GUI_FLAG,
          cap_taxtype: normalValue.cap_taxtype,
          tpy_net: Number(normalValue.tpy_net ?? 0),
        }));

      const payload = {
        tltList: [
          {
            tlt_no: normalValue.tlt_no,
            talent_id: 0,
            pod_no: normalValue.pod_no,
          },
        ],
        feeList,
      };

      this.tls2d010Service.insertTLS2D010(payload).subscribe({
        next: (res) => console.log('新增成功', res),
        error: (err) => console.error('新增失敗', err),
      });
    }
  }
}
