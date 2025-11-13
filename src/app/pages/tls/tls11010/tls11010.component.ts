/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// UI
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

// until-destroy
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
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
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  // Options
  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: '0', label: '未使用' },
    { value: '1', label: '使用中' },
    { value: '2', label: '保留中' },
    { value: '3', label: '停用' },
  ];

  queryForm = this.formBuilder.group({
    LOCATION_No: ['', Validators.maxLength(10)],
    org_id: [[]],
    building_no: [[]],
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

  // 注意：狀態欄改用 LOCATION_Status_Label，避免資料在排序/再查詢時被型別影響
  columns: any[] = [
    { field: 'LOCATION_No', header: '位置代碼', visible: true },

    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
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

    // 用 Label 欄，避免排序或再次查詢時變成 null
    { field: 'LOCATION_Status_Label', header: '使用狀態', visible: true },

    { field: 'purpose_desc', header: '用途名稱', visible: true },
    { field: 'Draw_X', header: '平面圖X座標', visible: true },
    { field: 'Draw_Y', header: '平面圖Y座標', visible: true },
    { field: 'LOCATION_Name', header: '店位說明', visible: true },
  ];

  constructor(private tls11010Service: Tls11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11010', 'tls/tls11010cru', this.queryForm, (f) => this.onSubmit(f));

    this.tls11010Service
      .getFloorOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.floorOptions = res));

    this.tls11010Service
      .getRegionOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.RegionCodeOptions = res));

    this.tls11010Service
      .getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label, // table 顯示
            formLabel: `${x.value} - ${x.label}`, // 下拉顯示
            value: x.value,
          })) || [];
      });

    this.tls11010Service
      .getUsageOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.usageOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.messageService.blockUi();

      const formValue: any = { ...frm.value };

      // 將空字串欄位轉為 null，以符合後端 char? 要求
      if (formValue.building_no === '') formValue.building_no = null;
      if (formValue.LOCATION_No === '') formValue.LOCATION_No = null;

      // 將 LOCATION_Status 轉成字串陣列（後端若用 in 查詢較穩）
      if (Array.isArray(formValue.LOCATION_Status)) {
        formValue.LOCATION_Status = formValue.LOCATION_Status.map((x: string | number) =>
          String(x),
        );
      }

      // console.log('🔍 查詢條件 request payload:', formValue);

      this.tls11010Service
        .queryData(formValue)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              const rows = res?.Data || [];
              // 先把 null → ''（避免 table 顯示 null）
              const cleaned = this.convertNullToEmptyString(rows);
              // 再建立 LABEL 欄位，避免排序/再查詢導致的型別轉換影響
              this.data = this.decorateRowsForDisplay(cleaned);
              this.totalRecords = res?.TotalCount || this.data.length;
              this.queryStateService.setQueryState(this.ProgNo, formValue);
            }
            this.loading = false;
            this.messageService.unblockUi();
          },
          error: () => {
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
    const confirmDelete = window.confirm('是否確定刪除選取項目？');
    if (!confirmDelete) return;

    const idList = selectedItems.map((item) => item.id);
    this.tls11010Service
      .deleteData(idList)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        },
        error: () => this.messageService.errorBubble('刪除失敗'),
      });
  }

  override onEdit(data: any): void {
    if (!this.canPerformAction('30')) return;

    const trimmedData = {
      ...data,
      AREA_NO: Array.isArray(data?.AREA_NO)
        ? data.AREA_NO.map((x: any) => String(x).trim())
        : String(data?.AREA_NO ?? '').trim(),
    };

    // console.log('🛫 編輯時傳入的 trimmed AREA_NO：', trimmedData.AREA_NO);
    this.navigateWithState(CRUDStatus.Edit, trimmedData);
  }

  /** 將 null → ''（避免 UI 出現 null） */
  convertNullToEmptyString(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertNullToEmptyString(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        newObj[key] = value === null ? '' : this.convertNullToEmptyString(value);
      });
      return newObj;
    }
    return obj;
  }

  /** 產生穩定的顯示欄位（例如 LOCATION_Status_Label），避免排序造成顯示異常 */
  private decorateRowsForDisplay(rows: any[]): any[] {
    return rows.map((r) => {
      const statusCode = String(r?.LOCATION_Status ?? '').trim();
      const statusLabel = this.getLabelFromOptions(statusCode, this.LOCATION_Status_Options);
      return {
        ...r,
        LOCATION_Status_Code: statusCode,
        LOCATION_Status_Label: statusLabel, // 表格直接吃這個
      };
    });
  }

  /** 安全取得 Options 的 label；同時相容 number / string */
  getLabelFromOptions(value: any, options: any[]): string {
    const trimmedValue = String(value ?? '').trim();
    const found = options?.find((opt) => String(opt.value ?? '').trim() === trimmedValue);
    return found ? found.label : trimmedValue;
  }
}
