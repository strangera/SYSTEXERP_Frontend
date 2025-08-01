import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

export interface IPOS20031Request {
  CAT_LNo: string[];
}

export interface IPOS20032Request {
  CAT_LNo: string[];
  CAT_MNo: string[];
}

@Component({
  selector: 'app-tls56010',
  templateUrl: './tls56010.component.html',
  styleUrls: ['./tls56010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CheckboxModule,
    TableComponent,
    TranslateModule
  ]
})
export class TLS56010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    generalCode: [],
    brandCode: [],
    tltCode: [],
    isSafetyStock: [false],
    ...createPaginationConfig([{ field: 'pendingApprovalRegisterCode', order: 1 }])
  });

  bigCategoryOptions: IDropdownItem[] = [];
  midCategoryOptions: IDropdownItem[] = [];
  smallCategoryOptions: IDropdownItem[] = [];
  managementIdOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  totalRecords = 0;

  data: any[] = [];
  filteredData: any[] = [...this.data];

  columns: Column[] = [
    { field: 'productName', header: '品號名稱', visible: true },
    { field: 'currentInventory', header: '現有庫存量', visible: true },
    { field: 'safetyStock', header: '安全庫存量', visible: true },
    { field: 'unit', header: '單位', visible: true },
    { field: 'itemPrice', header: '售價', visible: true },
    { field: 'brand', header: '品牌', visible: true }
  ];

  constructor(
    private notificationService: NotificationService,
    private managementIdService: ManagementIDService,
    private brandCodeService: BrandCodeService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56010', '/TLS/TLS56010cru', this.queryForm, (form) => this.onSubmit(form));

    // 1. 大分類
    this.dropDownListService.queryPOS2003_DropDownList().subscribe({
      next: (res) => {
        this.bigCategoryOptions = (res.Data ?? []).map(item => ({
          label: item.Name,
          value: item.No,
          No: item.No,
          Name: item.Name
        }));
      },
      error: () => this.messageService.errorBubble('載入大分類選單失敗')
    });

    // 2. 中分類（依據大分類）
    this.queryForm.get('bigCategoryCode')?.valueChanges.subscribe((bigCode) => {
      if (bigCode) {
        this.dropDownListService.queryPOS20031_DropDownList({ CAT_LNo: [bigCode] }).subscribe({
          next: (res) => {
            this.midCategoryOptions = (res.Data ?? []).map(item => ({
              label: item.Name,
              value: item.No,
              No: item.No,
              Name: item.Name
            }));
            this.queryForm.patchValue({ midCategoryCode: null, smallCategoryCode: null });
            this.smallCategoryOptions = [];
          },
          error: () => this.messageService.errorBubble('載入中分類選單失敗')
        });
      } else {
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ midCategoryCode: null, smallCategoryCode: null });
      }
    });

    // 3. 小分類（依據大分類＋中分類）
    this.queryForm.get('midCategoryCode')?.valueChanges.subscribe((midCode) => {
      const bigCode = this.queryForm.get('bigCategoryCode')?.value;
      if (bigCode && midCode) {
        const params: IPOS20032Request = {
          CAT_LNo: [bigCode],
          CAT_MNo: [midCode]
        };

        this.dropDownListService.queryPOS20032_DropDownList(params).subscribe({
          next: (res) => {
            this.smallCategoryOptions = (res.Data ?? []).map(item => ({
              label: item.Name,
              value: item.No,
              No: item.No,
              Name: item.Name
            }));
            this.queryForm.get('smallCategoryCode')?.setValue(null);
          },
          error: () => this.messageService.errorBubble('載入小分類選單失敗')
        });

      } else {
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ smallCategoryCode: null });
      }
    });

  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = false;
      this.messageService.unblockUi();
    });
  }
}
