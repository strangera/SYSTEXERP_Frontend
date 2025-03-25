import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-checkbox-one',
  templateUrl: './checkbox-one.component.html',
  styleUrl: './checkbox-one.component.scss'
})
export class CheckboxOneComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
  }
}
