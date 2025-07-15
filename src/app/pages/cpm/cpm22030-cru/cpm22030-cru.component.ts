import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';


@Component({
    selector: 'app-cpm22030-cru',
    templateUrl: './cpm22030-cru.component.html',
    styleUrl: './cpm22030-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        DropdownComponent,
        InputTextComponent,
        NgFor,
        ButtonDynamicallydeleteComponent,
        ButtonDynamicallyaddComponent,
        NgIf,
        TranslateModule,
    ],
})
export class CPM22030CRUComponent extends BasicCrupageComponent implements OnInit {


  ngOnInit(): void {
    // 網站導覽設定
    this.ProgNo = '520009';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);


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

  // 非動態表單
  dataForm = this.formBuilder.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    marketingCampaignCode: ['', Validators.required],
    campaignName: ['', Validators.required],
    activityOwner: ['', Validators.required],
    activityCategory: [],
    activityCode: ['', Validators.required],
    activityDescription: [],
    items: this.formBuilder.array([this.createItem()]),
  });
  marketingCampaignOptions: any[] = [
    { value: 1, label: '行銷檔期 001' },
    { value: 2, label: '行銷檔期 002' },
  ];
  // 動態項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      taskCode: ['', Validators.required],
      taskName: ['', Validators.required],
      taskDescription: [],
      taskOwner: ['', Validators.required],
      progressStatus: ['', Validators.required],
      plannedStartDate: ['', Validators.required],
      plannedEndDate: ['', Validators.required],
      plannedWorkDays: [],
      actualStartDate: [],
      actualEndDate: [],
      actualWorkDays: [],
      remarks: [],
    });
  }

  // 獲取動態表單組
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 移除動態項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 新增動態項目
  taskConfig() { };
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 提交表單
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

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onCancel() {
    this.router.navigate(['CPM2000/CPM22030']);
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,

  ) {
    super();
  }
}
