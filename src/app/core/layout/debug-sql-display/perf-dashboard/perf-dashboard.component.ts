import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@service/system/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from 'src/environments/environment';
import { BackendPerfTableComponent } from './backend-perfTable.component';
import { BackendErrorTableComponent } from './backend-error-table.component';
import { ClientApiErrorTableComponent } from './client-api-error-table.component';
import { FrontendErrorTableComponent } from './frontend-error-table.component';

@Component({
  selector: 'app-perf-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TabViewModule,
    TooltipModule,
    BackendPerfTableComponent,
    BackendErrorTableComponent,
    ClientApiErrorTableComponent,
    FrontendErrorTableComponent
  ],
  template: `
    <div class="p-4 bg-gray-100 min-h-screen">
      <div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-4 pb-3 border-bottom-1 border-300 gap-3">
        <h2 class="text-3xl font-bold m-0 text-900 flex align-items-center gap-2">
          <i class="pi pi-shield text-primary text-3xl"></i> TSRD 系統上線全域維運儀表板
        </h2>
        <p-button label="同步刷新日誌" icon="pi pi-refresh" styleClass="p-button-raised p-button-primary" (onClick)="loadAllLogs()"></p-button>
      </div>

      <div class="grid mb-4">
        <div class="col-12 sm:col-6 md:col-3">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-pink-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">前端執行期錯誤</span>
              <div class="text-900 font-bold text-3xl">{{ frontendErrorList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-pink-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-desktop text-pink-700 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="col-12 sm:col-6 md:col-3">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-red-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">後端 API 錯誤</span>
              <div class="text-900 font-bold text-3xl">{{ backendErrorList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-red-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-exclamation-triangle text-red-700 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="col-12 sm:col-6 md:col-3">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-orange-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">前端遭遇 API 錯誤</span>
              <div class="text-900 font-bold text-3xl">{{ clientApiErrorList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-wifi text-orange-700 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="col-12 sm:col-6 md:col-3">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-amber-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">API 慢速效能事件</span>
              <div class="text-900 font-bold text-3xl">{{ backendPerfList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-amber-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-server text-amber-700 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="shadow-2 border-round bg-white p-3">
        <p-tabView>
          <p-tabPanel header="① 前端執行期錯誤">
            <app-frontend-error-table [data]="frontendErrorList" (onView)="openLogDetails($event)"></app-frontend-error-table>
          </p-tabPanel>
          <p-tabPanel header="② 後端 API 錯誤">
            <app-backend-error-table [data]="backendErrorList" (onView)="openLogDetails($event, 'backend')"></app-backend-error-table>
          </p-tabPanel>
          <p-tabPanel header="③ 前端遭遇 API 錯誤">
            <app-client-api-error-table [data]="clientApiErrorList" (onView)="openLogDetails($event)"></app-client-api-error-table>
          </p-tabPanel>
          <p-tabPanel header="④ API 慢速效能">
            <app-backend-perf-table [data]="backendPerfList" (onView)="openLogDetails($event)"></app-backend-perf-table>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>

    <p-dialog [header]="selectedLogTitle" [(visible)]="displayDialog" [modal]="true"
              [style]="{ width: '75vw' }" [breakpoints]="{ '960px': '95vw' }"
              [draggable]="false" [resizable]="false" styleClass="perf-log-dialog">

      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between w-full pr-3">
          <span class="text-xl font-bold text-800">{{ selectedLogTitle }}</span>
          <p-button icon="pi pi-copy" label="複製日誌內容"
                    styleClass="p-button-sm p-button-secondary p-button-outlined"
                    pTooltip="點擊複製完整 Log" tooltipPosition="bottom"
                    (onClick)="copyLogToClipboard()">
          </p-button>
        </div>
      </ng-template>

      <div class="log-content-box">
        <pre class="m-0"><code>{{ selectedLogContent }}</code></pre>
      </div>
    </p-dialog>
  `,
  styles: [`
    ::ng-deep .perf-log-dialog .p-dialog-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 1.5rem;
    }
    ::ng-deep .perf-log-dialog .p-dialog-content {
      padding: 0 !important;
    }
    .log-content-box {
      background: #1c1c1c;
      color: #e0e0e0;
      font-family: 'Fira Code', 'Consolas', monospace;
      padding: 1.5rem;
      margin: 0;
      max-height: 65vh;
      overflow-y: auto;
      font-size: 13px;
      line-height: 1.6;
    }
    .font-monospace {
      font-family: 'Consolas', monospace;
    }
  `]
})
export class PerfDashboardComponent implements OnInit {
  frontendErrorList: any[] = [];   // ① 純前端 JS 崩潰（沒打到 API）
  backendErrorList: any[] = [];    // ② 後端 API 例外（NLog ERROR/FATAL）
  clientApiErrorList: any[] = [];  // ③ 前端遭遇的 API 錯誤（使用者端視角）
  backendPerfList: any[] = [];     // ④ 後端 API 慢速效能
  displayDialog = false;
  selectedLogTitle = '';
  selectedLogContent = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUserStr = this.authService.currentUserValue?.user_No || '';
    if (currentUserStr !== 'admin') {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadAllLogs();
  }

  loadAllLogs(): void {
    const base = `${environment.ApiUrl}/BasicEIP_Core/DiagnosticsModule/api/ClientLog`;

    // logs_TsrPerf：前端崩潰 + 前端遭遇API錯誤 + 慢速效能，以後端標記的 LogType 分流。
    this.http.get<any[]>(`${base}/get-perf-summary`).subscribe({
      next: (res) => {
        this.frontendErrorList = res.filter(x => x.LogType === 'FrontendError');
        this.clientApiErrorList = res.filter(x => x.LogType === 'ClientApiError');
        this.backendPerfList = res.filter(x => x.LogType === 'Performance');
      },
      error: (err) => console.error('無法撈取系統效能摘要清單:', err)
    });

    // NLog 後端例外，獨立來源、獨立分頁。
    this.http.get<any[]>(`${base}/get-error-summary`).subscribe({
      next: (res) => this.backendErrorList = res,
      error: (err) => console.error('無法撈取後端 API 錯誤清單:', err)
    });
  }

  // root：'backend' → 後端 NLog error 日誌（${basedir}/logs）；省略 → logs_TsrPerf（前端崩潰／慢速）。
  openLogDetails(row: any, root: 'perf' | 'backend' = 'perf'): void {
    const title = (row.ActionName ?? row.SubTask ?? '').replace('Client_', '');
    this.selectedLogTitle = `📄 原始日誌 ── 【${row.SubTask} > ${title}】`;

    const params = `relativePath=${encodeURIComponent(row.RelativePath)}&root=${root}`;
    this.http.get<any>(`${environment.ApiUrl}/BasicEIP_Core/DiagnosticsModule/api/ClientLog/get-log-content?${params}`).subscribe({
      next: (res) => {
        this.selectedLogContent = res.Content;
        this.displayDialog = true;
      },
      error: (err) => console.error('無法讀取該日誌詳細內容:', err)
    });
  }

  copyLogToClipboard(): void {
    navigator.clipboard.writeText(this.selectedLogContent).then(() => {
      // 這裡如果專案有導入 PrimeNG MessageService (Toast)，可以用 Toast 提示更優雅
      alert('日誌已成功複製到剪貼簿！');
    });
  }
}
