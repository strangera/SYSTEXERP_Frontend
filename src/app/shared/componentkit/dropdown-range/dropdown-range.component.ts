import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { DropdownChangeEvent, DropdownLazyLoadEvent, DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dropdown-range',
  standalone: true,
  imports: [NgIf, InputGroupModule, FormsModule, DropdownModule, ReactiveFormsModule, NgClass, ControlMessagesComponent],
  templateUrl: './dropdown-range.component.html',
  styleUrl: './dropdown-range.component.scss'
})
export class DropdownRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() startControl: FormControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl: FormControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  @Input() errorForGroup = false;
  @Input() controlName = '';
  @Input() options: any[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() templateLabel = ''; // 自訂 Label 模板
  destroy$ = new Subject<void>(); // 銷毀訂閱
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();
  ngOnInit(): void {
    this.handleControlState(this.startControl);
    this.handleControlState(this.endControl);
    // 監聽 `disabled` 變化
    this.startControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleControlState(this.startControl);
    });
    this.endControl.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleControlState(this.endControl);
    });
  }

  onLazyLoad(event: DropdownLazyLoadEvent) {
    console.log(event);
  }

  private handleControlState(control: FormControl) {
    if (!control.disabled) {
      this.updateControlState(this.startControl, this.endControl);
      if (!this.placeholder) {
        this.placeholder = '請選擇';
      }
    }
  }

  onDropdownChange(event: DropdownChangeEvent) {
    this.changeEvent.emit(event);
  }
}
