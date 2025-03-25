import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-fin35020-cru',
  templateUrl: './fin35020-cru.component.html',
  styleUrls: ['./fin35020-cru.component.scss']
})
export class FIN35020CRUComponent extends BasicCrupageComponent implements OnInit  {

  // 下拉選項等變數
  debitAccountOptions: any[] = [{ value: 1, label: '110302' }];
  creditAccountOptions: any[] = [{ value: 1, label: '110301' }, { value: 2, label: '110302' }];
  vendorCodeOptions: any[] = [{ value: 1, label: '00000000-1' }, { value: 2, label: '00000000-2' }];
  documentTypeOptions: any[] = [{ value: 1, label: '現金' }, { value: 2, label: '支票' }];
  financialInstitutionOptions: any[] = [{ value: 1, label: '000000' }];
  statusOptions: any[] = [{ value: 1, label: '建立' }];
  organizationCodeOptions: any[] = [{ value: 1, label: '全公司' }];
  targetCodeOptions: any[] = [{ value: 1, label: '臺南紡織股份有限公司' }];
  
  // 表單定義
  dataForm = this.formBuilder.nonNullable.group({
    voucherNumber: [''], // 傳票編號
    voucherType: [''], // 傳票種類
    voucherCategory: [''], // 傳票型態
    voucherDate: [''], // 傳票日期
    voucherSummary: [''], // 傳票摘要
    creator: [''], // 建立者
    creationDate: [''], // 建立日
    items: this.formBuilder.array([this.createItem()]), // 明細項目
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '130011';

    // 設定 CRUD 狀態
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
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

  // 動態表單項目
  createItem(): FormGroup {
    return this.formBuilder.group({
      accountCode: ['', Validators.required], // 科目代號
      vendorCode: [''], // 廠商編號
      summary: [''], // 摘要
      debitAmount: ['', Validators.required], // 借方金額
      creditAmount: ['', Validators.required], // 貸方金額
      organizationCode: ['', Validators.required], // 組織代號
      settleCode: [''], // 立沖代號
      activityCode: [''], // 活動代號
      targetCode: [''], // 對象別編號
      reconciliationKey: [''], // 對帳KEY值
    });
  }

  // 取得明細項目的表單控制
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  // 新增與刪除動態項目
  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  // 提交表單處理
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    // 根據 CRUD 狀態進行處理
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // 返回處理
  onCancel() {
    this.router.navigate(['/demo/demofin35020']);
  }
  
  // 表單提交
  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
  
  // 讀取數據並填充表單
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }
}
