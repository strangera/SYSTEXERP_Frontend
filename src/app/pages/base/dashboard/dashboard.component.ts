import { Component, OnInit, } from '@angular/core';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
// 公告
export class DashboardComponent implements OnInit {

  constructor(
    private currentPageService: CurrentPageService
  ) { }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo('dashboard');
  }
}
