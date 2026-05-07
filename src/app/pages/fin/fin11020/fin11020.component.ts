import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { transformOptionsForExport } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDateTime, formatYN, formatYYYYMM, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { finalize } from 'rxjs';
import { Fin11020Service, MainInvoiceData } from '../../../service/api/fin/fin11020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { YearMonthComponent } from './query-year-month.component';

//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  standalone: true,
  imports: [YearMonthComponent, InputGroupModule, InputGroupAddonModule, MenubarComponent, FileUploadModule, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputTextRangeComponent, TableReportComponent, TranslateModule]
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [((new Date()).getFullYear().toString()) + ((Math.floor((((new Date()).getMonth() + 1) - 1) / 2) * 2 + 1).toString().padStart(2, '0')), [Validators.required]], // 發票年月
    GUI_YYMM_end: [((new Date()).getFullYear().toString()) + ((Math.floor((((new Date()).getMonth() + 1) - 1) / 2) * 2 + 1).toString().padStart(2, '0')), [Validators.required]], // 發票年月
    GUI_Track: [null, [this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]], // 字軌
    GUI_No_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    GUI_No_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'GUI_YYMM', order: 1 }, { field: 'GUI_SerNo', order: 1 }]],
  }, { validators: this.validationService.guiNumberRangeValidator('GUI_No_start', 'GUI_No_end') });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: MainInvoiceData[] = [];
  selectedRows: MainInvoiceData[] = [];
  lastQueryBody: any = {};
  columns: ReportColumn[] = [
    { field: 'GUI_YYMM', header: '發票年月', format: formatYYYYMM }, // 發票年月YYYYMM (西元年單數月)
    { field: 'GUI_SerNo', header: '序號' }, // 序號
    { field: 'GUI_Track', header: '字軌' }, // 字軌
    { field: 'GUI_BegNo', header: '發票起始號碼' }, // 發票起始號碼
    { field: 'GUI_EndNo', header: '發票結束號碼' }, // 發票結束號碼
    { field: 'GUI_TotQty', header: '發票張數' }, // 發票張數
    { field: 'GUI_AssignQty', header: '發票號碼已分配張數' }, // 發票號碼已分配張數
    { field: 'GUI_Status', header: '發票號碼狀態', format: (value: string) => getSYS1000('GUI_Status', value) },
    { field: 'GUI_Type', header: '發票類別', format: (value: string) => getSYS1000('GUI_Type', value) },
    { field: 'GUI_File', header: '匯入檔案名稱' }, // 匯入檔案名稱
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
    { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
    { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
    { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
  ];
  subColumns: ReportColumn[] = [
    { field: 'STO_No', header: '分店編號' }, // 分店編號
    { field: 'GUI_YYMM', header: '發票年月' }, // 發票年月YYYYMM (西元年單數月)
    { field: 'GUI_SerNo', header: '序號' }, // 序號
    { field: 'GUI_Track', header: '字軌' }, // 字軌
    { field: 'GUI_BegNo', header: '發票起始號碼' }, // 發票起始號碼
    { field: 'GUI_EndNo', header: '發票結束號碼' }, // 發票結束號碼
    { field: 'GUI_TotQty', header: '發票張數' }, // 發票張數
    { field: 'GUI_AssignQty', header: '發票號碼已分配張數' }, // 發票號碼已分配張數
    { field: 'GUI_Status', header: '發票號碼狀態', format: (value: string) => getSYS1000('GUI_Status', value) },
    { field: 'GUI_ProcStatus', header: '是否完成上傳', format: formatYN, exportFormat: transformOptionsForExport(getSYS1000Options('YES_NO')) }, // 是否完成上傳
    { field: 'GUI_ProcDate', header: '上傳日期', format: formatDateTime }, // 上傳日期
    { field: 'GUI_Type', header: '發票類別', format: (value: string) => getSYS1000('GUI_Type', value) },
    { field: 'STO_Uniform', header: '門市統一編號' }, // 門市統一編號(賣方統編)
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime }, // 建立日期
    { field: 'CRT_USR_No', header: '建立人員' }, // 建立人員
    { field: 'CRT_USR_Name', header: '建立人員姓名' }, // 建立人員姓名
  ];
  constructor(
    public readonly fin11020Service: Fin11020Service,
    private readonly validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11020', '/fin/fin11020cru', this.queryForm, (form) => this.onSubmit(form));
    const startControl = this.queryForm.get('GUI_YYMM_start');
    const endControl = this.queryForm.get('GUI_YYMM_end');
    startControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(startValue => {
      // 如果起始年月有值 (YYYYMM 格式) 且 結束年月目前沒有值
      if (startValue && !endControl?.value) {
        endControl?.setValue(startValue);// 將結束年月設定為與起始年月相同
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11020Service.queryFIN11020(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data;
        this.lastQueryBody = frm.value;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete(selectedRows: MainInvoiceData[]) {
    const ids = selectedRows.map(row => row.ID);
    this.messageService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        this.fin11020Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe(() => {
          this.onSubmit(this.queryForm);
          this.selectedRows = [];
        });
      }
    })
  }

  uploadLoading = false;
  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    this.uploadLoading = true;
    this.fin11020Service.uploadFIN11020(file).pipe(untilDestroyed(this), finalize(() => this.uploadLoading = false)).subscribe(res => {
      if (res.Data) {
        this.messageService.successBubble(res.Message);
      } else {
        this.messageService.errorBubble(res.Message);
      }
    });
  }

  isRowSelectable(row: MainInvoiceData) {
    return row.GUI_AssignQty === 0;
  }

  editDisabled(rowdata: MainInvoiceData) {
    return rowdata.GUI_AssignQty > 0;
  }
}
