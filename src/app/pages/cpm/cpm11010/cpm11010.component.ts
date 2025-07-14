import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { FloorService } from '../../../service/basic/floor.service';
import { RegionService } from '../../../service/basic/region-code.service';
import { LocationService } from '../../../service/basic/location.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//5.1.1.1 服務台位置維護作業
@Component({
    selector: 'app-cpm11010',
    templateUrl: './cpm11010.component.html',
    styleUrl: './cpm11010.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM11010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    BUILDING_NO: [, [Validators.maxLength(2)]], // 館別(sys3800)
    floor: [], // 營業樓層
    regionCode: [], // 營業區域
    positionNumber: [], // 服務台位置編號
    counterName: ['', [Validators.maxLength(60)]], // 服務台位置名稱
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { isdelete: false, 'floor': '1F', 'regionCode': 'A區', 'positionNumber': '11A001', 'BUILDING_NO': 1, 'counterName': '服務諮詢台' },
    { isdelete: false, 'floor': '2F', 'regionCode': 'A區', 'positionNumber': '12A001', 'BUILDING_NO': 1, 'counterName': 'VIP室' },
    { isdelete: true, 'floor': '3F', 'regionCode': 'A區', 'positionNumber': '12D001', 'BUILDING_NO': 2, 'counterName': '總機' },
    { isdelete: true, 'floor': '5F', 'regionCode': 'A區', 'positionNumber': '15A001', 'BUILDING_NO': 2, 'counterName': '顧客服務中心' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'BUILDING_NO', header: '館別', visible: true },
    { field: 'floor', header: '營業樓層', visible: true },
    { field: 'regionCode', header: '營業區域', visible: true },
    { field: 'positionNumber', header: '服務台位置編號', visible: true },
    { field: 'counterName', header: '服務台位置名稱', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  positionNumberOptions: any[] = [];
  BUILDING_NO_Options: any[] = [
    { value: 1, label: '1館' },
    { value: 2, label: '2館' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private floorService: FloorService,
    private RegionService: RegionService,
    private locationService: LocationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '510001';
    this.cruPage = '/CPM1000/CPM11010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe(data => {
      this.RegionCodeOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.positionNumberOptions = data;
    });
    // ----------------------------------------------------------------
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
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
