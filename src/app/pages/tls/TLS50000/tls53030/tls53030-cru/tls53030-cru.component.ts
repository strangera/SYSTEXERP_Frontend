import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS53030Data, TLS53030DetailData, TLS53030Service } from '@service/api/tls/tls53030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@others/component/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { finalize } from 'rxjs';
type FilterMode = 'ALL' | 'DIFF';

@Component({
  selector: 'app-tls53030-cru',
  templateUrl: './tls53030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarComponent,
    TranslateModule,
    DropdownComponent,
    TableEditComponent,
    NgIf,
    ButtonModule,
    SelectButtonModule
  ]
})
export class TLS53030CRUComponent extends BasicCruPageComponent<TLS53030Data> implements OnInit {
  filterMode: FilterMode = 'ALL'; // 預設顯示全部
  filterOptions = [
    { label: `顯示全部`, value: 'ALL', icon: 'pi pi-list' },
    { label: `只顯示差異`, value: 'DIFF', icon: 'pi pi-exclamation-triangle' }
  ];
  dataForm = this.formBuilder.nonNullable.group({
    PST_No: [{ value: '', disabled: true }],        // 盤點單編號
    HOS_No: [{ value: '', disabled: true }],        // 倉庫代碼
    HOS_NAME: [{ value: '', disabled: true }],      // 倉庫名稱
    LOGO_No: [{ value: '', disabled: true }],       // 品牌代碼
    LOGO_CH_NAME: [{ value: '', disabled: true }],  // 品牌名稱
    PST_Date: [{ value: '', disabled: true }],      // 盤點基準日期
    PST_Type: [{ value: '', disabled: true }],      // 盤點類別
    PST_Status: [{ value: '', disabled: true }],    // 盤點狀態
  });

  hosOptions: any[] = [];   // 倉別選項
  logoOptions: any[] = [];  // 品牌選項

  // 盤點類別選項
  pstTypeOptions: any[] = [
    { value: '1', label: '初盤' },
    { value: '2', label: '複盤' },
    { value: '3', label: '抽盤' }
  ];

  // 盤點單狀態選項
  pstStatusOptions: any[] = [
    { value: '0', label: '盤點資料維護作業-待盤點' },
    { value: '1', label: '初盤-盤點中' },
    { value: '2', label: '複盤-盤點完成' },
    { value: '3', label: '抽盤-小盤結案' },
    { value: '4', label: '已結案' },
    { value: '9', label: '作廢' }
  ];
  detailData: any[] = [];
  originalDetailData: TLS53030DetailData[] = [];
  selectedItems: TLS53030DetailData[] = [];
  detailLoading = false;

  detailColumns: EditColumn[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'UNIT_NAME', header: '單位' },
    { field: 'SYS_STOCK_QTY', header: '庫存量', format: formatAmount },
    {
      field: 'PST_Qty1',
      header: '初盤',
      format: formatAmount,
      type: 'inputNumber',
      placeholder: '請輸入數量',
      calculate: (row) => {
        // 如果不是編輯模式，或該資料尚未被異動 (還是 original)，就不計算，維持後端給的值
        if (this.crudstatus !== CRUDStatus.Edit || row._dataStatus === 'original') {
          return {};
        }
        // --- 只有當使用者開始修改 (status 變為 modified) 才會走到下面 ---
        let diff = 0;
        const status = this.rowdata?.PST_Status;

        if (status === '1') {
          diff = (row.PST_Qty1 || 0) - (row.SYS_STOCK_QTY || 0);
        } else if (['2', '3'].includes(status || '')) {
          const qty = (row.PST_Qty2 !== null && row.PST_Qty2 !== undefined) ? row.PST_Qty2 : row.PST_Qty1;
          diff = (qty || 0) - (row.SYS_STOCK_QTY || 0);
        }

        return { 'DIFF_Qty': diff };
      }
    },
    {
      field: 'PST_Qty2',
      header: '複盤',
      format: formatAmount,
      type: 'inputNumber',
      disabled: () => !['2', '3'].includes(this.rowdata?.PST_Status || ''),
      placeholder: '請輸入數量',
      calculate: (row) => {
        if (this.crudstatus !== CRUDStatus.Edit) return {};

        // 如果 DIFF_Qty 已經有值（初始載入時），則不重新計算
        if (row.DIFF_Qty !== undefined && row.DIFF_Qty !== null && row._dataStatus === 'original') {
          return {};
        }

        // 狀態2(複盤)或3(抽盤)：若複盤有值，則用複盤計算差異量
        if (['2', '3'].includes(this.rowdata?.PST_Status || '')) {
          if (row.PST_Qty2 !== null && row.PST_Qty2 !== undefined) {
            return {
              'DIFF_Qty': row.PST_Qty2 - row.SYS_STOCK_QTY,
            };
          }
        }

        return {};
      }
    },
    {
      field: 'PST_Qty3',
      header: '抽盤',
      format: formatAmount,
      type: 'inputNumber',
      disabled: () => this.rowdata?.PST_Status !== '3',
      placeholder: '請輸入數量',
      calculate: (row) => {
        if (this.crudstatus !== CRUDStatus.Edit) return {};

        // 如果 DIFF_Qty 已經有值（初始載入時），則不重新計算
        if (row.DIFF_Qty !== undefined && row.DIFF_Qty !== null && row._dataStatus === 'original') {
          return {};
        }

        // 狀態3(抽盤)：若複盤無值，則用抽盤計算差異量
        if (this.rowdata?.PST_Status === '3') {
          if (row.PST_Qty2 === null || row.PST_Qty2 === undefined) {
            return {
              'DIFF_Qty': row.PST_Qty3 - row.SYS_STOCK_QTY,
            };
          }
        }

        return {};
      }
    },
    { field: 'DIFF_Qty', header: '差異量', format: formatAmount },
    { field: 'PST_Remark', header: '備註', type: 'input', },
  ];
  constructor(
    private tls53030Service: TLS53030Service,
    private dropDownListService: DropDownListService,
    private readonly fileExportService: FileExportService,
    private readonly datePeipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53030', this.dataForm);
    this.loadOptions();
    this.loadDetailData();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        // 更新明細資料
        const updateDetails = this.detailData
          .filter(item => item._dataStatus === 'modified')
          .map(item => ({
            ...item,
            MID: this.rowdata!.MID,
            PST_No: this.rowdata!.PST_No,
            SYS_StoreNo: this.rowdata!.SYS_StoreNo,
            HOS_No: this.rowdata!.HOS_No,
            PLU_MagNo: item.PLU_MagNo,
            PST_Qty1: item.PST_Qty1,
            PST_Qty2: item.PST_Qty2,
            PST_Qty3: item.PST_Qty3,
            PST_Remark: item.PST_Remark
          }));

        this.tls53030Service.updateTLS53030Detail(updateDetails)
          .pipe(
            untilDestroyed(this),
            finalize(() => this.loading = false)
          )
          .subscribe(
            () => {
              this.messageService.successBubble('更新成功');
              this.dataForm.reset();
              this.onCancel();
            }
          );
      }
    })
  }

  loadDetailData() {
    this.detailLoading = true;
    const payload = {
      MID: this.rowdata!.MID,
      PST_No: this.rowdata!.PST_No,
      SYS_StoreNo: this.rowdata!.SYS_StoreNo,
      HOS_No: this.rowdata!.HOS_No
    };
    this.tls53030Service.queryTLS53030Detail(payload)
      .pipe(untilDestroyed(this), finalize(() => this.detailLoading = false))
      .subscribe(response => {
        const data = response.Data;
        this.originalDetailData = JSON.parse(JSON.stringify(data));
        this.detailData = data;
      });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  resetTable() {
    // 使用深拷貝重置明細資料
    this.detailData = JSON.parse(JSON.stringify(this.originalDetailData));
  }
  get filteredDetailData() {
    if (this.filterMode === 'DIFF') {
      // 篩選出差異量不等於 0 的資料
      return this.detailData.filter(item => {
        const diff = parseFloat(item.DIFF_Qty);
        return !isNaN(diff) && diff !== 0;
      });
    }
    return this.detailData;
  }
  // 計算數量的 Getters
  get totalCount(): number {
    return this.detailData?.length || 0;
  }

  get diffCount(): number {
    return this.detailData.filter(item => {
      const diff = parseFloat(item.DIFF_Qty);
      return !isNaN(diff) && diff !== 0;
    }).length;
  }

  // 修改後的切換方法 (配合 SelectButton 的 onChange 事件)
  onFilterChange(event: SelectButtonChangeEvent) {
    const newMode = event.value;
    if (!newMode) {
      return;
    }
    if (newMode === this.filterMode) return;
    this.detailLoading = true;
    setTimeout(() => {
      this.filterMode = newMode;
      this.detailLoading = false;
    }, 300);
  }

  btnLoading = false;
  onPrintDiff() {
    if (!this.rowdata) return;

    this.loading = true; // 使用全域 loading 或自定義一個 printLoading

    const payload = {
      MID: this.rowdata.MID,
      PST_No: this.rowdata.PST_No || '',
      SYS_StoreNo: this.rowdata.SYS_StoreNo || '',
      HOS_No: this.rowdata.HOS_No || '',
      PST_Date: this.datePeipe.transform(this.rowdata.PST_Date, 'yyyy-MM-dd') || '',
      showDiff: true // 強制開啟差異列印
    };
    const export$ = this.tls53030Service.exportTLS53030DetailPDF(payload as any);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}
