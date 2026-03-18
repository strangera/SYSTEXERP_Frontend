import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ErrorReportService {
  constructor(private primengMessageService: MessageService) { }

  /**
 * 觸發錯誤檔提示 Toast
 * @param filePath 後端回傳的錯誤檔相對路徑
 * @param message 提示文字
 */
  public showImportError(filePath: string, message = '請下載錯誤報告並修正資料後重新上傳。') {
    this.primengMessageService.add({
      key: 'importError',
      sticky: true,
      severity: 'warn', // 建議改為 warn (橘色)，因為這是使用者資料問題而非系統崩潰 (error/紅色)
      summary: 'Excel 檢核未通過', // 讓使用者一眼看出是「檔案內容」的問題
      detail: message,
      data: filePath
    });
  }
}
