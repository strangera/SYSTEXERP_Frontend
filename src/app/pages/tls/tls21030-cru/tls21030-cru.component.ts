import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21030Data, Tls21030Service, TLS21030TalentData } from '../../../service/api/tls/tls21030.service';
import { RadiobuttonYNComponent } from '../../../shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Base64Service } from '../../../shared/service/base64.service';
import { TableRowUnSelectEvent } from 'primeng/table';

@Component({
  selector: 'app-tls21030-cru',
  templateUrl: './tls21030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    TableComponent,
    NgIf,
    TranslateModule,
    EditorTextComponent,
    RadiobuttonYNComponent
  ],
})
export class TLS21030CRUComponent extends BasicCruPageComponent<TLS21030Data> implements OnInit {
  dataForm = this.formBuilder.group({
    money_type: [null, Validators.required],       // 結帳方式
    term_no: [1, Validators.required],       // 帳次
    rece_yn: [null, Validators.required],        // 是否使用業主發票
    bill_remark1: [''],           // 說明1
    bill_remark2: [''],           // 說明2
    bill_remark3: [''],           // 說明3
    ...createPaginationConfig([{ field: 'talent_id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  settlementMethodOptions = [
    { value: '10', label: '十日結' },
    { value: '15', label: '半月結' },
    { value: '30', label: '月結' },
  ];
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
  ];
  data: TLS21030TalentData[] = [];
  selectedRows: TLS21030TalentData[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  constructor(
    private tls21030Service: Tls21030Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21030', this.dataForm);
    if (!this.isFormCreateable) {
      this.onQuery(this.dataForm);
      this.loading = true;
      this.tls21030Service.queryTLS21030Detail({ BILL_NOTES_id: this.rowdata?.id }).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
        this.selectedRows = res.Data;
      });
    }
  }
  onUnSelect(event: TableRowUnSelectEvent) {
    this.selectedRows = this.selectedRows.filter(x => x.talent_id.toString() !== event.data.talent_id.toString());
  }
  onQuery(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    if (frm?.invalid) {
      this.loading = false;
      return;
    }
    this.tls21030Service.queryTLTTALENT_By_money_type(frm.getRawValue()).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
      this.data = res.Data;
      this.totalRecords = res.TotalCount;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const remark1 = (frm.value.bill_remark1 || '').trim();
      const remark2 = (frm.value.bill_remark2 || '').trim();
      const remark3 = (frm.value.bill_remark3 || '').trim();
      if (remark1 === '' && remark2 === '' && remark3 === '') {
        this.loading = false;
        return this.messageService.errorBubble('請至少輸入一個說明');
      }
      if (this.isFormCreateable && this.selectedRows.length === 0) {
        this.loading = false;
        return this.messageService.errorBubble('請至少選擇一個專櫃');
      }
      const body = {
        ...frm.value,
        ID: this.rowdata?.id || undefined,
        bill_remark1: Base64Service.encode(frm.value.bill_remark1),
        bill_remark2: Base64Service.encode(frm.value.bill_remark2),
        bill_remark3: Base64Service.encode(frm.value.bill_remark3),
        TALTALENT_BILL_NOTES_DETAILDetails: this.selectedRows
      }
      const serviceCall = this.isFormCreateable
        ? this.tls21030Service.insertTLS21030(body)
        : this.tls21030Service.updateTLS21030(body);
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.resetTable();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
      });
    });
  }
  resetTable() {
    this.dataForm.reset();
    this.selectedRows = [];
    this.data = [];
    this.totalRecords = 0;
  }
}
