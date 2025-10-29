import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, AddButton } from '../../../shared/componentkit/table/table.model';
import { FIN11010Data, FIN11010QueryRequest, FIN11010Service, FIN11010UpdateStatusRequest } from '../../../service/api/fin/fin11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BaseDeleteRequest } from '../../../shared/models/api/base-api.interface';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  styleUrl: './fin11010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
  ]
})
export class FIN11010Component extends BasicQueryPageComponent<FIN11010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    STO_Uniform: ['', [Validators.maxLength(8)]],           // 營業人統編
    STO_TaxName: ['', [Validators.maxLength(60)]],          // 營業人名稱
    STO_Addr: ['', [Validators.maxLength(100)]],            // 營業地址
    REP_OrgCodeList: [[]],                                  // 總繳代號
    STO_StatusList: [[]],                                   // 狀態 (多選)
    REP_GUIYM_start: [''],                                  // 申報年月(起)
    REP_GUIYM_end: [''],                                    // 申報年月(訖)
    ...createPaginationConfig([{ field: 'REP_BegGUIYM', order: 1 }]) // 分頁和排序參數
  });

  totalRecords = 0;
  data: FIN11010Data[] = [];
  selectedItems: FIN11010Data[] = [];

  // #region 下拉選單選項定義
  // 總繳代號選項
  orgCodeOptions = [
    { No: '0', Name: '單一機構報繳' },
    { No: '1', Name: '總機構彙總報繳' },
    { No: '2', Name: '各單位(分支機構)分別申報' }
  ];

  // 狀態選項
  reviewStatusOptions = [
    { No: '0', Name: '未確認' },
    { No: '1', Name: '使用中' },
    { No: '2', Name: '已過期' }
  ];

  // 縣市別選項
  cityOptions = [
    { No: 'A', Name: '台北市' },
    { No: 'B', Name: '台中市' },
    { No: 'C', Name: '基隆市' },
    { No: 'D', Name: '台南市' },
    { No: 'E', Name: '高雄市' },
    { No: 'F', Name: '新北市' },
    { No: 'G', Name: '宜蘭縣' },
    { No: 'H', Name: '桃園縣' },
    { No: 'I', Name: '嘉義市' },
    { No: 'J', Name: '新竹縣' },
    { No: 'K', Name: '苗栗縣' },
    { No: 'L', Name: '台中縣' },
    { No: 'M', Name: '南投縣' },
    { No: 'N', Name: '彰化縣' },
    { No: 'O', Name: '新竹市' },
    { No: 'P', Name: '雲林縣' },
    { No: 'Q', Name: '嘉義縣' },
    { No: 'R', Name: '台南縣' },
    { No: 'S', Name: '高雄縣' },
    { No: 'T', Name: '屏東縣' },
    { No: 'U', Name: '花蓮縣' },
    { No: 'V', Name: '台東縣' },
    { No: 'W', Name: '金門縣' },
    { No: 'X', Name: '澎湖縣' },
    { No: 'Z', Name: '連江縣' }
  ];
  // #endregion

  columns: Column[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'STO_Uniform', header: '營業人統編', visible: true },
    { field: 'STO_TaxName', header: '營業人名稱', visible: true },
    { field: 'STO_City', header: '縣市別', visible: true, format: (value: string) => this.cityOptions.find(option => option.No === value)?.Name || value },
    { field: 'STO_Addr', header: '營業地址', visible: true },
    { field: 'REP_OrgCode', header: '總繳代號', visible: true, format: (value: string) => this.orgCodeOptions.find(option => option.No === value)?.Name || value },
    { field: 'STO_Direct', header: '直接扣抵法(Y/N)', visible: true, format: (value: string) => value === 'Y' ? '是' : '否' },
    {
      field: 'STO_Status',
      header: '狀態',
      visible: true,
      format(value) {
        switch (value) {
          case "0": return "未確認";
          case "1": return "使用中";
          case "2": return "已過期";
          default: return value;
        }
      }
    },
    { field: 'REP_BegGUIYM', header: '申報年月起', visible: true },
    { field: 'REP_EndGUIYM', header: '申報年月訖', visible: true },

    { field: 'mid', header: 'MID', visible: false },
    { field: 'STO_No', header: '分店編號', visible: false },
    { field: 'STO_TaxNo', header: '稅籍編號', visible: false },
    { field: 'STO_HQUniform', header: '總公司統編', visible: false },
    { field: 'STO_PostCode', header: '郵遞區號', visible: false },
    { field: 'STO_ManagerName', header: '負責人員', visible: false },
    { field: 'STO_AbbName', header: '營業人簡稱', visible: false },
    { field: 'STO_ApplyFlag', header: '自行或委託辦理申報註記', visible: false },
    { field: 'STO_ApplyName', header: '申請人姓名', visible: false },
    { field: 'STO_ApplyID', header: '申請人身份證字號', visible: false },
    { field: 'STO_ApplyTEL', header: '申請人電話', visible: false },
    { field: 'STO_ApplyTEL_ext', header: '電話分機', visible: false },
    { field: 'STO_AreaCode', header: '電話區碼', visible: false },
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }
  ];


  constructor(
    private fin11010Service: FIN11010Service,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', 'fin/fin11010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const queryRequest: FIN11010QueryRequest = {
      ...frm.value,
      // 年月格式處理
      REP_GUIYM_start: frm.value.REP_GUIYM_start ? this.datePipe.transform(frm.value.REP_GUIYM_start, 'yyyyMM') : '',
      REP_GUIYM_end: frm.value.REP_GUIYM_end ? this.datePipe.transform(frm.value.REP_GUIYM_end, 'yyyyMM') : '',
    };
    this.handleSubmit(frm, () => {
      this.fin11010Service.queryFIN11010(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  btnLoading = false;

  /* STO_Status 狀態 0.未確認, 1.使用中, 2.已過期 */
  addButton: AddButton[] = [
    {
      label: '審核',
      icon: 'pi pi-check-circle text-green-500',
      action: (rowData: FIN11010Data) => { this.statusChange(rowData, "1"); },
      disabled: (rowData: FIN11010Data) => rowData.STO_Status == "1" || rowData.STO_Status == "2"
    },
    {
      label: '反審核',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: FIN11010Data) => { this.statusChange(rowData, "0"); },
      disabled: (rowData: FIN11010Data) => rowData.STO_Status == "0" || rowData.STO_Status == "2"
    },
    {
      label: '刪除',
      icon: 'pi pi-trash text-red-500',
      action: (rowData: FIN11010Data) => { this.deleteRow(rowData); },
      disabled: (rowData: FIN11010Data) => rowData.STO_Status == "1" || rowData.STO_Status == "2"
    },
  ];

  onExport(): void {
    // TODO: 實作匯出功能
  }

  deleteRow(rowData: FIN11010Data) {
    this.messageService.confirm({
      header: '是否確認刪除',
      accept: () => {
        const req: BaseDeleteRequest = {
          idList: [rowData.id]
        };
        this.fin11010Service.deleteFIN11010(req).subscribe(() => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }

  statusChange(rowData: FIN11010Data, status: string) {
    this.btnLoading = true;

    const rq: FIN11010UpdateStatusRequest = {
      id: rowData.id,
      REP_BegGUIYM: rowData.REP_BegGUIYM,
      STO_Status: status
    }

    this.fin11010Service.updateStatusFIN11010(rq)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe(response => {
        this.messageService.successBubble(response.Message);
        this.onSubmit(this.queryForm);
      });
  }

  editDisabled(rowData: FIN11010Data) {
    return rowData.STO_Status === '1' || rowData.STO_Status === '2';
  }
}
