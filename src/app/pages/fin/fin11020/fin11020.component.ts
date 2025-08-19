import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, convertYYYYMMToDate, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, MainInvoiceData, subColumns } from './fin11020.model';
import { Fin11020Service } from '../../../service/api/fin/fin11020.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';

//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  styleUrls: ['./fin11020.component.scss'],
  standalone: true,
  imports: [MenubarComponent, FileUploadModule, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, InputTextRangeComponent, TableComponent, TranslateModule]
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [new Date(), [Validators.required]], // 發票年月
    GUI_YYMM_end: [new Date(), [Validators.required]], // 發票年月
    GUI_Track: ['', [this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]], // 字軌
    GUI_No_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    GUI_No_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    ...createPaginationConfig([{ field: 'GUI_YYMM', order: 1 }]), // 分頁和排序參數
  }, { validators: this.validationService.guiNumberRangeValidator('GUI_No_start', 'GUI_No_end') });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: MainInvoiceData[] = [];
  selectedRows: MainInvoiceData[] = [];
  columns: Column[] = columns;
  subColumns: Column[] = subColumns;
  constructor(
    private fin11020Service: Fin11020Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11020', '/FIN/FIN11020cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.get('GUI_YYMM_start')?.valueChanges.subscribe(value => {
      const endDate = this.queryForm.get('GUI_YYMM_end')?.value;
      if (value && (!endDate)) {
        this.queryForm.get('GUI_YYMM_end')?.setValue(value);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        GUI_YYMM_start: convertDateToYYYYMM(frm.value.GUI_YYMM_start),
        GUI_YYMM_end: convertDateToYYYYMM(frm.value.GUI_YYMM_end),
      }
      this.fin11020Service.queryFIN11020(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data.map((item: MainInvoiceData) => ({
            ...item,
            GUI_YYMM: convertYYYYMMToDate(item.GUI_YYMM)
          }));
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
    });
  }
  onDelete(selectedRows: MainInvoiceData[]) {
    const ids = selectedRows.map(row => row.ID);
    this.fin11020Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedRows = [];
      },
      error: () => { this.loading = false; },
    });
  }

  onFileUpload(event: FileSelectEvent) {
    const file = event.files[0];
    this.fin11020Service.uploadFIN11020(file).pipe(untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
    });
  }

  isRowSelectable(row: MainInvoiceData) {
    return row.GUI_AssignQty === 0;
  }

  editDisabled(rowdata: MainInvoiceData) {
    return rowdata.GUI_AssignQty > 0;
  }
}
