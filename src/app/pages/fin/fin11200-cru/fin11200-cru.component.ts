import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Fin11200Service } from '../../../service/api/fin/fin11200.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
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
    CalendarComponent,
    TableComponent,
    NgIf,
    DialogComponent,
    InputTextComponent,
    TranslateModule,
    YearMonthComponent
  ],
})
export class FIN11200CRUComponent extends BasicCruPageComponent<Pos1018> implements OnInit {
  dataForm = this.formBuilder.group({
    GUI_YYMM: [null, [Validators.required]], // 發票年月
  });
  monthOptions = monthOptions;
  minDate?: Date;
  dialogVisible = false;

  data: POS1002[] = [];
  selectedData: POS1002[] = [];
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
  ]

  constructor(
    private validationService: ValidationService,
    private eCRNoService: ECRNoService,
    private fin11200Service: Fin11200Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', this.dataForm);
    if (this.isFormCreateable) {
      this.minDate = this.setMinDate();
    }
    this.eCRNoService.getPOS1002BillDropDownList().pipe(untilDestroyed(this)).subscribe(data => {
      const mappedData = data.Data.map((item: { No: string; Name: string }) => ({
        ECR_No: item.No,
        ECR_Name: item.Name
      }));
      this.originalDialogData = mappedData;
      this.dialogData = mappedData;
    });
  }
  setMinDate(): Date | undefined {
    if (this.isFormCreateable) {
      const today = new Date();
      const currentMonth = today.getMonth();
      if ((currentMonth + 1) % 2 !== 0) {
        return new Date(today.getFullYear(), currentMonth, 1);
      } else {
        return new Date(today.getFullYear(), currentMonth - 1, 1);
      }
    }
    return undefined;
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

  private formatDateToYYYYMM(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return year + month;
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
