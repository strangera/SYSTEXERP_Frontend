import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { KeyItem } from '../tls42010.mapper';

@Component({
  selector: 'app-tls42010-grid',
  standalone: true,
  imports: [CommonModule, TabViewModule],
  template: `
    <p-tabView [activeIndex]="activeIndex" (activeIndexChange)="onPageChange($event)" class="kb-tabview">
      <p-tabPanel *ngFor="let page of pages; index as i" [header]="(i + 1).toString()">
        <div class="kb-grid"
             [style.gridTemplateColumns]="'repeat(' + xCount + ', 1fr)'"
             [style.gridTemplateRows]="'repeat(' + yCount + ', 60px)'">
          <ng-container *ngFor="let k of page; trackBy: trackByKey">
            <button *ngIf="!k.isHidden" type="button" class="kb-key"
                    [class.active]="selected?.code === k.code"
                    [ngStyle]="k.buttonStyle"
                    [style.grid-column]="k.gridStyle?.['grid-column']"
                    [style.grid-row]="k.gridStyle?.['grid-row']"
                    (click)="keyClick.emit({key: k, event: $event})">
              <div class="kb-line" *ngIf="k.KB_Display1">{{ k.KB_Display1 }}</div>
              <div class="kb-line" *ngIf="k.KB_Display2">{{ k.KB_Display2 }}</div>
              <div class="kb-sub" *ngIf="!k.KB_Display1 && !k.KB_Display2">&nbsp;</div>
            </button>
          </ng-container>
        </div>
      </p-tabPanel>
    </p-tabView>
  `,
  styleUrls: ['./tls42010-grid.component.scss'] // 移入原本在主元件的 grid 相關 CSS
})
export class TLS42010GridComponent {
  @Input() pages: KeyItem[][] = [];
  @Input() activeIndex = 0;
  @Input() selected?: KeyItem;
  @Input() xCount = 8;
  @Input() yCount = 5;

  @Output() activeIndexChange = new EventEmitter<number>();
  @Output() keyClick = new EventEmitter<{ key: KeyItem, event: MouseEvent }>();

  onPageChange(index: number) {
    this.activeIndexChange.emit(index);
  }

  trackByKey(index: number, item: KeyItem): string {
    return item.code || index.toString();
  }
}
