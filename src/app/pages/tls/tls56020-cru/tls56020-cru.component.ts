import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';


import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
@Component({
  selector: 'app-tls56020-cru',
  templateUrl: './tls56020-cru.component.html',
  styleUrl: './tls56020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    EditorTextComponent,
    CalendarComponent,
    NgFor,
    ButtonDynamicallydeleteComponent,
    ButtonDynamicallyaddComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableComponent
  ]
})
export class TLS56020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    SPM_No: [{ value: '自動編號', disabled: true }],
    SPM_Type: [],
    SPM_remark: [],
    APPLY_USR_No: [],
    org_id: [],
    APPLY_Date_Start: [],
    HOS_NoList: [[]],
    LOGO_NoList: [[]],
    items: this.formBuilder.array([this.createItem()]),
  });

  // Dropdown options
  issuanceTypeOptions: { label: string; value: string }[] = [];
  APPLY_USR_NoOptions: { label: string; value: string }[] = [];
  org_id: { label: string; value: string }[] = [];
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string; value: string }[] = [];
  userOptions: { label: string, value: string }[] = [];

  constructor(
    private notificationService: NotificationService,
    private translate: TranslateService,
    private dropDownListService: DropDownListService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56020', this.dataForm);
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => { this.warehouseOptions = options; });
    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(response => response.Data.map(item => ({ label: item.Name, value: item.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
    this.issuanceTypeOptions = [
      { label: '贈品領用', value: '1' },
      { label: '公關活動', value: '2' },
    ];
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      PLU_MagNo: [],
      RPD_SalePrc: [],
      stocknum: [],
      SPM_TotQty: [],
      remark: [],
    });
  }

  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup): void {
    this.notificationService.blockUi();
    this.submitted = true;

    if (frm.invalid) {
      this.notificationService.errorBubble(this.translate.instant('form_error_message'));
      this.notificationService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.notificationService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.notificationService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.notificationService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }
}
