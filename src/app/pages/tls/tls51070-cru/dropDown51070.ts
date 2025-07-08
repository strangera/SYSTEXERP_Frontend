// pos2005-handler.service.ts
import { Injectable } from '@angular/core';
import { option } from '../../../shared/models/sys/sysb000.module';

@Injectable({
    providedIn: 'root',
})
export class dropDown51070 {
    // ---基本資料dropdown---
    statusOptions: option[] = [  //商品狀態
        { value: '1', label: '正常' },
        { value: '2', label: '停用' },
        { value: '3', label: '停進' },
        { value: '4', label: '下架' },
    ];

    // ---商品規格dropdown---
    attributeOptions: option[] = [ // 商品型態
        { value: '1', label: '一般' },
        { value: '2', label: '進口' },
        { value: '3', label: '買斷' },
        { value: '4', label: '試銷' },
        { value: '5', label: '寄賣' },
    ];
    taxTypeOptions: option[] = [ // 稅別
        { value: '0', label: '免稅' },
        { value: '1', label: '應稅' },
    ];
    pluTypeOptions: option[] = [ // 商品類別
        { value: '1', label: '一般商品' },
        { value: '8', label: '專櫃' },
        { value: 'CC', label: '專櫃商品' },
        { value: 'SC', label: '特殊條碼' }
    ];

    // ---POS2020 dropdown區---
    transTypeOption: option[] = [  //運輸方式
        { value: '1', label: '自行送貨' },
        { value: '2', label: '貨運' },
        { value: '3', label: '快遞' },
        { value: '4', label: '其它' },
    ];

    purchaseTypeOption: option[] = [  // 採購狀態
        { value: '1', label: '正常採購' }, // 預設
        { value: '2', label: '停止採購' },
    ];

}