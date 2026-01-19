import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11050Tree } from '@pages/ass/ass11050/ass11050.component';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ASS11050Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  public getASS11050Tree(): Observable<BaseQueryResponse<ASS11050Tree>> {
    // return this.http.post<BaseQueryResponse<ASS11050Tree>>(`${this.apiUrl}/queryASS11050_tree_DropDownList`, {})

    // 模擬資料 - 返回測試用的樹狀結構資料
    return of({
      Status: "0000",
      Data: [
        // 第二層：[23] 室內裝潢工程
        { T_Id: "23", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: null, T_Name: "室內裝潢工程" },

        // 第三層：室內裝潢工程的子項目
        { T_Id: "2301", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "23 公區裝演(分樓層)", T_Name: "公區裝演(分樓層)" },
        { T_Id: "2402", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "24 普通裝潢補貼款(分品牌)", T_Name: "普通裝潢補貼款(分品牌)" },
        { T_Id: "2503", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "25 商場室直空間裝修工程", T_Name: "商場室直空間裝修工程" },
        { T_Id: "2604", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "26 護膚室裝潢", T_Name: "護膚室裝潢" },
        { T_Id: "2705", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "27 燈具工程", T_Name: "燈具工程" },
        { T_Id: "2806", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "28 商場室直空間裝修工程", T_Name: "商場室直空間裝修工程" },
        { T_Id: "2907", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "29 指標工程", T_Name: "指標工程" },
        { T_Id: "7708", T10Label: "A 裝潢工程", T20Label: "23 室內裝潢工程", T30Label: "77 辦公室裝潢", T_Name: "辦公室裝潢" },

        // 第二層：[24] 室內裝潢備品
        { T_Id: "24", T10Label: "A 裝潢工程", T20Label: "24 室內裝潢備品", T30Label: null, T_Name: "室內裝潢備品" }
      ],
      Error: null,
      Meta: {
        Timestamp: "2026-01-15T15:01:17.9430898+08:00",
        RequestId: "c8c3e2f8-50ea-4238-a4e4-6adaada8c20f"
      },
      Message: "成功",
      TotalCount: 0,
      TotalPage: 0
    } as unknown as BaseQueryResponse<ASS11050Tree>);
  }

}
