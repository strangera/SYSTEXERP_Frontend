import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, Column, createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls2c040',
  templateUrl: './tls2c040.component.html',
  styleUrl: './tls2c040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule
  ]
})
export class TLS2C040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SrcSheetTypeList: [[]],                                    // 傳票種類(多選)
    VouDate_Start: [''],                                       // 傳票日期(起)
    VouDate_End: [''],                                         // 傳票日期(迄)
    PostFlagList: [[]],                                        // 傳票狀態(多選)
    No: ['', Validators.maxLength(12)],                         // 結帳單號
    ...createPaginationConfig([])
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  addButton: AddButton[] = [
    {
      label: '應收',
      displayText: '應收',
      icon: '',
      action: (rowData: any) => { this.onEdit(rowData) },
    },
    {
      label: '應付',
      displayText: '應付',
      icon: '',
      action: (rowData: any) => { this.onEdit(rowData) },
    },
  ];

  // 下拉選單選項
  // 傳票種類
  srcSheetTypeOptions: IDropdownItem[] = [];
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];

  columns: Column[] = [
    { field: 'VouNo', header: '傳票編號', visible: true },
    { field: 'SrcSheetType', header: '傳票種類', visible: true, format: (value: string) => this.srcSheetTypeOptions.find(item => item.No === value)?.Name || value },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'PostFlag', header: '傳票狀態', visible: true, format: (value: string) => this.postFlagOptions.find(item => item.No === value)?.Name || value },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'No', header: '結帳單號', visible: true }
  ];

  constructor(
    private tls2c040Service: TLS2C040Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', 'tls/tls2c040cru', this.queryForm, (form) => this.onSubmit(form));
    // 載入傳票種類
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'entry_type' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.srcSheetTypeOptions = response.Data;
      });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.tls2c040Service.queryTLS2C040(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data.map((item: any) => this.restructureData(item));
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  restructureData(item: any) {
    return {
      ...item._GLS6001,
      _GLS6002List: item._GLS6002List
    }
  }
}