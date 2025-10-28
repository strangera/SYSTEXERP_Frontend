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
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { FieldChangeEvent, formatAmount } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { combineLatest, finalize, Observable, tap } from 'rxjs';
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
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CRT_Date: new FormControl<Date | void>(void 0),
    UPD_Date: new FormControl<Date | void>(void 0),
    CompNo: new FormControl<string | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<FIN53010DetailTable[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public selectedItems: FIN53010Data[] = [];
  public rowEditCanSave = !1;

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

  // 載入資料的 effect
  public readonly dataEffect = effect(() => {
    if (this.isFormCreateable) return void (() => {
      this.loading = !1;
      this.service.tableLoading.set(!1);
      this.dataEffect.destroy();
    });
    const data = this.service.FIN53010Detail();
    if (!data?.Details) return;

    this.dataForm.patchValue({
      VouNo: data.VouNo,
      VouType: ['1', '2', '3'].includes(String(data.VouType)) ? String(data.VouType) as '1' | '2' | '3' : '1',
      PostFlag: ['0', '1', '3'].includes(String(data.PostFlag)) ? String(data.PostFlag) as '0' | '1' | '3' : '0',
      VoucherType: data.VoucherType?.trim() ?? 'GL',
      VouDate: data.VouDate ? new Date(data.VouDate) : new Date(),
      Remark: data.Remark,
      INV_YN: (data.INV_YN ?? 'N') as 'N' | 'Y',
      VouAccType: ['0', '1'].includes(String(data.VouAccType)) ? String(data.VouAccType) as '0' | '1' : void 0,
      CompNo: data.CompNo,
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

    this.logger.debug(`loading detail:`, [data, this.dataForm.getRawValue(), this.tableData()]);
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

  public readonly columns = computed<(Omit<EditColumn, 'field'> & { field: keyof FIN53010DetailTable; })[]>(() => [
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
      disabled: () => this.service.venLoading() || this.service.usrLoading(),
      type: 'template',
      templateRef: this.venUsrTemplate(),
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    {
      field: 'NoteDesc',
      header: '摘要',
      type: 'dropdown',
      options: (v: FIN53010DetailTable) => computed(() =>
        this.service.noteDescList().find(item => item.value === v.AccNo)?.data ?? [])(),
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
      options: () => this.service.orgNoList(),
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
      options: () => this.service.refNameList(),
      optionLabel: 'label',
      optionValue: 'value',
    },
    { field: 'recKey', header: '對帳KEY值', type: 'input' },
  ]);

  constructor(
    public readonly service: FIN53010Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);
    this.service.FIN53010Detail.set(Object.create(null));
    this.loading = !0;

    if (!this.isFormCreateable) this.service.loadFIN53010Detail(this.rowdata!.id).subscribe();

    this.service.getOrgNoList();
    this.service.getRefNameList();
    this.service.getVoucherTypeList();

    combineLatest([
      this.service.getAccNoList(),
      this.service.getVendorList(),
      this.service.getUsrList(),
      this.service.getAccDescList([]),
    ]).pipe(
      tap(([accNos, vendors, usrs, accDescs]) => {
        this.logger.debug(`init forks:`, [accNos, vendors, usrs, accDescs]);
        if (!this.isFormCreateable) {
          this.df().UPD_USR_No.setValue(this.user.user_Name);
          this.df().UPD_Date.setValue(new Date());
        } else {
          this.df().CRT_USR_No.setValue(this.user.user_Name);
          this.df().CRT_Date.setValue(new Date());
        }
      }),
      finalize(() => {
        this.loading = !1;
        this.logger.debug(`init:`, [this.rowdata, this.service.FIN53010Detail()]);
      }),
    ).subscribe();
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const { VouNo, ...d } = this.dataForm.getRawValue();
      const raw = {
        ...d,
        Details: this.tableData().map(({ AccAmtD, AccAmtC, NoteDesc, ...rest }, index) => {
          return {
            ...rest,
            index,
            id: typeof rest.id === 'number' ? rest.id! : void 0,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
            ORG_ID: rest.ORG_ID || '100000',
            NoteDesc: this.service.noteDescMap().get(String(NoteDesc))?.label ?? NoteDesc,
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
            .get(event.rowData.AccNo)?.data
            ?.find(d => d.value === event.value)?.label
            || event.value || '');
          break;
      }

      // 更新 SerNo
      result[index].SerNo = (index + 1) * 10;

      // 檢查是否可儲存
      this.rowEditCanSave = !!result[index].AccNo && !!result[index].ORG_ID || !!this.isBalanced();

      return result;
    });
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

  public onApplyTemplate(): void {
    this.logger.debug(`套用常用傳票:`, []);
  };

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
