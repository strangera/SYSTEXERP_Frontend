import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
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
import { Column, FieldChangeEvent, formatAmount, RowEditSaveEvent, TemplateDisplayFormats } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { FIN52030Data, FIN52030Detail, FIN52030DetailTable } from '../fin52030/fin52030.model';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  styleUrl: './fin52030-cru.component.scss',
  standalone: !0,
  imports: [
    ButtonModule,
    CheckboxModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    PanelModule,
    ReactiveFormsModule,
    TableModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<FIN52030Data> implements OnInit {

  private readonly venUsrTemplate = viewChild<TemplateRef<any>>('venUsrTemplate');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    TempNo: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(8)]),
    TempName: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(40)]),
    VouType: new FormControl<string | void>(void 0, [Validators.required]),
    CRT_USR_No: new FormControl<string | void>(void 0),
    createDate: new FormControl<Date | void>(void 0),
    UPD_USR_No: new FormControl<string | void>(void 0),
    modifyDate: new FormControl<Date | void>(void 0),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tableData = signal<FIN52030Detail[]>([]);

  public readonly filteredData = computed(() => {
    return this.isFormCreateable ? [] : this.tableData();
  });

  public selectedItems: Record<string, any>[] = [];

  public readonly totalRecords = computed(() => this.filteredData().length);

  // Template 相關屬性
  public selectedTemplateType = 'vendor';
  public templateSearchTerm = '';
  public readonly templateOptions = [
    { label: '廠商', value: 'vendor' },
    { label: '員工', value: 'user' }
  ];

  public readonly columns = computed<(Omit<Column, 'field'> & { field: keyof FIN52030DetailTable; })[]>(() => [
    {
      field: 'AccNo',
      header: '科目代號',
      type: 'dropdown',
      options: () => this.service.accNoList(),
      optionLabel: 'AccCName',
      optionValue: 'AccNo',
    },
    { field: 'AccName', header: '科目名稱' },
    {
      field: 'DetailNo',
      header: '廠商/員工代號',
      type: 'template',
      templateRef: this.venUsrTemplate(),
      templateDisplayField: 'DetailName',
      templateDisplayFormat: TemplateDisplayFormats.codeWithName
    },
    { field: 'DetailName', header: '廠商/員工名稱' },
    { field: 'NoteDesc', header: '摘要', type: 'input' },
    {
      field: 'AccAmt',
      header: '借方金額',
      type: 'inputNumber',
      format: d => d.AccDC === 'D' && formatAmount(d.AccAmt) || '',
      isTotal: true,
    },
    {
      field: 'AccAmt',
      header: '貸方金額',
      type: 'inputNumber',
      format: d => d.AccDC === 'C' && formatAmount(d.AccAmt) || '',
      isTotal: true,
    },
    {
      field: 'ORG_ID',
      header: '組織代號',
      type: 'dropdown',
      options: () => this.service.orgNoList(),
      optionLabel: 'Name',
      optionValue: 'No',
    },
    { field: 'SubDetailNo', header: '對象別編號', type: 'input' },
    { field: 'recKey', header: '對帳KEY值', type: 'input' },
  ]);

  constructor(
    public service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
    this.authService.getUserInfo() && (this.user = this.authService.getUserInfo()!);
  }

  ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);

    this.service.getSubpoenaTypes();
    this.service.getUsrList();
    this.service.getAccNoList();
    this.service.getOrgNoList();
    this.service.getVendorList();

    if (this.isFormCreateable) {
      this.df().CRT_USR_No.setValue(this.user.user_Name);
      this.df().createDate.setValue(new Date());
    } else {
      // this.df().UPD_USR_No.setValue(this.user.user_Name);
      // this.df().modifyDate.setValue(new Date());
    }

    if (!this.isFormCreateable) this.service.loadFIN52030Detail(this.rowdata!.id);

    this.logger.debug(`init:`, [this.rowdata]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const payload = {
        ...d,
        TempNo: String(d.TempNo),
        VouType: String(d.VouType),
        TempName: String(d.TempName),
        Details: this.filteredData(),
      };
      this.logger.debug(`FIN52030CRU request:`, [payload, this.filteredData()]);

      if (this.isFormCreateable) {
        this.service.insertFIN52030Data(payload).pipe(
          finalize(() => {
            this.loading = !1;
            this.logger.debug(`onSubmit:`, [this.dataForm.getRawValue(), this.filteredData()]);
          }),
        ).subscribe();
      } else {
        this.service.updateFIN52030Data({ ...payload, CRT_USR_No: this.user.user_Name, UPD_USR_No: '' }).pipe(
          finalize(() => {
            this.loading = !1;
            this.logger.debug(`onSubmit:`, [this.dataForm.getRawValue(), this.filteredData()]);
          }),
        ).subscribe();
      }
    });
  }

  public onFieldChange(event: FieldChangeEvent<FIN52030DetailTable>): void {
    this.logger.debug(`onFieldChange:`, [event]);
    if (event.field === 'AccNo') event.rowData.AccDC = this.service.accNoMap().get(String(event.value) ?? '')?.AccCName ?? '';
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

  // Template 相關方法
  public onTemplateTypeChange(event: any): void {
    this.selectedTemplateType = event.value;
    this.templateSearchTerm = ''; // 重置搜尋
  }

  public onTemplateSearch(event: any): void {
    this.templateSearchTerm = event.target.value;
  }

  public getFilteredTemplateData(): any[] {
    let data: any[] = [];

    if (this.selectedTemplateType === 'vendor') {
      data = this.service.vendorList();
    } else {
      data = this.service.usrList();
    }

    if (this.templateSearchTerm) {
      const searchTerm = this.templateSearchTerm.toLowerCase();
      data = data.filter(item => {
        const code = this.getItemCode(item).toLowerCase();
        const name = this.getItemName(item).toLowerCase();
        return code.includes(searchTerm) || name.includes(searchTerm);
      });
    }

    return data;
  }

  public getItemCode(item: any): string {
    if (this.selectedTemplateType === 'vendor') {
      return item.VEN_No || '';
    } else {
      return item.value || '';
    }
  }

  public getItemName(item: any): string {
    if (this.selectedTemplateType === 'vendor') {
      return item.VEN_Name || '';
    } else {
      return item.label || '';
    }
  }

  public selectTemplateItem(item: any, rowData: any, col: any, overlayPanel: any): void {
    const code = this.getItemCode(item);
    const name = this.getItemName(item);

    rowData[col.field] = code;
    rowData['DetailName'] = name;

    this.onFieldChange({
      field: col.field,
      value: code,
      rowData: rowData
    });

    overlayPanel.hide();
    this.logger.debug('selectTemplateItem:', [item, rowData, `${col.field}: ${code}`]);
  }

  public clearSelection(rowData: any, col: any, overlayPanel: any): void {
    rowData[col.field] = '';
    rowData['DetailName'] = '';

    this.onFieldChange({
      field: col.field,
      value: '',
      rowData: rowData
    });

    overlayPanel.hide();
    this.logger.debug('clearSelection:', [rowData]);
  }
}
