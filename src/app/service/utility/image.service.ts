import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@service/system/auth.service';

// 定義圖片相關的資料模型
export interface ImageQueryRequest {
  IMG_Type: string;
  IMG_SeqNo: string;
}

export interface ImageDetail {
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  id: number;
  IMG_Type: string;
  IMG_SeqNo: string;
  IMG_Path: string;
  IMG_File: string;
  IMG_Remark: string;
}

export interface ImageUploadRequest {
  IMG_Type: string;
  IMG_SeqNo: string;
  IMG_Remark?: string;
  Files: File[];
}

export interface ImageDownloadRequest {
  IMG_Type: string;
  IMG_SeqNo: string;
  IMG_File: string;
}

export interface ImageDeleteRequest {
  IMG_Type: string;
  IMG_SeqNo: string;
  IMG_File: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = 'http://localhost:5142/Image';

  constructor(private readonly http: HttpClient) { }

  /**
   * 查詢圖片資料
   * @param request 包含 IMG_Type 和 IMG_SeqNo 的物件
   * @returns 圖片資料列表的 Observable
   */
  queryImages(request: ImageQueryRequest): Observable<ApiResponse<ImageDetail[]>> {
    return this.http.post<ApiResponse<ImageDetail[]>>(`${this.apiUrl}/queryImage`, request);
  }

  /**
   * 上傳圖片
   * @param request 包含圖片上傳所需的資料
   * @returns 上傳結果的 Observable
   */
  uploadImages(request: ImageUploadRequest): Observable<unknown> {
    const formData = new FormData();
    formData.append('IMG_Type', request.IMG_Type);
    formData.append('IMG_SeqNo', request.IMG_SeqNo);
    if (request.IMG_Remark) {
      formData.append('IMG_Remark', request.IMG_Remark);
    }

    // 遍歷所有檔案並添加到 FormData 中
    for (const file of request.Files) {
      formData.append('files', file);
    }

    // 注意：上傳檔案通常不需要設定 Content-Type，瀏覽器會自動處理
    return this.http.post(`${this.apiUrl}/uploadImages`, formData);
  }

  /**
   * 下載圖片
   * @param request 包含 IMG_Type, IMG_SeqNo 和 IMG_File 的物件
   * @returns 圖片檔案 Blob 的 Observable
   */
  downloadImage(request: ImageDownloadRequest): Observable<Blob> {
    // 這裡我們假設後端回傳的是檔案流，所以設定 responseType 為 'blob'
    return this.http.post(`${this.apiUrl}/downloadImage`, request, {
      responseType: 'blob'
    });
  }

  /**
   * 刪除圖片資料
   * @param request 包含 IMG_Type, IMG_SeqNo 和 IMG_File 的物件
   * @returns 刪除結果的 Observable
   */
  deleteImage(request: ImageDeleteRequest): Observable<unknown> {
    // 這裡我們假設後端回傳的是一個 JSON 物件
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      body: request // DELETE 請求的 body
    };
    return this.http.delete(`${this.apiUrl}/deleteImage`, options);
  }
}
