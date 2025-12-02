import { Component, inject } from '@angular/core';
import { environment } from '@environment';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar-version',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="version-info" [pTooltip]="tooltipText" tooltipPosition="bottom">
      <i class="pi pi-info-circle"></i>
      <span class="version-text">{{ version }}</span>
    </div>
  `,
  styles: [`
    .version-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      cursor: help;
      user-select: none;
      transition: all 0.2s;
      border-radius: var(--border-radius);

      &:hover {
        background-color: var(--surface-hover);
        color: var(--primary-color);
      }

      .pi-info-circle {
        font-size: 1rem;
      }

      .version-text {
        font-family: 'Courier New', monospace;
        font-weight: 500;
      }
    }

    @media (max-width: 768px) {
      .version-info {
        font-size: 0.75rem;
        padding: 0.375rem 0.5rem;

        .version-text {
          display: none;
        }
      }
    }
  `]
})
export class AppTopbarVersionComponent {
  public version: string = environment.version;
  public tooltipText: string = `系統版本：${environment.version}\n環境：${environment.production ? '正式環境' : '開發環境'}`;
}
