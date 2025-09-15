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
  public readonly df = signal(this.dataForm.controls);

  private tableData = signal<Record<string, any>[]>([]);

  public readonly filteredData = computed(() => {
    const data = !this.isFormCreateable
      ? this.service.test ? this.tableData() : this.service.FIN52030DetailData()
      : [];

    return data.filter(item => ({
      ...(this.df().typeCode.value ? { typeCode: this.df().typeCode.value } : {}),
      ...(this.df().subpoenaName.value ? { subpoenaName: this.df().subpoenaName.value } : {}),
      ...(this.df().subpoenaType.value ? { subpoenaType: this.df().subpoenaType.value } : {}),
    }));
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [
    { field: 'subjectCode', header: '科目代號', type: 'dropdown', options: this.service.FIN52030xxxxData(), optionLabel: 'xxxxName', optionValue: 'xxxxId' },
    { field: 'vendorEmployeeCode', header: '廠商/員工代號', type: 'input' },
    { field: 'vendorEmployeeName', header: '廠商/員工名稱', type: 'input' },
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
      this.service.getSubpoenaTypes();

      this.tableData.set(dummyData);
    }

    this.logger.debug(`init:`, [this.rowdata, dummyData]);
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
}



const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1) * 10,
  subjectCode: `00${i + 3}`,
  vendorEmployeeCode: `V00${i + 3}`,
  vendorEmployeeName: `Vendor ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  summary: `Generated summary ${i + 3}`,
  debitAmount: Math.floor(Math.random() * 1e6) + 1e4,
  creditAmount: Math.floor(Math.random() * 1e6) + 1e4,
  organizationCode: `ORG00${i + 3}`,
  objectCode: `OBJ00${i + 3}`,
  reconciliationKey: `KEY00${i + 3}`,
}));
