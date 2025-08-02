import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { COMMON_IMPORTS } from '../demo-imports';

@Component({
  selector: 'app-example-input',
  standalone: true,
  imports: [
    InputTextComponent,
    InputTextRangeComponent,
    InputTextareaComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    COMMON_IMPORTS
  ],
  templateUrl: './example-input.component.html',
})
export class ExampleInputComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    text: ['', [Validators.required, Validators.maxLength(20)]],
    text1: ['', [Validators.required, Validators.maxLength(20)]],
    text2: ['', [Validators.required, Validators.maxLength(20)]],
    textarea: ['', [Validators.required, Validators.maxLength(200)]],
    number: [null, [Validators.required, Validators.max(9999999)]],
    number1: [null, [Validators.required, Validators.max(9999), Validators.min(0)]],
    number2: [null, [Validators.required, Validators.max(9999999), Validators.min(0)]],
  });

  ngOnInit(): void {

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
