import { Component } from '@angular/core';
import { LayoutComponent } from '../core/layout/layout.component';
import { RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [LayoutComponent, RouterOutlet],
})
export class PagesComponent {
}
