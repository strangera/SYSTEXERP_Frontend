import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss',
  standalone: true,
  imports: [NgIf, FormsModule, InputTextareaModule, ReactiveFormsModule, NgClass, ControlMessagesComponent]
})
export class InputTextareaComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() customPlaceholder: string | undefined;

  ngOnInit(): void {
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    this.initControl(this.control);
  }
}
