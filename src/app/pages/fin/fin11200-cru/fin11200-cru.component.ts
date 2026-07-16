import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { DividerModule } from "primeng/divider";
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { Fin11200Service } from '../../../service/api/fin/fin11200.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { monthOptions, POS1002, Pos1018 } from '../fin11200/fin11200.model';

@Component({
  selector: 'app-fin11200-cru',
  templateUrl: './fin11200-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    NgIf,
    DialogComponent,
    InputTextComponent,
    TranslateModule,
    YearMonthComponent,
    DividerModule
  ],
})
export class FIN11200CRUComponent extends BasicCruPageComponent<Pos1018> implements OnInit {
  dataForm = this.formBuilder.group({
    GUI_YYMM: [null as string | null, [Validators.required, this.validationService.invoicePeriodValidator()]], // 發票年月
  });
  monthOptions = monthOptions;
  minDate?: Date;
  dialogVisible = false;

  data: POS1002[] = [];
  selectedData: POS1002[] = [];
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
  ]

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fin11200Service: Fin11200Service,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', this.dataForm);
    if (this.isFormCreateable) {
      // 設定GUI_YYMM預設值
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
      if (currentMonth % 2 === 0) {
        currentDate.setMonth(currentDate.getMonth() - 1);
      }
      this.dataForm.get('GUI_YYMM')?.setValue(
        this.datePipe.transform((currentDate), 'yyyyMM'));
      // minDate 仍然保留，用來在 UI 上擋掉 2025 (讓使用者根本不能選舊年份)
      this.minDate = this.setMinDate();
    }
    this.dropdownApiService.queryPos1002Bill().pipe(untilDestroyed(this)).subscribe(data => {
      const mappedData = (data ?? []).map((item: { No: string; Name: string }) => ({
        ECR_No: item.No,
        ECR_Name: item.Name
      }));
      this.originalDialogData = mappedData;
      this.dialogData = mappedData;
    });
  }
  setMinDate(): Date {
    const today = new Date();
    // 只要限制年份，通常設為該年 1 月 1 日即可
    // 如果要嚴格限制到月，p-calendar view="year" 主要還是看年份
    return new Date(today.getFullYear(), 0, 1);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (this.data.length === 0) {
        this.loading = false;
        return this.messageService.errorBubble('請選擇收銀機');
      }
      if (!frm.value.GUI_YYMM) { return; }
      this.loading = true;
      const body = {
        NumberDetails: this.data.map(item => ({
          GUI_YYMM: frm.value.GUI_YYMM,
          ECR_No: item.ECR_No
        })),
      };
      this.fin11200Service.execProcNumber(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble(response.Message);
          this.dataForm.reset();
          this.data = [];
          this.selectedData = [];
        }
      });
    });
  }

  dialogQueryForm = this.formBuilder.group({
    ECR_No: [''], // 收銀機號
    ECR_Name: [''], // 收銀機名稱
  });
  dialogData: POS1002[] = [];
  private originalDialogData: POS1002[] = [];
  selectedItemsDialog: POS1002[] = [];

  isRowSelectable(event: POS1002): boolean {
    return !this.data || !this.data.some((item: POS1002) => item.ECR_No === event.ECR_No);
  }
  inputEnter() {
    const filterECRNo = this.dialogQueryForm.controls.ECR_No.value?.trim().toLowerCase() || '';
    const filterECRName = this.dialogQueryForm.controls.ECR_Name.value?.trim().toLowerCase() || '';
    this.dialogData = this.originalDialogData.filter(item => {
      const matchECRNo = item.ECR_No.toLowerCase().includes(filterECRNo);
      const matchECRName = item.ECR_Name.toLowerCase().includes(filterECRName);
      return matchECRNo && matchECRName;
    });
  }
  saveDialog() {
    this.dialogVisible = false;
    this.data = [...this.data, ...this.selectedItemsDialog];
    this.selectedItemsDialog = [];
  }
  onDelete(selectedRows: POS1002[]) {
    this.data = this.data.filter(row => !selectedRows.includes(row));
    this.selectedData = [];
  }
  resetTable() {
    this.data = [];
    this.selectedData = [];
  }
}
