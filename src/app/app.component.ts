import { Component, OnInit, } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';
import { ConfirmDialogModule } from "primeng/confirmdialog";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, NotificationMessageComponent, ConfirmDialogModule],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly primengConfig: PrimeNGConfig,
    private readonly translate: TranslateService,
  ) {
    this.translate.setDefaultLang('zh-tw');
    this.translate.use('zh-tw');
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation({
      today: '今天',
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dateFormat: 'yy/mm/dd',
      weekHeader: '週',
      emptyFilterMessage: '沒有符合條件的資料',
      passwordPrompt: '請輸入密碼',
      searchMessage: '搜尋中',	// { 0} results are available
      selectionMessage: '已選擇 {0} 個項目',	// { 0} items selected
      emptySelectionMessage: '沒有選擇', 	// No selected item
      emptySearchMessage: '沒有符合條件的資料',	// No results found
      emptyMessage: '沒有可供選擇的項目',	// No available options
      chooseYear: '選擇年份',
      chooseMonth: '選擇月份',
      chooseDate: '選擇日期',
      prevDecade: '上一個十年',
      nextDecade: '下一個十年',
      prevYear: '上一年',
      nextYear: '下一年',
      prevMonth: '上一月',
      nextMonth: '下一月',
      prevHour: '上一個小時',
      nextHour: '下一個小時',
      prevMinute: '上一分鐘',
      nextMinute: '下一分鐘',
      prevSecond: '上一秒',
      nextSecond: '下一秒',
      am: '上午',
      pm: '下午',
      weak: '弱',
      medium: '中',
      strong: '強',
      startsWith: '開頭為',
      contains: '包含',
      notContains: '不包含',
      endsWith: '結尾為',
      equals: '等於',
      notEquals: '不等於',
      noFilter: '無篩選器',
      lt: '小於',
      lte: '小於或等於',
      gt: '大於',
      gte: '大於或等於',
      dateIs: '日期為',
      dateIsNot: '日期不為',
      dateBefore: '日期在...之前',
      dateAfter: '日期在...之後',
      clear: '清除',
      apply: '應用',
      matchAll: '全部匹配',
      matchAny: '任何一個匹配',
      addRule: '新增規則',
      removeRule: '移除規則',
      accept: '是',
      reject: '否',
      choose: '選擇',
      upload: '上傳',
      cancel: '取消',
      pending: '待處理',
    });
  }
}
