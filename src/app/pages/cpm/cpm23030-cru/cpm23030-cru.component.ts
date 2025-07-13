import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
    selector: 'app-cpm23030-cru',
    templateUrl: './cpm23030-cru.component.html',
    styleUrl: './cpm23030-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        InputTextComponent,
        DropdownComponent,
        NgFor,
        ButtonDynamicallydeleteComponent,
        ButtonDynamicallyaddComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
    ],
})
export class CPM23030CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    issueDate: [, Validators.required],
    issueNumber: [, Validators.required],
    marketingCampaignCode: [, Validators.required],
    campaignName: [],
    applicant: [, Validators.required],
    remarks: [],
    items: this.formBuilder.array([this.createItem()]),
  });

  applicantOptions: any[] = [];
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  activityItemOptions: any[] = [];

  ngOnInit(): void {
    this.ProgNo = '520014';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 下拉選單初始化
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.applicantOptions = data));

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      activityItemCode: [, Validators.required],
      activityItemName: [],
      itemNature: [],
      currentStock: [],
      availableQuantity: [],
      issuedQuantity: [, Validators.required],
      remainingQuantity: [],
    });
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['CPM2000/CPM23030']);
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService
  ) {
    super();
  }
}
