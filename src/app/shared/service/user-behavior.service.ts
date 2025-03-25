import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
// 記錄 User 的行為
export class UserBehaviorService {
  private behaviors: string[] = [];

  constructor() { }

  logBehavior(behavior: string) {
    const timestamp = new Date().toISOString();
    this.behaviors.push(`${timestamp} - ${behavior}`);

    // 發送到伺服器
    /*
      this.http.post('https://your-server.com/api/log', { behavior, timestamp }).subscribe();
     */

    // 或者儲存在本地儲存
    // localStorage.setItem('userBehaviors', JSON.stringify(this.behaviors));
  }

  getBehaviors() {
    return this.behaviors;
  }
}
