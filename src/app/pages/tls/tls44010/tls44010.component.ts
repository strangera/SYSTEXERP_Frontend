import { AsyncPipe, CommonModule, Location } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as signalR from '@microsoft/signalr';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';
import { filter, finalize, firstValueFrom, fromEvent } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EOSStatus, QueryTLS44010Response, TLS44010Service } from '../../../service/api/tls/tls44010.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { NotificationService } from '../../../shared/components/notification-message/notification.service';
import { EncryptionService } from '../../../shared/service/encryption.service';

// 狀態映射字典配置：將 0~5 的狀態配置化管理
const STATUS_CONFIG: Record<EOSStatus, { class: string; icon: string; color: string; label: string }> = {
  '0': { class: 'status-chip warning', icon: 'pi pi-pause', color: '#fd7e14', label: '暫停交易' },
  '1': { class: 'status-chip logout', icon: 'pi pi-sign-out', color: '#dc3545', label: '登出' },
  '2': { class: 'status-chip purple', icon: 'pi pi-wallet', color: '#6f42c1', label: '完成清帳' },
  '3': { class: 'status-chip success', icon: 'pi pi-sync', color: '#28a745', label: '交易中' },
  '4': { class: 'status-chip primary', icon: 'pi pi-users', color: '#0d6efd', label: '完成交班' },
  '5': { class: 'status-chip shutdown', icon: 'pi pi-power-off', color: '#6c757d', label: '關機' }
};

@Component({
  selector: 'app-tls44010',
  templateUrl: './tls44010.component.html',
  styleUrls: ['./tls44010.component.scss'],
  standalone: true,
  imports: [
    ButtonComponent, FormsModule, ReactiveFormsModule, TabMenuModule,
    TranslateModule, ButtonModule, TableModule, AccordionModule,
    CommonModule, MenubarComponent, InputTextModule, DataViewModule,
    DropdownComponent, MultiSelectComponent, TooltipModule, AsyncPipe,
    InputTextComponent, DialogModule, PasswordModule,
  ]
})
export class TLS44010Component extends BasicQueryPageComponent<QueryTLS44010Response> implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly tls44010Service = inject(TLS44010Service);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly location = inject(Location);
  private readonly encryptionService = inject(EncryptionService);
  private readonly notemessage = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private eosHubConnection?: signalR.HubConnection;

  @ViewChild('vncIframe') private readonly vncIframeRef?: ElementRef<HTMLIFrameElement>;

  queryForm = this.fb.nonNullable.group({
    ECR_No: [null],
    TLT_No: [null],
    tlt_building: [null],
    tlt_floor: [null],
    area_no: [null],
    EOS_IP: [''],
    EOS_Online: [''],
    Day: [0],
  });

  items: MenuItem[] = [{ label: '全部' }, { label: '連線機台' }, { label: '離線機台' }];
  activeItem: MenuItem | undefined = this.items[0];

  // 完美宣告：直接綁定新版快取選單機制
  ECRNoOptions$ = this.dropdownApiService.queryPos1002();
  CounterOptions$ = this.dropdownApiService.queryTltTalent();
  buildingNoOptions$ = this.dropdownApiService.querySys3800();
  floorOptions$ = this.dropdownApiService.querySys3900();

  globalFilter = '';
  data: QueryTLS44010Response[] = [];
  filteredData: QueryTLS44010Response[] = [];
  layout: 'list' | 'grid' = 'grid';

  vncDialogVisible = false;
  vncConnecting = false;
  selectedVncRow: QueryTLS44010Response | null = null;
  vncIframeUrl: SafeResourceUrl | null = null;

  vncControlDialogVisible = false;
  vncControlPassword = '';
  vncControlLoading = false;
  /** 本次 VNC 連線 session 是否已成功驗證過密碼；true 時再次接管控制不需重複輸入密碼 */
  private vncControlVerified = false;

  eosHubStatus: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';
  eosLastUpdated: Date | null = null;

  ngOnInit() {
    this.initializePage('TLS44010', '/TLS/TLS44010cru', this.queryForm, (form) => this.onSubmit(form));
    this.onSubmit(this.queryForm);

    fromEvent<MessageEvent>(globalThis, 'message')
      .pipe(
        filter(e => e.data?.type === 'REQUEST_CONTROL'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onVncControlRequest());

    this.connectEosStatusHub();
  }

  openVnc(row: QueryTLS44010Response) {
    if (!this.hasPermission(this.Actions.Connect)) {
      this.notemessage.errorBubble('您沒有「連線」操作權限');
      return;
    }
    this.selectedVncRow = row;
    this.vncDialogVisible = true;
  }

  async onVncDialogShow(): Promise<void> {
    if (!this.selectedVncRow) return;
    this.vncConnecting = true;
    this.vncIframeUrl = null;

    try {
      const res = await firstValueFrom(this.tls44010Service.createVncSession(this.selectedVncRow.ECR_No));
      const session = res?.Data;
      if (!session?.SessionToken) throw new Error('取得 VNC token 失敗');

      const wsBase = environment.ApiUrl
        .replace(/^https:\/\//i, 'wss://')
        .replace(/^http:\/\//i, 'ws://');

      const wsUrl = `${wsBase}/TLS0000/TLS4000/vnc/ws?token=${session.SessionToken}`;
      const viewerPath = this.location.prepareExternalUrl('assets/vnc-viewer.html');
      const ecrNo = this.selectedVncRow?.ECR_No ?? '';
      const tltName = this.selectedVncRow?.TLT_Name ?? '';
      // 不傳密碼，後端代理在 RFB 握手時已完成認證
      const iframeUrl = `${viewerPath}?wsUrl=${encodeURIComponent(wsUrl)}&ecrNo=${encodeURIComponent(ecrNo)}&tltName=${encodeURIComponent(tltName)}`;

      this.vncIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
    } catch (err) {
      console.error('VNC 連線失敗：', err);
    } finally {
      this.vncConnecting = false;
    }
  }

  onVncDialogHide() {
    this.vncIframeUrl = null;
    this.selectedVncRow = null;
  }

  private connectEosStatusHub(): void {
    this.eosHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.ApiUrl}/hubs/eos-status`, {
        accessTokenFactory: () => this.authService.currentUserValue?.AccessToken ?? ''
      })
      .withAutomaticReconnect()
      .build();

    this.eosHubConnection.on('StatusChanged', (changes: { ECR_No: string; Online: string }[]) => {
      console.log('[SignalR] StatusChanged:', changes);
      this.eosLastUpdated = new Date();
      let dirty = false;
      for (const change of changes) {
        const item = this.data.find(d => d.ECR_No === change.ECR_No);
        if (item) {
          item.EOS_Online = change.Online;
          dirty = true;
        }
      }
      if (dirty) this.filterDataByTab();
    });

    this.eosHubConnection.onreconnecting(() => { this.eosHubStatus = 'reconnecting'; });
    this.eosHubConnection.onreconnected(() => { this.eosHubStatus = 'connected'; });
    this.eosHubConnection.onclose(() => { this.eosHubStatus = 'disconnected'; });

    this.eosHubConnection.start()
      .then(() => { this.eosHubStatus = 'connected'; })
      .catch(err => console.error('EOS SignalR 連線失敗:', err));

    this.destroyRef.onDestroy(() => this.eosHubConnection?.stop());
  }

  onVncControlRequest(): void {
    if (!this.hasPermission(this.Actions.Control)) {
      this.notemessage.errorBubble('您沒有「控制」操作權限');
      this.vncIframeRef?.nativeElement.contentWindow?.postMessage({ type: 'CONTROL_DENIED' }, globalThis.location.origin);
      return;
    }
    // 本次 VNC 連線 session 已驗證過密碼，之後再接管控制不需重複輸入
    if (this.vncControlVerified) {
      this.vncIframeRef?.nativeElement.contentWindow?.postMessage({ type: 'CONTROL_GRANTED' }, globalThis.location.origin);
      return;
    }
    this.vncControlPassword = '';
    this.vncControlDialogVisible = true;
  }

  onVncControlCancel(): void {
    this.vncControlDialogVisible = false;
    this.vncControlPassword = '';
    this.vncIframeRef?.nativeElement.contentWindow?.postMessage({ type: 'CONTROL_DENIED' }, globalThis.location.origin);
  }

  onVncControlConfirm(): void {
    if (!this.vncControlPassword) return;
    this.vncControlLoading = true;

    const userNo = this.authService.currentUserValue?.user_No ?? '';
    const encrypted = this.encryptionService.getPassword(userNo, this.vncControlPassword);

    this.tls44010Service.verifyVncPassword(encrypted)
      .pipe(finalize(() => { this.vncControlLoading = false; }))
      .subscribe({
        next: () => {
          this.vncControlVerified = true;
          this.vncControlDialogVisible = false;
          this.vncControlPassword = '';
          this.vncIframeRef?.nativeElement.contentWindow?.postMessage({ type: 'CONTROL_GRANTED' }, globalThis.location.origin);
        },
        error: () => {
          this.notemessage.errorBubble('VNC 密碼錯誤，請重試');
          this.vncControlPassword = '';
        }
      });
  }

  /** 計算機台實際顯示狀態碼 */
  getDisplayStatus(row: QueryTLS44010Response): EOSStatus {
    if (row?.EOS_CloseTime) {
      return '2'; // 若有清帳時間，直接定義為「完成清帳」狀態
    }
    return (row?.EOS_Status ? String(row.EOS_Status).trim() : '5') as EOSStatus;
  }

  // 利用 STATUS_CONFIG 物件，消滅髒亂的大範圍 switch-case
  getStatusLabel(status: EOSStatus): string {
    return STATUS_CONFIG[status]?.label ?? '未知狀態';
  }

  getStatusIcon(status: EOSStatus): string {
    return STATUS_CONFIG[status]?.icon ?? 'pi pi-question-circle';
  }

  getStatusColor(status: EOSStatus): string {
    return STATUS_CONFIG[status]?.color ?? '#6c757d';
  }

  getStatusClass(status: EOSStatus): string {
    return STATUS_CONFIG[status]?.class ?? 'status-chip';
  }
  /** * 計算目前畫面上特定狀態的機台總數
   * @param status 狀態碼 '0' ~ '5'
   */
  getStatusCount(status: EOSStatus): number {
    if (!this.filteredData || this.filteredData.length === 0) return 0;
    return this.filteredData.filter(row => this.getDisplayStatus(row) === status).length;
  }
  onSubmit(form: FormGroup) {
    this.loading = true;
    const rawValue = form.getRawValue();
    const payload = {
      ...rawValue,
      PageSize: 9999,
      PageIndex: 1,
      ECR_No: rawValue.ECR_No,
      TLT_No: [rawValue.TLT_No],
      tlt_building: [rawValue.tlt_building],
      tlt_floor: [rawValue.tlt_floor],
      area_no: [rawValue.area_no]
    };

    this.tls44010Service.queryTLS44010(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe((res) => {
        this.data = res?.Data || [];
        this.filterDataByTab();
      });
  }

  onTabChange(item: MenuItem) {
    this.activeItem = item;
    this.filterDataByTab();
  }

  private filterDataByTab() {
    const label = this.activeItem?.label || '全部';

    if (label.includes('全部')) {
      this.filteredData = [...this.data];
    } else if (label.includes('連線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === 'Y');
    } else if (label.includes('離線')) {
      this.filteredData = this.data.filter(d => d.EOS_Online === 'N' || !d.EOS_Online);
    }
    this.applyFilter();
  }

  applyFilter() {
    const keyword = this.globalFilter?.toLowerCase().trim();
    if (!keyword) return;

    this.filteredData = this.filteredData.filter(row =>
      row.ECR_LocNo?.toLowerCase().includes(keyword) ||
      row.ECR_No?.toLowerCase().includes(keyword) ||
      row.TLT_No?.toLowerCase().includes(keyword) ||
      row.TLT_Name?.toLowerCase().includes(keyword) ||
      this.getStatusLabel(this.getDisplayStatus(row)).includes(keyword)
    );
  }
}
