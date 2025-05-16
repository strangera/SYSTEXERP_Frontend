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
  selector: 'app-cpm21050-cru',
  templateUrl: './cpm21050-cru.component.html',
  styleUrl: './cpm21050-cru.component.scss'
})
export class CPM21050CRUComponent extends BasicCrupageComponent implements OnInit {
  // 表單資料初始化
  dataForm = this.formBuilder.nonNullable.group({
    activityItemCode: ['', Validators.required], // 活動用品代號
    activityItemName: ['', Validators.required], // 活動用品名稱
    equipmentCategory: ['', Validators.required], // 設備類別代號
    supplyNature: ['', Validators.required], // 用品性質
    brandModel: [], // 廠牌型號
    specificationDetail: [], // 規格明細
    productSerialNumber: [], // 產品序號
    accessoryEquipment: [], // 附屬設備
    storageLocation: [], // 存放地點
    custodian: [], // 保管人
    items: this.formBuilder.array([this.createItem()]) // 動態項目
  });

  // 下拉選單選項
  equipmentCategoryOptions: any[] = [
    { value: 1, label: '000001' },
    { value: 2, label: '000002' }
  ];
  supplyNatureOptions: any[] = [
    { value: 1, label: '耗材' },
    { value: 2, label: '贈品' },
    { value: 3, label: '一般' }
  ];
  floor: any[] = [];
  Departmentcode: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '520005';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.Departmentcode = data));
    this.floorService.getFloors().subscribe((data) => (this.floor = data));

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

  // 建立單個動態項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      itemCodeOptions: [],
      unit: [],
      returnQty: [],
      desc: [],
      cCat: []
    });
  }

  // 取得表單中的動態項目
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
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
          // Create logic here
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // Update logic here
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
    this.router.navigate(['CPM2000/CPM21050']);
  }
}
