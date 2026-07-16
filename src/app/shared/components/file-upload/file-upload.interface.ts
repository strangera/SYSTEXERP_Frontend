// 透過 'as const' 斷言，可以讓這些字串成為常數，並提供更精確的字串字面量型別推斷
export const FileUploadAcceptConstants = {
  // 圖片類型
  IMAGES_ALL: 'image/*',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_SVG: 'image/svg+xml',

  // 文件類型
  DOCUMENTS_ALL_OFFICE: '.doc,.docx,.xls,.xlsx,.ppt,.pptx', // 廣泛的辦公室文件
  DOCUMENT_PDF: 'application/pdf',
  DOCUMENT_WORD_OLD: 'application/msword', // .doc
  DOCUMENT_WORD_NEW: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  DOCUMENT_EXCEL_OLD: 'application/vnd.ms-excel', // .xls
  DOCUMENT_EXCEL_NEW: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  DOCUMENT_POWERPOINT_OLD: 'application/vnd.ms-powerpoint', // .ppt
  DOCUMENT_POWERPOINT_NEW: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  DOCUMENT_TEXT: 'text/plain',
  DOCUMENT_CSV: 'text/csv',
  DOCUMENT_JSON: 'application/json',
  DOCUMENT_XML: 'application/xml,text/xml', // 通常兩種都接受

  // 壓縮檔類型
  ARCHIVE_ZIP: 'application/zip',
  ARCHIVE_RAR: 'application/x-rar-compressed',

  // 音訊類型
  AUDIO_ALL: 'audio/*',
  AUDIO_MP3: 'audio/mpeg',
  AUDIO_WAV: 'audio/wav',

  // 視訊類型
  VIDEO_ALL: 'video/*',
  VIDEO_MP4: 'video/mp4',
} as const; // 使用 'as const' 斷言，讓物件的屬性值變為字面量型別

// 定義一個介面，用於描述 FileUploadAcceptConstants 的結構
// 這有助於在 IDE 中進行自動完成和型別檢查
export interface IFileUploadAcceptTypes {
  IMAGES_ALL: typeof FileUploadAcceptConstants.IMAGES_ALL;
  IMAGE_JPEG: typeof FileUploadAcceptConstants.IMAGE_JPEG;
  IMAGE_PNG: typeof FileUploadAcceptConstants.IMAGE_PNG;
  IMAGE_GIF: typeof FileUploadAcceptConstants.IMAGE_GIF;
  IMAGE_SVG: typeof FileUploadAcceptConstants.IMAGE_SVG;

  DOCUMENTS_ALL_OFFICE: typeof FileUploadAcceptConstants.DOCUMENTS_ALL_OFFICE;
  DOCUMENT_PDF: typeof FileUploadAcceptConstants.DOCUMENT_PDF;
  DOCUMENT_WORD_OLD: typeof FileUploadAcceptConstants.DOCUMENT_WORD_OLD;
  DOCUMENT_WORD_NEW: typeof FileUploadAcceptConstants.DOCUMENT_WORD_NEW;
  DOCUMENT_EXCEL_OLD: typeof FileUploadAcceptConstants.DOCUMENT_EXCEL_OLD;
  DOCUMENT_EXCEL_NEW: typeof FileUploadAcceptConstants.DOCUMENT_EXCEL_NEW;
  DOCUMENT_POWERPOINT_OLD: typeof FileUploadAcceptConstants.DOCUMENT_POWERPOINT_OLD;
  DOCUMENT_POWERPOINT_NEW: typeof FileUploadAcceptConstants.DOCUMENT_POWERPOINT_NEW;
  DOCUMENT_TEXT: typeof FileUploadAcceptConstants.DOCUMENT_TEXT;
  DOCUMENT_CSV: typeof FileUploadAcceptConstants.DOCUMENT_CSV;
  DOCUMENT_JSON: typeof FileUploadAcceptConstants.DOCUMENT_JSON;
  DOCUMENT_XML: typeof FileUploadAcceptConstants.DOCUMENT_XML;

  ARCHIVE_ZIP: typeof FileUploadAcceptConstants.ARCHIVE_ZIP;
  ARCHIVE_RAR: typeof FileUploadAcceptConstants.ARCHIVE_RAR;

  AUDIO_ALL: typeof FileUploadAcceptConstants.AUDIO_ALL;
  AUDIO_MP3: typeof FileUploadAcceptConstants.AUDIO_MP3;
  AUDIO_WAV: typeof FileUploadAcceptConstants.AUDIO_WAV;

  VIDEO_ALL: typeof FileUploadAcceptConstants.VIDEO_ALL;
  VIDEO_MP4: typeof FileUploadAcceptConstants.VIDEO_MP4;

  // 如果你希望動態組合，也可以在這裡定義一個方法簽名
  // getCombinedTypes?(types: Array<keyof typeof FileUploadAcceptConstants>): string;
}

// 由於我們使用 'as const' 已經提供了嚴格的型別推斷，
// 通常可以直接匯出 FileUploadAcceptConstants 物件來使用。
// IFileUploadAcceptTypes 介面主要用於文件化或當你需要更嚴格的結構時。
