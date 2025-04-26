import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-cpm22020-cru',
  templateUrl: './cpm22020-cru.component.html',
  styleUrl: './cpm22020-cru.component.scss',
})
export class CPM22020CRUComponent extends BasicCrupageComponent implements OnInit {
  ngOnInit(): void {
    // 網站導覽設定
    this.ProgNo = '520008';
    // 權限和數據初始化
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);


    // 處理頁面狀態（創建、編輯、查看）
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

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
  marketingCampaignOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
  ];
  //動態新增項目----------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      businessDate: [], // 營業日期
      weekDay: [], // 星期
      estimatedSales: [], // 預估營業額
      actualSales: [], // 實際營業額
      customerCount: [], // 來客數
      averageSpending: [], // 客單價
      lastYearDate: [], // 去年日期
      lastYearAverageSpending: [], // 去年客單價
      lastYearActualSales: [], // 去年實際營業額
      lastYearCustomerCount: [], // 去年來客數
    });
  }
  BDG() { };
  // 非動態新增----------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    startDate: [, Validators.required], // 開始日期
    endDate: [, Validators.required], // 結束日期
    marketingCampaignCode: [, Validators.required], // 行銷檔期代號
    campaignName: [, Validators.required], // 檔期名稱
    campaignDays: [], // 檔期天數
    salesTargetAmount: [], // 營業目標金額
    lastYearStartDate: [], // 去年開始日期
    lastYearEndDate: [], // 去年結束日期
    items: this.formBuilder.array([this.createItem()]), // 動態項目
  });

  // 取得動態項目陣列
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  // 取得指定項目的控制項
  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 移除項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 新增動態項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 表單提交處理
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

  // 編輯模式下加載數據
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 查看模式下加載數據並禁用表單
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 表單提交
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  // 取消並返回頁面
  onCancel() {
    this.router.navigate(['CPM2000/CPM22020']);
  }

  // 保留的建構子
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
