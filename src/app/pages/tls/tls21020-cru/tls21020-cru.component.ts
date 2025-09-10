import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TLS21020Service } from '@service/api/tls/tls21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonDynamicallyaddComponent } from '@shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonDynamicallydeleteComponent } from '@shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-tls21020-cru',
  templateUrl: './tls21020-cru.component.html',
  styleUrls: ['./tls21020-cru.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class TLS21020CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {
  public dataForm = this.formBuilder.nonNullable.group({
    items: this.formBuilder.array([this.createItem()]),
  });
  public readonly df = toSignal(this.dataForm.valueChanges);

  public SDcolumn: Column[] = [
    { field: 'AccDC', header: '借/貸' },
    { field: 'ItemDesc', header: '項目名稱' },
    { field: 'AccNo_Name', header: '會計科目' },
    { field: 'Org_ID', header: '組織代碼' },
    { field: 'AccNotes', header: '傳票備註' },
    { field: 'ObjectNo', header: '是否依合約拆立組織' },
    { field: 'RelatedPartyAccNo_Name', header: '區分關係人會科' },
    { field: 'VEN_No', header: '應收廠商' },
    { field: 'PAY_days', header: '付款天數' },
  ];

  // CashRegisterTypeItems: any[] = [
  //   { label: '業主', value: '1' },
  //   { label: '非業主', value: '2' },
  // ];

  // receivableVendorItems: any[] = [
  //   { label: '南紡流通服務台', value: 'A' },
  //   { label: '南紡流通-特殊交易', value: 'B' },
  // ];

  // organizationCodeItems: any[] = [
  //   { label: '全公司', value: '1' },
  //   { label: '稽核室', value: '2' },
  // ];

  // accountingSubjectItems: any[] = [
  //   { label: '應收帳款-現金', value: '1' },
  //   { label: '應收帳款-一卡通', value: '2' },
  // ];

  constructor(
    public readonly service: TLS21020Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS21020', this.dataForm);

    this.service.queryTLS21020_GLS1005({ AccDC: 'D' });
    this.service.getOrgIDs();
    this.service.getGLS1005s();

    this.logger.debug(`init:`, [this.rowdata]);
  }

  // Get FormArray for items
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // Get FormControl based on index and controlName
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // Create new form group for item
  createItem(): FormGroup {
    return this.formBuilder.group({
      AccDC: new FormControl<string | undefined>(void 0, [Validators.required]),
      ItemDesc: new FormControl<string | undefined>(void 0),
      AccNo_Name: new FormControl<string | undefined>(void 0),
      Org_ID: new FormControl<string | undefined>(void 0),
      AccNotes: new FormControl<string | undefined>(void 0),
      ObjectNo: new FormControl<string | undefined>(void 0),
      RelatedPartyAccNo_Name: new FormControl<string | undefined>(void 0),
      VEN_No: new FormControl<string | undefined>(void 0),
      PAY_days: new FormControl<string | undefined>(void 0, [Validators.pattern('^[0-9]*$')]),

      // itemName: [], // 項目名稱
      // accountingSubject: [], // 會計科目
      // organizationCode: [], // 組織代碼
      // voucherRemarks: ['', Validators.maxLength(100)], // 傳票備註
      // contractOrganizationSplit: [], // 是否依合約拆立組織
      // relatedPartyAccounting: [], // 區分關係人會科
      // receivableVendor: [], // 應收廠商
      // paymentDays: ['', [Validators.pattern('^[0-9]*$')]], // 付款天數
    });
  }

  // Remove an item from FormArray
  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  // Add a new item to FormArray
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // Edit the form with provided rowdata
  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  // Read the form with provided rowdata
  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // Submit the form
  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      // this.messageService.blockUi();
      // this.submitted = true;

      // if (this.dataForm.invalid) {
      //   this.messageService.errorBubble(this.translate.instant('form_invalid'));
      //   this.messageService.unblockUi();
      //   return;
      // }

      // switch (this.crudstatus) {
      //   case CRUDStatus.Create:
      //     if (this.canAdd()) {
      //       // Implement add logic here
      //       this.messageService.successBubble(this.translate.instant('success_message'));
      //     }
      //     break;
      //   case CRUDStatus.Edit:
      //     if (this.canEdit()) {
      //       // Implement update logic here
      //       this.messageService.successBubble(this.translate.instant('updated-successfully'));
      //     }
      //     break;
      // }

      // this.messageService.unblockUi();
      // this.submitted = false;

      this.submitted = !1;
      this.loading = !1;
    });
  }

  // Submit the form on button click
  submitForm(): void {
    this.onSubmit();
  }
}
