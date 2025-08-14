import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { EditorInitEvent, EditorTextChangeEvent, EditorModule } from 'primeng/editor';
import { editorModules, validateHtmlContent } from './editor.model';
import { NgIf } from '@angular/common';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
@Component({
  selector: 'app-editor-text',
  templateUrl: './editor-text.component.html',
  styleUrl: './editor-text.component.scss',
  standalone: true,
  imports: [NgIf, EditorModule, FormsModule, ReactiveFormsModule, ControlMessagesComponent]
})
export class EditorTextComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl(); // 給使用者看的
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() textLength = 0;
  @Input() htmlLength = 0;
  @Output() textChange = new EventEmitter<EditorTextChangeEvent>();
  @Output() init = new EventEmitter<EditorInitEvent>();
  modules = editorModules;

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.checkRequiredValidator(this.control);
    this.checkIntLengthValidator(this.control);
    validateHtmlContent(this.control.value, this.control);
    // 因為輸入後再全空會有剩下html標籤，所以把他刪掉
    this.control.valueChanges.subscribe((value) => {
      if (!value) return;
      const isOnlyHtmlTags = /^<[^>]+>(<\/[^>]+>)*$/.test(value.trim());
      if (isOnlyHtmlTags) {
        this.control.setValue('');
      }
      validateHtmlContent(value, this.control); // 驗證html標籤，自訂義
    });
  }

  onInit(event: EditorInitEvent) {
    this.init.emit(event);
  }

  onTextChange(event: EditorTextChangeEvent) {
    this.textChange.emit(event);
  }
}
