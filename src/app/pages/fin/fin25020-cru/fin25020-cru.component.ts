import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//1.2.5.2 形成電匯明細資料 CRU
@Component({
  selector: 'app-fin25020-cru',
  templateUrl: './fin25020-cru.component.html',
  styleUrl: './fin25020-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN25020CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    buildDate: [, [Validators.required]], // 建立日期
    transferDate: [, [Validators.required]], // 匯款日期
    bankCode: [, [Validators.required, Validators.maxLength(8)]], // 銀行代號
    transferSource: [, [Validators.required, Validators.maxLength(12)]], //匯款來源單號
  });
  //
  // ----------------------------------------------------------------
  //
  transferSourceOptions: any[] = [
    { value: 1, label: 'D20140106001/2014/0106/Y' },
    { value: 2, label: 'D20140106002/2014/0106/Y' },
    { value: 3, label: 'D20140106003/2014/0106/Y' },
  ];

  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private translate: TranslateService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120018';
    //
    // ----------------------------------------------------------------
    //
    // ----------------------------------------------------------------
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
    this.router.navigate(['/FIN2000/FIN25020']);
  }
}
