import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
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
import { FieldsConfig, DropdownTableComponent } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { debounceTime } from 'rxjs/operators';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ExportLabelService } from '@service/utility/exportLabel.service';
import { TLS56010Service } from '@service/api/tls/tls56010.service';

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
    TranslateModule,
    DropdownTableComponent,
    InputTextComponent
  ]
})
export class TLS56010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    CAT_LNo: [],
    CAT_MNo: [],
    CAT_SNo: [],
    generalCode: [],
    LOGO_No: [],
    tltCode: [],
    PLU_MagNo: [null as string | null],
    PLU_Name: [],
    isSafetyStock: [false],
    ...createPaginationConfig([{ field: 'APPLY_Date', order: -1 }, { field: 'PO_No', order: 1 }]), // 分頁和排序參數

  });
  // 管理編號
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]), // 分頁和排序參數
  });
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '管理編號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;

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
    private dropDownListService: DropDownListService,
    private exportLabelService: ExportLabelService,
    private tls52010Service: Tls52010Service,
    private tls56010Service: TLS56010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56010', '/TLS/TLS56010cru', this.queryForm, (form) => this.onSubmit(form));

    this.dropDownListService.queryPOS2003_DropDownList().subscribe({
      next: (res: { Data: any[]; TotalCount: number }) => {
        this.bigCategoryOptions = (res.Data ?? []).map(item => ({
          label: item.Name,
          value: item.No,
          Name: item.Name,
          No: item.No
        }));
      },
      error: () => this.messageService.errorBubble('載入大分類選單失敗')
    });

    this.queryForm.get('CAT_LNo')?.valueChanges.pipe(debounceTime(300)).subscribe((bigCode) => {
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
            this.queryForm.patchValue({ CAT_MNo: null, CAT_SNo: null }, { emitEvent: false });
            this.smallCategoryOptions = [];
          },
          error: () => this.messageService.errorBubble('載入中分類選單失敗')
        });
      } else {
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ CAT_MNo: null, CAT_SNo: null }, { emitEvent: false });
      }
    });

    this.queryForm.get('CAT_MNo')?.valueChanges.pipe(debounceTime(300)).subscribe((midCode) => {
      const bigCode = this.queryForm.get('CAT_LNo')?.value;
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
            this.queryForm.patchValue({ CAT_SNo: null }, { emitEvent: false });
          },
          error: () => this.messageService.errorBubble('載入小分類選單失敗')
        });
      } else {
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ CAT_SNo: null }, { emitEvent: false });
      }
    });

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

    this.queryForm.get('tltCode')?.valueChanges.pipe(debounceTime(300)).subscribe((tltCode) => {
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
            this.queryForm.patchValue({ generalCode: null }, { emitEvent: false });
          },
          error: () => this.messageService.errorBubble('載入管理編號選單失敗')
        });
      } else {
        this.managementIdOptions = [];
        this.queryForm.patchValue({ generalCode: null }, { emitEvent: false });
      }
    });
  }

  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.PLU_MagNo || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data];
    });
  }
  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }

onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    this.loading = true;

    const v = form.value;
    const params = {
      SYS_StoreNo: v.SYS_StoreNo || '',
      HOS_NoList: v.CAT_LNo ? [v.CAT_LNo] : [],  // 依你實際欄位調整
      LOGO_NoList: v.LOGO_No ? [v.LOGO_No] : [],
      PLU_MagNo: v.queryNo || '',
      PLU_No: v.generalCode || '',
      PLU_Name: v.PLU_Name || '',

    };

    this.tls56010Service.queryTLS56010(params).subscribe({
      next: (res: { Data: any[]; TotalCount: number }) => {
        this.data = res?.Data ?? [];
        this.filteredData = [...this.data];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        // 記住查詢條件（如果有 queryState）
        this.queryStateService.setQueryState(this.ProgNo, params);

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: unknown) => {
        console.error('TLS56010 查詢失敗:', err);
        this.messageService.errorBubble('查詢失敗，請稍後再試');
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  });
}


}
