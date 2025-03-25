import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  styleUrl: './tls11020.component.scss'
})
// 2.1.2.1 扣款項目維護作業
export class TLS11020Component {
  ProgNo: string = '210002';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };
  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    deductionItemNumber: [, [this.validationService.numberValidator, Validators.maxLength(3)]], // 扣款項目編號
    deductionItemName: ['', [Validators.maxLength(40)]], // 扣款項目名稱
    deductionCategory: [[] as number[]], // 扣款類別
    defaultAmountMin: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 預設金額
    defaultAmountMax: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 預設金額
    remark: ['', [Validators.maxLength(50)]], // 備註
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { deductionItemNumber: 'A01', deductionItemName: '開幕贊助費', deductionCategory: '一次扣款'},
    // { deductionItemNumber: 'A02', deductionItemName: '識別費', deductionCategory: '一次扣款'},
    // { deductionItemNumber: 'A03', deductionItemName: '影印費', deductionCategory: '一次扣款'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'col1', header: '扣款項目編號', visible: true },
    { field: 'col2', header: '扣款項目名稱', visible: true },
    { field: 'col3', header: '扣款類別', visible: true },
    { field: 'col4', header: '銷售類型', visible: true },
    { field: 'col5', header: '收單行', visible: true },
    { field: 'col6', header: '期數', visible: true },
    { field: 'col7', header: '有價卷代扣款類別', visible: true },
    { field: 'col8', header: '基準金額/比率', visible: true },
    { field: 'col9', header: '預設金額', visible: true },
    { field: 'col10', header: '備註', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  deductionCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private deductionCategoryService: DeductionCategoryService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.deductionCategoryService.getDeductionCategories().subscribe(data => {
      this.deductionCategoryOptions = data;

      // let deductionCategoryValues = this.deductionCategoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   deductionCategory: deductionCategoryValues
      // });
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
  }
}
