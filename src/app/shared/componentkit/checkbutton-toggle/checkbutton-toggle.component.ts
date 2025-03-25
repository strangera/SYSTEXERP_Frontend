import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-checkbutton-toggle',
  templateUrl: './checkbutton-toggle.component.html',
  styleUrl: './checkbutton-toggle.component.scss'
})
export class CheckbuttonToggleComponent extends BasicKitComponent implements OnInit {

  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() onLabel: string = '審核';
  @Input() offLabel: string = '未審核';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false;
  @Input() styleClass: string = 'w-9rem';
  @Input() ariaLabel: string = 'Do you confirm';

  ngOnInit(): void {
  }
}
