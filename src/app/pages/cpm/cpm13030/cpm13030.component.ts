import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM13030Service } from '@service/api/cpm/cpm13030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, ColumnGroup, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-cpm13030',
  templateUrl: './cpm13030.component.html',
  standalone: true,
  imports: [
    DropdownComponent,
    ButtonModule,
    CalendarRangeQuickComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberRangeComponent,
    TranslateModule,
    CustomFooterTableComponent,
    MultiSelectComponent,
    NgIf,
    InputTextComponent
  ]
})
export class CPM13030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({

    TXN_EDATE: [new Date(), [Validators.required]],
    TXN_BDATE: [new Date(), [Validators.required]],
    building_noList: [[]],
    org_idList: [[]],
    tlt_noList: [[]],
    TXN_GUIBegNo: [''],
    TXN_TotSaleAmtStart: [null],
    TXN_TotSaleAmtEnd: [null],
    displayMode: ['M', [Validators.required]],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  footerData: any[] = [];
  subTotalData: any[] = [];
  groupRowsBy = 'building_desc';
  showSubTotal = true;
  btnLoading = false;
  btnLoading2 = false;
  columns: Column[] = [];
  columnGroup: ColumnGroup[] = [];
  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];
  org_id_Options: any[] = [];
  ECR_Group_Options: any[] = [];
  TLT_No_Options: { No: string, Name: string, label: string }[] = [];

  constructor(
    private dropDownListService: DropDownListService,
    private cpm13030Service: CPM13030Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM13030', '/CPM/CPM13030CRU', this.queryForm, (frm) => this.onSubmit(frm));

    // 下拉清單載入
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLT_No_Options = res.Data.map(item => ({
        value: item.No,
        ...item, label: `${item.No} - ${item.Name}`
      }));
    });

    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Options = (res.Data || []).map(item => ({
          ...item,
          label: `${item.No} ${item.Name}`,
          value: item.No
        }));
      });

    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.ECR_Group_Options = res.Data.map(x => ({
          label: x.Name,
          value: x.No,
          Name: x.Name,
          No: x.No
        }));
      });
    this.queryForm.get('displayMode')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(mode => {
        console.log('[displayMode 改變]', mode);

        if (mode === 'M') {
          this.queryForm.patchValue({
            TXN_GUIBegNo: '',
            TXN_TotSaleAmtStart: null,
            TXN_TotSaleAmtEnd: null
          });
        }

        // 觸發畫面更新
        this.queryForm.updateValueAndValidity();
      });
  }
  private getPaginationParams(): { PageIndex: number; PageSize: number } {
    const table = document.querySelector('app-customFooter-table') as any;
    const pageIndex = table?.currentPage ?? 1;
    const pageSize = table?.rows ?? 20;
    return { PageIndex: pageIndex, PageSize: pageSize };
  }

  /** 查詢報表 */
  onSubmit(frm: FormGroup): void {
    // 先同步 PrimeNG Table 的分頁狀態（確保最新）
    const pagination = this.getPaginationParams();
    frm.patchValue(pagination);

    this.handleSubmit(frm, () => {
      const v = frm.getRawValue();
      const payload = {
        TXN_BDATE: this.datePipe.transform(v.TXN_BDATE, 'yyyy-MM-dd'),
        TXN_EDATE: this.datePipe.transform(v.TXN_EDATE, 'yyyy-MM-dd'),
        building_noList: v.building_noList || [],
        org_idList: v.org_idList || [],
        tlt_noList: v.tlt_noList || [],
        TXN_GUIBegNo: v.TXN_GUIBegNo || '',

        TXN_TotSaleAmtStart:
          v.TXN_TotSaleAmtStart !== null && v.TXN_TotSaleAmtStart !== undefined && v.TXN_TotSaleAmtStart !== ''
            ? Number(v.TXN_TotSaleAmtStart)
            : null,

        TXN_TotSaleAmtEnd:
          v.TXN_TotSaleAmtEnd !== null && v.TXN_TotSaleAmtEnd !== undefined && v.TXN_TotSaleAmtEnd !== ''
            ? Number(v.TXN_TotSaleAmtEnd)
            : null,

        ShowType: v.displayMode,
        PageIndex: v.pageIndex ?? 1,
        PageSize: v.pageSize ?? 20,
      };


      this.loading = true;
      this.cpm13030Service
        .queryCPM13030(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Data) {
              if (v.displayMode === 'M') {
                this.data = res.Data.SumDatas || [];
                this.footerData = res.Data.TotalDatas ? [res.Data.TotalDatas] : [];
                this.subTotalData = [];
              } else {
                this.data = res.Data.Datas || [];
                this.subTotalData = res.Data.SumDatas || [];
                this.footerData = res.Data.TotalDatas ? [res.Data.TotalDatas] : [];
              }
              this.totalRecords = res.TotalCount || this.data.length;
              this.updateTableColumns(v.displayMode);
            } else {
              this.data = [];
              this.subTotalData = [];
              this.footerData = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }


  /** 匯出 Excel */
  onExportExcel(): void {
    this.btnLoading = true;
    const v = this.queryForm.value;
    const payload = {
      PageSize: v.pageSize ?? 0,
      PageIndex: v.pageIndex ?? 0,
      TXN_BDATE: this.datePipe.transform(v.TXN_BDATE, 'yyyy-MM-dd'),
      TXN_EDATE: this.datePipe.transform(v.TXN_EDATE, 'yyyy-MM-dd'),
      building_noList: v.building_noList || [],
      org_idList: v.org_idList || [],
      tlt_noList: v.tlt_noList || [],
      TXN_GUIBegNo: v.TXN_GUIBegNo || '',
      TXN_TotSaleAmtStart:
        v.TXN_TotSaleAmtStart !== null && v.TXN_TotSaleAmtStart !== undefined && v.TXN_TotSaleAmtStart !== ''
          ? Number(v.TXN_TotSaleAmtStart)
          : null,

      TXN_TotSaleAmtEnd:
        v.TXN_TotSaleAmtEnd !== null && v.TXN_TotSaleAmtEnd !== undefined && v.TXN_TotSaleAmtEnd !== ''
          ? Number(v.TXN_TotSaleAmtEnd)
          : null,
      ShowType: v.displayMode,
    };


    this.cpm13030Service.exportCPM13030(payload)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe({
        next: (res) => {
          const blob = res.body;
          if (blob) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'CPM13030_非業主POS停車費折抵補登報表.xlsx';
            link.click();
          }
        },
        error: (err) => console.error('匯出 Excel 失敗:', err)
      });
  }

  /** 匯出 PDF */
  onExportPDF(): void {
    this.btnLoading2 = true;
    const v = this.queryForm.value;
    const payload = {
      PageSize: v.pageSize ?? 0,
      PageIndex: v.pageIndex ?? 0,
      TXN_BDATE: this.datePipe.transform(v.TXN_BDATE, 'yyyy-MM-dd'),
      TXN_EDATE: this.datePipe.transform(v.TXN_EDATE, 'yyyy-MM-dd'),
      building_noList: v.building_noList || [],
      org_idList: v.org_idList || [],
      tlt_noList: v.tlt_noList || [],
      TXN_GUIBegNo: v.TXN_GUIBegNo || '',
      TXN_TotSaleAmtStart:
        v.TXN_TotSaleAmtStart !== null && v.TXN_TotSaleAmtStart !== undefined && v.TXN_TotSaleAmtStart !== ''
          ? Number(v.TXN_TotSaleAmtStart)
          : null,

      TXN_TotSaleAmtEnd:
        v.TXN_TotSaleAmtEnd !== null && v.TXN_TotSaleAmtEnd !== undefined && v.TXN_TotSaleAmtEnd !== ''
          ? Number(v.TXN_TotSaleAmtEnd)
          : null,
      ShowType: v.displayMode,
    };

    this.cpm13030Service.exportCPM13030PDF(payload)
      .pipe(finalize(() => this.btnLoading2 = false))
      .subscribe({
        next: (res) => {
          const blob = res.body;
          if (blob) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'CPM13030_非業主POS停車費折抵補登報表.pdf';
            link.click();
          }
        },
      });
  }
  private downloadFile(blob: Blob, filename: string): void {
    if (!blob || blob.size === 0) {
      this.messageService.warnBubble('無可匯出的資料。');
      return;
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  /** 動態設定欄位與群組 */
  updateTableColumns(showType: string): void {
    if (showType === 'D') {
      // ========== 明細 ==========
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true },
        { field: 'building_desc', header: '館別', visible: true },
        { field: 'Org_Name', header: '組織名稱', visible: true },
        { field: 'ECR_No', header: 'POS機號', visible: true },
        { field: 'TLT_No', header: '專櫃編號', visible: true },
        { field: 'ECR_LocNo', header: '位置編號', visible: true },
        { field: 'TLT_NAME', header: '櫃位名稱', visible: true },
        { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
        { field: 'TXN_TotSaleAmt', header: '消費金額', visible: true, format: formatAmount },
        { field: 'POSonline_Amt', header: '金額', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSonline_Time', header: '時數', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSonline_Qty', header: '筆數', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Amt', header: '金額', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Time', header: '時數', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Qty', header: '筆數', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Amt', header: '金額', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Time', header: '時數', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Qty', header: '筆數', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
      ];

      this.columnGroup = [
        { field: 'POS連線', header: 'POS連線' },
        { field: '強制折抵', header: '強制折抵' },
        { field: '小計', header: '小計' },
      ];
    } else {
      // ========== 彙總 ==========
      this.columns = [
        { field: 'TXN_Date', header: '日期', visible: true },
        { field: 'building_desc', header: '館別', visible: true },
        { field: 'Org_Name', header: '組織名稱', visible: true },
        { field: 'ECR_No', header: 'POS機號', visible: true },
        { field: 'TLT_No', header: '專櫃編號', visible: true },
        { field: 'ECR_LocNo', header: '位置編號', visible: true },
        { field: 'TLT_NAME', header: '櫃位名稱', visible: true },
        { field: 'POSonline_Amt', header: '金額', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSonline_Time', header: '時數', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSonline_Qty', header: '筆數', visible: true, groupField: 'POS連線', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Amt', header: '金額', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Time', header: '時數', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'POSoffline_Qty', header: '筆數', visible: true, groupField: '強制折抵', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Amt', header: '金額', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Time', header: '時數', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'subTotal_Qty', header: '筆數', visible: true, groupField: '小計', format: formatAmount, isTotal: true, isSubTotal: true },
      ];

      this.columnGroup = [
        { field: 'POS連線', header: 'POS連線' },
        { field: '強制折抵', header: '強制折抵' },
        { field: '小計', header: '小計' },
      ];
    }
  }

}
