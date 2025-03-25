import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-time-one',
  templateUrl: './time-one.component.html',
  styleUrl: './time-one.component.scss'
})
export class TimeOneComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('請選擇時間', this.control);
  }
}

