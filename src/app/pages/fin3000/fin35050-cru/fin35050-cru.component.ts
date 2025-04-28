import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { MargintypeService } from '../../../service/basic/margintype.service';
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fin35050-cru',
  templateUrl: './fin35050-cru.component.html',
  styleUrl: './fin35050-cru.component.scss',
})
export class FIN35050CRUComponent
  extends BasicCrupageComponent
  implements OnInit {









  // 選項下拉選單
  FNCCodeOptions: any[] = [];
  accountCodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  margintypeOptions: any[] = [];
  borrowLoanOptions: any[] = [
    { value: 1, label: '借' },
    { value: 2, label: '貸' },
  ];
  typeOptions: any[] = [
    { value: 1, label: '存入保證金' },
    { value: 2, label: '存出保證金' },
  ];

  // 表單
  dataForm = this.formBuilder.nonNullable.group({
    accountCode: [, Validators.required], // 會計科目代號
    borrowLoan: [, Validators.required], // 借/貸
    remark: [], // 備註
    type: [, Validators.required], // 類型
    // 明細項目
    items: this.formBuilder.array([this.createItem()]),
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService,
    private vendorService: VendorService,
    private flippingstateService: FlippingstateService,
    private margintypeService: MargintypeService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '130015';
    // 獲取權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 加載下拉選項資料
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });
    this.margintypeService.getOptions().subscribe((data) => {
      this.margintypeOptions = data;
    });

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
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

  // 新增明細項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      remark: [], // 備註
      startdate: [],
      enddate: [],
      SMarginserialnumber: [],
      EMarginserialnumber: [],
      vendorCode: [],
      Flippingstate: [1, Validators.required],
      Checknumber: [],
      margintype: [],
      borrowloan: [],
      type: [],
    });
  }

  // 獲取明細項目的表單控制項
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 刪除明細項目
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 編輯模式
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 閱讀模式
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 新增一項明細
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  // 表單提交
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

  // 取消操作
  onCancel() {
    this.router.navigate(['FIN3000/FIN35050']);
  }
}
