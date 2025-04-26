import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { FloorService } from '../../../service/basic/floor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';

@Component({
  selector: 'app-cpm23020',
  templateUrl: './cpm23020.component.html',
  styleUrls: ['./cpm23020.component.scss']
})
// 活動用品入庫作業
export class CPM23020Component extends BasicQpageComponent implements OnInit {

  queryForm = this.formBuilder.group({
    eventStartDate: [], // 活動開始日期
    eventEndDate: [], // 活動結束日期
    lastStorageDate: [], // 最後入庫日期
    marketingCampaignCode: [], // 行銷檔期代號
    campaignName: [], // 檔期名稱
    suppliesManagementNumber: [], // 用品管理單號
    manufacturerCode: [], // 廠商編號
    lastStoragePerson: [], // 最後入庫人員
    suppliesCondition: [], // 用品狀況
    storageStatus: [] // 入庫狀況
  });
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'itemManagementNumber', header: '用品管理單號', visible: true },
    { field: 'marketingPhaseCode', header: '行銷檔期代號', visible: true },
    { field: 'phaseName', header: '檔期名稱', visible: true },
    { field: 'eventStartDate', header: '活動開始日期', visible: true },
    { field: 'eventEndDate', header: '活動結束日期', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'itemStatus', header: '用品狀況', visible: true },
    { field: 'lastStorageDate', header: '最後入庫日期', visible: true },
    { field: 'lastStoragePerson', header: '最後入庫人員', visible: true },
    { field: 'storageStatus', header: '入庫狀況', visible: true },
  ];
  // Dropdown options
  marketingCampaignCodeOptions: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' }
  ];

  manufacturerCodeOptions: any[] = [
    { value: 1, label: '53472035-23' }
  ];

  lastStoragePersonOptions: any[] = [
    { value: 1, label: 'John Doe' },
    { value: 2, label: 'Jane Smith' }
  ];

  suppliesConditionOptions: any[] = [
    { value: 1, label: '請購' },
    { value: 2, label: '借用' },
    { value: 3, label: '贈送' },
    { value: 4, label: '租賃' }
  ];

  storageStatusOptions: any[] = [
    { value: 1, label: '未入庫' },
    { value: 2, label: '全部入庫' },
    { value: 3, label: '部分入庫' }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private organizationNumberService: OrganizationNumberService,
    private floorService: FloorService,
    private userCodeService: UserCodeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '520013';

    // Initialize form group


    // Load dropdown options (can be updated with actual service calls)
    this.loadDropdownOptions();
  }

  loadDropdownOptions(): void {
    // Replace this with actual API calls if necessary
    this.userCodeService.getUserCode().subscribe((data) => {
      this.lastStoragePersonOptions = data;
    });
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
    this.router.navigate(['CPM2000/CPM23020CRU']);
  }

  onCreate(): void {
    if (this.canAdd()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM23020CRU'], extras);
    }
  }

  onEdit(data: any): void {
    if (this.canEdit()) {
      const extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['CPM2000/CPM23020CRU'], extras);
    }
  }

  onDetail(data: any): void {
    const extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['CPM2000/CPM23020CRU'], extras);
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
