import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
// Services
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
@Component({
  selector: 'app-tls56010',
  templateUrl: './tls56010.component.html',
  styleUrls: ['./tls56010.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CheckboxModule, TableComponent, TranslateModule]
})
export class TLS56010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    generalCode: [],
    brandCode: [],
    isSafetyStock: [false],
    ...createPaginationConfig([{ field: 'pendingApprovalRegisterCode', order: 1 }])
  });

  // Dropdown options
  bigCategoryOptions: any[] = [];
  midCategoryOptions: any[] = [];
  smallCategoryOptions: any[] = [];
  managementIdOptions: any[] = [];
  brandCodeOptions: any[] = [];
  totalRecords = 0;

  // Table data
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: Column[] = [
    { field: 'productName', header: '品號名稱', visible: true },
    { field: 'currentInventory', header: '現有庫存量', visible: true },
    { field: 'safetyStock', header: '安全庫存量', visible: true },
    { field: 'unit', header: '單位', visible: true },
    { field: 'itemPrice', header: '售價', visible: true },
    { field: 'brand', header: '品牌', visible: true },
  ];


  constructor(

    private notificationService: NotificationService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private managementIdService: ManagementIDService,
    private brandCodeService: BrandCodeService,

  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage('TLS56010', '/TLS/TLS56010cru', this.queryForm, (form) => this.onSubmit(form));

  } onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = false;
      this.messageService.unblockUi();
    });



  }
}
