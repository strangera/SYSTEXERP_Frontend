import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { COMMON_IMPORTS } from '../demo-imports';

@Component({
  selector: 'app-example-multi',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    MultiSelectComponent
  ],
  templateUrl: './example-multi.component.html',
})
export class ExampleMultiComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    multiSelect: [[], Validators.required],
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
    console.log('ExampleMultiComponent initialized');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('Multi-select form submitted with values:', frm.value.multiSelect);
    });
  }
}
