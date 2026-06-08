import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Subject, takeUntil } from 'rxjs';

export interface TableExport {
  print_reportTitle?: string;
  print_reportTitle_per_page?: string;
  print_eject?: string;
  print_field_title?: string;
  print_field_title_per_page?: string,
  print_reportFooter?: string;
  print_reportFooter_per_page?: string;
  page_lines?: number;
  print_line_number?: string,
  footer_DataType?: string,
  page_orientation?: string,
  page_size_setting?: string,

}

@Component({
  selector: 'app-table-export',
  template: `
  <p-dialog [(visible)]="visible" position="center" [header]="header" [modal]="true"
  (visibleChange)="visibleChange.emit($event)" contentStyleClass="pt-2" [style]="{ width: '30rem' }">
    <form [formGroup]="form" (ngSubmit)="saveDialog()">
      <div class="grid m-0">
        <div class="card col-12 p-0">
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_reportTitle">是否顯示報表標題</label>
            <p-inputSwitch class="flex" id="print_reportTitle" formControlName="print_reportTitle" trueValue="Y"
              falseValue="N" />
          </div>
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_reportTitle_per_page">每頁顯示報表標題</label>
            <p-inputSwitch class="flex" id="print_reportTitle_per_page" formControlName="print_reportTitle_per_page"
              trueValue="Y" falseValue="N" />
          </div>
        </div>
        <div class="card col-12 p-0">
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_eject">是否需要分頁</label>
            <p-inputSwitch class="flex" id="print_eject" formControlName="print_eject" trueValue="Y" falseValue="N" />
          </div>
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="page_lines">分頁顯示筆數</label>
            <p-inputNumber formControlName="page_lines" inputId="page_lines" [min]="10" />
          </div>
        </div>
        <div class="card col-12 p-0">
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_field_title">是否顯示欄位名稱</label>
            <p-inputSwitch class="flex" id="print_field_title" formControlName="print_field_title" trueValue="Y"
              falseValue="N" />
          </div>
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_field_title_per_page">每頁顯示欄位名稱</label>
            <p-inputSwitch class="flex" id="print_field_title_per_page" formControlName="print_field_title_per_page"
              trueValue="Y" falseValue="N" />
          </div>
        </div>
        <div *ngIf="exportStatus === 'PDF'" class="card col-12 p-0">
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_reportFooter">是否顯示報表頁尾</label>
            <p-inputSwitch class="flex" id="print_reportFooter" formControlName="print_reportFooter" trueValue="Y"
              falseValue="N" />
          </div>
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_reportFooter_per_page">是否每頁顯示報表頁尾</label>
            <p-inputSwitch class="flex" id="print_reportFooter_per_page" formControlName="print_reportFooter_per_page"
              trueValue="Y" falseValue="N" />
          </div>
        </div>
        <div *ngIf="exportStatus === 'PDF'" class="card col-12 p-0">
          <div class="col-12 flex justify-content-between align-items-center">
            <label for="print_line_number">是否顯示序號</label>
            <p-inputSwitch class="flex" id="print_line_number" formControlName="print_line_number" trueValue="Y"
              falseValue="N" />
          </div>
        </div>
        <div class="flex justify-content-end gap-2 w-full mb-3">
          <p-button label="取消" [outlined]="true" severity="secondary" (click)="visibleChange.emit(false)" />
          <p-button label="確定" type="submit" (onClick)="visible = false" [disabled]="disable" />
        </div>
      </div>
    </form>
  </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DialogModule, FormsModule, ReactiveFormsModule, InputSwitchModule, InputNumberModule, RadioButtonModule, DropdownModule, NgIf, Button]
})
export class TableExportComponent implements OnInit, OnDestroy {
  @Input() visible = true;
  @Input() header = 'header';
  @Input() disable = false;
  @Input() exportStatus: 'PDF' | 'Excel' = 'PDF';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<TableExport>();

  @Input() pageOrientation: string | null = 'Landscape';  // PDF橫式
  @Input() pageSizeSetting: string | null = 'A4';  // PDF A4

  private destroy$ = new Subject<void>();

  form = this.formBuilder.nonNullable.group({
    print_reportTitle: ['Y'], // 報表標題
    print_reportTitle_per_page: ['N'], // 報表標題每頁
    print_eject: ['Y'], // 是否分頁
    print_field_title: ['Y'], // 是否顯示欄位標題
    print_field_title_per_page: ['N'],// 是否顯示欄位標題
    print_reportFooter: ['Y'], // 報表頁尾
    print_reportFooter_per_page: ['N'], // 報表頁尾每頁
    page_lines: [30, [Validators.min(10)]], // 每頁行數
    print_line_number: ['Y'],
    footer_DataType: [''],
    page_orientation: ['Landscape'],
    page_size_setting: ['A4']
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
    const tableExportData: TableExport = {
      print_reportTitle: this.form.value.print_reportTitle || 'Y',
      print_reportTitle_per_page: this.form.value.print_reportTitle_per_page || 'N',
      print_eject: this.form.value.print_eject || 'Y',
      print_field_title: this.form.value.print_field_title || 'Y',
      print_field_title_per_page: this.form.value.print_field_title_per_page || 'N',
      page_lines: this.form.value.page_lines || 0,
      print_reportFooter: this.exportStatus === 'PDF' ? (this.form.value.print_reportFooter || 'Y') : undefined,
      print_reportFooter_per_page: this.exportStatus === 'PDF' ? (this.form.value.print_reportFooter_per_page || 'N') : undefined,
      print_line_number: this.exportStatus === 'PDF' ? (this.form.value.print_line_number || 'Y') : undefined,
      footer_DataType: this.form.value.footer_DataType || '',

      page_orientation: this.pageOrientation || this.form.value.page_orientation || 'Landscape',
      page_size_setting: this.pageSizeSetting || this.form.value.page_size_setting || 'A4',
    };
    this.save.emit(tableExportData);
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.form.reset();
  }
}
