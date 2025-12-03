import { Component, computed, effect, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CheckboxComponent } from '@shared/componentkit/checkbox/checkbox.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn, EditColumnExtend } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { concatMap, finalize, Observable, tap } from 'rxjs';
import { FIN52030Data, FIN52030DetailData, FIN52030Payload } from '../fin52030/fin52030.model';
import { FIN53010Data, FIN53010DetailTable, FIN53010InsertResult, FIN53010UpdateResult, QueryFIN53010Detail } from '../fin53010/fin53010.model';

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
    CheckboxComponent,
    DialogComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    RadiobuttonComponent,
    TableComponent,
    TableEditComponent,
  ],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<QueryFIN53010Detail> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票類別 1:現金收入 2:現金支出 3:轉帳傳票 */
    VouType: new FormControl<'1' | '2' | '3' | void>(void 0, [Validators.required]),
    /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
    PostFlag: new FormControl<'0' | '1' | '3' | void>(void 0),
    /** 傳票種類(SYS1000.VoucherType) */
    VoucherType: new FormControl<string>('GL', [Validators.required]),
    VouDate: new FormControl<Date>(new Date, [Validators.required]),
    Remark: new FormControl<string | void>(void 0, [Validators.maxLength(100)]),
    INV_YN: new FormControl<'N' | 'Y'>('N', [Validators.required]),
    /** ROC/IFRS 0:ROC 1:IFRS null:全部 */
    VouAccType: new FormControl<'0' | '1' | void>('0', [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(this.isFormCreateable ? this.user.user_No : void 0),
    UPD_USR_No: new FormControl<string | void>(!this.isFormCreateable ? this.user.user_No : void 0),
    CRT_Date: new FormControl<Date | void>(this.isFormCreateable ? new Date() : void 0),
    UPD_Date: new FormControl<Date | void>(!this.isFormCreateable ? new Date() : void 0),
    CompNo: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly fin53010DetailData = signal<QueryFIN53010Detail>(Object.create(null));
  public readonly totalRecords = signal(0);
  public readonly tableData = signal<FIN53010DetailTable[]>([]);
  public readonly selectedDetail = signal<FIN52030DetailData[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public readonly tableLoading = signal<boolean>(!1);

  public selectedItems: FIN53010Data[] = [];
  public rowEditCanSave = signal<boolean>(!1);
  public displayDialog = signal<boolean>(!1);

  public readonly footerData = computed(() => ({
    AccAmtD: this.debitTotal(),
    AccAmtC: this.creditTotal(),
  }));

  public defaultInsertData = computed((): Partial<FIN53010DetailTable> => ({
    ORG_ID: this.selectedOrgId(),
  }));

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

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.accLoading()
      || this.service.venLoading()
      || this.service.usrLoading()
      || this.service.orgNoLoading()
      || this.service.voucherTypeLoading()
      || this.service.refNameLoading()
      || this.service.noteDescLoading();
  });

  // 載入資料的 effect
  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return void (() => {
      this.tableLoading.set(!1);
      this.dataEffect.destroy();
    });
    const data = this.fin53010DetailData();
    if (!data?.Details) return;

    this.dataForm.patchValue({
      VouNo: data.VouNo,
      VouType: ['1', '2', '3'].includes(String(data.VouType)) ? String(data.VouType) as '1' | '2' | '3' : '1',
      PostFlag: ['0', '1', '3'].includes(String(data.PostFlag)) ? String(data.PostFlag) as '0' | '1' | '3' : '0',
      VoucherType: data.VoucherType ?? 'GL ',
      VouDate: data.VouDate ? new Date(data.VouDate) : new Date(),
      Remark: data.Remark,
      INV_YN: (data.INV_YN ?? 'N') as 'N' | 'Y',
      VouAccType: ['0', '1'].includes(String(data.VouAccType)) ? String(data.VouAccType) as '0' | '1' : void 0,
      CompNo: data.CompNo,
      ...data.CRT_USR_No ? { CRT_USR_No: data.CRT_USR_No } : {},
      ...data.CRT_Date ? { CRT_Date: new Date(data.CRT_Date) } : {},
      ...data.UPD_USR_No ? { UPD_USR_No: data.UPD_USR_No } : {},
      ...data.UPD_Date ? { UPD_Date: new Date(data.UPD_Date) } : {},
    });

    this.tableData.set(data?.Details.map(v => ({
      ...v,
      AccAmtC: v.AccDC === 'C' ? v.AccAmt : void 0,
      AccAmtD: v.AccDC === 'D' ? v.AccAmt : void 0,
      AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
      DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
        ?? this.service.usrMap().get(String(v.DetailNo))?.label,
      NoteDesc: v.NoteDesc || this.service.noteDescMap().get(String(v.AccNo))?.label,
    })));

    this.logger.debug(`loadingDetail:`, [data, this.dataForm.getRawValue(), this.tableData()]);
    if (!this.service.accNoMap().size
      || !this.service.vendorMap().size
      || !this.service.usrMap().size
      || !this.service.noteDescMap().size) return;

    this.dataEffect.destroy();
  }, { allowSignalWrites: !0 });

  // Template 相關屬性
  public readonly vouTypeTemp = signal<'1' | '2' | '3' | void>(void 0);
  public readonly vouTermSearchTemp = signal<string>('');
  public readonly detailCountTemp = signal<boolean | null>(null);
  public readonly filteredVoucherTemplateOptions = computed(() =>
    this.service.voucherTemplateOptions().filter(v => {
      return (!this.vouTypeTemp() || v.VouType === this.vouTypeTemp())
        && (this.detailCountTemp() === null ? !0 : this.detailCountTemp() ? v.DetailCount > 0 : v.DetailCount === 0)
        && (v.TempNo.includes(this.vouTermSearchTemp()) || v.TempName.includes(this.vouTermSearchTemp()));
    })
  );

  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<EditColumn, 'field'> & { field: keyof FIN53010DetailTable; })[]>(() => [
    { field: 'SerNo', header: '序號' },
    {
      field: 'AccNo',
      header: '科目代號',
      type: 'dropdown',
      required: !0,
      showClear: !1,
      options: () => this.service.accNoOptions(),
      optionLabel: 'value',
      optionValue: 'value',
      templateLabel: 'templateLabel',
    },
    { field: 'AccCName', header: '科目名稱' },
    {
      field: 'DetailNo',
      header: '廠商/員工代號',
      type: 'template',
      templateRef: this.venUsrTemplate(),
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    {
      field: 'NoteDesc',
      header: '摘要',
      type: 'dropdown',
      options: (v: FIN53010DetailTable) => this.service.noteDescOptions().find(item => item.value === v.AccNo)?.data ?? [],
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'AccAmtD',
      header: '借方金額',
      type: 'inputNumber',
      format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
    },
    {
      field: 'AccAmtC',
      header: '貸方金額',
      type: 'inputNumber',
      format: (v) => (v !== void 0 && v !== null) ? formatAmount(v) : '',
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
    {
      field: 'clearingCode',
      header: '立沖代號',
      type: 'dropdown',
      options: () => [],
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'ReflNo',
      header: '對象別編號',
      type: 'dropdown',
      options: () => this.service.refNameOptions(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    { field: 'recKey', header: '對帳KEY值', type: 'input' },
  ]);

  public readonly templateColumns: (Omit<Column, 'field'> & { field: keyof FIN52030Data; })[] = [
    { field: 'TempNo', header: '傳票號碼' },
    { field: 'TempName', header: '傳票代號' },
    { field: 'VouType', header: '傳票類型', format: v => this.service.vouTypeOptions.find(({ value }) => value === v)?.label ?? v },
    { field: 'DetailCount', header: '明細筆數' },
  ];

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
    this.user = this.authService.getUserInfo()!;
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);

    this.service.getAccNoOptions();
    this.service.getVendorOptions();
    this.service.getUsrOptions();
    this.service.getOrgNoOptions();
    this.service.getRefNameOptions();
    this.service.getAccDescOptions();

    if (!this.isFormCreateable) {
      this.tableLoading.set(!0);
      this.service.loadFIN53010Detail(this.rowdata!.id).pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.fin53010DetailData.set(res.Data);
          this.totalRecords.set(res.TotalCount);
        },
      });
    }
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const { VouNo, ...d } = this.dataForm.getRawValue();
      const payload = <any>{
        ...d,
        Details: this.tableData().map(({ AccAmtD, AccAmtC, NoteDesc, ...rest }, index) => {
          return {
            ...rest,
            index,
            id: typeof rest.id === 'number' ? rest.id! : void 0,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
            ORG_ID: rest.ORG_ID || '100000',
            VoucherType: d.VoucherType?.padEnd(3, ' ') || 'GL ',
            NoteDesc: this.service.noteDescMap().get(String(NoteDesc))?.label ?? NoteDesc,
          };
        }),
        ...(this.isFormCreateable ? {} : { VouNo }),
      };

      this.tableLoading.set(!0);
      const request: Observable<FIN53010InsertResult | FIN53010UpdateResult> = this.isFormCreateable
        ? this.service.insertFIN53010Data({ ...payload, CRT_USR_No: this.user.user_No })
        : this.service.updateFIN53010Data({ ...payload, id: this.rowdata!.id, UPD_USR_No: this.user.user_No });


      this.logger.debug(`submit:`, [payload]);
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

  public onFieldChange(event: FieldChangeEvent<FIN53010DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);

    // 更新 tableData 並觸發重算合計
    this.tableData.update(current => {
      const result = [...current];
      const index = event.index;

      if (typeof index !== 'number' || index < 0 || index >= result.length) {
        result.push({ ...event.rowData, SerNo: (result.length + 1) * 10 });
        return result;
      }

      const rowData = result[index];
      this.logger.debug(`rowData :`, [rowData, event.rowData]);
      switch (event.field) {
        case 'AccNo':
          // 自動帶入科目名稱
          rowData.AccCName = this.service.accNoMap().get(String(event.value))?.label ?? '';
          // 自動帶入摘要
          rowData.NoteDesc = String(this.service.noteDescMap()
            .get(event.value)?.data?.[0].label || event.value || '');
          break;

        case 'AccAmtD':
          // 自動互斥借貸方金額
          if (event.value) rowData.AccAmtC = void 0;
          break;

        case 'AccAmtC':
          // 自動互斥借貸方金額
          if (event.value) rowData.AccAmtD = void 0;
          break;

        case 'ORG_ID':
          // 設定目前選擇的組織代號
          this.selectedOrgId.set(String(event.value));
          rowData.SubDetailNo = '';
          break;

        // case 'NoteDesc':
        //   rowData.NoteDesc = String(this.service.noteDescMap().get(event.rowData.AccNo)?.data
        //     ?.find(d => d.value === event.value)?.label
        //     || event.value || '');
        //   break;
      }

      // 如果會計科目是進項稅額，且組織是部門，則自動改為共同
      if (rowData.AccNo?.startsWith('1232')
        && this.service.orgMap().get(rowData.ORG_ID || '')?.label?.endsWith('部')) {
        rowData.AccNo = '123208';
        rowData.AccCName = this.service.accNoMap().get('123208')?.label ?? '';
      }

      // 更新 SerNo
      rowData.SerNo = (index + 1) * 10;

      // 檢查是否可儲存
      this.rowEditCanSave.set(!!rowData.AccNo && !!rowData.ORG_ID || !!this.isBalanced());

      return result;
    });
  }

  public onDelete(event: (FIN53010DetailTable & EditColumnExtend)[]): void {
    let ids: number[] = [];
    for (let e of event) {
      if (RegExp(/^[^0-9]/).test(String(e.SerNo))) continue;

      const data = this.tableData();
      const idx = data.findIndex(d => d.SerNo === e.SerNo);
      if (e[idx]?._dataStatus === 'new') {
        // 如果是新資料則直接從 tableData 移除
        this.tableData.update(current => current.filter(d => d.SerNo !== e.SerNo));
        continue;
      }
      if (idx > -1) ids.push(idx + 1);
    }

    if (!ids.length) return;
    this.tableLoading.set(!0);
    this.service.deleteFIN53010Data(ids).pipe(
      tap(res => this.logger.debug(`onDelete:`, [ids, res])),
      concatMap(() => this.service.loadFIN53010Detail(this.rowdata!.id)),
      tap(res => this.logger.debug(`reload after delete:`, [res])),
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.messageService.successBubble('刪除成功');
      },
    });
  }

  public onRowReorder(event: TableRowReorderEvent): void {
    this.tableData.update(current => {
      const newArray = [...current];
      const movedItem = newArray.splice(event.dragIndex!, 1)[0];
      newArray.splice(event.dropIndex!, 0, movedItem);

      return newArray.map((item, index) => ({
        ...item,
        index,
        displayIndex: index,
        SerNo: (index + 1) * 10,
      }));
    });

    this.logger.debug(`onRowReorder:`, [event, this.tableData()]);
  }

  public getVocherTemplate(): void {
    const payload: FIN52030Payload = {
      ...(this.df().VouType.value ? { VouType: this.df().VouType.value as FIN52030Payload['VouType'] } : {}),
      // ...(this.isFormCreateable ? { CRT_USR_No: this.user.user_No } : {}),
      // ...(!this.isFormCreateable ? { UPD_USR_No: this.user.user_No } : {}),
    };

    if (this.loading) return;

    this.tableLoading.set(!0);
    this.service.getFin52030(payload).pipe(
      tap(res => this.logger.debug(`getFin52030:`, [res])),
      finalize(() => {
        this.tableLoading.set(!1);
        this.displayDialog.set(!0);
      }),
    ).subscribe();
  }

  public onApplyTemplate(): void {
    this.tableLoading.set(!0);
    this.service.getFin52030Detail(this.selectedDetail()[0]?.TempNo, this.df().CompNo.value!, Number(this.user.mid)).pipe(
      tap(res => this.logger.debug(`onApplyTemplate:`, [res])),
      finalize(() => {
        this.tableLoading.set(!1);
        this.displayDialog.set(!1);
      }),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data = res.Data;
        this.dataForm.patchValue({
          VouType: data.VouType,
          CRT_USR_No: data.CRT_USR_No ?? void 0,
          CRT_Date: data.CRT_Date || void 0,
          UPD_USR_No: data.UPD_USR_No ?? void 0,
          UPD_Date: data.UPD_Date || void 0,
        });
        this.tableData.set(data.Details.map((v, index) => ({
          ...v,
          id: v.id!,
          ...(v.AccDC === '0' ? { AccAmtC: v.AccAmt } : {}),
          ...(v.AccDC === '1' ? { AccAmtD: v.AccAmt } : {}),
          ...(v.NoteDesc ? { NoteDesc: this.service.noteDescMap().get(String(v.AccNo))?.label } : {}),
          AccNo: v.AccNo,
          DetailNo: v.DetailNo,
          AccName: this.service.accNoMap().get(String(v.AccNo))?.label,
          DetailName: this.service.vendorMap().get(String(v.DetailNo))?.label
            ?? this.service.usrMap().get(String(v.DetailNo))?.label,
          SerNo: v.SerNo,
          index: v.index,
        })));
      },
    });
  }

  // Template 相關方法
  public onTemplateTypeChange(event: DropdownChangeEvent): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  };

  /** 根據所選模板類型與搜尋條件取得並過濾模板資料 */
  public getFilteredTemplateData(): Option[] {
    const src = this.selectedTemplateType === 'vendor'
      ? this.service.vendorOptions()
      : this.service.usrOptions();

    const term = this.templateSearchTerm?.trim().toLowerCase();
    if (!term) return src;

    return src.filter(item => {
      const label = item.label?.toLowerCase() || '';
      const value = item.value?.toLowerCase() || '';
      return label.includes(term) || value.includes(term);
    });
  }

  /** 選中的項目 */
  public selectTemplateItem(rowData: FIN53010DetailTable, item?: Option & { short?: string; }): void {
    this.logger.debug('selectTemplateItem:', [rowData, item]);
    [rowData.DetailNo, rowData.DetailName] = [item?.value ?? '', item?.short ?? item?.label ?? ''];
  };

  public vouTermChange(event: Event): void {
    this.logger.debug(`vouTermChange:`, [event]);
    this.vouTermSearchTemp.set((<HTMLInputElement>event.target).value?.toString() || '');
  }

  public vouTypeChange(event: '1' | '2' | '3' | void): void {
    this.logger.debug(`vouTypeChange:`, [event]);
    this.vouTypeTemp.set(<'1' | '2' | '3' | void>event);
    this.df().VouType.patchValue(event);
  }
}
