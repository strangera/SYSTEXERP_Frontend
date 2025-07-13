import { Component, OnInit, } from '@angular/core';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: true,
    imports: [RouterLink],
})
export class DashboardComponent implements OnInit {

  constructor(
    private currentPageService: CurrentPageService
  ) { }

  ngOnInit(): void {
    this.currentPageService.setCurrentProgNo('dashboard');
  }
}
