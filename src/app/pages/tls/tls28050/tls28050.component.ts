import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';
// Services for dropdowns
import { BagTypeService } from '../../../service/basic/bag-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

const now = new Date();

@Component({
  selector: 'app-tls28050',
  templateUrl: './tls28050.component.html',
  styleUrls: ['./tls28050.component.scss'],
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS28050Component {

  // 程式編號
  ProgNo: string = '220048';
  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    date: [now, [Validators.required]],  // 日期
    bagType: [],  // 表類
    floor: []  // 樓層
  });

  // 表格資料
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'categoryName', header: '櫃號名稱', visible: true },
    { field: 'description', header: '說明', visible: true },
    { field: 'buildingName', header: '樓層名稱', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'sequence', header: '序號', visible: true },
    { field: 'subCategoryName', header: '櫃號名稱', visible: true },
    { field: 'subDescription', header: '說明', visible: true },
    { field: 'subBuildingName', header: '樓層名稱', visible: true },
    { field: 'subStatus', header: '狀態', visible: true },
  ];

  // 下拉選單選項
  bagTypeOptions: any[] = [];
  floorOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private bagTypeService: BagTypeService,
    private floorService: FloorService
  ) { }

  ngOnInit(): void {

    // Initialize dropdown options
    this.bagTypeService.getBagTypes().subscribe(data => {
      this.bagTypeOptions = data;
    });
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
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
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm
        },
        skipLocationChange: true
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
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
