import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { Column, formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';
import { FIN29060Data, FIN29060Service, FIN29060TotalData, QueryFIN29060Request } from '../../../service/api/fin/fin29060.service';
import { FIN55050Detail } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { FileExportService } from './../../../shared/service/file-export.service';
import { Fin29060TableSubheaderComponent } from './fin29060-table-subheader/fin29060-table-subheader.component';
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}
declare global {
  interface Window {
    handleAcpNoClick?: (acpNo: string) => void;
  }
}
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, Fin29060TableSubheaderComponent, DropdownRangeComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN29060Component extends BasicQueryPageComponent<FIN29060Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    STO_No: [null],
    VEN_No_From: [null],
    VEN_No_To: [null],
    ODM_Date_From: [null],
    ODM_Date_To: [null],
    PayRefDate_From: [null],
    PayRefDate_To: [null],
    AccNo_From: [null],
    AccNo_To: [null],
    ACP_Desc: [null],
    ShowUnpaid: [false],
    ShowZeroBalance: [false],
  });
  VendorNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  AccNoOptions = this.dropdown.queryGls1005();
  lastQueryBody: any = null;
  selectedItems: FIN29060Data[] = [];
  totalData: FIN29060TotalData[] = [];
  totalRecords = 0;
  fullData: FIN29060Data[] = [];
  data: FIN29060Data[] = [];
  columns: Column[] = [
    { field: 'VendorNo', header: '廠商編號', align: 'left' },
    { field: 'VendorName', header: '廠商名稱', align: 'left' },
    { field: 'ACP_No', header: '應付帳款編號', type: 'detail', align: 'left' },
    { field: 'AccNo', header: '會計科目', align: 'left' },
    { field: 'Summary', header: '摘要', align: 'left' },
    { field: 'PostDate', header: '立帳日期', format: formatDate, align: 'left' },
    { field: 'ACP_Amt', header: '立帳金額', format: formatAmount, align: 'right', isSubTotal: true, isTotal: true },
    { field: 'WireOrBillNo', header: '電匯/開票/單號', align: 'left' },
    { field: 'PayRefDate', header: '開票/匯款日期', format: formatDate, align: 'left' },
    { field: 'PayVoucherNo', header: '傳票號碼', type: 'detail', align: 'left' },
    { field: 'PayAmt', header: '付款金額', format: formatAmount, align: 'right', isSubTotal: true, isTotal: true },
    { field: 'NotPayAmt', header: '未沖餘額', format: formatAmount, align: 'right', isSubTotal: true, isTotal: true },
  ];
  constructor(
    public readonly fin29060Service: FIN29060Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) { super(); }
  private readonly navHelper = inject(NavigationHelperService); // 注入導覽小幫手
  ngOnInit(): void {
    this.initializePage('FIN29060', '/FIN/FIN29060CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onDetailWithColValue(event: { row: FIN29060Data; col: any; value: any }) {
    // 處理應付帳款編號 (跳轉至 FIN24010)
    if (event.col.field === 'ACP_No') {
      const acpNo = event.row?.ACP_No;
      if (!acpNo) return;
      this.navHelper.openInNewTab('/reports/fin/fin24010', { acpid: acpNo });
    }
    // 處理付款傳票編號 (跳轉至通用傳票報表)
    else if (event.col.field === 'PayVoucherNo') {
      const vouNo = event.row?.PayVoucherNo;
      if (!vouNo) {
        this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
        return;
      }
      // 指向你剛剛做好的 Report 頁面路徑，不再使用 localStorage
      // 參數名統一為 vouno，與 Report 元件 ngOnInit 接收的名稱一致
      this.navHelper.openInNewTab('/reports/fin/fin29060', { vouno: vouNo });
    }
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const raw = form.value as QueryFIN29060Request;
      this.lastQueryBody = {
        ...raw,
        pageIndex: 1,
        pageSize: 30,
        SortBy: [
          { field: 'VendorNo', order: 1 },
          { field: 'ACP_No', order: 1 },
          { field: 'PostDate', order: 1 },
        ]
      };
      this.fin29060Service.queryFIN29060(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((res) => {
        this.totalData = res.totalData || [];
        this.totalRecords = res.TotalCount;
        this.data = res.Data || [];
      });
    })
  }

  excelBtnLoading = false;
  onExportExcel() {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }
    const export$ = this.fin29060Service.exportFIN29060_Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.pdf',
      (isLoading) => this.excelBtnLoading = isLoading
    ).subscribe();
  }
  pdfBtnLoading = false;
  onExportPDF() {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }
    this.pdfBtnLoading = true;
    const export$ = this.fin29060Service.exportFIN29060_PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.pdf',
      (isLoading) => this.pdfBtnLoading = isLoading
    ).subscribe();
  }
}
