// src/app/components/input-text/input-text.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonComponent } from '../button/button.component';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { InputTextService } from './input-text.service';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TooltipModule,
    ButtonComponent,
    ControlMessagesComponent,
  ],
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() showCopyButton = false;
  @Input() customPlaceholder?: string;

  @Input() alwaysShowPlaceholder?: boolean = false; //總是顯示placeholder  [customPlaceholder]="'選擇'" [alwaysShowPlaceholder]="true"
  @Input() errorForGroup = false;
  @Input() showStar = false;
  @Input() showButton = false;
  @Input() buttonLabel = '';
  @Input() buttonLoading = false;
  @Input() copyControl = new FormControl();
  @Input() showErrorMessage = true;
  @Input() disabled = false;
  @Input() weightedMax: number | null = null;

  @Output() clickButton = new EventEmitter<unknown>();
  @Output() inputChange = new EventEmitter<Event>();

  value = '*****************************************';
  private isComposing = false;
  atMaxLength = false;

  constructor(private inputTextService: InputTextService) {
    super();
  }

  ngOnInit(): void {
    this.initControl(this.control);
    if (this.disabled) {
      this.control.disable();
    }
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(e: Event): void {
    this.isComposing = false;
    this.onInput(e);
  }

  onInput(event: Event): void {
    if (this.isComposing) return;

    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    const previousValue = this.control.value;

    this.atMaxLength = false;

    // 處理加權長度或一般長度
    if (this.weightedMax !== null) {
      const { trimmedValue, isMaxLength } = this.inputTextService.trimToWeighted(value, this.weightedMax);
      value = trimmedValue;
      this.atMaxLength = isMaxLength;
    } else if (this.maxLength && value.length > this.maxLength) {
      value = value.slice(0, this.maxLength);
      this.atMaxLength = true;
    }

    if (previousValue !== value) {
      this.control.setValue(value, { emitEvent: false });
      inputElement.value = value;
    }

    if (this.copyControl) {
      this.copyControl.setValue(this.control.value, { emitEvent: false });
    }

    this.inputChange.emit(event);
  }

  onClick(): void {
    this.clickButton.emit();
  }
}
