import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { FieldChangeEvent, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { combineLatest, finalize, tap } from 'rxjs';
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
    TableEditComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<FIN52030Data> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    TempNo: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(8)]),
    TempName: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(40)]),
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0, [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    CRT_Date: new FormControl<Date | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    UPD_Date: new FormControl<Date | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<FIN52030DetailTable[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public selectedItems: FIN52030Data[] = [];

  public readonly rowEditCanSave = signal<boolean>(!1);
  public readonly defaultNewRow = (): Partial<FIN52030DetailTable> => ({
    ORG_ID: this.selectedOrgId(),
  });
  public readonly footerData = (): Partial<FIN52030DetailTable> => ({
    AccAmtD: this.debitTotal(),
    AccAmtC: this.creditTotal(),
  });

  // 計算借貸方總額
  public readonly debitTotal = computed(() =>
    this.tableData().reduce((sum, row) => sum + (row.AccAmtD || 0), 0)
  );

  public readonly creditTotal = computed(() =>
    this.tableData().reduce((sum, row) => sum + (row.AccAmtC || 0), 0)
  );

  // 檢查借貸是否平衡
  public readonly isBalanced = computed(() => {
    const data = this.tableData();
    if (!data.length) return !0;
    const diff = Math.abs(this.debitTotal() - this.creditTotal());
    // 因為是自然數 所以不需要排除誤差 保留未來變更
    // return diff < 0.01;
    return !diff;
  });

  public readonly dropdownEffect = effect(() => {
    const accNos = this.service.accNoList();
    const vendors = this.service.vendorList();
    const usrs = this.service.usrList();
    const accDescs = this.service.noteDescList();
    const [name, date] = [this.user.user_Name, new Date()];

    if (!accNos.length || !vendors.length || !usrs.length) return;
    this.logger.debug('dropdown effect:', [accNos, vendors, usrs, accDescs, name, date]);

    this.isFormCreateable
      ? this.dataForm.patchValue({ CRT_USR_No: name, CRT_Date: date })
      : this.dataForm.patchValue({ UPD_USR_No: name, UPD_Date: date });

    this.loading = !1;
    this.service.tableLoading.set(!1);
  }, { allowSignalWrites: !0 });

  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return void (() => {
      this.loading = !1;
      this.service.tableLoading.set(!1);
      this.dataEffect.destroy();
    });
    const data = this.service.FIN52030Detail();
    this.logger.debug(`set init table:`, [data]);
    if (!data.Details?.length) return;

    this.dataForm.patchValue({
      TempNo: data.TempNo,
      TempName: data.TempName,
      VouType: data.VouType,
    });

    this.tableData.set(data.Details.map(v => ({
      ...v,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? this.service.usrMap().get(String(v.DetailNo))?.label,
      NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
    })));

    this.logger.debug(`dataEffect:`, [data, this.dataForm.getRawValue(), this.tableData()]);
    if (!this.service.accNoMap().size
      || !this.service.vendorMap().size
      || !this.service.usrMap().size
      || !this.service.noteDescMap().size) return;
    this.dataEffect.destroy();
  }, { allowSignalWrites: !0 });

  // Template 相關屬性
  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<EditColumn, 'field'> & { field: keyof FIN52030DetailTable; })[]>(() => [
    { field: 'SerNo', header: '序號' },
    {
      field: 'AccNo',
      header: '科目代號',
      type: 'dropdown',
      required: !0,
      showClear: !1,
      disabled: () => this.service.accLoading(),
      options: () => this.service.accNoList(),
      optionLabel: 'value',
      optionValue: 'value',
      templateLabel: 'templateLabel',
    },
    { field: 'AccName', header: '科目名稱' },
    {
      field: 'DetailNo',
      header: '廠商/員工代號',
      type: 'template',
      disabled: () => this.service.venLoading() || this.service.usrLoading(),
      templateRef: this.venUsrTemplate(),
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    {
      field: 'NoteDesc',
      header: '摘要',
      type: 'dropdown',
      disabled: () => this.service.noteDescLoading(),
      options: (v: FIN52030DetailTable) => computed(() =>
        this.service.noteDescList().find(item => item.value === v.AccNo)?.data ?? [])(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'AccAmtD',
      header: '借方金額',
      type: 'inputNumber',
      format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
      isTotal: !0,
    },
    {
      field: 'AccAmtC',
      header: '貸方金額',
      type: 'inputNumber',
      format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
      isTotal: !0,
    },
    {
      field: 'ORG_ID',
      header: '組織代號',
      type: 'dropdown',
      showClear: !1,
      options: () => this.service.orgNoList(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'SubDetailNo',
      header: '對象別編號',
      type: 'dropdown',
      options: () => this.service.refNameList(),
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
    this.user = this.authService.getUserInfo()!;
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);
    this.loading = !0;

    if (!this.isFormCreateable) this.service.loadFIN52030Detail(this.rowdata!.id).subscribe();

    this.service.getOrgNoList();
    this.service.getRefNameList();
    this.service.getAccNoList();
    this.service.getVendorList();
    this.service.getUsrList();
    this.service.getAccDescList([]);

    this.logger.debug(`init:`, [this.user, this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const raw = {
        ...d,
        Details: this.tableData().map(({ AccAmtD, AccAmtC, NoteDesc, ...rest }, index) => ({
          ...rest,
          index,
          AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
          AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
          NoteDesc: this.service.noteDescMap().get(String(NoteDesc))?.label ?? NoteDesc,
        })),
      };

      const payload = Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (v !== null && v !== void 0 && v !== '') acc[key as keyof typeof raw] = v;
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [d, raw, payload, this.rowdata, this.tableData()]);

      const request = this.isFormCreateable
        ? this.service.insertFIN52030Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN52030Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });

      request.pipe(
        finalize(() => this.loading = !1),
      ).subscribe(res => res.Status === '0000' && this.onCancel());
    });
  }

  public onFieldChange(event: FieldChangeEvent<FIN52030DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);

    // 更新 tableData 並觸發重算合計
    this.tableData.update(current => {
      const result = [...current];
      const index = event.index;

      if (typeof index !== 'number' || index < 0 || index >= result.length) {
        result.push({ ...event.rowData, SerNo: (result.length + 1) * 10 });
        return result;
      }

      switch (event.field) {
        case 'AccNo':
          // 自動帶入科目名稱
          result[index].AccName = this.service.accNoMap().get(String(event.value))?.label ?? '';
          // 自動帶入摘要
          result[index].NoteDesc = String(this.service.noteDescMap()
            .get(event.value)?.data?.[0].label || event.value || '');
          break;

        case 'AccAmtD':
          // 自動互斥借貸方金額
          if (event.value) result[index].AccAmtC = void 0;
          break;

        case 'AccAmtC':
          // 自動互斥借貸方金額
          if (event.value) result[index].AccAmtD = void 0;
          break;

        case 'ORG_ID':
          // 設定目前選擇的組織代號
          this.selectedOrgId.set(String(event.value));
          result[index].SubDetailNo = '';
          break;
        case 'NoteDesc':
          result[index].NoteDesc = String(this.service.noteDescMap()
            .get(result[index].AccNo)?.data
            ?.find(d => d.value === event.value)?.label
            || event.value || '');
          break;
      }

      // 更新 SerNo
      result[index].SerNo = (index + 1) * 10;

      // 檢查是否可儲存
      this.rowEditCanSave.set(!!result[index].AccNo && !!result[index].ORG_ID || !!this.isBalanced());

      return result;
    });
  }

  public onDelete(event: FIN52030DetailTable[]): void {
    const data = this.tableData();
    const indexMap = new Map(data.map((item, idx) => [item.index, idx + 1]));

    const ids = event
      .filter(e => /^\d/.test(String(e.index)))
      .map(e => indexMap.get(e.index))
      .filter(Boolean) as number[];

    if (ids.length === 0) return;

    this.service.deleteFIN52030Data(ids).pipe(
      finalize(() => this.service.loadFIN52030Detail(this.rowdata!.id))
    ).subscribe();
  }

  public onRowReorder(event: TableRowReorderEvent): void {
    this.tableData.update(current => {
      const newArray = [...current];
      const movedItem = newArray.splice(event.dragIndex!, 1)[0];
      newArray.splice(event.dropIndex!, 0, movedItem);

      return newArray.map((item, index) => ({
        ...item,
        index,
        SerNo: (index + 1) * 10,
      }));
    });

    this.logger.debug(`onRowReorder:`, [event, this.tableData()]);
  }

  // Template 相關方法
  public onTemplateTypeChange(event: DropdownChangeEvent): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  }

  /** 根據所選模板類型與搜尋條件取得並過濾模板資料 */
  public getFilteredTemplateData(): (VendorList | Option)[] {
    const src = this.selectedTemplateType === 'vendor'
      ? this.service.vendorList()
      : this.service.usrList();

    const term = this.templateSearchTerm?.trim().toLowerCase();
    if (!term) return src;

    return src.filter((item: any) => {
      const label = item.label?.toLowerCase() || '';
      const value = item.value?.toLowerCase() || '';
      return label.includes(term) || value.includes(term);
    });
  }

  /** 選中的項目 */
  public selectTemplateItem(rowData: FIN52030DetailTable, item?: Option): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    [rowData.DetailNo, rowData.DetailName] = [item?.value || '', item?.['short'] || ''];
  }
}
