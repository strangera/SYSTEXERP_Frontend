import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, ColumnGroup, createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Button } from 'primeng/button';
import { NgStyle, NgIf } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { creditCardColumns, creditCardGroup, defaultColumns } from './tls2a010.model';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls2a010',
  templateUrl: './tls2a010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TableComponent,
    Button,
    NgStyle,
    NgIf,
    TooltipModule,
    DropdownRangeComponent
  ],
})
export class TLS2A010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date: [null, Validators.required],
    tlt_floor: [''],
    ECR_No_Start: [null, Validators.required],
    ECR_No_End: [null, Validators.required],
    PAY_NO: ['', Validators.required],
    tlt_building: [''],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? ''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  }, { validators: this.validateRangeStartBeforeEnd });

  ECR_Options: { label: string; value: string }[] = [];
  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
  selectionMode = 'single';
  data: any[] = [];
  totalRecords = 0;
  PAY_NO = '';
  TXN_Date = '';
  todayDisplay = '';
  systemTypeOptions: IDropdownItem[] = [];
  addButtons = [
    {
      label: '缺單審核',
      icon: 'pi pi-exclamation-triangle',
      action: (rowData: any) => this.onEdit(rowData),
      disabled: (rowData: any) => rowData.isMissing !== 'Y'
    }
  ];
  IsPrint = true;
  selectedColumns: Column[] = [];     // 顯示哪些資料欄位
  columnGroup: ColumnGroup[] = [];    // 顯示上層群組欄位（分組標題）
  defaultColumns = defaultColumns;
  creditCardGroup = creditCardGroup;
  creditCardColumns = creditCardColumns;


  constructor(
    private dropDownListService: DropDownListService,
    private tls2a010Service: Tls2a010Service

  ) {
    super();
  }
  validateRangeStartBeforeEnd(): Validators {
    return (formGroup: FormGroup) => {
      const start = formGroup.get('ECR_No_Start')?.value;
      const end = formGroup.get('ECR_No_End')?.value;

      if (start && end && start > end) {
        formGroup.get('ECR_No_End')?.setErrors({ rangeInvalid: true });
      } else {
        const errors = formGroup.get('ECR_No_End')?.errors;
        if (errors) {
          delete errors['rangeInvalid'];
          if (Object.keys(errors).length === 0) {
            formGroup.get('ECR_No_End')?.setErrors(null);
          }
        }
      }

      return null;
    };
  }



  ngOnInit(): void {
    this.initializePage('TLS2A010', 'TLS/TLS2A010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    this.selectedColumns = this.defaultColumns;
    this.columnGroup = [];

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });

    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

    this.dropDownListService.queryPOS1006_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.paymentToolOptions = res.Data.map(x => {
        this.payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
        return {
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No,
          PAY_Type: x.PAY_Type ?? ''
        };
      });
    });
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res && res.Data) {
          this.systemTypeOptions = res.Data.map(item => ({
            label: item.Name,
            value: item.No,
            Name: item.Name,
            No: item.No
          }));
        }
      });

    const today = new Date();
    const mm = today.getMonth() + 1; // 月份是從 0 開始的
    const dd = today.getDate();
    this.todayDisplay = `${mm}/${dd}`;


  }

  get PAY_NO_NAME(): string {
    const option = this.paymentToolOptions.find(opt => opt.No === this.PAY_NO);
    return option?.label ?? this.PAY_NO;
  }

  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });
  }
  onAbnormalClick(row: any): void {
    console.log('缺單被點擊:', row);

  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;

    const raw = form.value;

    const payload = {
      PageSize: raw.PageSize ?? 0,
      PageIndex: raw.PageIndex ?? 0,
      OrderBy: raw.OrderBy ?? '',
      Offset: raw.Offset ?? 0,
      SortBy: raw.SortBy ?? [],

      SYS_StoreNo: raw.SYS_StoreNo ?? '',
      TXN_Date: raw.TXN_Date ? new Date(raw.TXN_Date).toISOString().split('T')[0] : '',
      ECR_No_Start: raw.ECR_No_Start ?? '',
      ECR_No_End: raw.ECR_No_End ?? '',
      PAY_NO: raw.PAY_NO ?? '',
      tlt_floor: raw.tlt_floor ?? '',
      tlt_building: raw.tlt_building ?? '',

    };


    this.tls2a010Service.queryTLS2A010(payload).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];

        const first = this.data[0];
        this.PAY_NO = this.queryForm.value.PAY_NO || '';
        this.TXN_Date = first?.TXN_Date || '';
        this.onPayNoChange(this.PAY_NO);

        this.totalRecords = res.TotalCount ?? this.data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('TLS2A010 查詢失敗', err);
        this.loading = false;
      }
    });
  }

  onReview(selectedItems: any[]): void {
    console.log('Reviewing selected items:', selectedItems);
    // Add your logic for reviewing the selected items here
  }
  onPayNoChange(payNo: string): void {
    console.log(payNo);
    const payType = this.paymentToolOptions.find(opt => opt.No === payNo)?.PAY_Type ?? '';
    console.log(payType);

    this.PAY_NO = payNo;

    if (payType === '0') {
      this.selectedColumns = this.creditCardColumns;
      this.columnGroup = this.creditCardGroup;
    } else {
      this.selectedColumns = this.defaultColumns;
      this.columnGroup = [];
    }


  }


}
