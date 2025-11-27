import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgIf } from '@angular/common';
import { Button } from 'primeng/button';

export interface TLS2B010TableExport {
  print_reportTitle?: string;
  print_reportTitle_per_page?: string;
  print_eject?: string;
  print_field_title?: string;
  print_field_title_per_page?: string,
  print_reportFooter?: string;
  print_reportFooter_per_page?: string;
  page_lines?: number;
  print_line_number?: string,
  footer_DataType?: string
}

@Component({
    selector: 'app-tls2b010table-export',
    templateUrl: './tls2b010table-export.component.html',
    styleUrl: './tls2b010table-export.component.scss',
    standalone: true,
    imports: [DialogModule, FormsModule, ReactiveFormsModule, InputSwitchModule, InputNumberModule, NgIf, Button]
})
export class TLS2B010TableExportComponent implements OnInit, OnDestroy {
  @Input() visible = true;
  @Input() header = 'header';
  @Input() disable = false;
  @Input() exportStatus: 'PDF' | 'Excel' = 'PDF';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<TLS2B010TableExport>();

  private destroy$ = new Subject<void>();

  form = this.formBuilder.nonNullable.group({
    print_reportTitle: ['Y'], // 報表標題
    print_reportTitle_per_page: ['N'], // 報表標題每頁
    print_eject: ['Y'], // 是否分頁
    print_field_title: ['Y'], // 是否顯示欄位標題
    print_field_title_per_page: ['N'],// 是否顯示欄位標題
    print_reportFooter: ['Y'], // 報表頁尾
    print_reportFooter_per_page: ['N'], // 報表頁尾每頁
    page_lines: [10, [Validators.min(10)]], // 每頁行數
    print_line_number: ['Y'],
    footer_DataType: ['']
  });
  constructor(private formBuilder: FormBuilder) { };
  ngOnInit() {
    this.setupValueChangeListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private setupValueChangeListeners() {
    const printReportTitleControl = this.form.get('print_reportTitle') as FormControl;
    if (printReportTitleControl) {
      printReportTitleControl.valueChanges
        .pipe(takeUntil(this.destroy$)) // 使用 takeUntil 在組件銷毀時取消訂閱
        .subscribe((value: string) => {
          if (value === 'N') {
            this.form.get('print_reportTitle_per_page')?.setValue('N');
            this.form.get('print_reportTitle_per_page')?.disable();
          } else {
            this.form.get('print_reportTitle_per_page')?.enable();
          }
        });
    }

    const printEjectControl = this.form.get('print_eject') as FormControl;
    if (printEjectControl) {
      printEjectControl.valueChanges
        .pipe(takeUntil(this.destroy$)) // 使用 takeUntil 在組件銷毀時取消訂閱
        .subscribe((value: string) => {
          if (value === 'N') {
            this.form.get('page_lines')?.setValue(0);
            this.form.get('page_lines')?.disable();
          } else {
            this.form.get('page_lines')?.setValue(10);
            this.form.get('page_lines')?.enable();
          }
        });
    }
    const printFieldTitleControl = this.form.get('print_field_title') as FormControl;
    if (printFieldTitleControl) {
      printFieldTitleControl.valueChanges
        .pipe(takeUntil(this.destroy$)) // 使用 takeUntil 在組件銷毀時取消訂閱
        .subscribe((value: string) => {
          if (value === 'N') {
            this.form.get('print_field_title_per_page')?.setValue('N');
            this.form.get('print_field_title_per_page')?.disable();
          } else {
            this.form.get('print_field_title_per_page')?.enable();
          }
        });
    }

    if (this.exportStatus === 'Excel') { return; }
    const printReportFooterControl = this.form.get('print_reportFooter') as FormControl;
    if (printReportFooterControl) {
      printReportFooterControl.valueChanges
        .pipe(takeUntil(this.destroy$)) // 使用 takeUntil 在組件銷毀時取消訂閱
        .subscribe((value: string) => {
          if (value === 'N') {
            this.form.get('print_reportFooter_per_page')?.setValue('N');
            this.form.get('print_reportFooter_per_page')?.disable();
          } else {
            this.form.get('print_reportFooter_per_page')?.enable();
          }
        });
    }
  }

  saveDialog() {
    if (this.disable) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const tableExportData: TLS2B010TableExport = {
      print_reportTitle: this.form.value.print_reportTitle || 'Y',
      print_reportTitle_per_page: this.form.value.print_reportTitle_per_page || 'N',
      print_eject: this.form.value.print_eject || 'Y',
      print_field_title: this.form.value.print_field_title || 'Y',
      print_field_title_per_page: this.form.value.print_field_title_per_page || 'N',
      page_lines: this.form.value.page_lines || 0,
      print_reportFooter: this.exportStatus === 'PDF' ? (this.form.value.print_reportFooter || 'Y') : undefined,
      print_reportFooter_per_page: this.exportStatus === 'PDF' ? (this.form.value.print_reportFooter_per_page || 'N') : undefined,
      print_line_number: this.exportStatus === 'PDF' ? (this.form.value.print_line_number || 'Y') : undefined,
      footer_DataType: this.form.value.footer_DataType || ''
    };
    this.save.emit(tableExportData);
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.form.reset();
  }
}
