import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@service/system/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
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
    BackendPerfTableComponent,
    FrontendErrorTableComponent
  ],
  template: `
    <div class="p-4 bg-gray-50 min-h-screen">
      <div class="flex justify-content-between align-items-center mb-4 pb-3 border-bottom-1 border-300">
        <h2 class="text-3xl font-bold m-0 text-900 flex align-items-center gap-2">
          <i class="pi pi-chart-bar text-primary text-3xl"></i> TSRD 系統上線全域維運儀表板
        </h2>
        <p-button label="同步刷新日誌" icon="pi pi-refresh" styleClass="p-button-raised" (onClick)="loadAllLogs()"></p-button>
      </div>

      <div class="mb-5 shadow-2 border-round bg-white p-3">
        <app-backend-perf-table [data]="backendPerfList" (onView)="openLogDetails($event)"></app-backend-perf-table>
      </div>

      <div class="shadow-2 border-round bg-white p-3">
        <app-frontend-error-table [data]="frontendErrorList" (onView)="openLogDetails($event)"></app-frontend-error-table>
      </div>
    </div>

    <p-dialog
      [header]="selectedLogTitle"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '80vw' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="perf-log-dialog">

      <div class="log-content-box">
        {{ selectedLogContent }}
      </div>
    </p-dialog>
  `,
  styles: [`
    ::ng-deep .perf-log-dialog .p-dialog-content {
      padding: 0 !important;
    }
    .log-content-box {
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Consolas', 'Courier New', monospace;
      padding: 20px;
      margin: 0;
      white-space: pre-wrap;
      max-height: 600px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.5;
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
    if (!(currentUserStr === 'admin')) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.loadAllLogs();
  }

  loadAllLogs(): void {
    this.http.get<any[]>(`${environment.ApiUrl}/TSRDERP_Main/Controllers/api/ClientLog/get-perf-summary`).subscribe({
      next: (res) => {
        // ✨ 一箭雙鵰：利用後端定義好的 MainModule 進行前端過濾分流
        this.backendPerfList = res.filter(x => x.MainModule !== 'Frontend');
        this.frontendErrorList = res.filter(x => x.MainModule === 'Frontend');
      },
      error: (err) => console.error('無法撈取系統效能摘要清單:', err)
    });
  }

  openLogDetails(row: any): void {
    this.selectedLogTitle = `📄 原始日誌內文 ──【${row.SubTask} > ${row.ActionName}】(${row.LogDate})`;

    // 呼叫後端讀取該實體檔案內容
    this.http.get<any>(`${environment.ApiUrl}/TSRDERP_Main/Controllers/api/ClientLog/get-log-content?relativePath=${row.RelativePath}`).subscribe({
      next: (res) => {
        this.selectedLogContent = res.Content;
        this.displayDialog = true;
      },
      error: (err) => console.error('無法讀取該日誌詳細內容:', err)
    });
  }
}
