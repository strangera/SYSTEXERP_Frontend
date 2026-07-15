import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';

@Component({
  selector: 'app-radiobutton-yn',
  template: `
    <label [for]="controlName" class="flex gap-1">
  {{ label }}
  <span *ngIf="isRequired" class="text-red-500">*</span>
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

<app-control-messages [onerror]="submitted || (control.touched && control.invalid)"
  [control]="control"></app-control-messages>
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
    ControlMessagesComponent,
    EnterToTabDirective,
  ],
})
export class RadiobuttonYNComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl(); // 初始化為新 FormControl
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() errorForGroup = false; // 用於 FormGroup 錯誤顯示
  @Input() showAll = false; // 是否顯示「全部」選項

  ynOptions: { label: string; value: string | null }[] = [];

  ngOnInit(): void {
    this.initControl(this.control);
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
