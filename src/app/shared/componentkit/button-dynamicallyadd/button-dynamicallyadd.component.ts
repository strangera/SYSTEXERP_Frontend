import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-button-dynamicallyadd',
    templateUrl: './button-dynamicallyadd.component.html',
    styleUrl: './button-dynamicallyadd.component.scss',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [Button, TranslateModule],
})
export class ButtonDynamicallyaddComponent {
  @Input() label: string = '';
  labelAdd: string = 'addition';
  icon: string = 'pi pi-plus';
  buttonClass: string = 'button-dynamicallyadd';
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit();
  }
}
