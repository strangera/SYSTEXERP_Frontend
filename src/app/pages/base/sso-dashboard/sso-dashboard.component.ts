// src/app/pages/base/sso-dashboard/sso-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // 新增 OnDestroy
import { LayoutService } from '../../../layout/layout.service';
import { ApiResponse, AuthService } from '../../../service/system/auth.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { concatMap, finalize, Subscription, tap, throwError } from 'rxjs'; // 引入 tap
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiItem, SsoDashboardService } from './sso-dashboard.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrl: './sso-dashboard.component.scss',
})
export class SsoDashboardComponent implements OnInit, OnDestroy { // 實現 OnDestroy
  logo = 'assets/layout/images/logo.png';
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  items: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        {
          label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => {
            this.visible = true;
            this.form.reset();
            this.form.markAsPristine();
          }
        },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
      ],
    },
  ];

  urlItems: ApiItem[] = [];
  loading = true; // 預設為 true，因為 ngOnInit 會調用 fetchUrlList
  errorMessage = '';
  visible = false;
  form = this.formBuilder.group({
    code: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-_+=`~[]\\;\']).{4,8}$';
  formButtonLoading = false;
  noClose = false;

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    public router: Router,
    private ssoDashboardService: SsoDashboardService,
    private formBuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private messageService: NotificationService,
    private userCodeService: UserCodeService,
    private validationService: ValidationService
  ) {
    this.subscriptions.push(
      this.authService.user.subscribe((x) => {
        this.user = x;
        // 在這裡設置 code 字段的值，因為 user 可能會延遲加載
        if (this.user) {
          this.form.patchValue({ code: this.user.user_No });
        }
      }),
    );
  }

  ngOnInit() {
    this.fetchUrlList();
    // 密碼過期檢查移到 AuthService 的 isLoggedIn 或 AuthGuard
    // 或者在 SsoDashboardComponent 初始化時只讀取並顯示通知，不強制打開對話框
    // 如果要強制打開，確保其在獲取到 user.user_No 後才填充表單
    const userInfo = this.authService.currentUserValue; // 直接從 AuthService 獲取最新狀態
    if (userInfo && userInfo.USER_PwdExpireDate) {
      const passwordExpireDate = new Date(userInfo.USER_PwdExpireDate);
      if (passwordExpireDate <= new Date()) {
        this.messageService.warnBubble(
          '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
          '建議您定期更換密碼',
        );
        this.visible = true;
        this.noClose = true; // 禁用關閉，強制用戶修改密碼
        this.form.patchValue({ code: userInfo.user_No }); // 設置 user_No 到表單
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  fetchUrlList(): void {
    this.loading = true; // 在開始請求前設置為 true
    this.urlItems = [
      {
        System_Id: 'ERP',
        System_Name: '商場營運管理系統',
        System_Url: '/account/dashboard',
        System_ImgFile: 'EIP_Image',
      },
    ];
    this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
      this.ssoDashboardService.fetchUrlList().pipe(
        finalize(() => this.loading = false) // 無論成功失敗，在所有請求完成後將 loading 設為 false
      ).subscribe({
        next: (data) => {
          const sortedAndFilteredData = data.Data
            .sort((a: any, b: any) => {
              const seqNoA = Number(a.Seq_No);
              const seqNoB = Number(b.Seq_No);
              if (seqNoA === undefined || seqNoA === null) return 1;
              if (seqNoB === undefined || seqNoB === null) return -1;
              return seqNoA - seqNoB;
            })
            .filter((item: any) => item.IsEnable === 'Y');
          this.urlItems = [...this.urlItems, ...sortedAndFilteredData];
          // this.loading = false; // 這裡不需要設置 false，由 finalize 處理
        },
        error: (error) => {
          this.errorMessage = '無法載入 URL 清單。請稍後再試。';
          // this.loading = false; // 這裡不需要設置 false，由 finalize 處理
          console.error('API 錯誤:', error);
        },
      })
    );
  }

  navigateToUrl(item: ApiItem): void {
    this.loading = true; // 在開始導航邏輯前，設為 true
    if (this.urlItems.length > 0 && item === this.urlItems[0]) {
      // 導向內部系統 (this.urlItems[0])
      this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
        this.ssoDashboardService.Inner().pipe(
          concatMap((innerResponse: ApiResponse<any>) => {
            if (innerResponse.Status === '0000') {
              console.log("Inner API 成功:", innerResponse);
              // 不再設置 this.loading = true; 而是保持現有狀態，等待後續 API 完成
              return this.authService.getFunRightsInfo().pipe(
                concatMap(() => this.authService.queryAllSystemCode()), // getFunRightsInfo 成功後，接著呼叫 queryAllSystemCode
                tap(() => console.log('所有權限資料載入成功。')), // 僅用於日誌，不改變狀態
              );
            } else {
              console.error('Inner API 失敗:', innerResponse.Message);
              this.messageService.errorBubble(innerResponse.Message || '內部系統登入失敗，請稍後再試。');
              // 如果 Inner API 失敗，直接拋出錯誤，讓外層的 catchError 處理，並在 finalize 中將 loading 設為 false
              return throwError(() => new Error(innerResponse.Message || 'Inner API failed'));
            }
          }),
          finalize(() => this.loading = false) // 無論哪個環節失敗或成功，最後都將 loading 設為 false
        ).subscribe({
          next: () => {
            // 所有串聯 API 都成功後才導航
            console.log('所有 API 成功，即將導航。');
            this.router.navigate([item.System_Url]);
          },
          error: (error) => {
            console.error('載入權限資料或連線內部系統失敗:', error);
            this.messageService.errorBubble('連線內部系統或載入權限資料失敗。');
            // finalize 會自動處理 loading = false
          },
        })
      );
    } else {
      // 導向外部系統
      this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
        this.ssoDashboardService.Outer().pipe(
          finalize(() => this.loading = false) // 外部系統請求完成後，設置 loading 為 false
        ).subscribe({
          next: (response) => {
            if (response.Status === '0000' && response.Data && response.Data.AccessToken) {
              const accessToken = response.Data.AccessToken;
              console.log("取得的 AccessToken:", accessToken);
              const urlWithToken = `${item.System_Url}?token=${encodeURIComponent(accessToken)}`;
              window.open(urlWithToken, '_blank'); // 在新分頁打開
            } else {
              console.error('Outer API 未成功取得 AccessToken:', response);
              this.messageService.errorBubble('無法登入外部系統，請稍後再試。');
            }
          },
          error: (error) => {
            console.error('Outer API 請求失敗:', error);
            this.messageService.errorBubble('導航至外部系統失敗。');
          },
        })
      );
    }
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (frm.valid) {
      this.formButtonLoading = true;
      const query = {
        User_No: this.user?.user_No || '',
        Old_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.oldPassword),
        New_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.newPassword),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 密碼到期日設為90天後
      };
      this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
        this.userCodeService.changePassword(query).pipe(
          finalize(() => this.formButtonLoading = false) // 無論成功失敗，都重置按鈕載入狀態
        ).subscribe({
          next: () => {
            this.messageService.successBubble('密碼修改成功');
            this.authService.logout(); // 修改密碼成功後登出
            // this.formButtonLoading = false; // 這裡不需要，因為 finalize 會處理
          },
          error: (err) => {
            // 錯誤處理會由 ErrorHandlerService 負責顯示訊息
            console.error('Change password failed:', err);
            // this.formButtonLoading = false; // 這裡不需要，因為 finalize 會處理
          },
        })
      );
    }
  }
}
