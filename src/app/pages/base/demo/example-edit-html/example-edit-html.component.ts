import { Component, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../demo-imports';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-example-edit-html',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    EditorTextComponent,
  ],
  templateUrl: './example-edit-html.component.html',
})
export class ExampleEditHtmlComponent extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    editortext: ['', Validators.required],
  });
  constructor() {
    super();
  }
  ngOnInit(): void {
    console.log('ExampleEditHtmlComponent initialized');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('Form submitted:', frm.value);
    });
  }
}
