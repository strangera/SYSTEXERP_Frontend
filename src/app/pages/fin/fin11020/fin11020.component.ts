import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { finalize } from 'rxjs';
import { Fin11020Service } from '../../../service/api/fin/fin11020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { columns, MainInvoiceData, subColumns } from './fin11020.model';
import { YearMonthComponent } from './query-year-month/query-year-month.component';

//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  styleUrls: ['./fin11020.component.scss'],
  standalone: true,
  imports: [YearMonthComponent, InputGroupModule, InputGroupAddonModule, MenubarComponent, FileUploadModule, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, InputTextRangeComponent, TableComponent, TranslateModule]
})
export class FIN11020Component extends BasicQueryPageComponent<MainInvoiceData> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM_start: [((new Date()).getFullYear().toString()) + ((Math.floor((((new Date()).getMonth() + 1) - 1) / 2) * 2 + 1).toString().padStart(2, '0')), [Validators.required]], // 發票年月
    GUI_YYMM_end: [((new Date()).getFullYear().toString()) + ((Math.floor((((new Date()).getMonth() + 1) - 1) / 2) * 2 + 1).toString().padStart(2, '0')), [Validators.required]], // 發票年月
    GUI_Track: [null, [this.validationService.guiTrackValidator, Validators.maxLength(2), Validators.minLength(2)]], // 字軌
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
        endControl?.setValue(startValue);// 將結束年月設定為與起始年月相同
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11020Service.queryFIN11020(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(response => {
        this.data = response.Data
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
