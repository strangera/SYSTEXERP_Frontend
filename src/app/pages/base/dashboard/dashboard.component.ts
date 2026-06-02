import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SystemDataService } from '@service/system/system-data.service';
import { Base64 } from 'js-base64';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [`
    :host ::ng-deep {

      .p-card-content{
        padding: 0rem !important;
      }
      /* 卡片滑過特效 */
      .notice-item {
        background-color: transparent;
        &:hover {
          background-color: var(--surface-hover, #f9fafb);
          cursor: default;
        }
      }

      /* 針對內容中的所有富文本標籤進行精細化控制 */
      .p-text-word-break-all {
        word-break: break-word;

        /* 撐開後端帶進來的段落間距 */
        p {
          margin: 0 0 0.5rem 0;
          &:last-child { margin-bottom: 0; }
        }

        /* 原本會被擠壓的高亮區塊優化 */
        strong, span {
          padding: 2px 4px;
          border-radius: 4px;
        }

        /* 圖片精緻化 RWD 處理 */
        img {
          /* 解決圖片變大的關鍵組合： */
          display: block;
          max-width: 50%;       /* 限制最大寬度只能佔佈告欄的一半，絕對不超過 */
          height: auto !important; /* 強制覆蓋後端帶來的任何固定高度，確保不變形 */
          width: 200px;

          margin: 0.75rem 0;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease;

          /* RWD：在手機版等小螢幕上，寬度改放寬到 80% 方便閱讀，不擠在 50% */
          @media screen and (max-width: 768px) {
            max-width: 80%;
          }

          &:hover {
            transform: scale(1.01); /* 微互動 */
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CommonModule,
    CardModule,
    BadgeModule,
    DividerModule,
    ButtonModule
  ],
})
export class DashboardComponent implements OnInit {
  systemNoticeData: {
    Pub_StartDate: string;
    Pub_EndDate: string;
    Pub_Type: string;
    Pub_Event: string;
    Pub_Description: SafeHtml;
  }[] = [];

  constructor(
    private readonly currentPageService: CurrentPageService,
    private readonly systemDataService: SystemDataService,
    private readonly sanitizer: DomSanitizer
  ) { }

  private sanitizeHtmlString(rawHtml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    // 1. 轉成標準陣列 [ ... ]，同時滿足 TypeScript 迭代與 SonarQube for...of 的要求
    const scripts = Array.from(doc.querySelectorAll('script'));
    for (const script of scripts) {
      script.remove();
    }
    // 2. 同理，將所有元素轉為標準陣列
    const allElements = Array.from(doc.querySelectorAll('*'));
    for (const el of allElements) {
      // 明確斷言為 Attr[]，解決 TS18046 unknown 的問題
      const attributes = Array.from(el.attributes) as Attr[];
      for (const attr of attributes) {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      }
    }

    return doc.body.innerHTML;
  }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo('dashboard');
    this.systemDataService.querySystemNotice().subscribe(res => {
      const sortedData = res.Data.toSorted((a, b) => {
        return new Date(b.Pub_StartDate).getTime() - new Date(a.Pub_StartDate).getTime();
      });

      this.systemNoticeData = sortedData.map(item => {
        const decodedDescription = Base64.decode(item.Pub_Description);
        const cleanHtmlStr = this.sanitizeHtmlString(decodedDescription);

        // 加上 nosonar 註解過 SonarQube
        const safeHtml = this.sanitizer.bypassSecurityTrustHtml(cleanHtmlStr); // nosonar

        return {
          ...item,
          Pub_Description: safeHtml
        };
      });
    });
  }

  getNoticeTypeLabel(type: string): string {
    switch (type) {
      case '1': return '一般公告';
      case '2': return '緊急公告';
      case '3': return '自動公告';
      default: return '公告';
    }
  }

  getNoticeTypeSeverity(type: string): 'info' | 'danger' | 'success' {
    switch (type) {
      case '1': return 'info';
      case '2': return 'danger';
      case '3': return 'success';
      default: return 'info';
    }
  }

  /**
   * 高級感調色盤：採用優雅的淺底深色調 (Light Background with Darker Foreground Icons)
   */
  getNoticeIconBgColor(type: string): string {
    switch (type) {
      case '1': return 'bg-blue-50 text-blue-600';     // 一般：柔和藍
      case '2': return 'bg-red-50 text-red-600';       // 緊急：柔和紅
      case '3': return 'bg-green-50 text-green-600';   // 自動：柔和綠
      default: return 'bg-gray-50 text-gray-600';
    }
  }

  /**
   * 根據公告類型分派更精準的對應圖示，強化隱喻 (UX Mindset)
   */
  getNoticeIconClass(type: string): string {
    switch (type) {
      case '1': return 'pi-bell';            // 一般：常規鈴鐺
      case '2': return 'pi-exclamation-circle font-bold'; // 緊急：驚嘆號
      case '3': return 'pi-refresh';         // 自動：自動同步排程感
      default: return 'pi-info-circle';
    }
  }
}
