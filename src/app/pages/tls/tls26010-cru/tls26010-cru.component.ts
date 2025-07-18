import { NgIf } from '@angular/common';
import { Component, OnInit, signal, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { TLS26010cru, TLS26010Query, TLS26010Service } from '../../../service/api/tls/tls26010.service';
import { AuthService } from '../../../service/system/auth.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, ButtonComponent, NgIf, TableComponent, TranslateModule, InputTextComponent, MultiSelectComponent]
})
export class TLS26010CRUComponent extends BasicCrupageComponent implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    pod_no: ['', [Validators.required, Validators.maxLength(10)]], // 預售活動編號
    pod_desc: ['', [Validators.required, Validators.maxLength(100)]], // 預售名稱
    pod_sdate: [new Date(), Validators.required], // 活動日期(起)
    pod_edate: [new Date(), Validators.required], // 活動日期(迄)
    pod_status: ['未核准'], // 核准狀態
    ECR_Nos: [[]], //收銀機清單
    tlt_Nos: [[]], //專櫃清單
    approved_usr_name: [''], // 核准人員
    approved_date: [''], // 核准日期

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });

  public CRUDStatus = CRUDStatus;

  private rowDataSignal = signal<TLS26010cru>({} as TLS26010cru); // 用於存儲表格資料

  // 表格資料
  columns: any[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
  ];
  // 表格資料2
  columns2: any[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    public tls26010Service: TLS26010Service,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = 'TLS26010';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    this.rowDataSignal.set(state?.rowdata!);
    this.tls26010Service.approvalData.set(state?.rowdata?.pod_status || '未核准');

    console.log(`init:`, [this.funInfo, state]);

    this.tls26010Service.loadPreorderECRList({ data_type: '1', SYS3800s: [], SYS3900s: [] });
    this.tls26010Service.loadTLTTALENT({ SYS3800s: [], SYS3900s: [] });

    this.formTitle = 'create-conditions';
    this.accordionTabCss = 'create-accordionTab';
    this.crudstatus = CRUDStatus.Create;
    this.showConfirm = this.canAdd();
    console.log(this.accordionTabCss);
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      pod_no: ['', [Validators.required, Validators.maxLength(14)]], // 預售活動編號
      pod_desc: ['', [Validators.required, Validators.maxLength(50)]], // 預售名稱
      pod_sdate: [new Date(), Validators.required], // 活動日期(起)
      pod_edate: [new Date(), Validators.required], // 活動日期(迄)
      pod_status: [''], // 核准狀態
      ECR_Nos: [[]], //收銀機清單
      tlt_Nos: [[]], //專櫃清單
      approved_usr_name: [''], // 核准人員
      approved_date: [''], // 核准日期
    });
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
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/demo']);
  }
}
