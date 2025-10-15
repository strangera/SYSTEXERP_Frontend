import { Component, computed, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { finalize, tap } from 'rxjs';
import { FIN53010Data, FIN53010DetailTable, VendorList } from '../fin53010/fin53010.model';

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  styleUrl: './fin53010-cru.component.scss',
  standalone: true,
  imports: [
    CheckboxModule,
    DropdownModule,
    FormsModule,
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
export class FIN53010CRUComponent extends BasicCruPageComponent<FIN53010Data> implements OnInit {

  private readonly venUsrTemplate = viewChild.required<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    VouNo: new FormControl<string>('自動給號'),
    /** 傳票種類 */
    PostFlag: new FormControl<string | void>(void 0, [Validators.required]),
    /** 傳票型態 */
    VouType: new FormControl<string | void>(void 0, [Validators.required]),
    VouDate: new FormControl<Date | void>(void 0, [Validators.required]),
    Remark: new FormControl<string | void>(void 0, [Validators.maxLength(100)]),
    PostReissue: new FormControl<'N' | 'Y'>('N', [Validators.required]),
    VouAccType: new FormControl<'0' | '1' | '2'>('0', [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    CrtDate: new FormControl<Date | void>(void 0),
    UpdDate: new FormControl<Date | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<any[]>([]);
  private readonly selectedOrgId = signal<string>('100000');

  public selectedItems: FIN53010Data[] = [];
  public onEditing = !1;
  public rowEditCanSave = !1;

  private readonly filteredTblUserOrgidList = computed(() => this.service.tblUserOrgidList().filter(v => v.Org_ID === this.selectedOrgId()));

  public readonly totalRecords = computed(() => this.tableData.length);

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
      type: 'dropdown',
      options: () => this.service.accNoList(),
      optionLabel: 'AccNo',
      optionValue: 'AccNo',
      templateLabel: 'AccName',
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
    {
      field: 'NoteDesc',
      header: '摘要',
      type: 'dropdown',
      options: () => [],
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'AccAmtD',
      header: '借方金額',
      type: 'inputNumber',
      format: d => +(d.AccDC === 'D' && formatAmount(d.AccAmt) || ''),
      isTotal: !0,
    },
    {
      field: 'AccAmtC',
      header: '貸方金額',
      type: 'inputNumber',
      format: d => +(d.AccDC === 'C' && formatAmount(d.AccAmt) || ''),
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
      options: () => this.filteredTblUserOrgidList(),
      optionLabel: 'user_Name',
      optionValue: 'user_No',
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

    this.service.getVouTypes();
    this.service.getPostFlags();
    this.service.getVouAccTypes(!0);

    this.service.getAccNoList();
    this.service.getOrgNoList();
    this.service.getTblUserOrgid();
    this.service.getSubpoenaReissueOptions();

    if (this.isFormCreateable) {
      this.service.getUsrList();
      this.service.getVendorList();
      this.df().CRT_USR_No.setValue(this.user.user_Name);
      this.df().CrtDate.setValue(new Date());
    } else {
      this.service.loadFIN53010Detail(this.rowdata!.id).pipe(
        finalize(() => this.loading = !1),
        tap(res => {
          this.logger.debug(`loadFIN53010Detail:`, [res]);
          this.tableData.set(res.Data.map(d => ({
            ...d,
            AccAmtD: d.AccDC === 'D' ? d.AccAmt : void 0,
            AccAmtC: d.AccDC === 'C' ? d.AccAmt : void 0,
            AccName: this.service.accNoMap.get(String(d.AccNo))?.AccName ?? '',
            DetailName: this.service.vendorMap.get(String(d.DetailNo))?.VEN_Name
              ?? this.service.usrMap.get(String(d.DetailNo))?.label ?? '',
            displayIndex: d.index,
            modifier: this.user.user_Name,
            modifyDate: new Date(),
          })));
        })
      ).subscribe();
    }

    this.logger.debug(`init:`, [this.rowdata, this.service.FIN53010Detail()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const raw = {
        ...d,
        VouDate: d.VouDate?.toISOString(),
        CrtDate: d.CrtDate?.toISOString(),
        UpdDate: d.UpdDate?.toISOString(),
        Details: this.tableData().map(({ displayIndex, AccAmtD, AccAmtC, ...rest }, idx) => {
          return {
            ...rest,
            index: idx + 1,
            AccAmt: (AccAmtD ?? 0) + (AccAmtC ?? 0),
            AccDC: AccAmtD ? 'D' : AccAmtC ? 'C' : '',
          };
        }),
      };

      const payload = <any>Object.keys(raw).reduce((acc, key) => {
        const v = raw[key as keyof typeof raw];
        if (v !== void 0 && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0)) {
          acc[key as keyof typeof raw] = v;
        }
        return acc;
      }, {} as any);

      this.logger.debug(`onSubmit:`, [d, payload, this.rowdata, this.tableData()]);

      const request = this.isFormCreateable
        ? this.service.insertFIN53010Data({ ...payload, creator: this.user.user_No })
        : this.service.updateFIN53010Data({ ...payload, id: this.rowdata!.id, creator: this.user.user_No });

      request.pipe(
        finalize(() => this.loading = !1)
      ).subscribe(res => res.Status === '0000' && this.onCancel());
    });
  }

  public onFieldChange(event: FieldChangeEvent<FIN53010DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const row = event.rowData;

    // 自動帶入科目名稱
    if (event.field === 'AccNo') {
      row.AccName = this.service.accNoMap.get(String(event.value))?.AccName ?? '';
    }

    // 自動互斥借貸方金額
    else if (event.field === 'AccAmtD' && row.AccAmtC) {
      row.AccAmtC = void 0;
    }
    else if (event.field === 'AccAmtC' && row.AccAmtD) {
      row.AccAmtD = void 0;
    }

    // 設定目前選擇的組織代號
    else if (event.field === 'ORG_ID') {
      this.selectedOrgId.set(String(event.value));
      row.SubDetailNo = '';
    }

    // 檢查是否可儲存
    this.rowEditCanSave = !!row.AccNo;
  }

  public onDelete(event: FIN53010DetailTable[]): void {
    let ids: number[] = [];
    for (let e of event) {
      if (RegExp(/^[^0-9]/).test(String(e.index))) continue;

      const data = this.tableData();
      const idx = data.findIndex(d => d.index === e.index);
      if (idx > -1) ids.push(idx + 1);
    }
    this.logger.debug(`onDelete:`, [event, ids]);

    this.service.deleteFIN53010Data(ids).pipe(
      finalize(() => this.service.loadFIN53010Detail(this.rowdata!.id))
    ).subscribe();
  }

  public onRowEditInit(event: FIN53010DetailTable): void {
    this.onEditing = !0;
    if (this.isFormCreateable) event.ORG_ID = '100000';
    this.selectedOrgId.set(event.ORG_ID);
    const arr = this.tableData();
    event.displayIndex = Array.isArray(arr) && arr.length > 0 && (arr[arr.length - 1]?.index ?? 0) + 1 || 0;
    this.logger.debug(`onRowEditInit:`, [event, arr]);
  }

  public onRowEditSave(event: RowEditSaveEvent<FIN53010DetailTable>): void {
    if (!this.rowEditCanSave) return;

    const newItems = Array.isArray(event.data) ? event.data : [event.data];
    const current = this.tableData();

    const indexMap = new Map(current.map((item, idx) => [item.index, idx]));
    const result = [...current];

    for (const item of newItems) {
      const existingIndex = indexMap.get(item.index);
      if (existingIndex !== undefined) {
        result[existingIndex] = { ...result[existingIndex], ...item };
      } else {
        result.push(item);
      }
    }

    this.tableData.set(result);
    this.onEditing = !1;
    this.logger.debug(`onRowEditSave:`, [event, newItems, result]);
  }

  public onRowEditCancel(event: { data: FIN53010DetailTable, rowData: FIN53010DetailTable[], ri: number; }): void {
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
    [rowData.DetailNo, rowData.DetailName] = [item?.value || '', item?.['short'] || ''];
  };


  // ngOnInit(): void {
  //   // 初始化
  //   this.ProgNo = '150016';
  //   //
  //   // ----------------------------------------------------------------
  //   this.funInfo = this.authService.getUserPermissions(this.ProgNo);
  //   this.userCodeService
  //     .getUserCode()
  //     .subscribe((data) => (this.usercode = data));

  //   // ----------------------------------------------------------------
  //   const state = this.router.lastSuccessfulNavigation?.extras.state as {
  //     crudstatus: CRUDStatus;
  //     rowdata: any;
  //   };

  //   switch (state.crudstatus) {
  //     // 創建
  //     case CRUDStatus.Create:
  //       this.formTitle = 'create-conditions';
  //       this.accordionTabCss = 'create-accordionTab';
  //       this.crudstatus = CRUDStatus.Create;
  //       this.showConfirm = this.canAdd();
  //       break;
  //     // 修改
  //     case CRUDStatus.Edit:
  //       this.formTitle = 'edit-conditions';
  //       this.accordionTabCss = 'edit-accordionTab';
  //       this.crudstatus = CRUDStatus.Edit;
  //       this.showConfirm = this.canEdit();
  //       this.Edit(state.rowdata);
  //       break;
  //     // 讀檔
  //     case CRUDStatus.Read:
  //       this.formTitle = 'display-conditions';
  //       this.crudstatus = CRUDStatus.Read;
  //       this.Read(state.rowdata);
  //       break;
  //   }

  //   console.log(this.accordionTabCss);
  // }
  // createItem(): FormGroup {
  //   return this.formBuilder.group({
  //     Accountcode: [],
  //     vendorCodeOptions: [],
  //     summary: [],
  //     Debitamount: [],
  //     Creditamount: [],
  //     Organizationcode: [],
  //     StandingInstructionCode: [],
  //     Activitycode: [],
  //     Objectnumber: [],
  //     ReconciliationKEYvalue: [],
  //   });
  // }

  // // ----------------------------------------------------------------
  // dataForm = this.formBuilder.nonNullable.group({
  //   Subpoenanumber: [],
  //   Subpoenatype: [],
  //   Subpoenadate: [],
  //   Subpoenastatus: [],
  //   Subpoenasummary: [],
  //   Makeupinvoice: [],
  //   builder: [],
  //   modifyer: [],
  //   builddate: [],
  //   modifydate: [],
  //   uickMenu: [],

  //   // ----------------------------------------------------------------
  //   items: this.formBuilder.array([this.createItem()]),
  // });
  // // Dropdown options
  // Activitycode: any[] = [
  //   { value: 1, label: '001' },
  //   { value: 2, label: '002' },
  //   { value: 3, label: '003' },
  //   { value: 4, label: '004' },
  //   { value: 5, label: '005' },
  //   { value: 6, label: '006' },
  //   { value: 7, label: '007' },
  //   { value: 8, label: '008' },
  //   { value: 9, label: '009' },
  //   { value: 10, label: '010' },
  // ];
  // StandingInstructionCode: any[] = [];
  // Organizationcode: any[] = [
  //   { value: 1, label: '100000' },
  //   { value: 2, label: '100100' },
  //   { value: 3, label: '101000' },
  //   { value: 4, label: '101100' },
  //   { value: 5, label: '101200' },
  //   { value: 6, label: '101300' },
  //   { value: 7, label: '101400' },
  //   { value: 8, label: '101500' },
  //   { value: 9, label: '101600' },
  //   { value: 10, label: '101700' },
  // ];
  // usercode: any[] = [];
  // Accountcode: any[] = [
  //   { value: 1, label: '110101' },
  //   { value: 2, label: '110102' },
  //   { value: 3, label: '110103' },
  //   { value: 4, label: '110111' },
  //   { value: 5, label: '110112' },
  //   { value: 6, label: '110199' },
  //   { value: 7, label: '110200' },
  //   { value: 8, label: '110201' },
  //   { value: 9, label: '110210' },
  //   { value: 10, label: '110220' },
  // ];
  // Makeupinvoice: any[] = [
  //   { value: 1, label: '是' },
  //   { value: 2, label: '否' },
  // ];
  // Subpoenatype: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];
  // Subpoenastatus: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];
  // vendorCodeOptions: any[] = [
  //   { value: 1, label: '00000000-1' },
  //   { value: 2, label: '00000000-2' },
  //   { value: 3, label: '00000000-4' },
  //   { value: 4, label: '00000000-5' },
  //   { value: 5, label: '00000000-7' },
  //   { value: 6, label: '00000000-8' },
  //   { value: 7, label: '00852492-1' },
  //   { value: 8, label: '01052878-1' },
  //   { value: 9, label: '01508949-1' },
  //   { value: 10, label: '01515462-1' },
  // ];
  // // ----------------------------------------------------------------
  // constructor(
  //   private router: Router,
  //   private formBuilder: FormBuilder,
  //   private messageService: NotificationService,
  //   private authService: AuthService,
  //   private translate: TranslateService,
  //   private userCodeService: UserCodeService
  // ) {
  //   super(); // 呼叫父類建構子
  // }

  // // ----------------------------------------------------------------
  // get items(): FormArray {
  //   return this.dataForm.get('items') as FormArray;
  // }

  // getFormControl(index: number, controlName: string): FormControl {
  //   return this.items.at(index).get(controlName) as FormControl;
  // }
  // // ----------------------------------------------------------------

  // onRemoveItem(index: number) {
  //   this.items.removeAt(index);
  // }
  // // ----------------------------------------------------------------
  // Edit(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  // }

  // Read(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  //   this.dataForm.disable();
  // }

  // onAddItem(): void {
  //   this.items.push(this.createItem());
  // }

  // onSubmit(frm: FormGroup) {
  //   this.messageService.blockUi();
  //   this.submitted = true;

  //   if (this.dataForm.invalid) {
  //     this.messageService.errorBubble(
  //       this.translate.instant('form_error_message')
  //     );
  //     this.messageService.unblockUi();
  //     return;
  //   }

  //   switch (this.crudstatus) {
  //     case CRUDStatus.Create:
  //       if (this.canAdd()) {
  //         // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
  //         this.messageService.successBubble(
  //           this.translate.instant('success_message')
  //         );
  //       }
  //       break;
  //     case CRUDStatus.Edit:
  //       if (this.canEdit()) {
  //         // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
  //         this.messageService.successBubble(
  //           this.translate.instant('updated-successfully')
  //         );
  //       }
  //       break;
  //   }

  //   this.messageService.unblockUi();
  //   this.submitted = false;
  // }

  // submitForm(frm: FormGroup) {
  //   // 查詢邏輯
  //   this.onSubmit(frm);
  // } //CRU

  // onCancel() {
  //   this.router.navigate(['FIN5000/FIN53010']);
  // }
}
