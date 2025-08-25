import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, ColumnGroup, createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Button } from 'primeng/button';
import { NgStyle, NgIf, DatePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { creditCardColumns, creditCardGroup, defaultColumns } from './tls2a010.model';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ValidationService } from '@shared/service/validation.service';


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
    TableComponent,
    Button,
    NgStyle,
    NgIf,
    TooltipModule,
    DropdownRangeComponent,
    DatePipe
  ],
})
export class TLS2A010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, Validators.required],
    Floor_No: [''],
    ECR_No_Start: ['', Validators.required],
    ECR_No_End: ['', Validators.required],
    PAY_NO: ['', Validators.required],
    Building_No: [''],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? ''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
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

  IsPrint = true;
  selectedColumns: Column[] = [];     // 顯示哪些資料欄位
  columnGroup: ColumnGroup[] = [];    // 顯示上層群組欄位（分組標題）
  defaultColumns = defaultColumns;
  creditCardGroup = creditCardGroup;
  creditCardColumns = creditCardColumns;


  constructor(
    private dropDownListService: DropDownListService,
    private tls2a010Service: Tls2a010Service,

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
            value: Number(item.No),   // 確保是數字
            No: String(item.No),      // Convert to string to match IDropdownItem type
            Name: item.Name
          }));

          if (this.systemTypeOptions.length > 0) {
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

    this.dropDownListService.queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.paymentToolOptions = res.Data.map(x => {
          this.payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
          return {
            label: `${x.No ?? ''}-${x.Name ?? ''}`,
            value: x.No,   // 這裡保持字串，因為下拉選單通常用字串當 value
            Name: x.Name,
            No: x.No,
            PAY_Type: x.PAY_Type ?? ''
          };
        }).filter(opt => ['0', '1', '6', 'B', 'M'].includes(opt.PAY_Type));  // <<== 過濾這些值

        const payNo = this.queryForm.value.PAY_NO;
        if (payNo) {
          this.onPayNoChange(payNo);
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

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;

    const raw = form.value;

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
    }

    this.tls2a010Service.queryTLS2A010(payload).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        interface TLS2A010Item {
          System_Amt?: number;
          Real_Amt?: number;
          TXN_Date?: string;
          Check_Status?: string;
          [key: string]: any; // Add additional properties as needed
        }

        this.data = (response?.Data ?? []).map((item: TLS2A010Item) => {
          const systemAmt = Number(item.System_Amt ?? 0);
          const realAmt = Number(item.Real_Amt ?? 0);
          const diff = systemAmt - realAmt;

          let status = '';
          if (diff < 0) {
            status = '欠';   // 欠收
          } else if (diff === 0) {
            status = '平';   // 平帳
          } else {
            status = '溢';   // 多收
          }

          return {
            ...item,
            OVER_PayAmt: diff,   // 差異數
            OVER_Status: status  // 欠 / 平 / 溢
          };
        });
        // this.data = (response?.Data ?? [])
        // .map((item: TLS2A010Item) => {
        //   // 先取原始日期字串
        //   const rawDate = item.TXN_Date;
        //   let formattedDate = item.TXN_Date;

        //   if (rawDate) {
        //     const dateObj = new Date(rawDate);
        //     if (!isNaN(dateObj.getTime())) {
        //       const yyyy = dateObj.getFullYear();
        //       const dd = String(dateObj.getDate() + 1).padStart(2, '0');
        //       const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // 月份從0開始
        //       formattedDate = `${yyyy}-${mm}-${dd}`;
        //     }
        //   }

        //   return {
        //     ...item,
        //     TXN_Date: formattedDate,
        //   };
        // });


        const first = this.data[0];
        this.PAY_NO = this.queryForm.value.PAY_NO || '';
        this.TXN_Date = first?.TXN_Date || '';

        this.totalRecords = response.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        this.loading = false;
      },
      error: (err) => {
        console.error('TLS2A010 查詢失敗', err);
        this.loading = false;
      }
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

    console.log('送出審核資料:', payload);

    this.loading = true;

    this.tls2a010Service.updateTLS2A010(payload).subscribe({
      next: () => {
        this.messageService.successBubble('審核完成');
        this.onSubmit(this.queryForm);
        this.loading = false;
      },
      error: (err) => {
        console.error('更新審核狀態失敗:', err);
        this.messageService.errorBubble('更新失敗，請稍後再試');
        this.loading = false;
      }
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
  override onDetail(row: any): void {
    console.log('缺單審核被點擊:', row);

    this.tls2a010Service.queryDetailTLS2A010(row).subscribe({
      next: (res) => {
        const detailData = res?.Data ?? [];
        const rowdataWithDetail = {
          ...row,
          details: detailData
        };

        // 呼叫共通的 navigateWithState (不會覆蓋底層)
        this.navigateWithState(CRUDStatus.Edit, rowdataWithDetail);
      },
      error: (err) => {
        console.error('查詢明細失敗:', err);
      }
    });
  }


}

