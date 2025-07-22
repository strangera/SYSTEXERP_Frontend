import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS46020Item, TLS46020Service } from '../../../service/api/tls/tls46020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { columns, ECR_GUI_Type_Option, ECR_SernoType_Option } from './tls46020.model';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DialogComponent } from '../../../shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// 2.4.6.2  POS環境變數維護作業
@Component({
  selector: 'app-tls46020',
  templateUrl: './tls46020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    InputTextareaComponent,
    TableComponent,
    DialogComponent,
    DropdownComponent,
    NgIf,
    TranslateModule,
  ],
})
export class TLS46020Component extends BasicQueryPageComponent<TLS46020Item> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_TmplNo: ['', [Validators.maxLength(20)]], // 環境變數編號
    ECR_TmplBegDate: [null], // 環境變數啟用日期
    ECR_TmplEndDate: [null], // 環境變數截止日期
    ECR_TmplDesc: ['', [Validators.maxLength(20)]], // 環境變數備註
    ...createPaginationConfig([{ field: 'ECR_TmplNo', order: 1 }]), // 分頁和排序參數
  });
  ECR_SernoType_Options = ECR_SernoType_Option; // 交易序號模式選項
  ECR_GUI_Type_Option = ECR_GUI_Type_Option; // 發票使用類別選項
  totalRecords = 0;
  data: TLS46020Item[] = [];
  selectedItems: TLS46020Item[] = [];
  columns = columns;

  constructor(
    private tls46020Service: TLS46020Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS46020', '/TLS/TLS46020CRU', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryPOS1002TML_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogOptions = res.Data.map(item => ({
        ...item,
        label: `${item.No} - ${item.Name}`,
      }));
      this.mergedDialogOptions = [{ label: '新增一筆環境變數', No: 'new' }, ...this.dialogOptions];
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls46020Service.queryTLS46020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete(selectedRows: TLS46020Item[]) {
    const idList = selectedRows.map(row => row.id).filter((id): id is number => typeof id === 'number');
    this.tls46020Service.deleteTLS46020(idList).pipe(untilDestroyed(this)).subscribe({
      next: () => {
        this.onSubmit(this.queryForm);
        this.selectedItems = [];
      },
      error: () => { this.loading = false; },
    });
  }
  dialogVisible = false;
  dialogQueryForm = this.formBuilder.group({
    ECR_TmplNo: ['', [Validators.required]], // 環境變數編號
    Target_ECR_No: ['', [Validators.required]], // 目的環境變數編號
  });
  dialogSelectItem: TLS46020Item | null = null;
  dialogSelectTargetItem: TLS46020Item | null = null;
  dialogOptions: { No?: string; Name?: string; label?: string }[] = [];
  mergedDialogOptions: { No?: string; Name?: string; label?: string }[] = [];
  saveDialog(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      if (this.isValid) { return; }
      const body = {
        ...this.dialogSelectItem,
        ECR_TmplNo: frm.value.ECR_TmplNo === 'new' ? undefined : frm.value.Target_ECR_No,
        id: frm.value.ECR_TmplNo === 'new' ? undefined : this.dialogSelectTargetItem?.id
      }
      if (frm.value.Target_ECR_No === 'new') {
        this.tls46020Service.insertTLS46020(body).pipe(untilDestroyed(this)).subscribe(res => {
          console.log('新增環境變數成功', res);
          this.dialogVisible = false;
          this.onSubmit(this.queryForm);
        });
      } else {
        this.tls46020Service.updateTLS46020(body).pipe(untilDestroyed(this)).subscribe(res => {
          console.log('複製環境變數成功', res);
          this.dialogVisible = false;
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
  onDialogChange(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body = { ECR_TmplNo: selectedValue };
    this.tls46020Service.queryTLS46020(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogSelectItem = res.Data[0];
    });
  }
  onDialogChange2(event: DropdownChangeEvent) {
    const selectedValue = event.value;
    const body = { ECR_TmplNo: selectedValue };
    this.tls46020Service.queryTLS46020(body).pipe(untilDestroyed(this)).subscribe(res => {
      this.dialogSelectTargetItem = res.Data[0];
    });
  }
  get isValid(): boolean {
    const ECR_TmplNo = this.dialogQueryForm.value.ECR_TmplNo ?? '';
    const Target_ECR_No = this.dialogQueryForm.value.Target_ECR_No ?? '';
    return (ECR_TmplNo !== '' && Target_ECR_No !== '') && (ECR_TmplNo === Target_ECR_No);
  }
}
