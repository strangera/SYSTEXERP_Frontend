import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { RegionCodeService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { DeductionCodeNameService } from '../../../service/basic/deduction-code-name.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';

@Component({
  selector: 'app-tls13030',
  templateUrl: './tls13030.component.html',
  styleUrl: './tls13030.component.scss',
})
export class TLS13030Component {
  ProgNo: string = '210012';
  // 權限
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  // 查詢
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    counterCode: [, [Validators.maxLength(8)]],
    counterName:  [,[Validators.maxLength(50)]] ,
    floorCode: [],
    regionCode: [],
    businessTypeCode: [],
    operationStatus: [],
    contractStartDate: [],
    contractEndDate: [],
    contractDeadlineStartDate: [],
    contractDeadlineEndDate: [],
    deductionCategory: [],
    deductionCodeName: [],
    deductionStartDate: [],
    deductionEndDate: [],
    deductionDeadlineStartDate: [],
    deductionDeadlineEndDate: [],
  });

  // 下拉選單選項
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  operationStatusOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  deductionCategoryOptions: any[] = [];
  deductionCodeNameServOptions: any[] = [];
  businessTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private regionCodeService: RegionCodeService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private deductionCategoryService: DeductionCategoryService,
    private deductionCodeNameService: DeductionCodeNameService,
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.regionCodeService.getRegionCodes().subscribe((data) => {
      this.regionOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });

    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });

    this.deductionCategoryService.getDeductionCategories().subscribe((data) => {
      this.deductionCategoryOptions = data;
    });

    this.deductionCodeNameService.getDeductionCodeNames().subscribe((data) => {
      this.deductionCodeNameServOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
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
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }
}
