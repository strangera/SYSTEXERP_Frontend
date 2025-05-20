import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { LayoutService } from '../../../layout/layout.service';
import { ApiResponse, AuthService } from '../../../service/system/auth.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { Subscription } from 'rxjs';
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
export class SsoDashboardComponent implements OnInit {
  logo = 'assets/layout/images/logo.png';
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  data: UserInfo | null = null; // 使用者資料
  items: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => { this.visible = true; this.form.reset(); } },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
      ],
    },
  ];

  urlItems: ApiItem[] = [];
  loading = true;
  errorMessage = '';
  visible = false; // 控制對話框的顯示與隱藏
  form = this.formBuilder.group({
    code: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-_+=`~[]\\;\']).{4,8}$';
  formButtonLoading = false; // 控制按鈕的載入狀態
  noClose = false; // 禁用對話框的關閉

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    public router: Router,
    private ssoDashboardService: SsoDashboardService,
    private formBuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private messageService: NotificationService,
    private userCodeService: UserCodeService,
    private renderer: Renderer2,
    private el: ElementRef,
    private validationService: ValidationService
  ) {
    this.subscriptions.push(
      this.authService.user.subscribe((x) => (this.user = x)),
    );
  }
  ngOnInit() {
    try {
      const userInfo = sessionStorage.getItem('UserInfo');
      this.data = userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to parse UserInfo:', error);
    }
    this.fetchUrlList();

    const time = JSON.parse(sessionStorage.getItem('UserInfo') || '{}').USER_PwdExpireDate;
    if (time <= new Date().toISOString()) {
      this.messageService.warnBubble(
        '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
        '建議您定期更換密碼',
      );
      this.visible = true;
      this.noClose = true
    }
  }
  fetchUrlList(): void {
    this.loading = true;
    this.urlItems = [
      {
        System_Id: 'ERP',
        System_Name: '商場營運管理系統',
        System_Url: '/dashboard',
        System_ImgFile: 'EIP_Image',
      },
    ];
    this.ssoDashboardService.fetchUrlList().subscribe({
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
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = '無法載入 URL 清單。請稍後再試。';
        this.loading = false;
        console.error('API 錯誤:', error);
      },
    });
  }

  navigateToUrl(item: ApiItem): void {
    this.loading = true;
    if (this.urlItems.length > 0 && item === this.urlItems[0]) {
      // 導向內部系統 (this.urlItems[0])
      this.ssoDashboardService.Inner().subscribe({
        next: (innerResponse: ApiResponse<any>) => {
          // 檢查 Inner API 回應，根據你的 API 契約來判斷是否成功
          if (innerResponse.Status === '0000') {
            console.log("Inner API 成功:", innerResponse);
            // Inner API 成功後，再呼叫 getFunRightsInfo 並導航
            this.authService.getFunRightsInfo().subscribe({
              next: (sys1000Response) => {
                sessionStorage.setItem('SYSTEMSetting', JSON.stringify(sys1000Response));
                this.loading = false;
                this.router.navigate([item.System_Url]);
              },
              error: (error) => {
                console.error('getFunRightsInfo API 請求失敗:', error);
                this.loading = false;
                this.messageService.errorBubble('載入權限資料失敗，無法導航。');
              },
            });
          } else {
            // Inner API 返回非 0000 狀態碼，表示失敗
            console.error('Inner API 失敗:', innerResponse.Message);
            this.loading = false;
            this.messageService.errorBubble(innerResponse.Message || '內部系統登入失敗，請稍後再試。');
          }
        },
        error: (error) => {
          console.error('Inner API 請求失敗:', error);
          this.loading = false;
          this.messageService.errorBubble('連線內部系統失敗。');
        },
      });
    } else {
      // 導向外部系統
      this.ssoDashboardService.Outer().subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data && response.Data.AccessToken) {
            const accessToken = response.Data.AccessToken;
            console.log("取得的 AccessToken:", accessToken);
            // 使用 Form Post 方式將 AccessToken 傳遞給外部系統
            this.postToUrl(item.System_Url, { token: accessToken }); // 這裡的 'token' 需與外部系統約定
            this.loading = false; // 成功發送跳轉後停止載入
          } else {
            console.error('Outer API 未成功取得 AccessToken:', response);
            this.loading = false;
            this.messageService.errorBubble('無法登入外部系統，請稍後再試。');
          }
        },
        error: (error) => {
          console.error('Outer API 請求失敗:', error);
          this.loading = false;
          this.messageService.errorBubble('導航至外部系統失敗。');
        },
      });
    }
  }
  /**
 * @param url 目標 URL：要將 POST 請求發送到哪個外部系統的 URL。
 * @param params 要傳遞的參數對象：包含鍵值對，例如 { token: 'your_jwt_token' }。
 *
 * 這個函數動態建立一個 HTML `<form>` 表單，並透過 POST 請求將數據發送到指定的 URL。
 * 這通常用於 SSO (Single Sign-On) 中，安全地將 AccessToken 傳遞給其他系統，
 * 避免將敏感資訊暴露在 URL 查詢參數中。
 */
  private postToUrl(url: string, params: Record<string, string>) {
    // 1. 建立一個新的 HTML <form> 元素
    const form = this.renderer.createElement('form');

    // 2. 設定表單的屬性
    //    - method: 設定為 'POST'，確保數據在 HTTP 請求體中傳輸。
    this.renderer.setAttribute(form, 'method', 'POST');
    //    - action: 設定表單提交的目標 URL，即外部系統的入口點。
    this.renderer.setAttribute(form, 'action', url);
    //    - target: 設定為 '_blank'，讓表單提交後在新分頁打開目標 URL。
    this.renderer.setAttribute(form, 'target', '_blank');

    // 3. 遍歷 params 物件，為每個鍵值對建立隱藏的 <input> 元素
    for (const key in params) {
      // 檢查屬性是否是物件自身的屬性 (非原型鏈上的繼承屬性)，確保安全性和準確性。
      // Object.hasOwn() 是 ES2022 引入的，更簡潔且安全。
      if (Object.hasOwn(params, key)) {
        // 建立一個新的 HTML <input> 元素作為隱藏字段
        const hiddenField = this.renderer.createElement('input');
        // 設定輸入框的類型為 'hidden'，這樣它就不會顯示在頁面上。
        this.renderer.setAttribute(hiddenField, 'type', 'hidden');
        // 設定輸入框的 'name' 屬性，這個名字將作為 POST 請求中的參數鍵。
        this.renderer.setAttribute(hiddenField, 'name', key);
        // 設定輸入框的 'value' 屬性，這個值將作為 POST 請求中的參數值 (例如 AccessToken)。
        this.renderer.setAttribute(hiddenField, 'value', params[key]);
        // 將這個隱藏輸入框添加到表單中。
        this.renderer.appendChild(form, hiddenField);
      }
    }

    // 4. 將動態建立的表單臨時添加到當前組件的 DOM 結構中
    //    - `this.el.nativeElement` 指的是當前組件的根 DOM 元素。
    //    - 這是為了讓表單能夠被正確提交。
    this.renderer.appendChild(this.el.nativeElement, form);

    // 5. 提交表單
    //    - 這將觸發瀏覽器向表單的 'action' URL 發送一個 POST 請求。
    form.submit();

    // 6. 提交後立即從 DOM 中移除表單
    //    - 保持 DOM 的整潔，避免留下不需要的元素。
    this.renderer.removeChild(this.el.nativeElement, form);
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (frm.valid) {
      this.formButtonLoading = true;
      const query = {
        User_No: this.data?.user_No || '',
        Old_password: this.encryptionService.getPassword(this.data?.user_No || '', frm.value.oldPassword),
        New_password: this.encryptionService.getPassword(this.data?.user_No || '', frm.value.newPassword),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 密碼到期日設為90天後
      };
      this.userCodeService.changePassword(query).subscribe({
        next: () => {
          this.messageService.successBubble('密碼修改成功');
          this.authService.logout();
          this.formButtonLoading = false;
        },
        error: () => {
          this.formButtonLoading = false;
        },
      });
    }
  }
}
