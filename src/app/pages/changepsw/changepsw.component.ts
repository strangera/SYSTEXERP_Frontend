import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BasicQpageComponent } from '../../shared/componentextends/basic-qpage/basic-qpage.component';

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

  private readonly correctOldPassword = '123';

  constructor(private messageService: MessageService) {
    super();
  }

  ngOnInit() {
    this.steps = [
      { label: '舊密碼' },
      { label: '新密碼' },
      { label: '完成' }
    ];
  }

  next() {
    if (this.activeIndex === 0) {
      if (this.oldPassword !== this.correctOldPassword) {
        this.messageService.add({ severity: 'error', summary: '錯誤', detail: '舊密碼不正確' });
        return;
      }
    }

    if (this.activeIndex === 1) {
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
    // 模擬成功提交
    this.messageService.add({ severity: 'success', summary: '成功', detail: '密碼已變更' });

    // 重置表單
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.activeIndex = 0;
  }
}
