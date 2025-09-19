import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Validators, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService, IDropdownItem, IAPS1003Request } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { Tls2d010Service } from '../../../service/api/tls/tls2d010.service';
import { forkJoin, map } from 'rxjs';
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
    TableComponent,
    DialogComponent,
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

  // 共用資料
  data: any[] = [];
  selectedItems: any[] = [];
  tlt_noOptions: IDropdownItem[] = [];
  pod_noOptions: any[] = [];

  // 下拉選項
  org_idOptions: IDropdownItem[] = [];
  CAP_TypeOptions = getSYS1000Options('CAP_Type');
  CAP_ItemOptions: IDropdownItem[] = [];
  AccNoOptions: IDropdownItem[] = [];
  OrgOptions: any[] = [];
  GuiFlagOptions: any[] = [];
  CapTaxTypeOptions: any[] = [];
  cap_taxtypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
  ];
  // 欄位設定
  columnsCounter: EditColumn[] = [];
  columnsNormal: EditColumn[] = [
    { field: 'tlt_no', header: '專櫃編號/名稱', type: 'dropdown', width: '12rem', optionLabel: 'label', optionValue: 'No' },
    { field: 'contract_no', header: '契約編號', type: 'inputNumber', width: '12rem', disabled: () => true },
    { field: 'contract_subno', header: '版次', type: 'inputNumber', width: '15rem', disabled: () => true },
    { field: 'pod_no', header: '活動代碼/名稱', type: 'dropdown', width: '10rem', optionLabel: 'SYS_Name', optionValue: 'SYS_Code' },
    { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
    { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
    { field: 'remarks', header: '備註', type: 'inputNumber', width: '12rem' },
  ];

  // 表單
  dataFormCounter = this.formBuilder.group({
    tlt_no: [''],
    CAP_Item: [''],
    AccNo: [''],
    org_id: [''],
    tpy_date: [null],
    GUI_FLAG: [''],
    tpy_net: [null],
    remarks: [''],
    pod_no: [],
    totalCash: [{ value: null as string | null, disabled: true }, [Validators.required]],
    contract_no: [{ value: null as string | null, disabled: true }, [Validators.required]],
    contract_subno: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_bdate: [{ value: null as string | null, disabled: true }, [Validators.required]],
    tlt_contract_edate: [{ value: null as string | null, disabled: true }, [Validators.required]],
  });

  dataFormNormal = this.formBuilder.group({
    tlt_no: [''],
    pod_no: [],
    remarks: [],
    CAP_Type: [],
    tpy_date: [null as null | Date, [Validators.required]],
    CAP_Item: [],
    tpy_net: [],
    cap_taxtype: [null],
    GUI_FLAG: [],
    AccNo: [],
    org_id: [],
  });

  constructor(
    private dropDownListService: DropDownListService,
    private route: ActivatedRoute,
    public sharedDropdownService: SharedDropdownService,
    private tls2d010Service: Tls2d010Service
  ) {
    super();
  }

  ngOnInit(): void {
    const rowdata = history.state?.rowdata;
    if (rowdata) {
      this.currentCreateType = rowdata.type;
      if (this.currentCreateType === 'counter') {
        // 日期轉型
        if (rowdata.tpy_date) rowdata.tpy_date = new Date(rowdata.tpy_date);
        this.dataFormCounter.patchValue(rowdata);
        // 這裡加上
        this.data = [rowdata];
      } else {
        this.dataFormNormal.patchValue(rowdata);
        this.data = [rowdata];
      }
    }
    if (this.currentCreateType === 'counter') {
      this.initializePage('TLS2D010', this.dataFormCounter);
    } else {
      this.initializePage('TLS2D010', this.dataFormNormal);
    }

    if (this.rowdata) {
      this.currentCreateType = this.rowdata.type;
    }

    // 載入專櫃 & 活動
    this.loadTltAndPodOptions();

    // 載入 Counter 欄位設定
    this.loadAndSetupColumnsCounter();
    // 載入 Normal 欄位設定
    this.loadAndSetupColumnsNormal();
  }

  // ===== 專櫃 & 活動選單 =====
  private loadTltAndPodOptions(): void {
    this.dropDownListService.queryPOS2001_DropDownList().subscribe((res) => {
      this.tlt_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.No ?? item.NO,
        label: `${item.No ?? item.NO}-${item.Name ?? item.NAME}`,
        No: item.No ?? item.NO,
        Name: item.Name ?? item.NAME,
        talent_id: item.talent_id ?? 0,
      }));
    });
    this.dropDownListService.getActivityOptions({ mid: 0, str_no: '10', pod_type: [], pod_status: '' }).subscribe((res) => {
      this.pod_noOptions = (res?.Data || []).map((item: any) => ({
        value: item.pod_no,
        label: `${item.pod_no}-${item.pod_desc}`
      }));
    });
    this.dropDownListService.queryGLS1005_DropDownList().subscribe((res) => {
      this.AccNoOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`,
        No: item.No,
        Name: item.Name
      }));
    });
    this.dropDownListService.querySYS3100_DropDownList().subscribe(
      (res) => {
        this.org_idOptions = (res?.Data || []).map((item: any) => ({
          value: item.No,                // 綁定值
          label: `${item.No}-${item.Name}`, // 顯示文字
          No: item.No,
          Name: item.Name
        }));
      },
    );
    this.dropDownListService.queryAPS1003_DropDownList({} as IAPS1003Request).subscribe((res) => {
      this.CAP_ItemOptions = (res?.Data || []).map((item: any) => ({
        value: item.No,
        label: `${item.No}-${item.Name}`,
        No: item.No,
        Name: item.Name
      }));
    });
  }

  // ===== 載入 Counter 欄位動態下拉 =====
  private loadAndSetupColumnsCounter(): void {

    const capItem$ = this.dropDownListService.queryAPS1003_DropDownList({} as IAPS1003Request).pipe(
      map((res: any) => (res?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    );

    const accNo$ = this.dropDownListService.queryAPS1003_DropDownList({} as IAPS1003Request).pipe(
      map((res: any) => (res?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    );

    const orgId$ = this.dropDownListService.querySYS3100_DropDownList().pipe(
      map((res: any) => (res?.Data ?? []).map((x: any) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    );

    const guiFlag$ = this.dropDownListService.queryAPS1003_DropDownList({} as IAPS1003Request).pipe(
      map(() => [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ])
    );

    const capTaxType$ = this.dropDownListService.queryAPS1003_DropDownList({} as IAPS1003Request).pipe(
      map(() => [
        { label: '免稅', value: '0' },
        { label: '應稅', value: '1' },
      ])
    );

    forkJoin([capItem$, accNo$, orgId$, guiFlag$, capTaxType$])
      .pipe(untilDestroyed(this))
      .subscribe(([CAP_ITEM, ACCNO, ORG, GUI, TAX]) => {
        this.CAP_ItemOptions = CAP_ITEM ?? [];
        this.AccNoOptions = ACCNO ?? [];
        this.OrgOptions = ORG ?? [];
        this.GuiFlagOptions = GUI ?? [];
        this.CapTaxTypeOptions = TAX ?? [];

        this.columnsCounter = [
          { field: 'tpy_date', header: '扣款日期', type: 'date', width: '12rem' },
          { field: 'CAP_Type', header: '扣款類型', type: 'dropdown', width: '12rem', options: this.CAP_TypeOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'CAP_Item', header: '扣款項目', type: 'dropdown', width: '12rem', options: this.CAP_ItemOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'AccNo', header: '會計科目', type: 'dropdown', width: '10rem', options: this.AccNoOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'org_id', header: '組織代號', type: 'dropdown', width: '15rem', options: this.OrgOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'GUI_FLAG', header: '是否開立發票', type: 'dropdown', width: '9rem', options: this.GuiFlagOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'cap_taxtype', header: '課稅別', type: 'dropdown', width: '9rem', options: this.CapTaxTypeOptions, optionLabel: 'label', optionValue: 'value' },
          { field: 'tpy_net', header: '扣款金額(未稅)', type: 'inputNumber', width: '12rem' },
          { field: 'remarks', header: '備註', type: 'input', width: '12rem' },
        ];
      });
  }
  // ===== 載入 normal 欄位動態下拉 =====
  private loadAndSetupColumnsNormal(): void {
    const tltNo$ = this.dropDownListService.queryPOS2001_DropDownList().pipe(
      map((res: any) =>
        (res?.Data ?? []).map((x: any) => ({
          label: `${x.No}-${x.Name}`,
          value: x.No,
          contract_no: x.contract_no,
          contract_subno: x.contract_subno,
        }))
      )
    );

    const podNo$ = this.dropDownListService.getActivityOptions({ mid: 0, str_no: '10', pod_type: [], pod_status: '' }).pipe(
      map((res: any) => (res?.Data ?? []).map((item: any) => ({
        value: item.pod_no,
        label: `${item.pod_no}-${item.pod_desc}`
      })))
    );

    forkJoin([tltNo$, podNo$])
      .pipe(untilDestroyed(this))
      .subscribe(([TLT, POD]) => {
        this.tlt_noOptions = TLT ?? [];
        this.pod_noOptions = POD ?? [];

        this.columnsNormal = [
          {
            field: 'tlt_no',
            header: '專櫃編號/名稱',
            type: 'dropdown',
            width: '12rem',
            options: this.tlt_noOptions,
            optionLabel: 'label',
            optionValue: 'value',
          },
          {
            field: 'contract_no',
            header: '契約編號',
            type: 'inputNumber',
            width: '12rem',
            disabled: () => true, // 自動代入
          },
          {
            field: 'contract_subno',
            header: '版次',
            type: 'inputNumber',
            width: '12rem',
            disabled: () => true, // 自動代入
          },
          {
            field: 'pod_no',
            header: '活動代碼/名稱',
            type: 'dropdown',
            width: '12rem',
            options: this.pod_noOptions,
            optionLabel: 'label',
            optionValue: 'value',
          },
          {
            field: 'tpy_date',
            header: '扣款日期',
            type: 'date',
            width: '12rem',
          },
          {
            field: 'tpy_net',
            header: '扣款金額(未稅)',
            type: 'inputNumber',
            width: '12rem',
          },
          {
            field: 'remarks',
            header: '備註',
            type: 'input',
            width: '12rem',
          },
        ];
      });
  }

  // ===== 送出 =====
  // ===== 送出 =====
  onSubmit(): void {
    this.submitted = true;

    if (this.currentCreateType === 'counter') {
      const counterValue = this.dataFormCounter.getRawValue();

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
            tlt_no: counterValue.tlt_no,
            talent_id: 0,
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
          remarks: normalValue.remarks,
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
