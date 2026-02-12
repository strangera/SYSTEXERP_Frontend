import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin63050ListData, Fin63050Service, QueryFin63050Request } from '@service/api/fin/fin63050.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-fin63050',
  templateUrl: './fin63050.component.html',
  standalone: true,
  imports: [CalendarComponent, DropdownComponent, DialogComponent, ButtonModule, CalendarRangeQuickComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule]
})
export class FIN63050Component extends BasicQueryPageComponent<Fin63050ListData> implements OnInit {
  queryForm = this.formBuilder.group({
    PageSize: [30],
    PageIndex: [1],
    ChkNo: [null, [Validators.maxLength(10)]],// 票據號碼
    WithdrawDateFrom: [null], // 撤票日(起)
    WithdrawDateTo: [null],  // 撤票日(迄)
  });
  data: Fin63050ListData[] = [];
  selectedItems: Fin63050ListData[] = [];
  isRowSelectable(row: Fin63050ListData) {
    // 1. 兌現不可勾選
    // 2. PayDate 有值不可勾選
    // 3. 狀態為「撤票」不可勾選
    return row.CheckStatus !== '兌現' &&
      row.CheckStatus !== '撤票' &&
      row.PayDate === null;
  }
  editDisabled(rowdata: Fin63050ListData) {
    return rowdata.CheckStatus === '兌現' || rowdata.PickupStatus === '已領';
  }
  lastQuery: QueryFin63050Request | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    // { field: 'TotalCount', header: '總筆數', visible: false },
    // { field: 'CanPickupYn', header: '支票是否可領取', visible: false, format: (v) => getSYS1000('YES_NO', v) },
    // { field: 'RowNo', header: '序號', visible: false },
    { field: 'CheckNo', header: '票據號碼' },
    { field: 'VendorNo', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱', visible: false },
    { field: 'CompanyAccNo', header: '公司銀行科目代號' },
    { field: 'CompanyAccName', header: '公司銀行科目名稱', visible: false },
    { field: 'IssueDate', header: '開票日', format: formatDate },
    { field: 'ExpireDate', header: '到期日', format: formatDate },
    { field: 'PayDate', header: '兌現日', format: formatDate },
    { field: 'WithdrawDate', header: '撤票日', visible: false, format: formatDate },
    { field: 'CheckAmount', header: '票面金額', format: formatAmount },
    { field: 'CheckTitle', header: '票據抬頭' },
    { field: 'NoEndorseYn', header: '票據禁止背書轉讓', visible: false, format: (v) => getSYS1000('YES_NO', v) }, // Y=是, N=否
    { field: 'Remark', header: '備註' },
    { field: 'OrgId', header: '組織代號', visible: false },
    { field: 'Org_Name', header: '組織名稱', visible: false },
    { field: 'CheckStatus', header: '狀態', format: (v) => getSYS1000('CheckStatus', v) },// 顯示為2=到期,3=兌現
    { field: 'StatusFlag', header: '票據狀態', visible: false, format: (v) => getSYS1000('StatusFlag', v) }, // 顯示 (1=確認, 2=拋轉)
    { field: 'PickupStatus', header: '領取狀態', visible: false, format: (v) => getSYS1000('PickupStatus', v) }, // 0=未領 1=已領 2=郵寄
    { field: 'PickupDate', header: '領取日期', visible: false, format: formatDate },
    { field: 'VoucherNoIssued', header: '傳票號碼', visible: false },
    { field: 'VoucherNoWithdraw', header: '撤票傳票號碼', visible: false }
  ];

  constructor(
    public readonly fin63050Service: Fin63050Service,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63050', 'fin/fin63050cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        WithdrawDateFrom: this.datePipe.transform(frm.value.WithdrawDateFrom, 'yyyy-MM-dd'),
        WithdrawDateTo: this.datePipe.transform(frm.value.WithdrawDateFrom, 'yyyy-MM-dd'),
      }
      this.fin63050Service.queryFIN63050(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(result => {
        this.data = result.Data;
        this.totalRecords = result.TotalCount;
        this.lastQuery = body;
        this.queryStateService.setQueryState(this.ProgNo, body);
      });
    });
  }

  btnLoading = false;
  onWithdraw() {
    this.dialogVisible = true;
  }
  dialogVisible = false;
  RemarkOptions = [
    { label: '存款不足', value: '存款不足' },
    { label: '簽章不符', value: '簽章不符' },
    { label: '支票掛失', value: '支票掛失' },
    { label: '拒絕往來戶', value: '拒絕往來戶' },
    { label: '金額或文字模糊', value: '金額或文字模糊' },
    { label: '日期問題', value: '日期問題' },
    { label: '支票塗改', value: '支票塗改' },
    { label: '印章問題', value: '印章問題' },
  ]
  dialogQueryForm = this.formBuilder.group({
    WithdrawDate: this.formBuilder.nonNullable.control(new Date(), [Validators.required]),
    Remark: this.formBuilder.control<string | null>(null, [Validators.required]),
  })
  saveDialog(dialogQueryForm: FormGroup) {
    if (!dialogQueryForm.valid) {
      this.messageService.errorBubble('請填寫必填欄位');
      dialogQueryForm.markAllAsTouched();
      return;
    }
    this.dialogVisible = false;
    this.btnLoading = true;
    const payload = {
      WithdrawDate: this.datePipe.transform(dialogQueryForm.get('WithdrawDate')?.value, 'yyyy-MM-dd') || null,
      Remark: dialogQueryForm.get('Remark')?.value,
      ChkNoList: this.selectedItems.map(item => item.CheckNo)
    }
    this.fin63050Service.updateFIN63050Detail(payload).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(() => {
      this.messageService.successBubble('撤票成功');
      this.onSubmit(this.queryForm);
    });
  }

  onExportPDF() {
    if (!this.lastQuery) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin63050Service.exportFIN63050PDF(this.lastQuery);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf',
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQuery) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin63050Service.exportFIN63050(this.lastQuery);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx',
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }
}
