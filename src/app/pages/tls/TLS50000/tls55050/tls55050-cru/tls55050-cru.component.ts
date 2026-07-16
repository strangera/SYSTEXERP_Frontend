import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Gls6001, Gls6002, Tls55050Service } from '@service/api/tls/tls55050.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, ReportColumn } from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls55050-cru',
  templateUrl: './tls55050-cru.component.html',
  standalone: true,
  imports: [CalendarComponent, DropdownComponent, InputTextComponent, TableReportComponent, MenubarComponent, ButtonComponent, PanelModule, FormsModule, CommonModule, ReactiveFormsModule, TranslateModule],
})
export class TLS55050CRUComponent extends BasicCruPageComponent<Gls6001> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [{ value: null as string | null, disabled: true }],
    VouType: [{ value: null as string | null, disabled: true }],
    VouDate: [{ value: null as string | null, disabled: true }],
    SrcSheetType: [{ value: null as string | null, disabled: true }],
    SrcSheetNo: [{ value: null as string | null, disabled: true }],
    PostFlag: [{ value: null as string | null, disabled: true }],
    INV_YN: [{ value: null as string | null, disabled: true }],
    Remark: [{ value: null as string | null, disabled: true }],
    CRT_Date: [{ value: null as string | null, disabled: true }],
    CRT_USR_No: [{ value: null as string | null, disabled: true }],
    CRT_USR_Name: [{ value: null as string | null, disabled: true }],
    UPD_Date: [{ value: null as string | null, disabled: true }],
    UPD_USR_No: [{ value: null as string | null, disabled: true }],
    UPD_USR_Name: [{ value: null as string | null, disabled: true }],
  })

  columns: ReportColumn[] = [
    { field: 'SerNo', header: '序號', align: 'left' },
    { field: 'AccNo', header: '科目代號', align: 'left' },
    { field: 'ACCCNAME', header: '科目名稱', align: 'left' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'DAccAmt', header: '借方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'CAccAmt', header: '貸方金額', format: formatAmount, isTotal: true, align: 'right' },
    { field: 'ORG_ID', header: '組織編號', align: 'left' },
    { field: 'DetailNo', header: '廠商編號', align: 'left' },
    { field: 'VEN_NAME', header: '廠商名稱', align: 'left' },
    { field: 'ProjectNo', header: '活動代號', align: 'left' },
    { field: 'PTA', header: '立沖代號' },
  ]
  data: Gls6002[] = [];
  totalRecords = 0;
  footerData: { DAccAmt: number, CAccAmt: number } = { DAccAmt: 0, CAccAmt: 0 };
  VouTypeOptions = getSYS1000Options('VouType');
  PostFlagOptions = getSYS1000Options('PostFlag');
  constructor(
    private readonly tls55050Service: Tls55050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55050', this.dataForm);
    if (this.rowdata && this.rowdata.VouNo) {
      const body = {
        VouNo: this.rowdata.VouNo
      }
      this.tls55050Service.queryTLS55050M_D(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        if (res.Data) {
          this.dataForm.patchValue(res.Data.Data._gls6001);
          this.data = res.Data.Data._gls6002s.map((item: any) => ({
            ...item,
            DAccAmt: item.AccDC === 'D' ? item.AccAmt : 0,
            CAccAmt: item.AccDC === 'C' ? item.AccAmt : 0,
          }));
          this.totalRecords = res.Data.Data._gls6002s?.length || 0;
          this.footerData = this.data.reduce((acc, cur) => (acc.DAccAmt += cur.DAccAmt, acc.CAccAmt += cur.CAccAmt, acc), { DAccAmt: 0, CAccAmt: 0 });
        }
      });
    }
  }
}
