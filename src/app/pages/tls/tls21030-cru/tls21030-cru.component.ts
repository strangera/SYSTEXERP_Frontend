import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { InputTextareaComponent } from "@shared/components/input-textarea/input-textarea.component";
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TLS21030Data, Tls21030Service, TLS21030TalentData } from '../../../service/api/tls/tls21030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { RadiobuttonYNComponent } from '../../../shared/components/radiobutton-yn/radiobutton-yn.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';

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
    TableReportComponent,
    NgIf,
    TranslateModule,
    RadiobuttonYNComponent,
    InputTextareaComponent,
  ],
})
export class TLS21030CRUComponent extends BasicCruPageComponent<TLS21030Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    money_type: [null, Validators.required],       // 結帳方式
    term_no: [{ value: 1, disabled: true }, Validators.required],       // 帳次
    rece_yn: ['Y', Validators.required],        // 是否使用業主發票
    bill_remark1: [''],           // 說明1
    bill_remark2: [''],           // 說明2
    bill_remark3: [''],           // 說明3
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });
  totalRecords = 0;
  lastQueryBody: any;
  settlementMethodOptions = getSYS1000Options('money_type');
  accountingPeriodOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' }
  ];
  data: TLS21030TalentData[] = [];
  originalData: TLS21030TalentData[] = [];
  selectedRows: TLS21030TalentData[] = [];
  // 唯讀模式下不可變更勾選狀態 (取代 app-table 原本的 [disabled])
  isRowSelectable = (): boolean => !this.isFormReadable;
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
  ];
  constructor(
    public readonly tls21030Service: Tls21030Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21030', this.dataForm);
    if (!this.isFormCreateable) {
      this.dataForm.get('money_type')?.disable();
      this.dataForm.get('term_no')?.disable();
      this.dataForm.get('rece_yn')?.disable();
      this.onQuery(this.dataForm);
    }
    this.dataForm.get('money_type')?.valueChanges.subscribe(value => {
      if (!value) {
        this.dataForm.get('term_no')?.setValue(1);
        this.dataForm.get('term_no')?.disable();
        return;
      }
      this.dataForm.get('term_no')?.enable();
      switch (value) {
        case '10': // 十日結
          this.accountingPeriodOptions = [
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
          ]
          break;
        case '15': // 半月節
          this.accountingPeriodOptions = [
            { value: 1, label: '1' },
            { value: 2, label: '2' },
          ]
          break;
        case '30': // 年結
          this.accountingPeriodOptions = [
            { value: 1, label: '1' },
          ]
          break;
        default:
          this.accountingPeriodOptions = []
      }
    });
  }
  onQuery(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    if (frm?.invalid) {
      this.loading = false;
      return;
    }
    this.tls21030Service.queryTLTTALENT_By_money_type(frm.getRawValue()).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
      this.lastQueryBody = frm.getRawValue();
      this.data = res.Data;
      this.originalData = res.Data;
      this.totalRecords = res.TotalCount;
      if (!this.isFormCreateable) {
        this.loading = true;
        this.tls21030Service.queryTLS21030Detail({ BILL_NOTES_id: this.rowdata?.id }).pipe(finalize(() => this.loading = false)).pipe(untilDestroyed(this)).subscribe(res => {
          this.selectedRows = res.Data;
        });
      }
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
      const body = {
        ...frm.getRawValue(),
        ID: this.rowdata?.id || undefined,
        TALTALENT_BILL_NOTES_DETAILDetails: this.selectedRows.map(x => ({
          ...x,
          talent_id: Number(x.talent_id),
        }))
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
    if (this.isFormCreateable) {
      this.selectedRows = [];
      this.data = [];
      this.totalRecords = 0;
    } else {
      this.onQuery(this.dataForm);
    }
  }
}
