import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@service/system/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from 'src/environments/environment';
import { BackendPerfTableComponent } from './backend-perfTable.component';
import { FrontendErrorTableComponent } from './frontend-error-table.component';

@Component({
  selector: 'app-perf-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    BackendPerfTableComponent,
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
        <div class="col-12 md:col-6">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-amber-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">慢速 API 警示事件</span>
              <div class="text-900 font-bold text-3xl">{{ backendPerfList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-amber-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-server text-amber-700 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="surface-card p-4 shadow-1 border-round border-left-3 border-pink-500 flex justify-content-between align-items-center">
            <div>
              <span class="block text-500 font-medium mb-2">前端崩潰異常次數</span>
              <div class="text-900 font-bold text-3xl">{{ frontendErrorList.length }} 筆</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-pink-100 border-round" style="width:2.5rem;height:2.5rem">
              <i class="pi pi-desktop text-pink-700 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4 shadow-2 border-round bg-white p-4">
        <app-backend-perf-table [data]="backendPerfList" (onView)="openLogDetails($event)"></app-backend-perf-table>
      </div>

      <div class="shadow-2 border-round bg-white p-4">
        <app-frontend-error-table [data]="frontendErrorList" (onView)="openLogDetails($event)"></app-frontend-error-table>
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
  backendPerfList: any[] = [];
  frontendErrorList: any[] = [];
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
    this.http.get<any[]>(`${environment.ApiUrl}/TSRDERP_Main/Controllers/api/ClientLog/get-perf-summary`).subscribe({
      next: (res) => {
        this.backendPerfList = res.filter(x => x.MainModule !== 'Frontend');
        this.frontendErrorList = res.filter(x => x.MainModule === 'Frontend');
      },
      error: (err) => console.error('無法撈取系統效能摘要清單:', err)
    });
  }

  openLogDetails(row: any): void {
    this.selectedLogTitle = `📄 原始日誌 ── 【${row.SubTask} > ${row.ActionName.replace('Client_', '')}】`;

    this.http.get<any>(`${environment.ApiUrl}/TSRDERP_Main/Controllers/api/ClientLog/get-log-content?relativePath=${row.RelativePath}`).subscribe({
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
