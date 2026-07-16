import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { ExportLabelService } from '@service/utility/exportLabel.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import {
  BaseDeleteRequest,
  FIN11010Data,
  FIN11010QueryRequest,
  FIN11010Service,
  FIN11010UpdateStatusRequest
} from '../../../service/api/fin/fin11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { AddButton, formatYN, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
    YearMonthComponent
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
  lastQueryBody?: FIN11010QueryRequest;

  // #region 下拉選單選項定義
  // 總繳代號選項
  orgCodeOptions = getSYS1000Options('REP_OrgCode');

  // 狀態選項
  reviewStatusOptions = getSYS1000Options('STO_Status');

  // 縣市別選項
  cityOptions = getSYS1000Options('STO_City');
  // #endregion

  columns: ReportColumn[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'STO_Uniform', header: '營業人統編', visible: true },
    { field: 'STO_TaxName', header: '營業人名稱', visible: true },
    { field: 'STO_City', header: '縣市別', visible: true, format: (value: string) => getSYS1000('STO_City', value) },
    { field: 'STO_Addr', header: '營業地址', visible: true },
    { field: 'REP_OrgCode', header: '總繳代號', visible: true, format: (value: string) => getSYS1000('REP_OrgCode', value) },
    { field: 'STO_Direct', header: '直接扣抵法(Y/N)', visible: true, format: formatYN },
    { field: 'STO_Status', header: '狀態', visible: true, format: (value: string) => getSYS1000('STO_Status', value) },
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
    private readonly fin11010Service: FIN11010Service,
    private readonly exportLabelService: ExportLabelService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', 'fin/fin11010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  queryFunction = (body: any) => {
    const raw = this.queryForm.getRawValue();
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const payload: FIN11010QueryRequest = {
      STO_Uniform: raw.STO_Uniform || undefined,
      STO_TaxName: raw.STO_TaxName || undefined,
      STO_Addr: raw.STO_Addr || undefined,
      REP_OrgCodeList: (raw.REP_OrgCodeList as unknown as string[] | undefined)?.length
        ? (raw.REP_OrgCodeList as unknown as string[])
        : undefined,
      STO_StatusList: (raw.STO_StatusList as unknown as string[] | undefined)?.length
        ? (raw.STO_StatusList as unknown as string[])
        : undefined,
      REP_GUIYM_start: raw.REP_GUIYM_start || undefined,
      REP_GUIYM_end: raw.REP_GUIYM_end || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    return this.fin11010Service.queryFIN11010(payload);
  };

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.lastQueryBody = {
        STO_Uniform: raw.STO_Uniform || undefined,
        STO_TaxName: raw.STO_TaxName || undefined,
        STO_Addr: raw.STO_Addr || undefined,
        REP_OrgCodeList: (raw.REP_OrgCodeList as unknown as string[] | undefined)?.length
          ? (raw.REP_OrgCodeList as unknown as string[])
          : undefined,
        STO_StatusList: (raw.STO_StatusList as unknown as string[] | undefined)?.length
          ? (raw.STO_StatusList as unknown as string[])
          : undefined,
        REP_GUIYM_start: raw.REP_GUIYM_start || undefined,
        REP_GUIYM_end: raw.REP_GUIYM_end || undefined,
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };
      this.loading = true;
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
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

  exportLoading = false;
  onExport(): void {
    const body = this.data.map(item => ({
      ...item,
      STO_Type: "1", //固定為 1
      STO_MergeFlag: "N", // 固定為 N
      STO_ModifyTime: this.datePipe.transform(new Date(), 'yyyyMMdd'), // 改成當下時間年月日 (民國)1141031
    })).filter(item => item.STO_Status === '1');
    this.exportLoading = true;
    this.exportLabelService.ExportDXT(body)
      .pipe(
        finalize(() => this.exportLoading = false),
        untilDestroyed(this)
      )
      .subscribe();
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
