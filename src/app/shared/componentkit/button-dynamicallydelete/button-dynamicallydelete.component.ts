import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CRUDStatus } from '../../enum/CRUDstatus';

@Component({
  selector: 'app-button-dynamicallydelete',
  templateUrl: './button-dynamicallydelete.component.html',
  styleUrl: './button-dynamicallydelete.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ButtonDynamicallydeleteComponent {
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create; // 從父元件接收 CRUDStatus
  @Input() IsDelete: boolean = false; // 清除或者刪除
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  handleClick() {
    this.onClick.emit();
  }
  isRead(): boolean {
    return this.crudstatus !== CRUDStatus.Read;
  }
  getIcon() {
    return this.IsDelete ? 'pi pi-trash' : ''; // Create 狀態時顯示 pi-plus
  }
  getLabel() {
    return this.IsDelete ?  'delete' : 'remove'; // Create 狀態時顯示 pi-plus
  }
  getButtonClass() {
    return this.IsDelete ?  'button-dynamicallydelete' : 'button-dynamicallyremove'; // Create 狀態時顯示 pi-plus
  }
}
