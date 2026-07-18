import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';

@Component({
  selector: 'app-radiobutton-yn',
  template: `
    <label [for]="controlName" class="flex gap-1">
  {{ label }}
  <span *ngIf="fieldState.isRequired" class="text-red-500">*</span>
  <ng-content select="header"></ng-content>
</label>

<div class="input-group">
  <div class="flex flex-wrap gap-3 p-2">
    <div *ngFor="let option of ynOptions" class="flex align-items-center">
      <p-radioButton [inputId]="controlName + option.value" [name]="controlName" [value]="option.value"
        [formControl]="control" [ngClass]="{'ng-dirty ng-invalid': submitted && control.errors}"
        appEnterToTab [attr.aria-label]="label + ' ' + option.label"
        [title]="label + ' ' + option.label"></p-radioButton>
      <label [for]="controlName + option.value" class="ml-2">
        {{ option.label }}
      </label>
    </div>
  </div>
</div>

@if ((submitted || (control.touched && control.invalid)) && fieldState.getErrorMessage(control); as msg) {
  <div class="text-red-600 text-sm">{{ msg }}</div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    EnterToTabDirective,
  ],
  hostDirectives: [FieldStateDirective],
})
export class RadiobuttonYNComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl(); // 初始化為新 FormControl
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() errorForGroup = false; // 用於 FormGroup 錯誤顯示
  @Input() showAll = false; // 是否顯示「全部」選項

  ynOptions: { label: string; value: string | null }[] = [];

  ngOnInit(): void {
    this.fieldState.initControl(this.control, this.controlName, this.label);
    this.ynOptions = this.showAll
      ? [
        { label: '全部', value: null },
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ]
      : [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' },
      ];
  }
}
