import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, AddButton } from '../../../shared/componentkit/table/table.model';
import { TLS53010Data, TLS53010QueryRequest, TLS53010Service } from '../../../service/api/tls/tls53010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls53010',
  templateUrl: './tls53010.component.html',
  styleUrl: './tls53010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
  ]
})
export class TLS53010Component extends BasicQueryPageComponent<TLS53010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PST_No: [''],                                           // 盤點單編號
    HOS_No: [''],                                           // 倉別代碼/名稱
    LOGO_No: [''],                                          // 品牌代碼/名稱
    PST_Date_B: [''],                                       // 盤點基準日期(起)
    PST_Date_E: [''],                                       // 盤點基準日期(訖)
    PST_Status: [[]],                                       // 盤點單狀態 (多選)
    ...createPaginationConfig([{ field: 'ID', order: -1 }]) // 分頁和排序參數
  });

  data: TLS53010Data[] = [];
  selectedItems: TLS53010Data[] = [];
  totalRecords = 0;

  // 下拉選單
  hosOptions: any[] = [];// 倉別選項
  logoOptions: any[] = [];// 品牌選項
  // 盤點單狀態選項 TODO: 待定義
  pstStatusOptions: any[] = [
    { value: '0', label: '未完成' },
    { value: '1', label: '已完成' },
    { value: '2', label: '已取消' }
  ];

  columns: Column[] = [
    { field: 'ID', header: '序號', visible: false },
    { field: 'PST_No', header: '盤點單編號', visible: true },
    {
      field: 'HOS_No', header: '倉別代碼/名稱', visible: true,
      format: (v, i, r) => `${r.HOS_No}-${r.HOS_Name}`,
    },
    {
      field: 'LOGO_No', header: '品牌代碼/名稱', visible: true,
      format: (v, i, r) => `${r.LOGO_No}-${r.LOGO_Name}`,
    },
    { field: 'PST_Date', header: '盤點基準日期', visible: true },
    { field: 'PST_Status', header: '盤點單狀態', visible: true, },
  ];

  addButton: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print',
      action: (rowData: TLS53010Data) => { this.onPrint(rowData); },
    },
    {
      label: '匯出',
      icon: 'pi pi-file-export',
      action: (rowData: TLS53010Data) => { this.onExport(rowData); },
    },
  ];

  constructor(
    private tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', 'tls/tls53010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const queryRequest: TLS53010QueryRequest = {
      ...frm.value,
    };
    this.handleSubmit(frm, () => {
      this.tls53010Service.queryTLS53010(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  // 列印
  onPrint(rowData: TLS53010Data) {
    // TODO: 實作列印功能
  }

  // 匯出
  onExport(rowData: TLS53010Data) {
    // TODO: 實作匯出功能
  }
}