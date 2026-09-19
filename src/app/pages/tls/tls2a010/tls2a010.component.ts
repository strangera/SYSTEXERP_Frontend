import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, switchMap } from 'rxjs';
import { Tls2a010Service } from 'src/app/service/api/tls/tls2a010.service';
import { DropDownListService, IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { ColumnGroup } from 'src/app/others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { creditCardColumns, creditCardGroup, defaultColumns, overStatusOptions, TLS2A010Query } from './tls2a010.model';
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
    NgIf,
    TooltipModule,
    DropdownRangeComponent,
    DatePipe,
    TableReportComponent,
    TableEditComponent,
    DialogComponent,
    MultiSelectComponent
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
    OVER_Status: [null],
    // invoice: [''],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? ''],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });
  historyRequestBody: TLS2A010Query | null = null;
  ECR_Options: { label: string; value: string }[] = [];
  floorOptions: IDropdownItem[] = [];
  paymentToolOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  overStatusOptions = overStatusOptions;
  invoiceOptions: any[] = [
    { label: '電子發票', value: '35' },
    { label: '折讓單', value: '33' }
  ];
  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
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
      disabled: (rowData: any) => {
        // 1. 已審核 或 已關帳 直接禁用
        if (rowData.check_status === 'Y' || rowData.isClose === 'Y') {
          return true;
        }
        // 2. PAY_NO 在這些值時也禁用(現金、信用卡)
        const disabledPayNos = ['10', '12', '14', '41', '42', '43', '44', '81'];
        return disabledPayNos.includes(rowData.PAY_NO);
      }
    }
  ];

  isRowSelectable(rowData: any) {
    // 已關帳就不能選取
    return rowData.isClose !== 'Y';
  }

  isAllSelected = false; // 是否全選
  IsPrint = true;
  selectedColumns: ReportColumn[] = [];     // 顯示哪些資料欄位
  columnGroup: ColumnGroup[] = [];    // 顯示上層群組欄位（分組標題）
  defaultColumns = defaultColumns;
  creditCardGroup = creditCardGroup;
  creditCardColumns = creditCardColumns;

  constructor(
    private dropDownListService: DropDownListService,
    public readonly tls2a010Service: Tls2a010Service,
    private readonly fileExportService: FileExportService
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
        const sysOptions = sysRes.Data.map(item => ({
          label: `${item.No ?? ''}-${item.Name ?? ''}`,
          value: item.No,
          Name: item.Name,
          No: item.No
        }));
        this.dropDownListService.queryPOS1006_DropDownList()
          .pipe(untilDestroyed(this))
          .subscribe(posRes => {
            const payNoToTypeMap = new Map<string, string>();
            posRes.Data.forEach(x => {
              payNoToTypeMap.set(x.No ?? '', x.PAY_Type ?? '');
            });
            this.paymentToolOptions = sysOptions.map(opt => ({
              ...opt,
              PAY_Type: payNoToTypeMap.get(opt.No) ?? ''
            }));
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
    this.initDialogColumns();

    // 由溢欠彙總表第三層(每日支付別收銀機資料)點選收銀機號鑽取進入，帶入當時的查詢條件並直接查詢
    const drillState = this.router.lastSuccessfulNavigation?.extras.state as
      { TXN_Date?: string; ECR_No?: string; PAY_NO?: string } | undefined;
    if (drillState?.TXN_Date && drillState?.ECR_No && drillState?.PAY_NO) {
      this.queryForm.patchValue({
        TXN_Date: new Date(drillState.TXN_Date),
        ECR_No_Start: drillState.ECR_No,
        ECR_No_End: drillState.ECR_No,
        PAY_NO: drillState.PAY_NO,
      });
      this.onSubmit(this.queryForm);
    }
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
        pageSize: raw.pageSize ?? 0,
        pageIndex: raw.pageIndex ?? 0,
        SortBy: raw.SortBy ?? [],
        TXN_Date: raw.TXN_Date && raw.TXN_Date instanceof Date
          ? `${raw.TXN_Date.getFullYear()}-${String(raw.TXN_Date.getMonth() + 1).padStart(2, '0')}-${String(raw.TXN_Date.getDate()).padStart(2, '0')}`
          : '',
        Floor_No: raw.Floor_No ?? '',
        ECR_No_Start: raw.ECR_No_Start ?? '',
        ECR_No_End: raw.ECR_No_End ?? '',
        PAY_NO: raw.PAY_NO ?? '',
        Building_No: raw.Building_No ?? '',
        OVER_Status: raw.OVER_Status ?? null
      };
      this.tls2a010Service.queryTLS2A010(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data ? response.Data : [];
        this.footerData = response.footerData;
        this.totalRecords = response.TotalCount;
        this.selectedItems = [];
        this.onPayNoChange(payload.PAY_NO);
        this.historyRequestBody = payload;
        const first = this.data[0];
        this.PAY_NO = this.queryForm.value.PAY_NO || '';
        this.TXN_Date = first?.TXN_Date || '';
        this.isAllSelected = false;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }

  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要審核的項目');
      return;
    }

    const raw = this.queryForm.value;
    const formattedDate = raw.TXN_Date && raw.TXN_Date instanceof Date
      ? `${raw.TXN_Date.getFullYear()}-${String(raw.TXN_Date.getMonth() + 1).padStart(2, '0')}-${String(raw.TXN_Date.getDate()).padStart(2, '0')}`
      : '';
    const deletePayload = {
      PAY_Type: this.PAY_Type,
      TXN_Date: formattedDate,
    }
    const payload: any = {
      PAY_Type: this.PAY_Type,
      isCheck: true,
      selectList: [],
      // === 全選時後端會用查詢條件重查所有資料，selectList直接給[] ===
      TXN_Date: formattedDate,
      Floor_No: raw.Floor_No ?? '',
      ECR_No_Start: raw.ECR_No_Start ?? '',
      ECR_No_End: raw.ECR_No_End ?? '',
      PAY_NO: raw.PAY_NO ?? '',
      Building_No: raw.Building_No ?? '',
      OVER_Status: raw.OVER_Status ?? null
    };
    if (!this.isAllSelected || (this.selectedItems.length === this.totalRecords)) {
      // 沒全選或勾到全部資料 給入選擇的資料
      payload.selectList = selectedItems.map(item => ({
        ID: item.ID,
        PAY_NO: item.PAY_NO,
      }))
    }
    this.loading = true;
    this.tls2a010Service.deletePOS30011Detail(deletePayload).pipe(switchMap(() => this.tls2a010Service.updateTLS2A010(payload)), finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.messageService.successBubble('審核完成');
        this.onSubmit(this.queryForm);
      },
    });
  }
  onUnreview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要取消審核的項目');
      return;
    }

    const raw = this.queryForm.value;
    const payload: any = {
      PAY_Type: this.PAY_Type,
      isCheck: false,
      selectList: [],
      // === 全選時後端會用查詢條件重查所有資料，selectList直接給[] ===
      TXN_Date: raw.TXN_Date && raw.TXN_Date instanceof Date
        ? `${raw.TXN_Date.getFullYear()}-${String(raw.TXN_Date.getMonth() + 1).padStart(2, '0')}-${String(raw.TXN_Date.getDate()).padStart(2, '0')}`
        : '',
      Floor_No: raw.Floor_No ?? '',
      ECR_No_Start: raw.ECR_No_Start ?? '',
      ECR_No_End: raw.ECR_No_End ?? '',
      PAY_NO: raw.PAY_NO ?? '',
      Building_No: raw.Building_No ?? '',
      OVER_Status: raw.OVER_Status ?? null
    };
    if (!this.isAllSelected || (this.selectedItems.length === this.totalRecords)) {
      // 沒全選或勾到全部資料 給入選擇的資料
      payload.selectList = selectedItems.map(item => ({
        ID: item.ID,
        PAY_NO: item.PAY_NO,
      }))
    }
    this.loading = true;

    this.tls2a010Service.updateTLS2A010(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.messageService.successBubble('反審核完成');
          this.onSubmit(this.queryForm);
          this.loading = false;
        },
      });
  }

  onPayNoChange(payNo: string): void {
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
      { field: 'MOD_PayAmt', header: '調整後實收帳', format: formatAmount, type: 'inputNumber', min: -999999999 },
      { field: 'OVER_PayAmt', header: '系統/實收帳差異', format: formatAmount },
      { field: 'OVER_Status', header: '狀況' },
    ];
  }
  calculateAdjustedAmounts(rowData: any): void {
    if (rowData && rowData.MOD_PayAmt !== undefined && rowData.BOOK_PayAmt !== undefined) {
      const adjustedDiff = rowData.MOD_PayAmt - rowData.BOOK_PayAmt;
      rowData.OVER_PayAmt = adjustedDiff;
      if (adjustedDiff < 0) {
        rowData.OVER_Status = '欠';
      } else if (adjustedDiff === 0) {
        rowData.OVER_Status = '平';
      } else {
        rowData.OVER_Status = '溢';
      }
    }
  }

  onEditDetail(rowData: any): void {
    if (!rowData) {
      this.messageService.warnBubble('請選擇要編輯的資料');
      return;
    }
    const dialogRowData = {
      ...rowData,
      MOD_PayAmt: rowData.MOD_PayAmt != null ? rowData.MOD_PayAmt : (rowData.BOOK_PayAmt ?? 0) // 調整實收有資料就帶入，沒有就預設系統帳金額
    };
    // 觸發初始計算
    this.calculateAdjustedAmounts(dialogRowData);
    this.dialogData = [dialogRowData];
    this.dialogVisible = true;
  }

  onDialogClose(visible: boolean): void {
    this.dialogVisible = visible;
    if (!visible) {
      this.dialogData = [];
    }
  }

  onRowEditSave(_event: any): void {
    this.messageService.successBubble('資料已更新');
  }

  onSaveDialog(): void {
    if (!this.dialogData || this.dialogData.length === 0) {
      this.messageService.warnBubble('沒有資料可以保存');
      return;
    }
    const rowData = this.dialogData[0];
    const payload = {
      ID: rowData.ID,
      BOOK_PayAmt: rowData.BOOK_PayAmt || 0,
      MOD_PayAmt: rowData.MOD_PayAmt || 0
    };
    this.loading = true;
    this.tls2a010Service.updateModPayAmt(payload).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.messageService.successBubble('資料已保存');
        this.onDialogClose(false);
        this.onSubmit(this.queryForm);
        this.loading = false;
      },
    });
  }

  onDataChange(data: any[]): void {
    data.forEach(row => {
      this.calculateAdjustedAmounts(row);
    });
    this.dialogData = [...data];
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls2a010Service.exportTLS2A010Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.xlsx',
      (isLoading) => this.btnLoading = isLoading // 傳遞 Setter 函數來更新元件狀態
    ).subscribe();
  }
}
