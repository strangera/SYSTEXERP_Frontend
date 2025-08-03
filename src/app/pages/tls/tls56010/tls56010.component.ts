import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
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

interface IPLULOGOItem {
  No: string;
  Name: string;
  LOGO_EN_NAME: string;
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
          Name: item.Name,
          No: item.No
        }));
      },
      error: () => this.messageService.errorBubble('載入大分類選單失敗')
    });

    // 2. 中分類（依據大分類）
    this.queryForm.get('bigCategoryCode')?.valueChanges.subscribe((bigCode) => {
      if (bigCode) {
        const params: IPOS20031Request = { CAT_LNo: [bigCode] };
        this.dropDownListService.queryPOS20031_DropDownList(params).subscribe({
          next: (res) => {
            this.midCategoryOptions = (res.Data ?? []).map(item => ({
              label: item.Name,
              value: item.No,
              Name: item.Name,
              No: item.No
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

    // 3. 小分類（依據大＋中分類）
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
              Name: item.Name,
              No: item.No
            }));
            this.queryForm.patchValue({ smallCategoryCode: null });
          },
          error: () => this.messageService.errorBubble('載入小分類選單失敗')
        });
      } else {
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ smallCategoryCode: null });
      }
    });

    // 4. 品牌編號（初始化 options）
    this.dropDownListService.queryPLULOGO_DropDownList().subscribe({
      next: (res) => {
        const data = res.Data as unknown as IPLULOGOItem[];
        this.brandCodeOptions = (data ?? []).map(item => ({
          label: `${item.LOGO_EN_NAME}（${item.Name}）`,
          value: item.No,
          No: item.No,
          Name: item.Name,
          LOGO_EN_NAME: item.LOGO_EN_NAME
        }));
      },
      error: () => this.messageService.errorBubble('載入品牌選單失敗')
    });

    // 5. 管理編號（依據 TLT_NO）
    this.queryForm.get('tltCode')?.valueChanges.subscribe((tltCode) => {
      if (tltCode) {
        const requestBody = `{"TLT_NO":"${tltCode}"}`;
        this.dropDownListService.queryPOS2004_DropDownList(requestBody).subscribe({
          next: (res) => {
            this.managementIdOptions = (res.Data ?? []).map(item => ({
              label: item.PLU_Name,
              value: item.PLU_No,
              No: item.PLU_No,
              Name: item.PLU_Name
            }));
            this.queryForm.patchValue({ generalCode: null });
          },
          error: () => this.messageService.errorBubble('載入管理編號選單失敗')
        });
      } else {
        this.managementIdOptions = [];
        this.queryForm.patchValue({ generalCode: null });
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
