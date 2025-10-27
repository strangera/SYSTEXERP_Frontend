import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-fin61020-cru',
  templateUrl: './fin61020-cru.component.html',
  styleUrl: './fin61020-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN61020CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  ngOnInit(): void {
    // 初始化
    this.ProgNo = '160002';
    //
    // ----------------------------------------------------------------
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.usercode = data));

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
  createItem(): FormGroup {
    return this.formBuilder.group({
      Accountcode: [],
      vendorCodeOptions: [],
      summary: [],
      Debitamount: [],
      Creditamount: [],
      Organizationcode: [],
      StandingInstructionCode: [],
      Activitycode: [],
      Objectnumber: [],
      ReconciliationKEYvalue: [],
      usercode: [],
    });
  }

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    Subpoenanumber: [],
    Subpoenatype: [],
    Subpoenadate: [],
    Subpoenastatus: [],
    Subpoenasummary: [],
    Makeupinvoice: [],
    builder: [],
    modifyer: [],
    builddate: [],
    modifydate: [],
    uickMenu: [],
    Companybankcode: [],
    status: [],
    usercode: [],
    Employeename: [],
    Organizationcode: [],

    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options
  status: any[] = [
    { value: 1, label: '停用' },
    { value: 2, label: '手開' },
    { value: 3, label: '電腦' },

  ];
  Companybankcode: any[] = [
    { value: 1, label: '110306' },

  ];
  Activitycode: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
    { value: 3, label: '003' },
    { value: 4, label: '004' },
    { value: 5, label: '005' },
    { value: 6, label: '006' },
    { value: 7, label: '007' },
    { value: 8, label: '008' },
    { value: 9, label: '009' },
    { value: 10, label: '010' },
  ];
  StandingInstructionCode: any[] = [];
  Organizationcode: any[] = [
    { value: 1, label: '100000' },
    { value: 2, label: '100100' },
    { value: 3, label: '101000' },
    { value: 4, label: '101100' },
    { value: 5, label: '101200' },
    { value: 6, label: '101300' },
    { value: 7, label: '101400' },
    { value: 8, label: '101500' },
    { value: 9, label: '101600' },
    { value: 10, label: '101700' },
  ];
  usercode: any[] = [];
  Accountcode: any[] = [
    { value: 1, label: '110101' },
    { value: 2, label: '110102' },
    { value: 3, label: '110103' },
    { value: 4, label: '110111' },
    { value: 5, label: '110112' },
    { value: 6, label: '110199' },
    { value: 7, label: '110200' },
    { value: 8, label: '110201' },
    { value: 9, label: '110210' },
    { value: 10, label: '110220' },
  ];
  Makeupinvoice: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  Subpoenatype: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];
  Subpoenastatus: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-4' },
    { value: 4, label: '00000000-5' },
    { value: 5, label: '00000000-7' },
    { value: 6, label: '00000000-8' },
    { value: 7, label: '00852492-1' },
    { value: 8, label: '01052878-1' },
    { value: 9, label: '01508949-1' },
    { value: 10, label: '01515462-1' },
  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private userCodeService: UserCodeService
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
    this.router.navigate(['FIN6000/FIN61020']);
  }
}
