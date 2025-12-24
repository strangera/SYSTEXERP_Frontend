import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS56010Service } from '@service/api/tls/tls56010.service';
import { DropDownListService, IDropdownItem, IPOS20032Request } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { debounceTime } from 'rxjs/operators';
import { IQueryPOS2004DetailRequest, IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

export interface IPOS20031Request {
  CAT_LNo: string[];
}
interface IPLULOGOItem {
  No: string;
  Name: string;
  LOGO_EN_NAME: string;
}

@Component({
  selector: 'app-tls56010',
  templateUrl: './tls56010.component.html',
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
    InputTextComponent,
    TableModule,
    MultiSelectComponent
  ]
})
export class TLS56010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    PLU_MagNo: [null, [Validators.maxLength(20)]], // 查詢編號 input
    CAT_LNo: [null],
    CAT_MNo: [null],
    CAT_SNo: [null],
    generalCode: [null],
    LOGO_No: [null],
    tltCode: [null],
    PLU_Name: [null],
    isSafetyStock: [false],
    // 預設排序：PLU_MagNo asc
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
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
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  opData: IQueryPOS2004DetailResponse[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  opTotalRecords = 0;
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
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_MagNo + ' - ' + item.PLU_Name + ' - ' + item.PLU_No + ' - ' + item.PLU_OrgPLUNo,
      }))];
    });
  }
  bigCategoryOptions: IDropdownItem[] = [];
  midCategoryOptions: IDropdownItem[] = [];
  smallCategoryOptions: IDropdownItem[] = [];
  managementIdOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];

  totalRecords = 0;
  data: any[] = [];
  filteredData: any[] = [...this.data];

  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'HOS_No', header: '倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '倉別名稱', visible: true },
    { field: 'STK_CurrentQty', header: '現有庫存量', visible: true },
    { field: 'Calc_SafeQty', header: '安全庫存量', visible: true },
    { field: 'PLU_UNITNAME', header: '單位', visible: true },
    { field: 'PLU_SalePrc', header: '售價', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'SaleQty_30Days', header: '30天銷售量', visible: true },
    { field: 'SaleQty_60Days', header: '60天銷售量', visible: true },
    { field: 'SaleQty_90Days', header: '90天銷售量', visible: true },
    { field: 'Unreceived_Qty', header: '已訂未到貨', visible: true },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private tls56010Service: TLS56010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56010', '/TLS/TLS56010cru', this.queryForm, (form) => this.onSubmit(form));

    // 大分類
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

    // 大 → 中
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

    // 中 → 小
    this.queryForm.get('CAT_MNo')?.valueChanges.pipe(debounceTime(300)).subscribe((midCode) => {
      const bigCode = this.queryForm.get('CAT_LNo')?.value;
      if (bigCode && midCode) {
        const params: IPOS20032Request = {
          CATList: [
            {
              CAT_LNo: bigCode,
              CAT_MNo: midCode
            }
          ]
        }
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

    // 品牌
    this.dropDownListService.queryPLULOGO_DropDownList().subscribe({
      next: (res) => {
        const data = res.Data as unknown as IPLULOGOItem[];
        this.brandCodeOptions = (data ?? []).map(item => ({
          label: `${item.No} ${item.LOGO_EN_NAME}（${item.Name}）`,
          value: item.No,
          No: item.No,
          Name: item.Name,
          LOGO_EN_NAME: item.LOGO_EN_NAME
        }));
      },
      error: () => this.messageService.errorBubble('載入品牌選單失敗')
    });

    // TLT → 管理編號
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

  onformValueChanged(event: IQueryPOS2004DetailRequest) {
    this.opLoading = true;
    const body = {
      queryNo: event.queryNo || '',
      PLU_Name: event.PLU_Name || '',
      VEN_No: '',
      LOGO_No: '',
    };
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data];
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = true;
      const v = form.getRawValue() as any;

      const toStr = (val: any) => Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
      const toArr = (val: any) =>
        Array.isArray(val) ? val.filter((x) => x != null && x !== '') :
          (val != null && val !== '' ? [val] : []);
      const nonEmpty = (s?: string | null) => !!(s && s.trim().length);

      // 依你要的顯示順序建立物件，並且對空字串「不送欄位」
      const body: any = {
        PageSize: Number(v.pageSize ?? 10),
        PageIndex: Number(v.pageIndex ?? 1),
        SortBy: (Array.isArray(v.SortBy) && v.SortBy.length)
          ? v.SortBy
          : [{ field: 'PLU_MagNo', order: 1 }],
        // 下面這些只在有值時才加入（避免空字串造成後端拋錯）
        ...(nonEmpty(toStr(v.CAT_LNo)) ? { CAT_LNo: toStr(v.CAT_LNo) } : {}),
        ...(nonEmpty(toStr(v.CAT_MNo)) ? { CAT_MNo: toStr(v.CAT_MNo) } : {}),
        ...(nonEmpty(toStr(v.CAT_SNo)) ? { CAT_SNo: toStr(v.CAT_SNo) } : {}),
        ...(nonEmpty(v.PLU_MagNo) ? { PLU_MagNo: v.PLU_MagNo.trim() } : {}),
        ...(toArr(v.LOGO_No).length ? { LOGO_No: toArr(v.LOGO_No) } : {}),
        isSafetyStock: !!v.isSafetyStock,
        CAT_LNo: v.CAT_LNo,
        CAT_MNo: v.CAT_MNo,
        CAT_SNo: v.CAT_SNo,
        PLU_MagNo: v.PLU_MagNo,
        LOGO_No: v.LOGO_No,
      };

      // // 小防呆：若所有條件都空，避免打到後端直接噴錯
      // if (!body.PLU_MagNo && !body.CAT_LNo && !body.CAT_MNo && !body.CAT_SNo && !body.LOGO_No) {
      //   this.messageService.errorBubble('請至少輸入一個查詢條件（例如：管理編號或分類/品牌）');
      //   this.loading = false;
      //   this.messageService.unblockUi();
      //   return;
      // }

      // console.log('payload =', JSON.stringify(body));  // 會是你要的順序

      this.tls56010Service.queryTLS56010(body).subscribe({
        next: (res: { Data: any[]; TotalCount: number }) => {
          this.data = res?.Data ?? [];
          this.filteredData = [...this.data];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, body);
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('TLS56010 查詢失敗:', err);
          this.messageService.errorBubble('查詢失敗，請稍後再試');
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }


}
