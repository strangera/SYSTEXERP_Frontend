import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { ItemUnitService } from './../../../service/basic/item-unit.service';
import { PostageChargeService } from './../../../service/basic/postage-charge.service';

//3.1.1.4 品項資料維護作業 CRU
@Component({
  selector: 'app-ass11040-cru',
  templateUrl: './ass11040-cru.component.html',
  styleUrl: './ass11040-cru.component.scss'
})
export class ASS11040CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  warrantyMethodOptions: any[] = [];

  bigCategoryCodeOptions: any[] = [
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  midCategoryCodeOptions: any[] = [
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];

  itemCategoryOptions: any[] = [
    { value: 1, label: '資產' },
    { value: 2, label: '列管品' },
    { value: 3, label: '耗材' },
    { value: 4, label: '房屋和建築設備' },
    { value: 5, label: '其他資產(無形)' },
    { value: 6, label: '不領用之耗材' },
  ];
  itemUnitOptions: any[] = [];
  packageUnitOptions: any[] = [
    { value: 1, label: '箱' },
    { value: 2, label: '包' },
    { value: 3, label: '袋' },
    { value: 4, label: '束' },
    { value: 5, label: '盒' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    itemCode: [, [Validators.maxLength(13)]], // 品項代碼
    itemName: ['', [Validators.maxLength(32)]], // 品項代碼
    bigCategoryCode: [], // 大分類代碼
    midCategoryCode: [], // 中分類代碼
    smlCategoryCode: [], // 小分類代碼
    itemCategory: [], // 品項類別區分
    itemUnit: [], // 基本單位
    packageUnit: [], // 包裝單位
    warrantyMethod: [], // 保固方式
    maintenanceMethod: [], // 保養方式
    illustrate: [,], // 說明
  });
  //
  // ----------------------------------------------------------------
  //

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    //
    private postageChargeService: PostageChargeService,
    private itemUnitService: ItemUnitService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310004';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    //
    this.postageChargeService.getSystemTypes().subscribe(data => {
      this.warrantyMethodOptions = data;
    });
    //
    this.itemUnitService.getItemUnits().subscribe(data => {
      this.itemUnitOptions = data;
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }
  // ----------------------------------------------------------------
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
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
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
    this.router.navigate(['/ASS1000/ASS11040']);
  }
}
