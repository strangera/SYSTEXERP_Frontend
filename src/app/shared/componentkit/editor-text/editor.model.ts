import { FormControl } from "@angular/forms";

export const editorModules = {
  toolbar: [
    [{ 'header': [false, 1, 2, 3, 4, 5, 6] }],
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    [{ 'list': 'ordered' }, { 'list': 'bullet' },
      // { 'list': 'check' }
    ],
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    // ['blockquote', 'code-block'],
    // ['link', 'image', 'video', 'formula'],
    // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    // [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction
    // [{ 'size': [false, 'large', 'huge'] }],  // custom dropdown
    // [{ 'font': [] }],
    // [{ 'align': [] }],
    // ['clean']                                         // remove formatting button
  ],
};

// 驗證html標籤，自訂義
export function validateHtmlContent(value: string, control: FormControl): void {
  if (!value) {
    return;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  // 允許的標籤
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 'span'];
  // 允許的 style 屬性 (僅 color 和 background-color)
  const allowedStyles = ['color', 'background-color'];
  const validRgbRegex = /^rgb\(\s?\d{1,3},\s?\d{1,3},\s?\d{1,3}\s?\)$/;
  let isValid = true;
  // 遍歷所有標籤
  doc.body.querySelectorAll('*').forEach((node) => {
    const tagName = node.tagName.toLowerCase();
    // 標籤不允許
    if (!allowedTags.includes(tagName)) {
      isValid = false;
      return;
    }
    // 若為 <span>，檢查 style 屬性
    if (tagName === 'span' && node.hasAttribute('style')) {
      const styleValue = node.getAttribute('style') || '';
      const styleRules = styleValue.split(';').map(rule => rule.trim()).filter(rule => rule);
      for (const rule of styleRules) {
        const [property, value] = rule.split(':').map(item => item.trim());
        // 屬性不允許
        if (!allowedStyles.includes(property)) {
          isValid = false;
          return;
        }
        // 顏色格式錯誤
        if (!validRgbRegex.test(value)) {
          isValid = false;
          return;
        }
      }
    }
  });
  if (!isValid) {
    control.setErrors({ invalidHtml: true });
  }
}
