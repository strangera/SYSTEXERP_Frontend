import { FloorService } from './../../../service/basic/floor.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
// Services

@Component({
  selector: 'app-ass21050-cru',
  templateUrl: './ass21050-cru.component.html',
  styleUrl: './ass21050-cru.component.scss'
})
export class ASS21050CRUComponent
  extends BasicCrupageComponent
  implements OnInit
{
  ngOnInit(): void {
    // 網站導覽設定
    this.ProgNo = '320005';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
     // 下拉選單--------------------------------------------------------
    //  this.userCodeService.getUserCode().subscribe((data) => (this.Applicantcode = data));
     this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.Departmentcode = data));
     this.floorService.getFloors().subscribe((data) => (this.floor = data));
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

    console.log(this.accordionTabCss);
  }

  //動態新增----------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      
      itemCodeOptions: [],
      unit: [],
      returnQty: [],
      desc: [],
      cCat: [],
      
    });
  }

  //非動態新增 ----------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    meterPosCode: [],
    floor: [],
    area: [],
    SN: [],
    xCoordinate : [],
    yCoordinate: [],
    desc: [],
    placementDesc: [],
    Energytype: [],
    meterNo: [],
    floorCat: [],
    VFP: [],
    cCat: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options
  VFP: any[] =[];
  floor: any[] =[];
  area: any[] = [];
  Departmentcode: any[] = [];
  itemCodeOptions: any[] = [
    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
    { value: 6, label: '3A24210000006' },
    { value: 7, label: '3A24210000007' },
    { value: 8, label: '3A24210000008' },
    { value: 9, label: '3A24210000009' },
    { value: 10, label: '3A24210000010' },
];
Energytype: any[] = [{ value: 1, label: '水費' },
  { value: 2, label: '電費' },
  { value: 3, label: '瓦斯費' },];
  meterPosCode: any[] = [
    { value: 1, label: '3A24210000001' },
    { value: 2, label: '3A24210000002' },
    { value: 3, label: '3A24210000003' },
    { value: 4, label: '3A24210000004' },
    { value: 5, label: '3A24210000005' },
    { value: 6, label: '3A24210000006' },
    { value: 7, label: '3A24210000007' },
    { value: 8, label: '3A24210000008' },
    { value: 9, label: '3A24210000009' },
    { value: 10, label: '3A24210000010' },
];
equipmentLocationOptions: any[] = [
  { value: 1, label: '010A000001' },
  { value: 2, label: '010A000002' },
  { value: 3, label: '010A000003' },
  { value: 4, label: '010A000004' },
  { value: 5, label: '010B000001' },
  { value: 6, label: '010B000002' },
  { value: 7, label: '010B000003' },
  { value: 8, label: '010B000004' },
  { value: 9, label: '010B000005' },
  { value: 10, label: '010B000006' },
];
cCat: any[] = [
  { value: 1, label: '商場' },
 
];

 
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService:UserCodeService,
    private organizationNumberService:OrganizationNumberService,
    private floorService:FloorService,

  ) {
    super(); // 呼叫父類建構子
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
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
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
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
    // 查詢邏輯
    this.onSubmit(frm);
  } //CRU

  onCancel() {
    this.router.navigate(['ASS2000/ASS21050']);
  }
}
