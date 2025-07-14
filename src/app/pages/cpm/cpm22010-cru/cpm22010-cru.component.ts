import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { FloorService } from './../../../service/basic/floor.service';

@Component({
  selector: 'app-cpm22010-cru',
  templateUrl: './cpm22010-cru.component.html',
  styleUrl: './cpm22010-cru.component.scss',
})
export class CPM22010CRUComponent extends BasicCrupageComponent implements OnInit {
  dataForm = this.formBuilder.group({
    startDate: [],
    endDate: [],
    marketingCampaignCode: [],
    campaignName: [],
    campaignDescription: [],
    campaignDays: [],
    campaignYear: [],
    campaignSeason: [],
    totalBudgetAmount: [],
    items: this.formBuilder.array([this.createItem()]),
  });


  // 下拉選單選項
  marketingCampaignOptions: any[] = [
    { value: 1, label: '贈品兌換活動' },
    { value: 2, label: '紅利積點活動' },
    { value: 3, label: 'DM發送活動' },
    { value: 4, label: '聯名超強卡友日' },
  ];
  activityCategory
    : any[] = [
      { value: 1, label: '贈品兌換活動' },
      { value: 2, label: '紅利積點活動' },
      { value: 3, label: 'DM發送活動' },
      { value: 4, label: '聯名超強卡友日' },
    ];


  // 初始化
  ngOnInit(): void {
    this.ProgNo = '520007';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 下拉選單資料


    // 表單初始化


    // 獲取狀態
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    // 根據狀態處理表單標題與狀態
    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

  // 動態新增項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      activityCategory: ['', Validators.required],
      activityCode: ['', Validators.required],
      activityDescription: [],
      activityStatus: ['', Validators.required],
      budgetAmount: ['', Validators.required],
      activityOwner: ['', Validators.required],
      preparationStartDate: [],
      preparationEndDate: [],
      preparationRemark: [],
      activityStartDate: ['', Validators.required],
      activityEndDate: ['', Validators.required],
      statusChanger: ['', Validators.required],
      statusChangeDate: ['', Validators.required],
    });
  }

  // 獲取動態表單項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 獲取表單控制項
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 刪除動態項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 新增動態項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 編輯模式
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取模式
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 表單提交
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

  // 查詢提交
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消操作
  onCancel() {
    this.router.navigate(['CPM2000/CPM22010']);
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,

  ) {
    super(); // 呼叫父類建構子
  }
}
