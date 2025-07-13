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
    selector: 'app-cpm22040-cru',
    templateUrl: './cpm22040-cru.component.html',
    styleUrl: './cpm22040-cru.component.scss',
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
export class CPM22040CRUComponent
  extends BasicCrupageComponent
  implements OnInit {


  // 下拉選單資料
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  locationCode: any[] = [
    { value: 1, label: 'A0000001' },
    { value: 2, label: 'B0000001' },
  ];


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




  ngOnInit(): void {
    this.ProgNo = '520010';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 根據CRUD狀態初始化表單
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    this.initializeForm();

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

  // 初始化表單
  private initializeForm() {

  }

  // 動態新增表單項目
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

  // 取得表單項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 新增表單項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 刪除表單項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 編輯狀態下的表單初始化
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取狀態下的表單初始化
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 表單提交
  taskConfig() { }
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.messageService.blockUi();

    if (frm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // 這裡可以添加創建的業務邏輯
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // 這裡可以添加編輯的業務邏輯
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 表單提交按鈕觸發
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消按鈕
  onCancel() {
    this.router.navigate(['CPM2000/CPM22040']);
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
