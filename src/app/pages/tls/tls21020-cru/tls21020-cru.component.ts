import { Component, OnInit, computed, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21020Service } from '@service/api/tls/tls21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { TLS21020Data, TLS21020UpdateQuery } from '../tls21020/tls21020.model';

@Component({
  selector: 'app-tls21020-cru',
  templateUrl: './tls21020-cru.component.html',
  styleUrls: ['./tls21020-cru.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    MenubarComponent,
    TableEditComponent,
  ],
})
export class TLS21020CRUComponent extends BasicCruPageComponent<TLS21020Data> implements OnInit {
  public dataForm = this.formBuilder.nonNullable.group({
    ENTRY_TYPE: new FormControl<string | void>(void 0),
    // items: this.formBuilder.array([this.createItem()]),
  });
  public readonly df = computed(() => this.dataForm.controls);
  public readonly canSave = computed(() => this.dataForm.valid);

  public selectedItems: TLS21020Data[] = [];

  private readonly AccDCMap = new Map<string, string>([['D', '借'], ['C', '貸']]);
  private readonly ABATYN = (v: any) => v?.ABAT_YN === 'N';

  public readonly columns: EditColumn[] = [
    {
      field: 'AccDC',
      header: '借/貸',
      format: v => this.AccDCMap.get(v) || v,
    },
    {
      field:
        'ItemDesc',
      header: '項目名稱',
    },
    {
      field: 'AccNo',
      header: '會計科目',
      type: 'dropdown',
      options: this.service.GLS1005Data,
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'Org_ID',
      header: '組織代碼',
      type: 'dropdown',
      options: this.service.SYS3100Data,
      optionLabel: 'label',
      optionValue: 'value',
    },
    {
      field: 'AccNotes',
      header: '傳票備註',
      type: 'input',
    },
    {
      field: 'ObjectNo',
      header: '是否依合約拆立組織',
      type: 'dropdown',
      options: this.service.getYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
    },
    {
      field: 'RelatedPartyAccNo',
      header: '區分關係人會科',
      groupField: 'RelatedPartyAcc',
      type: 'dropdown',
      options: this.service.GLS1005Data,
      optionLabel: 'label',
      optionValue: 'value',
      showClear: !1,
      disabled: this.ABATYN,
    },
    {
      field: 'VEN_No',
      header: '應收廠商',
      groupField: 'Vendor',
      type: 'dropdown',
      options: this.service.POS2013Data,
      optionLabel: 'Name',
      optionValue: 'VEN_No',
      disabled: this.ABATYN,
      templateLabel: 'ShortName',
    },
    {
      field: 'PAY_days',
      header: '付款天數',
      type: 'inputNumber',
      disabled: this.ABATYN,
    },
    {
      field: 'PAY_No',
      header: '付款別編號',
      type: 'input',
      disabled: this.ABATYN,
    },
  ];

  public readonly defaultInsertData: Partial<TLS21020Data> = {
    AccDC: 'D',
    ABAT_YN: 'N',
  };

  constructor(
    public readonly service: TLS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21020', this.dataForm);
    this.rowdata && (this.rowdata.ENTRY_TYPE = this.rowdata.ENTRY_TYPE.trim());

    this.service.getGLS1005s();
    this.service.getPOS2013s('1');
    this.service.getOrgIDs();
    this.service.queryTLS21020({ ENTRY_TYPE: this.rowdata?.ENTRY_TYPE! }).pipe(
      tap(),
      finalize(() => this.loading = !1),
    ).subscribe();

    // this.service.queryTLS21020_GLS1005({ AccDC: this.rowdata?.AccDC! });

    this.logger.debug(`init:`, [this.rowdata]);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      this.logger.debug(`onSubmit:`, [this.service.TLS21020Data()]);
      const entryType = this.rowdata!.ENTRY_TYPE;
      if (!entryType) return;
      const data = this.service.TLS21020Data();
      const payload: TLS21020UpdateQuery[] = data.map(v => ({
        ABAT_YN: v.ABAT_YN,
        AccNo: v.AccNo,
        AccNotes: v.AccNotes,
        ObjectNo: v.ObjectNo,
        Org_ID: v.Org_ID,
        PAY_No: v.PAY_No,
        PAY_days: v.PAY_days,
        RelatedPartyAccNo: v.RelatedPartyAccNo,
        VEN_No: v.VEN_No,
        id: v.id,
      }));
      this.logger.debug(`onSubmit:`, [data, payload]);
      this.service.updateTLS21020(payload).pipe(
        tap(res => res.Status === '2000' && this.onCancel()),
        finalize(() => this.loading = !1),
      ).subscribe();
    });
  }

  public rowEditValid(row: TLS21020Data, index: number, data: TLS21020Data[]): boolean {
    return index === data.length - 2;
  }

  public validateEntireRow = (rowData: TLS21020Data): { isValid: boolean, errorMessage: string; } => {
    if ((rowData.ObjectNo === 'Y' || rowData.ObjectNo === 'N') && (rowData.Org_ID === void 0 || rowData.Org_ID === null || String(rowData.Org_ID).trim() === '')) {
      return { isValid: !1, errorMessage: '必要欄位未填寫' };
    }

    if (rowData.ABAT_YN === 'Y') {
      const venNoValue = rowData.VEN_No;
      return {
        isValid: venNoValue !== void 0 && venNoValue !== null && String(venNoValue).trim() !== '',
        errorMessage: '應收廠商必須填寫'
      };
    }

    if (rowData.PAY_days !== void 0 && rowData.PAY_days !== null) {
      const payDaysValid = Number.isInteger(rowData.PAY_days) && rowData.PAY_days >= 0;
      if (!payDaysValid) return { isValid: !1, errorMessage: '付款天數必須為大於等於0的整數' };
    }

    if (rowData.PAY_No !== void 0 && rowData.PAY_No !== null && rowData.PAY_No !== '') {
      const payNoValid = String(rowData.PAY_No).trim().length > 0;
      if (!payNoValid) return { isValid: !1, errorMessage: '付款別編號必須填寫' };
    }

    if (rowData.AccNotes !== void 0 && rowData.AccNotes !== null && rowData.AccNotes !== '') {
      const accNotesValid = String(rowData.AccNotes).trim().length > 0;
      if (!accNotesValid) return { isValid: !1, errorMessage: '傳票備註必須填寫' };
    }

    if (rowData.AccNo !== void 0 && rowData.AccNo !== null && rowData.AccNo !== '') {
      const accNoValid = String(rowData.AccNo).trim().length > 0;
      if (!accNoValid) return { isValid: !1, errorMessage: '會計科目必須填寫' };
    }

    if (rowData.RelatedPartyAccNo !== void 0 && rowData.RelatedPartyAccNo !== null && rowData.RelatedPartyAccNo !== '') {
      const relatedPartyAccNoValid = String(rowData.RelatedPartyAccNo).trim().length > 0;
      if (!relatedPartyAccNoValid) return { isValid: !1, errorMessage: '區分關係人會科必須填寫' };
    }

    // 檢查是否有重複的組合 (AccDC, ItemDesc, AccNo)
    const rowIndex = this.service.TLS21020Data().findIndex(item => item === rowData);
    if (rowIndex === -1) return { isValid: !1, errorMessage: '找不到該列資料' };
    const isOverlapping = this.service.TLS21020Data().some((item, idx) => {
      if (idx === rowIndex) return !1;
      return item.AccDC === rowData.AccDC && item.ItemDesc === rowData.ItemDesc && item.AccNo === rowData.AccNo;
    });
    return { isValid: !isOverlapping, errorMessage: `` };
  };

  // Get FormArray for items
  // get items(): FormArray {
  //   return this.dataForm.get('items') as FormArray;
  // }

  // Get FormControl based on index and controlName
  // getFormControl(index: number, controlName: string): FormControl {
  //   return this.items.at(index).get(controlName) as FormControl;
  // }

  // Create new form group for item
  // createItem(): FormGroup {
  //   return this.formBuilder.group({
  //     AccDC: new FormControl<string | undefined>(void 0, [Validators.required]),
  //     ItemDesc: new FormControl<string | undefined>(void 0),
  //     AccNo_Name: new FormControl<string | undefined>(void 0),
  //     Org_ID: new FormControl<string | undefined>(void 0),
  //     AccNotes: new FormControl<string | undefined>(void 0),
  //     ObjectNo: new FormControl<string | undefined>(void 0),
  //     RelatedPartyAccNo_Name: new FormControl<string | undefined>(void 0),
  //     VEN_No: new FormControl<string | undefined>(void 0),
  //     PAY_days: new FormControl<string | undefined>(void 0, [Validators.pattern('^[0-9]*$')]),

  // itemName: [], // 項目名稱
  // accountingSubject: [], // 會計科目
  // organizationCode: [], // 組織代碼
  // voucherRemarks: ['', Validators.maxLength(100)], // 傳票備註
  // contractOrganizationSplit: [], // 是否依合約拆立組織
  // relatedPartyAccounting: [], // 區分關係人會科
  // receivableVendor: [], // 應收廠商
  // paymentDays: ['', [Validators.pattern('^[0-9]*$')]], // 付款天數
  //   });
  // }
}
