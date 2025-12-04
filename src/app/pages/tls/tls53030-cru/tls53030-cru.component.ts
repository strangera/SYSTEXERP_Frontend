import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS53030Data, TLS53030DetailData, TLS53030Service } from '@service/api/tls/tls53030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls53030-cru',
  templateUrl: './tls53030-cru.component.html',
  styleUrl: './tls53030-cru.component.scss',
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
    NgIf
  ]
})
export class TLS53030CRUComponent extends BasicCruPageComponent<TLS53030Data> implements OnInit {
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

  //#region 下拉選項
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
  //#endregion

  //#region 明細資料
  detailData: TLS53030DetailData[] = [];
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
      disabled: () => this.rowdata?.PST_Status !== '1',
      placeholder: '請輸入數量',
      calculate: (row) => {
        if (this.crudstatus !== CRUDStatus.Edit) return {};

        // 如果 DIFF_Qty 已經有值（初始載入時），則不重新計算
        if (row.DIFF_Qty !== undefined && row.DIFF_Qty !== null && row._dataStatus === 'original') {
          return {};
        }

        return {
          'DIFF_Qty': row.PST_Qty1 - row.SYS_STOCK_QTY,
        };
      }
    },
    {
      field: 'PST_Qty2',
      header: '複盤',
      format: formatAmount,
      type: 'inputNumber',
      disabled: () => this.rowdata?.PST_Status !== '2',
      placeholder: '請輸入數量',
      calculate: (row) => {
        if (this.crudstatus !== CRUDStatus.Edit) return {};

        // 如果 DIFF_Qty 已經有值（初始載入時），則不重新計算
        if (row.DIFF_Qty !== undefined && row.DIFF_Qty !== null && row._dataStatus === 'original') {
          return {};
        }

        return {
          'DIFF_Qty': row.PST_Qty2 - row.SYS_STOCK_QTY,
        };
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

        return {
          'DIFF_Qty': row.PST_Qty3 - row.SYS_STOCK_QTY,
        };
      }
    },
    { field: 'DIFF_Qty', header: '差異量', format: formatAmount },
  ];
  //#endregion

  constructor(
    private tls53030Service: TLS53030Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
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
        const updateDetails = this.detailData.map(item => ({
          MID: this.rowdata!.MID,
          PST_No: this.rowdata!.PST_No,
          SYS_StoreNo: this.rowdata!.SYS_StoreNo,
          HOS_No: this.rowdata!.HOS_No,
          PLU_MagNo: item.PLU_MagNo,
          PST_Qty1: item.PST_Qty1,
          PST_Qty2: item.PST_Qty2,
          PST_Qty3: item.PST_Qty3
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
        this.detailData = response.Data;
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
}