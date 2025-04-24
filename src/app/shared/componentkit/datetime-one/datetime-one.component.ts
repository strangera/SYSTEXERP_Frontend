import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-datetime-one',
  templateUrl: './datetime-one.component.html',
  styleUrl: './datetime-one.component.scss'
})
export class DatetimeOneComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    // this.setPlaceholder('請選擇日期時間', this.control);
  }
}
