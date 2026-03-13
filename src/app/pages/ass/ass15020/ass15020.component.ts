import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS15020Service } from '@service/api/ass/ass15020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import {
  ASS15020QueryRequest,
  ASS15020QueryRow,
} from '@pages/ass/ass15020/ass15020.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

/** 3.1.5.2 財產保管清冊 */
@UntilDestroy()
@Component({
  selector: 'app-ass15020',
  templateUrl: './ass15020.component.html',
  styleUrl: './ass15020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class ASS15020Component
  extends BasicQueryPageComponent<ASS15020QueryRow>
  implements OnInit
{
  queryForm = this.formBuilder.nonNullable.group({
    keepingDepartment: [null as string | null],
    usageUnit: [null as string | null],
    usageDepartment: [null as string | null],
    usagePerson: [null as string | null],
    propertyCode: [null as string | null],
    itemCode: [null as string | null],
    propertyType: [null as string | null],
    assetStatus: [null as string | null],
    purchaseDateFrom: [null as string | null],
    purchaseDateTo: [null as string | null],
    grouping: [1 as number],
  });

  keepingDepartmentOptions: { value: string; label: string }[] = [];
  usageUnitOptions: { value: string; label: string }[] = [];
  usageDepartmentOptions: { value: string; label: string }[] = [];
  usagePersonOptions: { value: string; label: string }[] = [];
  propertyCodeOptions: { value: string; label: string }[] = [];
  itemCodeOptions: { value: string; label: string }[] = [];
  propertyTypeOptions: { value: string; label: string }[] = [];
  assetStatusOptions: { value: string; label: string }[] = [];
  groupingOptions: { value: number; label: string }[] = [
    { value: 1, label: '有保管部門' },
    { value: 2, label: '保管人員' },
    { value: 3, label: '品項編號' },
    { value: 4, label: '財產類型' },
  ];

  readonly tableData = signal<ASS15020QueryRow[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: ASS15020QueryRequest;

  columns: ReportColumn[] = [
    { field: 'RowNum', header: '序號', visible: true },
    { field: 'AssetCode', header: '資產代號', visible: true },
    { field: 'AssetName', header: '財產名稱', visible: true },
    { field: 'EquipmentNo', header: '設備編號', visible: true },
    {
      field: 'PurchaseDate',
      header: '購入日期',
      visible: true,
      format: (v: string) => formatDate(v),
    },
    { field: 'AssetStatus', header: '資產狀態', visible: true },
    { field: 'KeepingDept', header: '保管單位', visible: true },
    { field: 'KeepingPerson', header: '保管人', visible: true },
    { field: 'UsageUnit', header: '使用單位', visible: true },
    { field: 'UsagePerson', header: '使用人', visible: true },
    { field: 'OriginalAmount', header: '原購入金額', visible: true },
    { field: 'Remark', header: '備注', visible: true },
  ];

  constructor(
    private readonly dropdownApi: DropdownApiService,
    private readonly ass15020Service: ASS15020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS15020',
      'ass/ass15020cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.dropdownApi
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        const list = opts ?? [];
        this.keepingDepartmentOptions = list;
        this.usageDepartmentOptions = list;
      });

    this.dropdownApi
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.usagePersonOptions = opts ?? [];
      });

    this.dropdownApi
      .querySys1000({ SYS_Type: 'ASSET_TYPE' })
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        )
      )
      .subscribe((opts) => {
        this.propertyTypeOptions = opts;
      });

    this.dropdownApi
      .querySys1000({ SYS_Type: 'ASSET_STATUS' })
      .pipe(
        untilDestroyed(this),
        map((items) =>
          (items ?? []).map((item) => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        )
      )
      .subscribe((opts) => {
        this.assetStatusOptions = opts;
      });
    // usageUnit, propertyCode, itemCode: 選項來源未提供，維持空陣列
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const payload: ASS15020QueryRequest = {
        KeepingDept: raw.keepingDepartment || undefined,
        UsageUnit: raw.usageUnit || undefined,
        UsageDept: raw.usageDepartment || undefined,
        UsagePerson: raw.usagePerson || undefined,
        PropertyCode: raw.propertyCode || undefined,
        ItemCode: raw.itemCode || undefined,
        PropertyType: raw.propertyType || undefined,
        AssetStatus: raw.assetStatus || undefined,
        PurchaseDateFrom: raw.purchaseDateFrom || undefined,
        PurchaseDateTo: raw.purchaseDateTo || undefined,
        Grouping: raw.grouping ?? undefined,
        PageSize: 30,
        PageIndex: 1,
      };
      const body = removeEmptyValues(payload) as ASS15020QueryRequest;
      this.lastQueryBody = body;
      this.tableLoading.set(true);
      this.ass15020Service
        .queryASS15020(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res: ApiResponse<ASS15020QueryRow[]>) => {
            if (res.Status !== '0000') return;
            const data = res.Data ?? [];
            this.tableData.set(
              data.map((row, idx) => ({
                ...row,
                RowNum: row.RowNum ?? idx + 1,
                ID: row.ID ?? row.AssetCode ?? `row-${idx}`,
              }))
            );
            this.totalRecords.set(res.TotalCount ?? data.length);
          },
        });
    });
  }

  onClearForm(): void {
    this.queryForm.reset({ grouping: 1 });
  }

  override onDetail(data: ASS15020QueryRow): void {
    this.navigateWithState(CRUDStatus.Read, data);
  }
}
