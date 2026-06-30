import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IAutoMailRequest, IExportPDFRequest, IQueryData, IQueryRequest, TLS57180Service } from '@service/api/tls/tls57180.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { saveAs } from 'file-saver';
import { finalize, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls57180',
  templateUrl: './tls57180.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TranslateModule,
    MultiSelectComponent,
    AsyncPipe,
    InputTextComponent,
    TableReportComponent,
    ButtonModule,
    DialogComponent,
    DropdownComponent,
  ]
})
export class TLS57180Component extends BasicQueryPageComponent<IQueryData> implements OnInit {
  queryForm = this.formBuilder.group({
    ACP_YYYYMM: [null, [Validators.required]], // 結帳年月
    VEN_No: [null], // 廠商編號
    TLT_No: [null], // 專櫃編號
    VEN_Uniform: [null, [Validators.minLength(8), Validators.maxLength(8)]], // 統一編號
    PUR_GUINo: [null], // 發票號碼
  });
  dialogForm = this.formBuilder.group({
    SMTP_No: [null, [Validators.required]], // 寄件者
  });
  historyRequestBody?: IQueryRequest;
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  SMTP_NoOptions = this.dropdown.queryNTY1001_DropDownList();
  totalRecords = 0;
  isAllSelected = false;
  data: IQueryData[] = [];
  selectedItems: IQueryData[] = [];
  columns: ReportColumn[] = [
    { field: 'ACP_YYYYMM', header: '結帳年月', visible: true },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'VEN_Uniform', header: '統一編號', visible: true },
  ];
  btnLoading = false;
  dialogVisible = false;
  dialogLoading = false;

  ngOnInit(): void {
    this.initializePage('TLS57180');
  }

  constructor(
    public readonly tls57180Service: TLS57180Service,
    public readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  onSubmit(frm: FormGroup) {
    const formValue = frm.value;
    let ACP_YYYYMM_string = '';
    if (formValue.ACP_YYYYMM) {
      const date = new Date(formValue.ACP_YYYYMM);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      ACP_YYYYMM_string = `${year}${month}`;
    }
    const body = {
      ...formValue,
      ACP_YYYYMM: ACP_YYYYMM_string,
    };
    this.handleSubmit(frm, () => {
      this.tls57180Service.queryTLS57180(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.totalRecords = res.TotalCount || 0;
        this.data = res.Data;
        this.historyRequestBody = body;
      });
    });
  }

  autoMail(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body: IAutoMailRequest = {
        SMTP_No: frm.value.SMTP_No,
        selectList: this.selectedItems.map(item => ({
          ACP_YYYYMM: item.ACP_YYYYMM || '',
          VEN_No: item.VEN_No || '',
          TLT_No: item.TLT_No || '',
          VEN_Uniform: item.VEN_Uniform || undefined,
          VEN_Name: item.VEN_Name || undefined,
          email: item.VEN_Email || undefined,
        }))
      };
      this.dialogLoading = true;
      this.tls57180Service.autoMailTLS57180(body).pipe(untilDestroyed(this), finalize(() => [this.loading = false, this.dialogLoading = false, this.dialogVisible = false])).subscribe(res => {
        this.messageService.successBubble(res.Message);
      });
    });
  }

  exportPDF() {
    const body: IExportPDFRequest = {
      selectList: this.selectedItems.map(item => ({
        ACP_YYYYMM: item.ACP_YYYYMM || '',
        VEN_No: item.VEN_No || '',
        TLT_No: item.TLT_No || '',
        VEN_Uniform: item.VEN_Uniform || undefined,
      }))
    };
    this.btnLoading = true;
    this.tls57180Service.exportTLS57180PDF(body)
      .pipe(map(response => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = '自營廠商綜合對帳單.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)(;|$)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }
        const blob = new Blob([response.body], { type: 'application/pdf' });
        return { blob, filename };
      }), untilDestroyed(this), finalize(() => this.btnLoading = false))
      .subscribe(data => { saveAs(data.blob, data.filename); });
  }

}

