import { NgIf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, FieldChangeEvent, formatAmount, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  styleUrl: './fin52030-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    CheckboxModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    typeCode: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(8)]),
    subpoenaName: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(40)]),
    subpoenaType: new FormControl<string | void>(void 0, [Validators.required]),
    creator: new FormControl<string | void>(void 0),
    createDate: new FormControl<Date | void>(void 0),
    modifier: new FormControl<string | void>(void 0),
    modifyDate: new FormControl<Date | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  private tableData = signal<Record<string, any>[]>([]);

  public readonly filteredData = computed(() => {
    const data = this.isFormCreateable ? [] : this.service.test ? dummyData : this.tableData();
    return data;
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [
    {
      field: 'subjectCode',
      header: '科目代號',
      type: 'dropdown',
      options: this.service.test ? dummyId : this.service.FIN52030xxxxData(),
      optionLabel: 'Name',
      optionValue: 'No',
    },
    { field: 'subjectName', header: '科目名稱' },
    { field: 'vendorEmployeeCode', header: '廠商/員工代號', type: 'input' },
    {
      field: 'vendorEmployeeName',
      header: '廠商/員工名稱',
      type: 'dropdownTable',
      tableData: vendorEmployeeTable,
      tableColumns: vendorEmployeeColumns,
      tableKey: 'id',
      tableRows: 5,
      tableLoading: !1,
      valueKey: 'name',
      totalRecords: vendorEmployeeTable?.length,
    },
    { field: 'summary', header: '摘要', type: 'input' },
    { field: 'debitAmount', header: '借方金額', type: 'inputNumber', format: formatAmount, isTotal: true },
    { field: 'creditAmount', header: '貸方金額', type: 'inputNumber', format: formatAmount, isTotal: true },
    { field: 'organizationCode', header: '組織代號', type: 'input' },
    { field: 'objectCode', header: '對象別編號', type: 'input' },
    { field: 'reconciliationKey', header: '對帳KEY值', type: 'input' },
  ];

  constructor(
    public service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
    this.authService.getUserInfo() && (this.user = this.authService.getUserInfo()!);
  }

  ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);

    if (this.isFormCreateable) {
      this.df().creator.setValue(this.user.user_Name);
      this.df().createDate.setValue(new Date());
    }
    else {
      if (this.isFormEditable) {
        this.df().modifier.setValue(this.user.user_Name);
        this.df().modifyDate.setValue(new Date());
      }
      this.service.getSubpoenaTypes();
      this.service.test ? this.tableData.set(dummyData) : this.service.loadFIN52030Detail({
        /** payload */
      });
    }

    this.logger.debug(`init:`, [this.rowdata, dummyData, vendorEmployeeTable]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.submitted = !0;
      this.loading = !1;
    });
  }

  public onFieldChange(event: FieldChangeEvent<unknown>): void {
    this.logger.debug(`onFieldChange:`, [event]);
  }

  public onRowEditInit(event: RowEditSaveEvent): void {
    this.logger.debug(`onRowEditInit:`, [event]);
  }

  public onRowEditSave(event: RowEditSaveEvent): void {
    this.logger.debug(`onRowEditSave:`, [event]);
  }

  public onRowEditCancel(event: RowEditSaveEvent): void {
    this.logger.debug(`onRowEditCancel:`, [event]);
  }

  public onDelete(event: any): void {
    this.logger.debug(`onDelete:`, [event]);
  }

  public onInsert(event: any): void {
    this.logger.debug(`onInsert:`, [event]);
  }

  public onItemClick(event: any): void {
    this.logger.debug(`onItemClick:`, [event]);
  }
}

const dummyId = Array.from({ length: 100 }, (_, i) => ({ No: i + 3, Name: `Item ${i + 3}` }));

const vendorEmployeeTable = Array.from({ length: 100 }, (_, i) => ({
  id: `V00${i + 3}`,
  name: `Vendor ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
}));

const vendorEmployeeColumns: Column[] = [
  { field: 'id', header: '廠商/員工代號' },
  { field: 'name', header: '廠商/員工名稱' },
];

const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: dummyId[i % dummyId.length].No,
  subjectCode: `00${i + 3}`,
  subjectName: `Subject ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  vendorEmployeeCode: vendorEmployeeTable[i % vendorEmployeeTable.length].id,
  vendorEmployeeName: vendorEmployeeTable[i % vendorEmployeeTable.length].name,
  summary: `Generated summary ${i + 3}`,
  debitAmount: Math.floor(Math.random() * 1e6) + 1e4,
  creditAmount: Math.floor(Math.random() * 1e6) + 1e4,
  organizationCode: `ORG00${i + 3}`,
  objectCode: `OBJ00${i + 3}`,
  reconciliationKey: `KEY00${i + 3}`,
}));
