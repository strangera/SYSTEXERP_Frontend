import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';


@Component({
    selector: 'app-cpm22050-cru',
    templateUrl: './cpm22050-cru.component.html',
    styleUrl: './cpm22050-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        DropdownComponent,
        InputTextComponent,
        NgFor,
        ButtonDynamicallydeleteComponent,
        ButtonDynamicallyaddComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
    ],
})
export class CPM22050CRUComponent extends BasicCrupageComponent implements OnInit {


  // 非動態新增 ----------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    startDate: [, Validators.required],
    endDate: [, Validators.required],
    marketingCampaignCode: [, Validators.required],
    campaignName: [, Validators.required],
    activityOwner: [, Validators.required],
    activityCategory: [],
    activityCode: [, Validators.required],
    activityDescription: [],
    items: this.formBuilder.array([this.createItem()]),
  });

  // 下拉選單選項
  marketingCampaignOptions: any[] = [
    { value: 1, label: '活動001' },
    { value: 2, label: '活動002' },
  ];
  equipmentCategoryOptions: any[] = [
    { value: 1, label: '設備類別001' },
    { value: 2, label: '設備類別002' },
  ];
  locationOptions: any[] = [
    { value: 1, label: '地點001' },
    { value: 2, label: '地點002' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,

  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '520011';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state?.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  // 動態新增----------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      equipmentCategoryCode: [, Validators.required],
      activityItemCode: [, Validators.required],
      activityItemName: [, Validators.required],
      applicationStatus: [],
      usageStartDate: [, Validators.required],
      usageStartTime: [],
      usageEndDate: [, Validators.required],
      usageEndTime: [],
      expectedQuantity: [, Validators.required],
      currentStock: [, Validators.required],
      usageLocation: [],
      remarks: [],
    });
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
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
    this.router.navigate(['CPM2000/CPM22050']);
  }
}
