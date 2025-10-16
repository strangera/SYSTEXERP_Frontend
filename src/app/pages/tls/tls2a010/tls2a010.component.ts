import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, ColumnGroup } from 'src/app/shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Button } from 'primeng/button';
import { NgStyle, NgIf, DatePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { creditCardColumns, creditCardGroup, defaultColumns, TLS2A010Data, TLS2A010Query } from './tls2a010.model';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ValidationService } from '@shared/service/validation.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { finalize } from 'rxjs';


const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

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
    Button,
    NgStyle,
    NgIf,
    TooltipModule,
    DropdownRangeComponent,
    DatePipe,
    TableReportComponent,
  ],
})
export class TLS2A010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, Validators.required],
    Floor_No: [''],
    ECR_No_Start: [''],
    ECR_No_End: [''],
    PAY_NO: ['', Validators.required],
    Building_No: [''],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? ''],
    pageSize: [100],
    pageIndex: [1],
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });
  historyRequestBody: TLS2A010Query | null = null;

  //  { validators: this.validateRangeStartBeforeEnd });
  ECR_Options: { label: string; value: string }[] = [];
  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
  selectionMode = 'single';
  data: any[] = [];
  footerData: any = [];
  totalRecords = 0;
  PAY_NO = '';
  PAY_Type = '';
  TXN_Date = '';
  todayDisplay = '';
  systemTypeOptions: IDropdownItem[] = [];
  addButtons = [
    {
      label: '缺單審核',
      icon: 'pi pi-exclamation-triangle',
      action: (rowData: any) => this.onDetail(rowData),
      disabled: (rowData: any) => rowData.PAY_NO === '10'  // ⬅ PAY_NO=10 禁用
    }
  ];

  isRowSelectable(row: any) {
    return row.check_status === 'N';
  }
  IsPrint = true;
  selectedColumns: Column[] = [];     // 顯示哪些資料欄位
  columnGroup: ColumnGroup[] = [];    // 顯示上層群組欄位（分組標題）
  defaultColumns = defaultColumns;
  creditCardGroup = creditCardGroup;
  creditCardColumns = creditCardColumns;


  constructor(
    private dropDownListService: DropDownListService,
    public readonly tls2a010Service: Tls2a010Service,
    private readonly validationService: ValidationService

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
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res && res.Data) {
          this.systemTypeOptions = res.Data.map(item => ({
            label: `${item.No ?? ''}-${item.Name ?? ''}`,
            value: String(item.No),
            No: String(item.No),
            Name: item.Name
          }));


          if (this.systemTypeOptions.length > 0 && !this.queryStateService.getQueryStateValue(this.ProgNo)) {
            // 僅保留「全部是數字」的字串
            const values = this.systemTypeOptions
              .map(opt => opt.No)
              .filter(v => /^\d+$/.test(v ?? ''));

            if (values.length > 0) {
              const minVal = values.reduce((a, b) => a < b ? a : b);
              const maxVal = values.reduce((a, b) => a > b ? a : b);

              this.queryForm.patchValue({
                ECR_No_Start: minVal,
                ECR_No_End: maxVal
              });
            }
          }

        }
      });

    this.dropDownListService.querySYS3900_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.floorOptions = res.Data.map(item => ({ ...item, label: item.Name, value: item.No }));
    });

    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'FIN_PAY_Type' })
      .pipe(untilDestroyed(this))
      .subscribe(sysRes => {
        // 從 querySYS1000_DropDownList 取得下拉選單資料
        const sysOptions = sysRes.Data.map(item => ({
          label: `${item.No ?? ''}-${item.Name ?? ''}`,
          value: item.No,
          Name: item.Name,
          No: item.No
        }));

        // 呼叫 queryPOS1006_DropDownList 來取得 PAY_Type 對應
        this.dropDownListService.queryPOS1006_DropDownList()
          .pipe(untilDestroyed(this))
          .subscribe(posRes => {
            // 建立 payNo 到 PAY_Type 的映射
            const payNoToTypeMap = new Map<string, string>();
            posRes.Data.forEach(x => {
              payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
            });

            // 將 PAY_Type 加入 sysOptions
            this.paymentToolOptions = sysOptions.map(opt => ({
              ...opt,
              PAY_Type: payNoToTypeMap.get(opt.No) ?? ''
            }));

            // 處理初始 payNo
            const payNo = this.queryForm.value.PAY_NO;
            if (payNo) {
              this.onPayNoChange(payNo);
            }
          });
      });

    const today = new Date();
    const mm = today.getMonth() + 1;
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

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.value;
      const payload = {
        PageSize: raw.pageSize ?? 0,
        PageIndex: raw.pageIndex ?? 0,
        SortBy: raw.SortBy ?? [],
        TXN_Date: raw.TXN_Date && raw.TXN_Date instanceof Date
          ? `${raw.TXN_Date.getFullYear()}-${String(raw.TXN_Date.getMonth() + 1).padStart(2, '0')}-${String(raw.TXN_Date.getDate()).padStart(2, '0')}`
          : '',
        Floor_No: raw.Floor_No ?? '',
        ECR_No_Start: raw.ECR_No_Start ?? '',
        ECR_No_End: raw.ECR_No_End ?? '',
        PAY_NO: raw.PAY_NO ?? '',
        Building_No: raw.Building_No ?? ''
      };
      this.tls2a010Service.queryTLS2A010(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        // if (response?.Data?.mainData) {
        this.data = response.Data ? response.Data : [];
        this.footerData = response.footerData;
        this.totalRecords = response.TotalCount;
        this.selectedItems = [];
        this.onPayNoChange(payload.PAY_NO);
        console.log('footerData (API totalData):', response.Data.totalData);
        console.log('selectedColumns:', this.selectedColumns);
        this.historyRequestBody = payload;
        const first = this.data[0];
        this.PAY_NO = this.queryForm.value.PAY_NO || '';
        this.TXN_Date = first?.TXN_Date || '';
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);

      });
    });
  }

  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要審核的項目');
      return;
    }

    // 依照 API 格式，包成 selectList
    const payload = {
      PAY_Type: this.PAY_Type,
      selectList: selectedItems.map(item => ({
        ID: item.ID,
        PAY_NO: item.PAY_NO,
      }))
    };
    this.loading = true;
    this.tls2a010Service.updateTLS2A010(payload).subscribe({
      next: () => {
        this.messageService.successBubble('審核完成');
        this.onSubmit(this.queryForm);
        this.loading = false;
      },
    });
  }

  onPayNoChange(payNo: string): void {
    console.log(payNo);
    this.PAY_Type = this.paymentToolOptions.find(opt => opt.No === payNo)?.PAY_Type ?? '';
    this.PAY_NO = payNo;

    if (this.PAY_Type === '0') {
      this.selectedColumns = this.creditCardColumns;
      this.columnGroup = this.creditCardGroup;
    } else {
      this.selectedColumns = this.defaultColumns;
      this.columnGroup = [];
    }
  }
}

