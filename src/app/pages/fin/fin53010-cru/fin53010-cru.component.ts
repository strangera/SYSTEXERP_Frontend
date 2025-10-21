import { Component, computed, effect, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { finalize, forkJoin, Observable, tap } from 'rxjs';
import { FIN53010Data, FIN53010DetailTable, FIN53010InsertPayload, FIN53010InsertResult, FIN53010UpdateResult, QueryFIN53010Detail } from '../fin53010/fin53010.model';

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  styleUrl: './fin53010-cru.component.scss',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
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
    RadiobuttonComponent,
    TableComponent,
  ],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<QueryFIN53010Detail> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    /** 傳票種類(SYS1000.VoucherType) */
    VoucherType: new FormControl<string>('GL', [Validators.required]),
    VouDate: new FormControl<Date>(new Date, [Validators.required]),
    Remark: new FormControl<string | void>(void 0, [Validators.maxLength(100)]),
    INV_YN: new FormControl<'N' | 'Y'>('N', [Validators.required]),
    /** ROC/IFRS 0:共用 1:ROC 2:IFRS */
    VouAccType: new FormControl<'0' | '1' | '2'>('0', [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CrtDate: new FormControl<Date | void>(void 0),
    UpdDate: new FormControl<Date | void>(void 0),
    CompNo: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<FIN53010DetailTable[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public selectedItems: FIN53010Data[] = [];
  public onEditing = !1;
  public rowEditCanSave = !1;

  private readonly filteredTblUserOrgidList = computed(() => this.service.tblUserOrgidList().filter(v => v.value === this.selectedOrgId()));

  public readonly totalRecords = computed(() => this.tableData.length);

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
    return diff < 0.01;
  });

  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return void (() => {
      this.loading = !1;
      this.service.tableLoading.set(!1);
      this.dataEffect.destroy();
    });
    const d = this.service.FIN53010Detail();
    if (!d || !d.Details) return;
    this.dataForm.patchValue({
      VouNo: d.VouNo,
      VouType: ['1', '2', '3'].includes(String(d.VouType)) ? String(d.VouType) as '1' | '2' | '3' : '1',
      PostFlag: ['0', '1', '3'].includes(String(d.PostFlag)) ? String(d.PostFlag) as '0' | '1' | '3' : '0',
      VoucherType: d.VoucherType?.trim() ?? 'GL',
      VouDate: d.VouDate ? new Date(d.VouDate) : new Date(),
      Remark: d.Remark,
      INV_YN: (d.INV_YN ?? 'N') as 'N' | 'Y',
      VouAccType: ['0', '1', '2'].includes(String(d.VouAccType)) ? String(d.VouAccType) as '0' | '1' | '2' : '0',
      CRT_USR_No: d.CRT_USR_No,
      UPD_USR_No: d.UPD_USR_No,
      CompNo: d.CompNo,
    });

    this.tableData.set(d?.Details.map(v => ({
      ...v,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccName: v.AccName ?? this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: v.DetailName ?? this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? this.service.usrMap().get(String(v.DetailNo))?.label,
      displayIndex: v.SerNo / 10 - 1,
    })));

    this.dataEffect.destroy();
    this.logger.debug(`loading detail:`, [d, this.dataForm.getRawValue(), this.tableData()]);
  }, { allowSignalWrites: !0 });

  // Template 相關屬性
  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<Column, 'field'> & { field: keyof FIN53010DetailTable; })[]>(() => [
    { field: 'displayIndex', header: '序號', showSort: !1, format: d => (d + 1) * 10 },
    {
      field: 'AccNo',
      header: '科目代號',
      required: !0,
      type: 'dropdown',
      disabled: () => this.service.accLoading(),
      options: () => this.service.accNoList(),
      optionLabel: 'value',
      optionValue: 'value',
      templateLabel: 'label',
    },
    { field: 'AccName', header: '科目名稱' },
    {
      field: 'DetailNo',
      header: '廠商/員工代號',
      disabled: () => this.service.venLoading() || this.service.usrLoading(),
      type: 'template',
      templateRef: this.venUsrTemplate(),
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    {
      field: 'NoteDesc',
      header: '摘要',
      type: 'dropdown',
      options: () => this.service.remarkList(),
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
      options: () => this.service.orgNoList(),
      optionLabel: 'label',
      optionValue: 'value',
      optionShowClear: !1,
    },
    {
      field: 'SubDetailNo',
      header: '對象別編號',
      type: 'dropdown',
      options: () => this.filteredTblUserOrgidList(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'clearingCode',
      header: '立沖代號',
      type: 'dropdown',
      options: () => [],
      optionLabel: 'label',
      optionValue: 'value',
    },
    // { field: 'recKey', header: '對帳KEY值', type: 'input' },
  ]);

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);
    this.loading = !0;

    if (!this.isFormCreateable) this.service.loadFIN53010Detail(this.rowdata!.id).subscribe();

    this.service.getOrgNoList();
    this.service.getTblUserOrgidList();
    this.service.getVoucherTypeOptions();

    forkJoin([
      this.service.getAccNoList(),
      this.service.getVendorList(),
      this.service.getUsrList(),
    ]).pipe(
      tap(([_accnos, _vendors, _usrs]) => {
        if (!this.isFormCreateable) return;
        this.df().CRT_USR_No.setValue(this.user.user_No);
        this.df().CrtDate.setValue(new Date());
      }),
      finalize(() => {
        this.loading = !1;
        this.service.tableLoading.set(!1);
        this.logger.debug(`init:`, [this.rowdata, this.service.FIN53010Detail()]);
      }),
    ).subscribe();
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const { VouNo, ...d } = this.dataForm.getRawValue();
      const raw = {
        ...d,
        Details: this.tableData().map(({ displayIndex, AccAmtD, AccAmtC, ...rest }, idx) => {
          return {
            ...rest,
            id: typeof rest.id === 'number' ? rest.id! : null,
            index: idx + 1,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
            ORG_ID: rest.ORG_ID || '100000',
          };
        }),
        ...(this.isFormCreateable ? {} : { VouNo }),
      };

      const payload: FIN53010InsertPayload = Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (v !== null && v !== void 0 && v !== '') acc[key as keyof typeof raw] = v;
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [d, payload, this.rowdata, this.tableData()]);

      const request: Observable<FIN53010InsertResult | FIN53010UpdateResult> = this.isFormCreateable
        ? this.service.insertFIN53010Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN53010Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });

      request.pipe(
        finalize(() => this.loading = !1),
        tap(res => {
          if (res.Status !== '0000') return;
          this.messageService.successBubble(this.isFormCreateable ? '新增傳票成功' : '更新傳票成功');
          this.onCancel();
        })
      ).subscribe();
    });
  }

  public onFieldChange(event: FieldChangeEvent<FIN53010DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const row = event.rowData;

    switch (event.field) {
      case 'AccNo':
        // 自動帶入科目名稱
        row.AccName = this.service.accNoMap().get(String(event.value))?.label ?? '';
        break;

      case 'AccAmtD':
        // 自動互斥借貸方金額
        if (event.value) row.AccAmtC = void 0;
        break;

      case 'AccAmtC':
        // 自動互斥借貸方金額
        if (event.value) row.AccAmtD = void 0;
        break;

      case 'ORG_ID':
        // 設定目前選擇的組織代號
        this.selectedOrgId.set(String(event.value));
        row.SubDetailNo = '';
        break;
    }

    // 檢查是否可儲存
    this.rowEditCanSave = !!row.AccNo && !!row.ORG_ID;
  }

  public onDelete(event: FIN53010DetailTable[]): void {
    let ids: number[] = [];
    for (let e of event) {
      if (RegExp(/^[^0-9]/).test(String(e.SerNo))) continue;

      const data = this.tableData();
      const idx = data.findIndex(d => d.SerNo === e.SerNo);
      if (idx > -1) ids.push(idx + 1);
    }
    this.logger.debug(`onDelete:`, [event, ids]);

    this.service.deleteFIN53010Data(ids).pipe(
      finalize(() => this.service.loadFIN53010Detail(this.rowdata!.id))
    ).subscribe();
  }

  public onRowEditInit(event: FIN53010DetailTable): void {
    this.onEditing = !0;
    this.rowEditCanSave = !!event.AccNo && !!event.ORG_ID;
    if (this.rowEditCanSave) return;
    !event.ORG_ID && (event.ORG_ID = '100000');
    this.selectedOrgId.set(event.ORG_ID);
    const arr = this.tableData();
    event.displayIndex = Array.isArray(arr) && arr.length > 0 && (arr[arr.length - 1]?.displayIndex ?? 0) + 1 || 0;
    this.logger.debug(`onRowEditInit:`, [event, arr]);
  }

  public onRowEditSave(event: RowEditSaveEvent<FIN53010DetailTable>): void {
    if (!this.rowEditCanSave) return;

    const newItems = Array.isArray(event.data) ? event.data : [event.data];
    const current = this.tableData();

    const indexMap = new Map(current.map((item, idx) => [item.displayIndex, idx]));
    const result = [...current];

    for (const item of newItems) {
      const index = indexMap.get(item.displayIndex);
      if (index !== void 0) result[index] = { ...result[index], ...item };
      else result.push(item);
    }

    this.tableData.set(result);
    this.onEditing = !1;
    this.logger.debug(`onRowEditSave:`, [event, newItems, result]);
  }

  public onRowEditCancel(event: { data: FIN53010DetailTable, rowData: FIN53010DetailTable[], ri: number; }): void {
    this.onEditing = !1;
    this.logger.debug(`onRowEditCancel:`, [event, this.tableData()]);
  };

  public onRowReorder(event: TableRowReorderEvent): void {
    this.tableData.update(current => {
      const movedItem = current.splice(event.dragIndex!, 1)[0];
      current.splice(event.dropIndex!, 0, movedItem);
      return current;
    });

    this.logger.debug(`onRowReorder:`, [event, this.tableData()]);
  }

  // Template 相關方法
  public onTemplateTypeChange(event: DropdownChangeEvent): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  };

  /** 根據所選模板類型與搜尋條件取得並過濾模板資料 */
  public getFilteredTemplateData(): Option[] {
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
  public selectTemplateItem(rowData: FIN53010DetailTable, item?: Option): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    [rowData.DetailNo, rowData.DetailName] = [item?.value ?? '', item?.['short'] ?? ''];
  };
}
