import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageService, ImageUploadRequest } from '@service/utility/image.service';
import { EditorInitEvent, EditorModule, EditorTextChangeEvent } from 'primeng/editor';
import { environment } from 'src/environments/environment';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { editorModules } from './editor.model';
@Component({
  selector: 'app-editor-text',
  templateUrl: './editor-text.component.html',
  styleUrls: [
    './editor-text.component.scss',
    './quill.core.scss',
    './quill.snow.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, EditorModule, FormsModule, ReactiveFormsModule, ControlMessagesComponent, EnterToTabDirective],
  hostDirectives: [FieldStateDirective],
})
export class EditorTextComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl(); // 給使用者看的
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() textLength = 0;
  @Input() htmlLength = 0;
  @Output() textChange = new EventEmitter<EditorTextChangeEvent>();
  @Output() init = new EventEmitter<EditorInitEvent>();
  modules = editorModules;
  private readonly imageService = inject(ImageService);

  ngOnInit(): void {
    this.fieldState.initControl(this.control, this.controlName, this.label);
    // validateHtmlContent(this.control.value, this.control);
    // 因為輸入後再全空會有剩下html標籤，所以把他刪掉
    this.control.valueChanges.subscribe((value) => {
      if (!value) return;
      const isOnlyHtmlTags = /^<[^>]+>(<\/[^>]+>)*$/.test(value.trim());
      if (isOnlyHtmlTags) {
        this.control.setValue('');
      }
    });
  }

  onInit(event: any) {
    const quill = event.editor;
    if (!quill) return;
    quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
      if (source === 'user') {
        console.log('[Editor] 內容發生變更 (Source: User)');
      }
      // 觀察 HTML 變化
      console.log('[Editor] 目前編輯器內容:', quill.root.innerHTML);
    });
    // 1. 攔截工具列按鈕點擊
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', () => this.imageHandler(quill));

    // 2. 攔截 複製貼上 & 拖拽 (這是最重要的)
    // 當有檔案被丟進編輯器時，會觸發這個 uploader
    quill.getModule('uploader').options.handler = (range: any, files: File[]) => {
      const promise = new Promise((resolve, reject) => {
        // 這裡直接複用你寫好的上傳邏輯，但改成處理陣列
        const file = files[0];
        if (!file || !file.type.match(/^image\//)) return reject('Not an image');

        const body = {
          IMG_Type: 'POS5101',
          IMG_SeqNo: '0',
          Files: [file]
        };

        this.imageService.uploadImages(body).subscribe((res: any) => {
          console.log('[Editor] Uploader 上傳回應:', res);
          const uploadResult = res.Data?.[0];
          if (uploadResult?.ImageUrl) {
            const finalUrl = `${environment.ApiUrl}${uploadResult.ImageUrl}`;
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', finalUrl);

            // 【關鍵 Log】確認這裡有沒有觸發同步
            console.log('[Editor] Uploader 插入圖片後的 HTML:', quill.root.innerHTML);

            const html = quill.root.innerHTML;
            this.control.setValue(html, { emitEvent: true });
            this.control.markAsDirty();
            console.log('[Editor] FormControl 已同步更新');
          }
        });
      });
    };

    this.init.emit(event);
  }

  private imageHandler(quill: any) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const body: ImageUploadRequest = {
          IMG_Type: 'POS5101',
          IMG_SeqNo: '0',
          Files: [file]
        };

        this.imageService.uploadImages(body).subscribe((res: any) => {
          const uploadResult = res.Data?.[0];
          if (uploadResult?.ImageUrl) {
            const finalUrl = `${environment.ApiUrl.replace('/api', '')}${uploadResult.ImageUrl}`;
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', finalUrl);
            quill.setSelection(range.index + 1);

            // --- 強制同步：將編輯器內容塞回 Angular Control ---
            const html = quill.root.innerHTML;
            this.control.setValue(html);
            this.control.updateValueAndValidity(); // 強制觸發 Angular 驗證機制
            this.control.markAsDirty(); // 告訴 Angular 資料已變更

            console.log('[Editor] 已手動將圖片 HTML 同步至 FormControl:', html);
          }
        });
      }
    };
  }

  onTextChange(event: EditorTextChangeEvent) {
    this.textChange.emit(event);
  }
}
