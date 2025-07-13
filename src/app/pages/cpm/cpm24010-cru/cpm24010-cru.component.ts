import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { FloorService } from '../../../service/basic/floor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
    selector: 'app-cpm24010-cru',
    templateUrl: './cpm24010-cru.component.html',
    styleUrls: ['./cpm24010-cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarComponent,
        DropdownComponent,
        InputTextComponent,
        NgFor,
        ButtonDynamicallydeleteComponent,
        ButtonDynamicallyaddComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
    ],
})
export class CPM24010CRUComponent extends BasicCrupageComponent implements OnInit {
  dataForm = this.formBuilder.group({
    startDate: [, Validators.required],
    endDate: [, Validators.required],
    marketingCampaignCode: [, Validators.required],
    campaignName: [, Validators.required],
    totalBudget: [],
    items: this.formBuilder.array([this.createItem()]),
  });
  applicant: any[] = [];
  marketingCampaignOptions: any[] = [];
  activityCategoryOptions: any[] = [];


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
    super();

  }

  ngOnInit(): void {
    // 網站導覽設定
    this.ProgNo = '520017';
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 下拉選單初始化
    this.loadDropdownOptions();

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
  loadDropdownOptions() {
    this.userCodeService.getUserCode().subscribe((data) => (this.applicant = data));
    this.organizationNumberService.getOrganizationNumbers().subscribe();
    this.floorService.getFloors().subscribe();
    // 加載行銷檔期代號與活動類別選項
    this.marketingCampaignOptions = [
      { value: '001', label: '春季活動' },
      { value: '002', label: '夏季活動' },
    ];
    this.activityCategoryOptions = [
      { value: 'A1', label: '市場推廣' },
      { value: 'A2', label: '產品促銷' },
    ];
  }

  // 動態新增方法
  createItem(): FormGroup {
    return this.formBuilder.group({
      activityCategory: [],
      activityCategoryName: [],
      budgetAmount: [],
    });
  }

  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

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
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
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
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['CPM2000/CPM24010']);
  }
}
