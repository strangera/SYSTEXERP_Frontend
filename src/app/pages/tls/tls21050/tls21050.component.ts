import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { OperationStatusService } from '../../../service/basic/operation-status.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { DeductionCodeNameService } from '../../../service/basic/deduction-code-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-tls21050',
  templateUrl: './tls21050.component.html',
  styleUrl: './tls21050.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, ButtonComponent, TranslateModule]
})
export class TLS21050Component {
  ProgNo: string = '220005';
  // 权限
  funInfo?: FunsrightInfo;



  // 查询表单
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    counterCode: [],
    counterName: [],
    floorCode: [],
    regionCode: [],
    businessTypeCode: [],
    operationStatus: [],
    contractStartDate: [],
    contractEndDate: [],
    contractDeadlineStartDate: [],
    contractDeadlineEndDate: [],
    commissionType: [],
    commissionCategory: [],
    discountType: [],
    organizationCode: [],
  });
  // 表格数据
  data: any[] = [
    { name: 'John', age: 25, 電子信箱: 'john@example.com' },
    { name: 'Jane', age: 30, 電子信箱: 'jane@example.com' },
    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'name', visible: true },
    { field: 'age', header: 'age', visible: true },
    { field: '電子信箱', header: '電子信箱', visible: true },
    // 其他列
  ];
  // 下拉选单选项
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  commissionCategoryOptions: any[] = [];
  discountTypeOptions: any[] = [];
  organizationOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private operationStatusService: OperationStatusService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private DeductionService: DeductionService,
    private deductionCodeNameService: DeductionCodeNameService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
    this.RegionService.getRegionOptions().subscribe((data) => {
      this.regionOptions = data;
    });
    this.operationStatusService.getOperationStatuses().subscribe((data) => {
      this.operationStatusOptions = data;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.DeductionService.getDeductionCategories().subscribe((data) => {
      this.commissionCategoryOptions = data;
    });
    this.deductionCodeNameService.getDeductionCodeNames().subscribe((data) => {
      this.commissionTypeOptions = data;
    });
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

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交逻辑
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
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
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
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
