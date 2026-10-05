import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { FieldChangeEvent, formatAmount } from '@others/component/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { finalize, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailData, FIN52030DetailTable, FIN52030InsertPayload, FIN52030UpdatePayload, VendorList } from '../fin52030/fin52030.model';
import { TableEditComponent } from './table-edit/table-edit.component';
import { EditColumn, EditColumnExtend } from './table-edit/table-edit.model';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  standalone: true,
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

  public readonly fin52030DetailData = signal<FIN52030DetailData>(Object.create(null));
  private readonly selectedOrgId = signal<string>('100000');
  /**
   * 編輯模式用：用於「取消」還原為尚未修改前的表頭/明細狀態
   */
  private editOriginalSnapshot: {
    formValue: Record<string, unknown>;
    tableData: FIN52030DetailTable[];
    selectedOrgId: string;
  } | null = null;

  public readonly tableData = signal<FIN52030DetailTable[]>([]);
  public readonly tableLoading = signal<boolean>(!0);
  public readonly totalRecords = signal<number>(0);

  public selectedItems: FIN52030Data[] = [];

  public readonly rowEditCanSave = signal<boolean>(!1);
  public readonly defaultNewRow = (): Partial<FIN52030DetailTable> => ({});
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

  public readonly getId = computed(() => {
    return this.rowdata?.id || void 0;
  });

  public readonly dropdownEffect = effect(() => {
    const accNos = this.service.accNoOptions();
    const vendors = this.service.vendorOptions();
    const accDescs = this.service.noteDescOptions();
    const [name, date] = [this.user.user_Name, new Date()];

    if (!accNos.length || !vendors.length) return;
    this.logger.debug('dropdown effect:', [accNos, vendors, accDescs, name, date]);

    this.isFormCreateable ? this.dataForm.patchValue({ CRT_USR_No: name, CRT_Date: date })
      : this.dataForm.patchValue({
        CRT_USR_No: this.fin52030DetailData().CRT_USR_Name,
        CRT_Date: this.fin52030DetailData().CRT_Date,
        UPD_USR_No: name,
        UPD_Date: date
      });

    // 只有在新增模式時才關閉 loading，檢視模式的 loading 由 dataEffect 控制
    if (this.isFormCreateable) {
      this.tableLoading.set(!1);
    }
  }, { allowSignalWrites: !0 });

  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return this.dataEffect.destroy();
    const usrMap = this.service.updUsrMap();
    const accNoMap = this.service.accNoMap();
    const vendorMap = this.service.vendorMap();
    const noteDescMap = this.service.noteDescMap();
    const data = this.fin52030DetailData();
    this.logger.debug(`set init table:`, [data]);
    if (!data.Details?.length) return;

    // 讓 table-edit「新增候選列」的預設 ORG_ID 與原始資料一致
    const fallbackOrgId = this.selectedOrgId();
    this.selectedOrgId.set(String(data.Details?.[0]?.ORG_ID ?? fallbackOrgId));

    this.dataForm.patchValue({
      TempNo: data.TempNo,
      TempName: data.TempName,
      VouType: data.VouType,
    });

    const mappedTableData = data.Details.map((v) => ({
      ...v,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? usrMap.get(String(v.DetailNo))?.label,
      NoteDesc: v.NoteDesc ?? this.service.noteDescMap().get(String(v.AccNo))?.label ?? '',
      recKey: v.ACCT_KEY ?? undefined,
    }));

    this.tableData.set(mappedTableData);

    this.logger.debug(`dataEffect:`, [data, this.dataForm.getRawValue(), this.tableData()]);
    if (!accNoMap.size || !vendorMap.size || !usrMap.size || !noteDescMap.size) return;
    // 資料已載入完成，關閉 loading
    this.tableLoading.set(!1);

    // 資料載入完成後，建立快照供「取消」還原
    this.editOriginalSnapshot = {
      formValue: this.dataForm.getRawValue(),
      tableData: mappedTableData.map(row => ({ ...row })),
      selectedOrgId: this.selectedOrgId(),
    };
    this.dataEffect.destroy();
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.accLoading()
      || this.service.venLoading()
      || this.service.usrLoading()
      || this.service.RefNameLoading()
      || this.service.noteDescLoading();
  });

  public readonly initEffect = effect(() => {
    const id = this.getId();
    if (typeof id !== 'number' || !Number.isInteger(id)) return;

    this.tableLoading.set(!0);
    this.service.loadFIN52030Detail(id).pipe(
      tap(res => this.logger.debug(`ngOnInit load detail:`, [res])),
      tap(res => this.fin52030DetailData.set({
        ...res.Data,
        Details: res.Data?.Details.map(v => ({
          ...v,
          // 「摘要」改為輸入框：以後端 NoteDesc 為主；缺值才用預設值補齊
          NoteDesc: v.NoteDesc ?? this.service.noteDescMap().get(String(v.AccNo))?.label ?? '',
        })) || [],
      })),
      finalize(() => {
        this.tableLoading.set(!1);
        this.initEffect.destroy();
      }),
    ).subscribe();
  }, { allowSignalWrites: !0 });

  // Template 相關屬性
  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<EditColumn, 'field'> & { field: keyof FIN52030DetailTable; })[]>(() => {
    return [
      {
        field: 'AccNo',
        header: '科目代號',
        type: 'dropdown',
        required: !0,
        showClear: !1,
        disabled: () => this.service.accLoading(),
        options: () => this.service.accNoOptions(),
        optionLabel: 'label',
        optionValue: 'value',
      },
      {
        field: 'DetailNo',
        header: '廠商/員工代號',
        type: 'template',
        // 顯示用欄位（避免把 DetailNo 存成 "value - label"）
        templateDisplayField: 'DetailName',
        disabled: () => this.service.venLoading() || this.service.usrLoading(),
        templateRef: this.venUsrTemplate(),
      },
      {
        field: 'NoteDesc',
        header: '摘要',
        type: 'input',
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
        options: () => this.service.orgNoOptions(),
        optionLabel: 'label',
        optionValue: 'value',
      },
      { field: 'SubDetailNo', header: '對象別編號', type: 'input' },
      { field: 'recKey', header: '對帳KEY值', type: 'input' },
    ];
  });

  constructor(
    public readonly service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.getUserInfo()!;
  }

  public ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);

    this.service.getOrgNoOptions();
    this.service.getRefNameOptions();
    this.service.getAccNoOptions();
    this.service.getVendorOptions();
    this.service.getUsrOptions();
    this.service.getAccDescOptions([]);

    this.logger.debug(`init:`, [this.user, this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      // === 業務檢核（維持在 onSubmit 檢核） ===
      if (!this.isBalanced()) {
        this.messageService.errorBubble('借貸不平衡');
        this.loading = false;
        return;
      }

      if (this.tableData().length === 0) {
        this.messageService.errorBubble('明細至少要有一筆');
        this.loading = false;
        return;
      }

      const d = this.dataForm.getRawValue();
      const raw = {
        ...d,
        Details: this.tableData().filter(row => !!row.AccNo).map(({ AccAmtD, AccAmtC, NoteDesc, recKey, ...rest }) => ({
          ...rest,
          index: rest.SerNo,
          AccName: undefined,
          DetailName: undefined,
          ACCT_KEY: recKey ?? undefined,
          AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
          AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
          NoteDesc: NoteDesc !== undefined && NoteDesc !== null ? String(NoteDesc) : '',
        })),
      } as FIN52030InsertPayload | FIN52030UpdatePayload;
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN52030InsertPayload | FIN52030UpdatePayload;

      this.tableLoading.set(!0);
      this.logger.debug(`onSubmit:`, [raw, payload]);
      const request = this.isFormCreateable
        ? this.service.insertFIN52030Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN52030Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });

      request.pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.onCancel();
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '更新成功');
        },
      });
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
          // result[index].AccName = this.service.accNoMap().get(String(event.value))?.label ?? '';
          // 自動帶入摘要
          result[index].NoteDesc = this.service.noteDescMap().get(String(event.value))?.label ?? '';
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
          // input 輸入即直接寫入字串
          result[index].NoteDesc = event.value !== undefined && event.value !== null ? String(event.value) : '';
          break;
      }

      // 檢查是否可儲存
      this.rowEditCanSave.set(!!result[index].AccNo && !!result[index].ORG_ID || !!this.isBalanced());

      return result;
    });
  }

  public onDelete(event: (FIN52030DetailTable & Partial<EditColumnExtend>)[]): void {
    const data = this.tableData();
    const ev = event ?? [];
    // 用 event 陣列索引判斷刪除列（row 沒有 .index；刪除「新增」列時該列會從 fullData 移除，event 筆數會變少）
    const deletedIndexes = new Set<number>(
      ev.length < data.length
        ? [] // 筆數變少：下方用「以 event 為剩餘資料」處理，不依 deletedIndexes
        : ev.map((e, i) => (e?._dataStatus === 'deleted' ? i : -1)).filter(i => i >= 0)
    );

    this.logger.debug(`onDelete:`, [event, data, deletedIndexes]);

    if (ev.length < data.length) {
      // 刪除的是「新增」列，table-edit 已從 fullData 移除，event 即剩餘列
      this.tableData.set(
        ev.map((item, index) => ({ ...item, index, SerNo: (index + 1) * 10 }))
      );
    } else if (deletedIndexes.size > 0) {
      this.tableData.update(current =>
        current
          .filter((_, index) => !deletedIndexes.has(index))
          .map((item, index) => ({ ...item, index, SerNo: (index + 1) * 10 }))
      );
    }
    this.logger.debug(`onDelete - table updated:`, [this.tableData()]);
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
      ? this.service.vendorOptions()
      : this.isFormCreateable ? this.service.crtUsrOptions() : this.service.updUsrOptions();
    const term = this.templateSearchTerm?.trim().toLowerCase();
    if (!term) return src;

    this.logger.debug(`getFilteredTemplateData:`, [src, term]);
    return src.filter((item: any) => {
      const label = item.label?.toLowerCase() || '';
      const value = item.value?.toLowerCase() || '';
      return label.includes(term) || value.includes(term);
    });
  }

  /** 選中的項目 */
  public selectTemplateItem(rowData: FIN52030DetailTable, item?: Option): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    rowData.DetailNo = String(item?.value ?? '');
    rowData.DetailName = String(item?.label ?? '');
    const uniformNo = String(item?.['No'] ?? '').trim();
    const inGLS1016 = !!uniformNo && this.service.refNameOptions().some(o => String(o.value) === uniformNo);
    rowData.SubDetailNo = inGLS1016 ? uniformNo : '';
    rowData.recKey = inGLS1016 ? uniformNo : null;
  }

  public onCancelClearTable(): void {
    // 新增模式：維持既有行為（取消編輯/新增明細：清空表格）
    if (this.isFormCreateable) {
      this.tableData.set([]);
      return;
    }

    // 編輯模式：還原成尚未修改前的狀態（表頭 + 明細 + 組織代號）
    if (!this.editOriginalSnapshot) {
      this.tableData.set([]);
      return;
    }

    const snap = this.editOriginalSnapshot;
    this.dataForm.reset(snap.formValue as any);
    this.selectedOrgId.set(snap.selectedOrgId);
    this.tableData.set(snap.tableData.map(row => ({ ...row })));
  }
}
