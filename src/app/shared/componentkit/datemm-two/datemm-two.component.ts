import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-datemm-two',
  templateUrl: './datemm-two.component.html',
  styleUrl: './datemm-two.component.scss'
})
// 發票: 兩個月為一起 (需要調整，因為不確定回傳欄位是什麼)
export class DatemmTwoComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  // 設置 selectedYear 為當前年份
  selectedYear: number = new Date().getFullYear();
  selectedMonthRange: any;
  monthRanges: any[] = [];

  ngOnInit() {
    // Required *
    this.checkRequiredValidator(this.control);
    this.generateMonthRanges(this.selectedYear);
  }

  onYearSelect(event: any) {
    this.selectedYear = event.getFullYear();
  }

  generateMonthRanges(year: number) {
    this.monthRanges = [];

    for (let month = 0; month < 12; month += 2) {
      const startMonthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
      const endMonthName = new Date(year, month + 1, 1).toLocaleString('default', { month: 'short' });
      const rangeLabel = `${startMonthName}-${endMonthName}`;
      const rangeValue = { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
      this.monthRanges.push({ label: rangeLabel, value: rangeValue });
    }
  }
}
