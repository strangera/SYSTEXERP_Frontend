import { UserCodeService } from './../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BasicQpageComponent } from '../../shared/componentextends/basic-qpage/basic-qpage.component';
import { NotificationService } from '../../shared/service/notification.service';
import { EncryptionService } from '../../shared/service/encryption.service';

// 存在sectionStorage的用戶資料
export interface UserInfo {
  AccessToken: string;
  USER_PwdExpireDate: string;
  id: string;
  user_Name: string;
  user_No: string;
  user_email: string;
}

@Component({
  selector: 'app-changepsw',
  templateUrl: './changepsw.component.html',
  styleUrls: ['./changepsw.component.scss'],
  providers: [MessageService]
})

export class ChangepswComponent extends BasicQpageComponent implements OnInit {
  steps: MenuItem[] = [];
  activeIndex = 0;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  userInfo: UserInfo | null = null; // 用來儲存從 sessionStorage 取得的資料

  // private readonly correctOldPassword = '123';

  constructor(
    private messageService: MessageService,
    private notemessage: NotificationService,
    private encrypt: EncryptionService,
    private userCodeService: UserCodeService,
  ) {
    super();
  }

  ngOnInit() {
    this.steps = [
      { label: '輸入密碼' },
      // { label: '新密碼' },
      { label: '完成' }
    ];

    // 取得儲存在 sessionStorage 裡的資料
    const userInfoString = sessionStorage.getItem('UserInfo');

    // 檢查是否有資料，並轉成物件
    if (userInfoString) {
      try {
        this.userInfo = JSON.parse(userInfoString) as UserInfo;
        console.log('用戶資料',this.userInfo); // 可以看到你 response.Data 裡的內容
      } catch (error) {
        console.error('Failed to parse user info from sessionStorage', error);
      }
    }
  }

  next() {
    if (this.activeIndex === 0) {
      if (!this.isPasswordValid()) {
        this.messageService.add({ severity: 'warn', summary: '格式錯誤', detail: '新密碼長度需至少6字，並且兩次輸入需一致' });
        return;
      }
    }

    this.activeIndex++;
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  isPasswordValid(): boolean {
    return (
      this.newPassword.length >= 6 &&
      this.newPassword === this.confirmPassword
    );
  }

  submit() {
    // const reqest = {
    //   "User_No": this.userInfo?.user_No,
    //   "New_password": this.newPassword,
    //   "Old_password": this.oldPassword,
    //   "PwdExpireDate": this.userInfo?.USER_PwdExpireDate,
    // };

    // console.log('reqest', reqest);
    const userCode = this.userInfo?.user_No || null;

    if(userCode) {
      const query = {
        User_No: this.userInfo?.user_No,
        Old_password: this.encrypt.getPassword(this.userInfo!.user_No, this.oldPassword),
        New_password: this.encrypt.getPassword(this.userInfo!.user_No, this.newPassword),
        PwdExpireDate: this.userInfo?.USER_PwdExpireDate,
      };

      console.log('提交條件', query);

      this.userCodeService.changePassword(query).subscribe({
        next: () => {
          this.notemessage.successBubble('密碼修改成功');
        },
        error: (error) => {
          console.error('密碼修改失敗:', error);
          this.notemessage.errorBubble('密碼修改失敗，請稍後再試。');
        },
        complete: () => {
          // this.messageService.unblockUi();
          this.submitted = false;
        }
      });
    }else{
      console.error('用戶代碼無效');
    }

    // 模擬成功提交
    this.messageService.add({ severity: 'success', summary: '成功', detail: '密碼已變更' });

    // 重置表單
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.activeIndex = 0;
  }
}
