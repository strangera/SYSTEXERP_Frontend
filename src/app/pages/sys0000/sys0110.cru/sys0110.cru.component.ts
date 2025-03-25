import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { UserLevelService } from '../../../service/basic/user-level.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserTypeService } from '../../../service/basic/user-type.service';
import { UserStatusService } from '../../../service/basic/user-status.service';
import { FloorService } from '../../../service/basic/floor.service';
import { RegionCodeService } from '../../../service/basic/region-code.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { SystemTypeDetailService } from '../../../service/basic/system-type-detail.service';
import { TreeNode } from 'primeng/api';
// 4-2-1-1使用者基本資料維護
const nowDate = new Date();

@Component({
  selector: 'app-sys0110-cru',
  templateUrl: './sys0110.cru.component.html',
  styleUrls: ['./sys0110.cru.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SYS0110CRUComponent extends BasicCrupageComponent implements OnInit {
  nodes: TreeNode[] = [
    {
      label: '總公司',
      selectable: false,
      expanded: true,
      children: [
        {
          key: '1',
          label: '稽核室',
          selectable: true,
          expanded: true
        },
        {
          key: '3',
          label: '營運部',
          selectable: false,
          expanded: true,
          children: [
            {
              key: '3-1',
              label: '時尚Team',
              selectable: false,
              expanded: true,
              children: [
                { key: '3-1-1', label: '1F', leaf: true, selectable: true, expanded: true, data: '' },
                { key: '3-1-2', label: '化妝品', leaf: true, selectable: true, expanded: true, data: '' }
              ]
            },
            {
              key: '3-2',
              label: '休閒Team',
              selectable: false,
              expanded: true,
              children: [
                { key: '3-2-1', label: '3F', leaf: true, selectable: true, expanded: true, data: '' },
                { key: '3-2-2', label: '居家生活組(停用)', leaf: true, selectable: true, expanded: true, data: '' },
                { key: '3-2-3', label: '親子娛樂組(停用)', leaf: true, selectable: true, expanded: true, data: '' }
              ]
            },
            {
              key: '3-3',
              label: '餐飲Team',
              selectable: false,
              expanded: true,
              children: [
                { key: '3-3-1', label: '餐廳/輕食組', leaf: true, selectable: true, expanded: true, data: '' },
                { key: '3-3-2', label: '美食街/食品料組', leaf: true, selectable: true, expanded: true, data: '' },
                { key: '3-3-3', label: '品牌經營組', leaf: true, selectable: true, expanded: true, data: '' }
              ]
            },
            { key: '3-4', label: '流行Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '3-5', label: '特販Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '3-6', label: '生活Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '3-7', label: '營運支援Team', leaf: true, selectable: true, expanded: true, data: '' }
          ]
        },
        {
          key: '4',
          label: '行銷部',
          selectable: false,
          expanded: true,
          children: [
            { key: '4-1', label: '會員Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '4-2', label: '顧客關係Team(停用)', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '4-3', label: '活動Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '4-4', label: '廣宣Team', leaf: true, selectable: true, expanded: true, data: '' },
            { key: '4-5', label: '企劃Team', leaf: true, selectable: true, expanded: true, data: '' }
          ]
        }
      ]
    }
  ];


  selectedNodes: TreeNode[] = [];

  // 表單
  dataForm = this.formBuilder.nonNullable.group({
    userCode: [, Validators.required], // 使用者編號
    userAlias: ['', Validators.required], // 使用者名稱
    password: [''], // 密碼
    organizationNumber: ['', Validators.required], // 組織編號
    startDate: [, Validators.required], // 帳號有效起始日期
    endDate: [''], // 帳號終止日
    userStatus: ['', Validators.required], // 使用者狀態
    userType: [, Validators.required], // 使用者型態
    userLevel: ['', Validators.required], // 使用者等級
    remark: [''], // 備註
    email: [''], // 電子郵件
    jobPositionOptions: [''], // 職位
    FloorOptions: [''], // 樓層代碼
    regionCodeOptions: [''], // 區域代碼
    businessTypeCodeOptions: [''], // 業種代碼
    counterCodeOptions: [''], // 專櫃代碼
    items: this.formBuilder.array([this.createItem()]), // 動態項目
  });

  // 下拉選單選項
  userLevelOptions: any[] = [];
  userStatusOptions: any[] = [];
  userTypeOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  FloorOptions: any[] = [];
  regionCodeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  counterCodeOptions: any[] = [];
  systemTypeDetailOptions: any[] = [];

  jobPositionOptions: any[] = [
    { label: '總經理', value: '1' },
    { label: '副總經理', value: '2' },
    { label: '協理', value: '3' },
    { label: '經理', value: '4' },
    { label: '副理', value: '5' },
    { label: '襄理', value: '6' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userLevelService: UserLevelService,
    private organizationNumber: OrganizationNumberService,
    private userTypeService: UserTypeService,
    private userStatusService: UserStatusService,
    private floorService: FloorService,
    private regionCodeService: RegionCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private counterCodeService: CounterCodeService,
    private systemTypeDetailService: SystemTypeDetailService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420001';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 加載下拉選項
    this.userLevelService
      .getUserlevel()
      .subscribe((data) => (this.userLevelOptions = data));
    this.organizationNumber
      .getOrganizationNumbers()
      .subscribe((data) => (this.organizationNumberOptions = data));
    this.userTypeService
      .getUserTypes()
      .subscribe((data) => (this.userTypeOptions = data));
    this.userStatusService
      .getUserStatus()
      .subscribe((data) => (this.userStatusOptions = data));
    this.floorService
      .getFloors()
      .subscribe((data) => (this.FloorOptions = data));
    this.regionCodeService
      .getRegionCodes()
      .subscribe((data) => (this.regionCodeOptions = data));
    this.businessTypeCodeService
      .getBusinessTypeCodes()
      .subscribe((data) => (this.businessTypeCodeOptions = data));
    this.counterCodeService
      .getCounterCodes()
      .subscribe((data) => (this.counterCodeOptions = data));
    this.systemTypeDetailService
      .getSystemTypes()
      .subscribe((data) => (this.systemTypeDetailOptions = data));

    const state = this.router.getCurrentNavigation()?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };
    this.handleState(state);
  }

  handleState(state: { crudstatus: CRUDStatus; rowdata: any }): void {
    switch (state.crudstatus) {
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

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      systemTypeDetailOptions: [],
      organizationNumberOptions: [],
    });
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onRemoveItem(index: number): void {
    this.items.removeAt(index);
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  Edit(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any): void {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(form: FormGroup): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (form.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      this.messageService.successBubble(
        this.translate.instant('success_message')
      );
    } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
      this.messageService.successBubble(
        this.translate.instant('updated-successfully')
      );
    }

    this.messageService.unblockUi();
  }

  submitForm(form: FormGroup): void {
    this.onSubmit(form);
  }

  onCancel(): void {
    this.router.navigate(['SYS0000/SYS0110']);
  }

  onSelectionChange(event: any) {
    const selectedNode = event.node;
    if (selectedNode.children && selectedNode.children.length > 0) {
      // 若選到非葉子節點，則取消選取
      this.selectedNodes = this.selectedNodes.filter(node => node.key !== selectedNode.key);
    }
  }
}
