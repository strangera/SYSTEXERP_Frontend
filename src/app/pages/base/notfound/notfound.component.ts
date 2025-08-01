import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  standalone: true,
  imports: [ButtonModule],
})
export class NotfoundComponent {
  constructor(private router: Router) { }
  goHome(): void {
    this.router.navigate(['/']);
  }
}
