import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21020Service } from '@service/api/tls/tls21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, ColumnGroup, createPaginationConfig, FieldChangeEvent, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize, tap } from 'rxjs';
import { TLS21020Data, TLS21020GLS1005Data, TLS21020UpdateQuery } from './tls21020.model';

@Component({
  selector: 'app-tls21020',
  templateUrl: './tls21020.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class TLS21020Component extends BasicQueryPageComponent<TLS21020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    ENTRY_TYPE: new FormControl<string | void>(void 0),
    ...createPaginationConfig([{ field: 'SEQNO', order: 1 }]),
  });
  public readonly qf = computed(() => this.queryForm.controls);

  private readonly entryTypeSignal = toSignal(this.qf().ENTRY_TYPE.valueChanges);

  private readonly selectedStatus = signal<TLS21020GLS1005Data | void>(void 0);

  public readonly rowEditValidSignal = signal<boolean>(!1);

  public readonly totalRecord = signal(this.service.TLS21020Data().length);

  public readonly canSave = !this.qf().ENTRY_TYPE.value?.length;

  /** entryType 改變時，取得table 資料 */
  public readonly entryTypeEffect = effect(() => {
    const entryType = this.entryTypeSignal();
    if (!entryType) return;
    const { SortBy, ...field } = this.queryForm.getRawValue();
    if (!SortBy) return;
    this.service.queryTLS21020({ SortBy, ...field, ENTRY_TYPE: entryType });
    this.logger.debug(`entryType changed:`, [entryType]);
    this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
  }, { allowSignalWrites: !0 });

  public columns: Column[] = [
    {
      field: 'AccDC', header: '借/貸',
      format: v => v === 'D' ? '借' : v === 'C' ? '貸' : v
    },
    { field: 'ItemDesc', header: '項目名稱' },
    {
      field: 'AccNo',
      header: '',
      groupField: 'Acc',
      showSort: !1,
    },
    {
      field: 'AccNo',
      header: '',
      groupField: 'Acc',
      type: 'dropdown',
      showSort: !1,
      // format: v => `${v} ${this.selectedStatus()!.AccCName}`,
      options: () => this.service.GLS1005Data(),
      optionLabel: 'Name',
      optionValue: 'No',
    },
    // {
    //   field: 'AccNo',
    //   header: '立沖科目',
    //   format: v => this.service.TLS21020GLS1005Data()?.find(i => i.No === v?.trim())?.Name || v,
    // },
    {
      field: 'Org_ID',
      header: '組織代碼',
      type: 'dropdown',
      required: !0,
      options: () => this.service.SYS3100Data(),
      optionLabel: 'Name',
      optionValue: 'No',
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
      showSort: !1,
      required: !0,
      format: v => v === 'Y' ? '是' : v === 'N' ? '否' : '否',
      options: () => [
        { No: 'Y', Name: '是' },
        { No: 'N', Name: '否' },
      ],
      optionLabel: 'Name',
      optionValue: 'No',
    },
    {
      field: 'RelatedPartyAccNo',
      header: '',
      groupField: 'RelatedPartyAcc',
      showSort: !1,
    },
    {
      field: 'RelatedPartyAccNo',
      header: '',
      groupField: 'RelatedPartyAcc',
      type: 'dropdown',
      showSort: !1,
      format: v => this.service.TLS21020GLS1005Data()?.find(i => i.AccNo === v?.trim())?.AccCName || v,
      options: () => this.service.GLS1005Data(),
      optionLabel: 'Name',
      optionValue: 'No',
      disabled: v => v?.ABAT_YN === 'N',
    },
    {
      field: 'VEN_No',
      header: '',
      groupField: 'Vendor',
      showSort: !1,
    },
    {
      field: 'VEN_No',
      header: '',
      groupField: 'Vendor',
      type: 'dropdown',
      showSort: !1,
      required: !0,
      // format: v => `${v} ${this.service.POS2013Data()?.find(i => i.VEN_No === v?.trim())?.ShortName}`,
      options: () => this.service.POS2013Data(),
      optionLabel: 'ShortName',
      optionValue: 'VEN_No',
      disabled: v => v?.ABAT_YN === 'N',
      templateLabel: 'Name',
    },
    {
      field: 'PAY_days',
      header: '付款天數',
      type: 'inputNumber',
      disabled: v => v?.ABAT_YN === 'N',
    },
    {
      field: 'PAY_No',
      header: '付款別編號',
      type: 'input',
      disabled: v => v?.ABAT_YN === 'N',
    },
  ];

  public readonly tableGroup: ColumnGroup[] = [
    { field: 'Acc', header: '會計科目' },
    { field: 'Vendor', header: '應收廠商' },
    { field: 'RelatedPartyAcc', header: '區分關係人會科' },
  ];

  constructor(
    public readonly service: TLS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS21020', 'TLS/TLS21020', this.queryForm, this.onSubmit.bind(this));
    const store = this.queryStateService.getQueryState('TLS21020');
    if (store?.value) this.queryForm.setValue(store.value);

    this.service.getGLS1005s();
    this.service.getPOS2013s('1');
    this.service.getOrgIDs();
    this.logger.debug(`init:`, []);
  }

  public onRowEditInit(event: any): void {
    this.logger.debug(`onRowEditInit:`, [event]);
    this.service.queryTLS21020_GLS1005({ AccDC: event.AccDC });
    this.selectedStatus.set(event);

    if (!event.ObjectNo || event.ObjectNo === '') event.ObjectNo = 'N';
    this.rowEditValidSignal.set(!1);

    if (event) {
      const isValid = this.validateRequiredFields(event);
      this.rowEditValidSignal.set(isValid);
    }
  }

  public onRowEditSave(event: RowEditSaveEvent<TLS21020Data>): void {
    this.logger.debug(`onRowEditSave:`, [event]);
    if (!event.newData) return;
    // const payload = {
    //   ABAT_YN: event.newData.ABAT_YN,
    //   AccNo: event.newData.AccNo,
    //   AccNotes: event.newData.AccNotes,
    //   ObjectNo: event.newData.ObjectNo || 'N',
    //   Org_ID: event.newData.Org_ID,
    //   PAY_No: event.newData.PAY_No,
    //   PAY_days: event.newData.PAY_days,
    //   RelatedPartyAccNo: event.newData.RelatedPartyAccNo,
    //   VEN_No: event.newData.VEN_No,
    //   id: event.newData.id,
    // };
    // this.service.updateTLS21020([payload]);
    this.selectedStatus.set(void 0);
  }

  public onRowEditCancel(event: RowEditSaveEvent<TLS21020Data>): void {
    this.logger.debug(`onRowEditCancel:`, [event]);
    this.selectedStatus.set(void 0);
  }

  public onFieldChange(event: FieldChangeEvent<TLS21020Data>): void {
    this.logger.debug(`onFieldChange:`, [event?.rowData]);

    if (event.rowData) {
      const isValid = this.validateRequiredFields(event.rowData);
      this.rowEditValidSignal.set(isValid);
      this.logger.debug(`validate ${isValid ? 'success' : 'fail'}`);
    }
  }

  private validateRequiredFields(data: TLS21020Data): boolean {
    const baseRequiredFields: (keyof TLS21020Data)[] = ['Org_ID', 'ObjectNo'];

    const objectNoFormatValid = data.ObjectNo === 'Y' || data.ObjectNo === 'N';
    const baseFieldsValid = baseRequiredFields.every(field => {
      const value = data[field];
      return value !== void 0 && value !== null && String(value).trim() !== '';
    });

    let venNoValid = !0;
    if (data.ABAT_YN !== 'N') {
      const venNoValue = data.VEN_No;
      venNoValid = venNoValue !== void 0 && venNoValue !== null && String(venNoValue).trim() !== '';
    }

    let optionalFieldsValid = !0;
    if (data.PAY_days !== void 0 && data.PAY_days !== null) {
      const payDaysValid = Number.isInteger(data.PAY_days) && data.PAY_days >= 0;
      if (!payDaysValid) optionalFieldsValid = !1;
    }

    if (data.PAY_No !== void 0 && data.PAY_No !== null && data.PAY_No !== '') {
      const payNoValid = String(data.PAY_No).trim().length > 0;
      if (!payNoValid) optionalFieldsValid = !1;
    }

    if (data.AccNotes !== void 0 && data.AccNotes !== null && data.AccNotes !== '') {
      const accNotesValid = String(data.AccNotes).trim().length > 0;
      if (!accNotesValid) optionalFieldsValid = !1;
    }

    if (data.AccNo !== void 0 && data.AccNo !== null && data.AccNo !== '') {
      const accNoValid = String(data.AccNo).trim().length > 0;
      if (!accNoValid) optionalFieldsValid = !1;
    }

    if (data.RelatedPartyAccNo !== void 0 && data.RelatedPartyAccNo !== null && data.RelatedPartyAccNo !== '') {
      const relatedPartyAccNoValid = String(data.RelatedPartyAccNo).trim().length > 0;
      if (!relatedPartyAccNoValid) optionalFieldsValid = !1;
    }

    const finalValid = baseFieldsValid && objectNoFormatValid && venNoValid && optionalFieldsValid;
    if (!finalValid) this.logger.debug(`Validation fail:`, [{
      baseFieldsValid,
      objectNoFormatValid,
      venNoValid,
      optionalFieldsValid,
      finalValid,
      data,
    }]);

    return finalValid;
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.logger.debug(`onSubmit:`, [this.service.TLS21020Data()]);
      const entryType = this.entryTypeSignal();
      if (!entryType) return;
      const { SortBy, ...field } = this.queryForm.getRawValue();
      if (!SortBy) return;

      const data = this.service.TLS21020Data();
      const invalidData = data.filter(item => !this.validateRequiredFields(item));

      if (invalidData.length > 0) {
        this.messageService.errorBubble(
          `有 ${invalidData.length} 筆資料驗證失敗，請確認必填欄位皆已填入`,
          '驗證失敗'
        );
        this.submitted = !1;
        this.loading = !1;
        return;
      }

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
        tap(() => this.service.queryTLS21020({ SortBy, ...field, ENTRY_TYPE: entryType })),
        finalize(() => this.loading = !1),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }
}
