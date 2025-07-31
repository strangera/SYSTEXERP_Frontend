import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';




@Component({
    selector: 'app-tls11010',
    templateUrl: './tls11010.component.html',
    styleUrls: ['./tls11010.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownComponent,
        MultiSelectComponent,
        InputTextComponent,
        InputNumberRangeComponent,
        TableComponent,
        TranslateModule,
    ],
})
export class TLS11010Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    LOCATION_No: [''],
    org_id: [[]],
    building_no: [''],
    FLOOR_NO: [[] as string[]],
    AREA_NO: [[] as string[]],
    GROSS_SPACE_Start: [null, [Validators.min(0), Validators.max(9999.999)]],
    GROSS_SPACE_End: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_Start: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_End: [null, [Validators.min(0), Validators.max(9999.999)]],
    LOCATION_Status: [[]],
    Purpose_no: [[] as string[]],
    ...createPaginationConfig([{ field: 'LOCATION_No', order: 1 }]),
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'LOCATION_No', header: '位置代碼', visible: true },
    { field: 'LOCATION_Name', header: '店位說明', visible: true },
    { field: 'org_id', header: '組織代碼', visible: true },
    {
      field: 'org_id',
      header: '組織名稱',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.OrganizationCodeOptions),
    },
    {
      field: 'building_no',
      header: '館別',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    {
      field: 'FLOOR_NO',
      header: '樓層',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.floorOptions),
    },
    {
      field: 'AREA_NO',
      header: '區域',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.RegionCodeOptions),
    },
    { field: 'GROSS_SPACE', header: '簽約坪數', visible: true },
    { field: 'NET_SPACE', header: '營業坪數', visible: true },
    {
      field: 'LOCATION_Status',
      header: '使用狀態',
      visible: true,
      format: (value: any) => this.getLabelFromOptions(value, this.LOCATION_Status_Options),
    },
{
  field: 'Purpose_desc',
  header: '用途名稱',
  visible: true,
  
  
}
,
    { field: 'Draw_X', header: 'X 軸', visible: true },
    { field: 'Draw_Y', header: 'Y 軸', visible: true },
  ];


  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: 0, label: '空位' },
    { value: 1, label: '使用中' },
    { value: 2, label: '停用' },
  ];
  BUILDING_NO_Options: any[] = [];

  constructor(private tls11010Service: Tls11010Service,

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', 'TLS/TLS11010cru', this.queryForm);
    this.tls11010Service.getFloorOptions().subscribe((res) => (this.floorOptions = res));
    this.tls11010Service.getRegionOptions().subscribe((res) => (this.RegionCodeOptions = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.tls11010Service.getUsageOptions().subscribe((res) => {
      this.usageOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];

    });
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.messageService.blockUi();

      const formValue = { ...frm.value };

      // 將空字串欄位轉為 null，以符合後端 char? 要求
      if (formValue.building_no === '') {
        formValue.building_no = null;
      }


      // 處理空值
      if (formValue.building_no === '') formValue.building_no = null;
      if (formValue.LOCATION_No === '') formValue.LOCATION_No = null;

      // ✅ 將 LOCATION_Status 轉成字串陣列
      if (Array.isArray(formValue.LOCATION_Status)) {
        formValue.LOCATION_Status = formValue.LOCATION_Status.map((x: string | number) => String(x));
      }

      console.log('🔍 查詢條件 request payload:', formValue);

      // ✅ 使用修正後的 formValue
      this.tls11010Service.queryData(formValue).subscribe({
        next: (res) => {
  if (res.Status === '0000') {
    this.data = this.convertNullToEmptyString(res?.Data || []);
    this.totalRecords = res?.TotalCount || this.data.length;
    console.log('✅ totalRecords =', this.totalRecords);
    this.queryStateService.setQueryState(this.ProgNo, formValue);
  }
  this.loading = false;
  this.messageService.unblockUi();
},
        error: () => {
          this.messageService.errorBubble('查詢錯誤');
          this.loading = false;
          this.messageService.unblockUi();
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();

        },
      });
    });
  }

  onDelete(selectedItems: any[]) {
    if (!selectedItems.length) return;
    const confirm = window.confirm('是否確定刪除選取項目？');
    if (!confirm) return;

    const idList = selectedItems.map((item) => item.id);
    this.tls11010Service.deleteData(idList).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(this.queryForm);
      },
      error: () => this.messageService.errorBubble('刪除失敗'),
    });
  }
getLabelFromOptions(value: any, options: any[]): string {
  const trimmedValue = String(value).trim();
  const found = options?.find(opt => String(opt.value).trim() === trimmedValue);
  return found ? found.label : trimmedValue;
}
  override onEdit(data: any): void {
  if (!this.canPerformAction('30')) return;

  const trimmedData = {
    ...data,
    AREA_NO: Array.isArray(data?.AREA_NO)
      ? data.AREA_NO.map((x: any) => String(x).trim())
      : String(data?.AREA_NO ?? '').trim(),
  };

  console.log('🛫 編輯時傳入的 trimmed AREA_NO：', trimmedData.AREA_NO);

  this.navigateWithState(CRUDStatus.Edit, trimmedData);
}
convertNullToEmptyString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => this.convertNullToEmptyString(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      newObj[key] = value === null ? '' : this.convertNullToEmptyString(value);
    });
    return newObj;
  }
  return obj;
}
 
}
