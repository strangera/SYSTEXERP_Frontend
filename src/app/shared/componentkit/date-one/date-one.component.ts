import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-date-one',
  templateUrl: './date-one.component.html',
  styleUrl: './date-one.component.scss'
})
export class DateOneComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('請選擇日期', this.control);
  }
}
