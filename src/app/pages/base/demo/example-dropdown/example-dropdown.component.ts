import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, Validators } from '@angular/forms';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';

@Component({
  selector: 'app-example-dropdown',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    DropdownRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    RadiobuttonYNComponent,
  ],
  templateUrl: './example-dropdown.component.html',
})
export class ExampleDropdownComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    dropdown: ['', Validators.required],
    dropdownRangeStart: ['', Validators.required],
    dropdownRangeEnd: ['', Validators.required],
    radiolist: ['', Validators.required],
    radioYN: ['', Validators.required],
  });

  systemTypeOptions = [
    { label: '選項1', value: 'option1' },
    { label: '選項2', value: 'option2' },
    { label: '選項3', value: 'option3' }
  ];
  constructor() {
    super();
  }
  ngOnInit(): void {
    console.log('ExampleDropdownComponent initialized');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('Dropdown form submitted with values:', frm.value);
    });
  }
}
