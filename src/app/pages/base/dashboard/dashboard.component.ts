import { Component, OnInit, } from '@angular/core';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  constructor(
    private currentPageService: CurrentPageService
  ) { }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo('dashboard');
  }
}
