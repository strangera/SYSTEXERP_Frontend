import { Component, OnInit } from '@angular/core';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Base64 } from 'js-base64';
// 引入 PrimeNG 相關元件
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button'; // 如果未來需要按鈕，可以先引入
import { SystemDataService } from '@service/system/system-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    CardModule,
    BadgeModule,
    DividerModule,
    ButtonModule // 確保已引入
  ],
})
export class DashboardComponent implements OnInit {

  systemNoticeData: {
    Pub_StartDate: string,
    Pub_EndDate: string,
    Pub_Type: string,
    Pub_Event: string,
    Pub_Description: string | SafeHtml
  }[] = [];

  constructor(
    private currentPageService: CurrentPageService,
    private readonly systemDataService: SystemDataService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo('dashboard');
    this.systemDataService.querySystemNotice().subscribe(res => {
      const sortedData = res.Data.sort((a, b) => {
        return new Date(b.Pub_StartDate).getTime() - new Date(a.Pub_StartDate).getTime();
      });

      this.systemNoticeData = sortedData.map(item => {
        const decodedDescription = Base64.decode(item.Pub_Description);
        return {
          ...item,
          Pub_Description: this.sanitizer.bypassSecurityTrustHtml(decodedDescription)
        };
      });
    });
  }

  // 輔助函式：取得公告型別的文字標籤
  getNoticeTypeLabel(type: string): string {
    switch (type) {
      case '1': return '一般公告';
      case '2': return '緊急公告';
      case '3': return '自動公告';
      default: return '公告';
    }
  }

  // 輔助函式：取得 PrimeNG Badge 的嚴重性等級 (決定徽章顏色)
  getNoticeTypeSeverity(type: string): 'info' | 'danger' | 'success' {
    switch (type) {
      case '1': return 'info';    // 一般公告: 藍色
      case '2': return 'danger';  // 緊急公告: 紅色
      case '3': return 'success'; // 自動公告: 綠色 (或可以選 warning, secondary, primary)
      default: return 'info';
    }
  }

  // 新增輔助函式：取得鈴鐺圖示圓圈背景的顏色 (使用 PrimeFlex 背景色類別)
  getNoticeIconBgColor(type: string): string {
    switch (type) {
      case '1': return 'bg-blue-500';   // 一般公告
      case '2': return 'bg-red-500';    // 緊急公告
      case '3': return 'bg-green-500';  // 自動公告
      default: return 'bg-blue-500';
    }
  }
}
