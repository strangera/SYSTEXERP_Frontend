// TLS11020Component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';

@Component({
  selector: 'app-tls11020',
  templateUrl: './tls11020.component.html',
  styleUrls: ['./tls11020.component.scss']
})
export class TLS11020Component implements OnInit {
  ProgNo: string = '210002';
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.add };
  queryPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.query };
  editPermission: HasPermissionsValue = { progNo: this.ProgNo, permission: PermissionsInfo.edit };

  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    deductionItemNumber: ['', [this.validationService.numberValidator, Validators.maxLength(3)]],
    deductionItemName: ['', [Validators.maxLength(40)]],
    deductionCategory: [[] as string[]],
    remark: ['', [Validators.maxLength(160)]]
  });

  data: any[] = [];
  columns: any[] = [
    { field: 'CAP_Item', header: '扣款代碼', visible: true },
    { field: 'CAP_Type', header: '扣款類型', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目', visible: true },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true },
    { field: 'CAP_TaxType', header: '課稅別', visible: true },
    { field: 'IsCommonlyUsed', header: '是否常用', visible: true },
    { field: 'Print_Area', header: '扣款項目合約列印區分', visible: true },
    { field: 'CAP_Remark', header: '備註', visible: true }
  ];

  deductionCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private deductionCategoryService: DeductionCategoryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.deductionCategoryService.getDeductionCategories().subscribe(data => {
      this.deductionCategoryOptions = data;
    });
  }

  onSubmitQuery(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;
    this.loading = true;
    this.messageService.blockUi();

    const formValue = frm.value;
    const payload = {
      CAP_Item: formValue.deductionItemNumber,
      CAP_Type: null,
      CAP_Name: formValue.deductionItemName,
      AccNo: null,
      GUI_FLAG: null,
      CAP_TaxType: null,
      IsCommonlyUsed: null,
      Print_Area: null,
      PageIndex: 1,
      PageSize: 10,
      SortBy: [{ field: 'CAP_Item', order: 1 }]
    };

    this.http.post<any>('https://localhost:7271/TLS0000/TLS1000/queryTLS11020', payload).subscribe({
      next: res => {
        this.data = res.Data; // <- 修正這裡，原本是 res.data
        this.messageService.successBubble('查詢成功');
      },
      error: () => this.messageService.errorBubble('查詢失敗'),
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }

  onClearForm() {
    this.queryForm.reset();
  }

  onCreate() {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Create, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: { crudstatus: CRUDStatus.Edit, rowdata: data, queryform: this.queryForm },
        skipLocationChange: true
      };
      this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
    }
  }

  onDetail(data: any) {
    const extras: NavigationExtras = {
      state: { crudstatus: CRUDStatus.Read, rowdata: data, queryform: this.queryForm },
      skipLocationChange: true
    };
    this.router.navigate(['/TLS1000/TLS11020CRU'], extras);
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
    this.onSubmitQuery(frm);
  }
}