import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [
    RouterOutlet,
  ],
})
export class ReportsComponent {
}
