import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/system/auth.service';
import { Sys1000Service } from '../service/SYS100/sys1000.service';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private sys1000Service: Sys1000Service) { }

  ngOnInit() {
    this.authService.getFunRightsInfo().subscribe();
    this.sys1000Service.getData().subscribe({
      next: response => {
        // 將轉換後的數據存入 sessionStorage
        sessionStorage.setItem('SYSTEMSetting', JSON.stringify(response));
        console.log('SYS1000 response data saved successfully');
      },
      error: error => {
        console.error('Failed to load SYS1000 data', error);
        // 處理 SYS1000 錯誤
      }
    });
  }
}
