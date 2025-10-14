import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, MainInvoiceData, subColumns } from './fin11020.model';
import { Fin11020Service } from '../../../service/api/fin/fin11020.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { YearMonthComponent } from './query-year-month/query-year-month.component';
import { finalize } from 'rxjs';



//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  styleUrls: ['./fin11020.component.scss'],
  standalone: true,
  imports: [YearMonthComponent, InputGroupModule, InputGroupAddonModule, MenubarComponent, FileUploadModule, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputTextRangeComponent, TableComponent, TranslateModule]
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  // 輔助方法：計算當前雙月週期的起始 YYYYMM
  private getCurrentBiMonthStart(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-indexed month (1-12)

    // 根據您的規則：1,2月 -> 01; 3,4月 -> 03; ...
    // Math.floor((month - 1) / 2) * 2 + 1 會得出 1, 3, 5, 7, 9, 11
    const biMonthStart = Math.floor((month - 1) / 2) * 2 + 1;

    const yearString = year.toString();
    const monthString = biMonthStart.toString().padStart(2, '0');

    return yearString + monthString;
  }
  private initialYYMM = this.getCurrentBiMonthStart();
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [this.initialYYMM, [Validators.required]], // 發票年月
    GUI_YYMM_end: [this.initialYYMM, [Validators.required]], // 發票年月
    GUI_Track: ['', [this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]], // 字軌
    GUI_No_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], // 發票起始號碼
    GUI_No_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], // 發票結束號碼
    ...createPaginationConfig([{ field: 'GUI_YYMM', order: 1 }, { field: 'GUI_SerNo', order: 1 }]), // 分頁和排序參數
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
    this.initializePage('FIN11020', '/fin/fin11020cru', this.queryForm, (form) => this.onSubmit(form));
    const startControl = this.queryForm.get('GUI_YYMM_start');
    const endControl = this.queryForm.get('GUI_YYMM_end');
    startControl?.valueChanges.pipe(untilDestroyed(this)).subscribe(startValue => {
      // 如果起始年月有值 (YYYYMM 格式) 且 結束年月目前沒有值
      if (startValue && !endControl?.value) {
        // 將結束年月設定為與起始年月相同
        endControl?.setValue(startValue);

      }
    });
  }

  onSubmit(frm: FormGroup) {
    console.log('查詢條件', frm.value);
    this.handleSubmit(frm, () => {
      this.fin11020Service.queryFIN11020(frm.value).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          this.data = response.Data
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
    this.confirmationService.confirm({
      header: '刪除確認',
      message: '是否刪除所選項目?',
      accept: () => {
        this.fin11020Service.deleteFIN11020(ids).pipe(untilDestroyed(this)).subscribe({
          next: () => {
            this.onSubmit(this.queryForm);
            this.selectedRows = [];
          },
          error: () => { this.loading = false; },
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
