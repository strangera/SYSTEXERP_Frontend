import { DatePipe, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { Column, ColumnGroup } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { creditCardColumns, creditCardGroup, defaultColumns, TLS2A010Query } from './tls2a010.model';


const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls2a010',
  styleUrls: ['./tls2a010.component.scss'],
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
    TableEditComponent,
    DialogComponent
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

  // 彈跳視窗相關屬性
  dialogVisible = false;
  dialogData: any[] = [];
  dialogColumns: EditColumn[] = [];
  isFormReadable = false; // 控制表單是否只讀

  addButtons = [
    {
      label: '缺單審核',
      icon: 'pi pi-exclamation-triangle',
      action: (rowData: any) => this.onDetail(rowData),
      disabled: (rowData: any) =>
        rowData.PAY_Type === 'C' ||
        rowData.PAY_Type === 'A' ||
        rowData.PAY_Type === '1'
    },
    {
      label: '編輯',
      icon: 'pi pi pi-pencil',
      action: (rowData: any) => this.onEditDetail(rowData),
      disabled: (rowData: any) =>
        rowData.PAY_Type === 'C' ||
        rowData.PAY_Type === 'A' ||
        rowData.PAY_NO === '10' ||
        rowData.PAY_NO === '41' ||
        rowData.PAY_NO === '43'
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

    // 初始化彈跳視窗欄位
    this.initDialogColumns();

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

    // 檢查是否包含已審核的資料
    const hasReviewedItems = selectedItems.some(item => item.check_status === 'Y');
    if (hasReviewedItems) {
      this.messageService.warnBubble('您選取包含已審核的資料，無法進行審核完成。');
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
  onUnreview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要取消審核的項目');
      return;
    }

    // 檢查是否包含未審核的資料
    const hasUnreviewedItems = selectedItems.some(item => item.check_status === 'N');
    if (hasUnreviewedItems) {
      this.messageService.warnBubble('您選取包含未審核的資料，無法進行反審核。');
      return;
    }

    // 依照 API 格式，包成 selectList (假設反審核使用類似的 API)
    const payload = {
      PAY_Type: this.PAY_Type,
      selectList: selectedItems.map(item => ({
        ID: item.ID,
        PAY_NO: item.PAY_NO,
      }))
    };
    this.loading = true;
    // 這裡需要呼叫反審核的 API，目前假設使用相同的服務但不同的方法
    this.tls2a010Service.updateTLS2A010(payload).subscribe({
      next: () => {
        this.messageService.successBubble('反審核完成');
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

  initDialogColumns(): void {
    this.dialogColumns = [
      { field: 'ECR_No', header: '收銀機代號' },
      { field: 'TLT_NO', header: '專櫃編號' },
      { field: 'tlt_name', header: '櫃位名稱' },
      { field: 'BOOK_PayAmt', header: '系統帳', format: formatAmount },
      { field: 'ACT_PayAmt', header: '實收帳', format: formatAmount },
      {
        field: 'ADJUSTED_PayAmt',
        header: '調整後實收帳',
        format: formatAmount,
        type: 'inputNumber'
      },
      { field: 'OVER_PayAmt', header: '系統/實收帳差異', format: formatAmount },

    ];
  }


  onEditDetail(rowData: any): void {
    if (!rowData) {
      this.messageService.warnBubble('請選擇要編輯的資料');
      return;
    }
    const dialogRowData = {
      ...rowData,
      ADJUSTED_PayAmt: rowData.ACT_PayAmt || 0
    };
    this.dialogData = [dialogRowData];
    this.dialogVisible = true;
  }

  onDialogClose(visible: boolean): void {
    this.dialogVisible = visible;
    if (!visible) {
      this.dialogData = [];
    }
  }

  onRowEditSave(event: any): void {
    const editedData = event.data;
    console.log('編輯後的資料:', editedData);
    this.messageService.successBubble('資料已更新');
  }

  onSaveDialog(): void {
    this.messageService.successBubble('資料已保存');
    this.onDialogClose(false);
  }

  onDataChange(data: any[]): void {
    this.dialogData = data;
    console.log('表格資料已更新:', data);
  }
}
