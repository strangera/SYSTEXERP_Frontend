import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageService, ImageUploadRequest } from '@service/utility/image.service';
import { EditorInitEvent, EditorModule, EditorTextChangeEvent } from 'primeng/editor';
import { environment } from 'src/environments/environment';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly imageService = inject(ImageService);

  constructor() {
    super();
  }
  ngOnInit(): void {
    this.initControl(this.control);
    // validateHtmlContent(this.control.value, this.control);
    // 因為輸入後再全空會有剩下html標籤，所以把他刪掉
    this.control.valueChanges.subscribe((value) => {
      if (!value) return;
      const isOnlyHtmlTags = /^<[^>]+>(<\/[^>]+>)*$/.test(value.trim());
      if (isOnlyHtmlTags) {
        this.control.setValue('');
      }
      // validateHtmlContent(value, this.control); // 驗證html標籤，自訂義
    });
  }

  onInit(event: any) {
    const quill = event.editor;
    if (!quill) return;

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

        this.imageService.uploadImages(body).subscribe({
          next: (res: any) => {
            const uploadResult = res.Data?.[0];
            if (uploadResult?.ImageUrl) {
              const finalUrl = `${environment.ApiUrl}${uploadResult.ImageUrl}`;
              // 這裡插入圖片到當前游標位置
              quill.insertEmbed(range.index, 'image', finalUrl);
              quill.setSelection(range.index + 1);
            }
            resolve(true);
          },
          error: () => reject('Upload failed')
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
          // 根據後端 ApiResponse 結構取出 Data
          // res.Data 會是 [{ fileName: '...', imageUrl: '/IMAGES/...' }]
          const uploadResult = res.Data?.[0];

          if (uploadResult?.imageUrl) {
            const range = quill.getSelection();
            // 使用環境變數組合完整的 API 位址 (如果需要的話)
            // 或者後端如果給的是絕對路徑，直接用即可
            const finalUrl = `${environment.ApiUrl.replace('/api', '')}${uploadResult.imageUrl}`;

            quill.insertEmbed(range.index, 'image', finalUrl);
          }
        });
      }
    };
  }

  onTextChange(event: EditorTextChangeEvent) {
    this.textChange.emit(event);
  }
}
