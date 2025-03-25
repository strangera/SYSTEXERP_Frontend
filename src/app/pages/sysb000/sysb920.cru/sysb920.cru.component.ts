import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { IndustryTypeService } from '../../../service/basic/industry-type.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';

@Component({
  selector: 'app-sysb920.cru',
  templateUrl: './sysb920.cru.component.html',
  styleUrl: './sysb920.cru.component.scss'
})
// 小分類維護作業 CRU
export class SYSB920CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    smallClassification: [, [Validators.maxLength(2)]], // 小分類
    smallClassificationName: ['', [Validators.maxLength(40)]], // 小分類名稱
    industryType: [[] as number[]], // 所屬業種
    productCategory: [[] as number[]], // 商品類別
  });
  //
  industryTypeOptions: any[] = [];
  productTypeOptions: any[] = [];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private industryTypeService: IndustryTypeService,
    private productCategoryService: ProductCategoryService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '410009';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryTypeOptions = data;
    });

    this.productCategoryService.getSystemTypes().subscribe(data => {
      this.productTypeOptions = data;
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

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
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
    this.router.navigate(['/SYSB000/SYSB920']);
  }
  //------------------------------------------------------------------------------------------------------------
}
