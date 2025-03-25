import { DataTypeService } from './../../../service/basic/data-type.service';
import { FloorService } from './../../../service/basic/floor.service';
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
import { CounterCodeService } from '../../../service/basic/counter-code.service';

// 2.4.7.1  資料下傳收銀機作業
@Component({
  selector: 'app-tls47010',
  templateUrl: './tls47010.component.html',
  styleUrl: './tls47010.component.scss'
})
export class TLS47010Component {
  ProgNo: string = '240025';
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
    registerID: [, [Validators.required]], // DropDown
    counterID: [, [Validators.required]], // DropDown
    dataType: [[] as number[], [Validators.required]], // MultiSelect
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    //{ contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[]= [
    { field: 'contactPerson', header: 'Line1', visible: true },
    { field: 'contactDate', header: 'Line2', visible: true },
    { field: 'UID', header: 'Line3', visible: true },
    { field: 'industryType', header: 'Line4', visible: true },
    { field: 'category', header: 'Line5	', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  counterIDOptions: any[] = [];
  registerIDOptions: any[] = [];
  dataTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private floorService: FloorService,
    private counterCodeService: CounterCodeService,
    private dataTypeService: DataTypeService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.counterIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.floorService.getFloors().subscribe(data => {
      this.registerIDOptions = data;
    });
    // ----------------------------------------------------------------
    this.dataTypeService.getSystemTypes().subscribe(data => {
      this.dataTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.dataTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   dataType: allSystemValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }
  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }
  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }
  // ----------------------------------------------------------------
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
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS2000/TLS47010CRU'], extras);
  }
}
