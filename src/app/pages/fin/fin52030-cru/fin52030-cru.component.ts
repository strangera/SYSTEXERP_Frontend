import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { finalize, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailTable, VendorList } from '../fin52030/fin52030.model';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  styleUrl: './fin52030-cru.component.scss',
  standalone: !0,
  imports: [
    ButtonModule,
    CheckboxModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    PanelModule,
    ReactiveFormsModule,
    TableModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<FIN52030Data> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    TempNo: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(8)]),
    TempName: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(40)]),
    VouType: new FormControl<string | void>(void 0, [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    createDate: new FormControl<Date | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    modifyDate: new FormControl<Date | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<FIN52030DetailTable[]>([]);

  public selectedItems: Record<string, any>[] = [];
  public onEditing = !1;
  public rowEditCanSave = !1;

  public readonly totalRecords = computed(() => this.tableData().length);

  // Template 相關屬性
  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<Column, 'field'> & { field: keyof FIN52030DetailTable; })[]>(() => [
    { field: 'displayIndex', header: '序號', showSort: !1, format: d => (d + 1) * 10 },
    {
      field: 'AccNo',
      header: '科目代號',
      type: 'dropdown',
      options: () => this.service.accNoList(),
      optionLabel: 'value',
      optionValue: 'value',
      templateLabel: 'label',
    },
    { field: 'AccName', header: '科目名稱' },
    {
      field: 'DetailNo',
      header: '廠商/員工代號',
      disabled: () => this.service.venUsrLoading,
      type: 'template',
      templateRef: this.venUsrTemplate(),
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    { field: 'NoteDesc', header: '摘要', type: 'input' },
    {
      field: 'AccAmtD',
      header: '借方金額',
      type: 'inputNumber',
      format: d => d.AccDC === 'D' && formatAmount(d.AccAmt) || '',
      isTotal: !0,
    },
    {
      field: 'AccAmtC',
      header: '貸方金額',
      type: 'inputNumber',
      format: d => d.AccDC === 'C' && formatAmount(d.AccAmt) || '',
      isTotal: !0,
    },
    {
      field: 'ORG_ID',
      header: '組織代號',
      type: 'dropdown',
      options: () => this.service.orgNoList(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'SubDetailNo',
      header: '對象別編號',
      type: 'dropdown',
      options: () => this.service.subDetailNoList(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    { field: 'recKey', header: '對帳KEY值', type: 'input' },
  ]);

  constructor(
    public service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
    this.authService.getUserInfo() && (this.user = this.authService.getUserInfo()!);
  }

  ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);

    this.service.getSubpoenaTypes();
    this.service.getAccNoList();
    this.service.getOrgNoList();

    if (this.isFormCreateable) {
      this.service.getUsrList();
      this.service.getVendorList();
      this.df().CRT_USR_No.setValue(this.user.user_Name);
      this.df().createDate.setValue(new Date());
    } else {
      this.service.loadFIN52030Detail(this.rowdata!.id).pipe(
        finalize(() => this.loading = !1),
        tap(res => {
          this.logger.debug(`loadFIN52030Detail:`, [res]);
          this.tableData.set(res.Data.map(d => ({
            ...d,
            AccAmtD: d.AccDC === 'D' ? d.AccAmt : void 0,
            AccAmtC: d.AccDC === 'C' ? d.AccAmt : void 0,
            AccName: this.service.accNoMap.get(String(d.AccNo))?.['Name'] ?? '',
            DetailName: this.service.vendorMap.get(String(d.DetailNo))?.label
              ?? this.service.usrMap.get(String(d.DetailNo))?.label ?? '',
            displayIndex: d.index,
          })));
        })
      ).subscribe();
    }

    this.logger.debug(`init:`, [this.rowdata, this.service.FIN52030Detail()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const payload = {
        ...d,
        TempNo: String(d.TempNo),
        VouType: String(d.VouType),
        TempName: String(d.TempName),
        Details: this.tableData().map(({ AccAmtD, AccAmtC, ...rest }, idx) => {
          return {
            ...rest,
            index: idx + 1,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
          };
        }),
      };

      this.logger.debug(`onSubmit:`, [d, payload, this.rowdata, this.tableData()]);

      const request = this.isFormCreateable
        ? this.service.insertFIN52030Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN52030Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });

      request.pipe(
        finalize(() => this.loading = !1)
      ).subscribe(res => res.Status === '0000' && this.onCancel());
    });
  }

  public onFieldChange(event: FieldChangeEvent<FIN52030DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const row = event.rowData;

    // 自動帶入科目名稱
    if (event.field === 'AccNo') row.AccName = this.service.accNoMap.get(String(event.value))?.['Name'] ?? '';

    // 自動互斥借貸方金額
    if (event.field === 'AccAmtD' && row.AccAmtC) row.AccAmtC = void 0;
    if (event.field === 'AccAmtC' && row.AccAmtD) row.AccAmtD = void 0;

    // 檢查是否可儲存
    const include: (keyof FIN52030DetailTable)[] = ['AccNo', 'DetailNo', 'ORG_ID'];
    let allFilled = !0;
    for (const key of include) {
      const v = row[key];
      if (v === void 0 || v === null || v === '' || (typeof v === 'number' && isNaN(v))) allFilled = !1;
    }
    this.rowEditCanSave = allFilled;
  }

  public onDelete(event: FIN52030DetailTable[]): void {
    let ids: number[] = [];
    for (let e of event) {
      if (RegExp(/^[^0-9]/).test(String(e.index))) continue;

      const data = this.tableData();
      const idx = data.findIndex(d => d.index === e.index);
      if (idx > -1) ids.push(idx + 1);
    }
    this.logger.debug(`onDelete:`, [event, ids]);

    this.service.deleteFIN52030Data(ids).pipe(
      finalize(() => this.service.loadFIN52030Detail(this.rowdata!.id))
    ).subscribe();
  }

  public onRowEditInit(event: FIN52030DetailTable): void {
    this.onEditing = !0;
    if (this.isFormCreateable) event.ORG_ID = '100000';
    event.displayIndex = this.tableData()[this.tableData().length - 1].index + 1 || 0;
    this.logger.debug(`onRowEditInit:`, [event, this.tableData()]);
  }

  public onRowEditSave(event: RowEditSaveEvent<FIN52030DetailTable>): void {
    if (!this.rowEditCanSave) return;
    const arr = Array.isArray(event.data) ? event.data : [event.data];
    const curr = this.tableData();
    this.tableData.update(list =>
      arr.reduce((acc, item) => {
        const i = acc.findIndex(d => d.index === item.index);
        i > -1 ? acc[i] = { ...acc[i], ...item } : acc.push(item);
        return acc;
      }, [...curr])
    );
    this.onEditing = !1;
    this.logger.debug(`onRowEditSave:`, [event, this.tableData()]);
  }

  public onRowEditCancel(event: { data: FIN52030DetailTable, rowData: FIN52030DetailTable[], ri: number; }): void {
    this.onEditing = !1;
    this.logger.debug(`onRowEditCancel:`, [event, this.tableData()]);
  };

  // Template 相關方法
  public onTemplateTypeChange(event: DropdownChangeEvent): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  };

  /** 根據所選模板類型與搜尋條件取得並過濾模板資料 */
  public getFilteredTemplateData(): (VendorList | Option)[] {
    const src = this.selectedTemplateType === 'vendor'
      ? this.service.vendorList()
      : this.service.usrList();

    const term = (this.templateSearchTerm || '').trim().toLowerCase();
    if (!term) return src;

    const result: (VendorList | Option)[] = [];
    for (let i = 0, n = src.length; i < n; i++) {
      const it: any = src[i];
      const lb = (it.label || '').toLowerCase();
      const val = (it.value || '').toLowerCase();
      (lb.indexOf(term) > -1 || val.indexOf(term) > -1) && result.push(it);
    }
    return result;
  }

  /** 選中的項目 */
  public selectTemplateItem(rowData: FIN52030DetailTable, item?: Option): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    [rowData.DetailNo, rowData.DetailName] = [item?.value || '', item?.['short'] || ''];
  }
}
