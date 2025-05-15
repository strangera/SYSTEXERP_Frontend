import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export interface TableExport {
  print_reportTitle: string;
  print_reportTitle_per_page: string;
  print_eject: string;
  print_field_title: string;
  print_reportFooter: string;
  print_reportFooter_per_page: string;
  page_lines: number;
}

@Component({
  selector: 'app-table-export',
  templateUrl: './table-export.component.html',
  styleUrl: './table-export.component.scss'
})
export class TableExportComponent implements OnInit, OnDestroy {
  @Input() visible = true;
  @Input() header = 'header';
  @Input() disable = false;
  @Input() exportStatus: 'PDF' | 'Excel' = 'PDF';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<TableExport>();

  private destroy$ = new Subject<void>();

  form = this.formBuilder.nonNullable.group({
    print_reportTitle: ['Y'],
    print_reportTitle_per_page: ['N'],
    print_eject: ['Y'],
    print_field_title: ['Y'],
    print_reportFooter: ['Y'],
    print_reportFooter_per_page: ['N'],
    page_lines: [0]
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
    const printReportFooterControl = this.form.get('print_reportFooter') as FormControl;

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
    const tableExportData: TableExport = {
      print_reportTitle: this.form.value.print_reportTitle || 'Y',
      print_reportTitle_per_page: this.form.value.print_reportTitle_per_page || 'N',
      print_eject: this.form.value.print_eject || 'Y',
      print_field_title: this.form.value.print_field_title || 'Y',
      page_lines: this.form.value.page_lines || 0,
      print_reportFooter: this.form.value.print_reportFooter || 'Y',
      print_reportFooter_per_page: this.form.value.print_reportFooter_per_page || 'N',
    };
    this.save.emit(tableExportData);
  }
}
