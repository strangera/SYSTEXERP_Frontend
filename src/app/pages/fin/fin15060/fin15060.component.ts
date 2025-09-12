import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FIN15060Service, FIN15060Data, FIN15060QueryRequest, FIN15060PrintRequest } from '../../../service/api/fin/fin15060.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-fin15060',
  templateUrl: './fin15060.component.html',
  styleUrl: './fin15060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, DropdownComponent, TableComponent, TranslateModule, CalendarComponent, ButtonModule,
  ]
})
export class FIN15060Component extends BasicQueryPageComponent<FIN15060Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_YM: ['', [Validators.required, this.validationService.evenMonthValidator]],           // 申報年月
    STO_TaxNo: ['', [Validators.required, Validators.maxLength(10)]], // 稅籍編號
    ...createPaginationConfig([{ field: 'INV_GUIDate', order: -1 }])
  });

  totalRecords = 0;
  data: FIN15060Data[] = [];
  selectedItems: FIN15060Data[] = [];
  pdfBtnLoding = false;

  columns: Column[] = [
    { field: 'INV_DeclareYM', header: '所屬年月份', visible: true },
    { field: 'INV_GUIDate', header: '開立發票日期', visible: true },
    { field: 'INV_GUINo', header: '字軌號碼', visible: true },
    { field: 'INV_Name', header: '買受人名稱', visible: true },
    { field: 'TXN_Uniform', header: '買受人統一編號', visible: true },
    { field: 'GoodsOrServicesName', header: '貨物或勞務名稱', visible: true },
    { field: 'GoodsQty', header: '數量', visible: true },
    { field: 'ExportMethod', header: '外銷方式', visible: true },
    { field: 'INV_DocName', header: '證明文件名稱', visible: true },
    { field: 'INV_DocNo', header: '證明文件號碼', visible: true },
    { field: 'NonCustomsExportAmt', header: '非經海關出口金額', visible: true },
    { field: 'INV_ExportType', header: '出口報單類別', visible: true },
    { field: 'INV_ExportNo', header: '出口報單號碼', visible: true },
    { field: 'CustomsExportAmt', header: '經海關出口金額', visible: true },
    { field: 'ExportDate', header: '輸出或結匯日期', visible: true }
  ];

  constructor(
    private fin15060Service: FIN15060Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15060', 'fin/fin15060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15060QueryRequest: FIN15060QueryRequest = {
      ...frm.value,
      INV_YM: this.datePipe.transform(frm.value.INV_YM, 'yyyyMM') ?? ''
    };
    this.handleSubmit(frm, () => {
      this.fin15060Service.queryFIN15060(fin15060QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExportPdf() {
    this.pdfBtnLoding = true;
    const payload: FIN15060PrintRequest = {
      INV_YM: this.datePipe.transform(this.queryForm.value.INV_YM, 'yyyyMM')!,
      STO_TaxNo: this.queryForm.value.STO_TaxNo!
    }
    this.fin15060Service.printFIN15060(payload)
      .pipe(finalize(() => this.pdfBtnLoding = false))
      .subscribe(response => {
        this.openDownloadWindow(response.Data.Print_URL);
      });
  }

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    window.open(downloadUrl, '_blank');
  }
}