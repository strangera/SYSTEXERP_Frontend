import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { ViolationStatusService } from '../../../service/basic/violation-status.service';
import { DeductionItemService } from '../../../service/basic/deduction-item.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls25030-mod',
  templateUrl: './tls25030-mod.component.html',
  styleUrls: ['./tls25030-mod.component.scss'],
})
export class TLS25030ModComponent implements OnInit, OnDestroy {
  ProgNo: string = '220034';

  // 權限變數
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    documentNumber: [],           // 單據號碼
    counterCode: [],              // 專櫃編號
    operationEndDate: [],         // 營運截止日
    counterName: [],              // 櫃位名稱
    deductionItem: [],            // 扣款項目
    violationCategoryCode: [],        // 違規類別編號
    deductionContent: [],         // 扣款內容
    amount: [],              // 金額
    amountEnd: [],                // 金額結束
    monthlyDeduction: [],         // 月結扣款
    deductionDateStart: [],       // 扣款日期
    violationDateStart: [],       // 違規日期
    issuingUnit: [],              // 開立人代號 / 名稱
    remarks: [],                  // 備註

  });

  // 下拉選單選項
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  statusOptions: any[] = [];
  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  monthlyDeduction: any[] = [{ value: 1, label: '是' },
  { value: 2, label: '否' },];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private counterCodeService: CounterCodeService,
    private violationCategoryService: ViolationCategoryService,
    private floorService: FloorService,
    private violationStatusService: ViolationStatusService,
    private deductionItemService: DeductionItemService,
    private organService: OrganizationNumberService
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 從 sessionStorage 讀取並填充表單
    const storedEditData = sessionStorage.getItem('editData');
    if (storedEditData) {
      const editData = JSON.parse(storedEditData);
      this.queryForm.patchValue(editData);
    }

    // 加载选项数据
    this.counterCodeOptions = JSON.parse(sessionStorage.getItem('counterCodeOptions') || '[]');
    this.violationCategoryOptions = JSON.parse(sessionStorage.getItem('violationCategoryOptions') || '[]');
    this.floorOptions = JSON.parse(sessionStorage.getItem('floorOptions') || '[]');
    this.statusOptions = JSON.parse(sessionStorage.getItem('statusOptions') || '[]');
    this.deductionItemOptions = JSON.parse(sessionStorage.getItem('deductionItemOptions') || '[]');
    this.organizationNumberOptions = JSON.parse(sessionStorage.getItem('organizationNumberOptions') || '[]');
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('editData');
    sessionStorage.removeItem('queryFormData');
    sessionStorage.removeItem('detailData');
  }

  private populateForm(data: any) {
    this.queryForm.patchValue({
      documentNumber: data.documentNumber,
      counterCode: data.counterCode,
      operationEndDate: data.operationEndDate,
      counterName: data.counterName,
      deductionItem: data.deductionItem,
      violationCategoryCode: data.violationCategory,
      deductionContent: data.deductionContent,
      amount: data.amount,

      monthlyDeduction: data.monthlyDeduction,
      deductionDateStart: data.deductionDateStart,
      violationDateStart: data.violationDateStart,
      issuingUnit: data.issuingUnit,
      remarks: data.remarks
    });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
    this.router.navigate(['TLS2000/TLS25030']);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      sessionStorage.setItem('editData', JSON.stringify(data));
      sessionStorage.setItem('counterCodeOptions', JSON.stringify(this.counterCodeOptions));
      sessionStorage.setItem('violationCategoryOptions', JSON.stringify(this.violationCategoryOptions));
      sessionStorage.setItem('floorOptions', JSON.stringify(this.floorOptions));
      sessionStorage.setItem('statusOptions', JSON.stringify(this.statusOptions));
      sessionStorage.setItem('deductionItemOptions', JSON.stringify(this.deductionItemOptions));
      sessionStorage.setItem('organizationNumberOptions', JSON.stringify(this.organizationNumberOptions));

      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25030MOD'], extras);
    }
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }
}
