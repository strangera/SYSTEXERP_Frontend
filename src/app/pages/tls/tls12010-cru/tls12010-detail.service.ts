// pos2005-handler.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Tls12010DetailService {
    // 共通操作
    handleRowSave(event: any): void {
        if (event && 'oldData' in event && 'newData' in event) {
            const { oldData, newData } = event;

            // 如果是新資料就保持 'new'
            if (newData.status !== 'new') {
                // 比對 old/new，有差異才設為 modified
                const keysToCompare = ['shop_area', 'other_shop', 'total_amt']; // 你關心的欄位
                const isModified = keysToCompare.some(key => oldData[key] !== newData[key]);

                if (isModified) {
                    newData.status = 'modified';
                }
            }

            console.log('儲存明細：', newData);
        } else {
            console.warn('收到未預期的事件格式:', event);
            this.handleRowCancel(event);
        }
    }

    handleRowCancel(event: any): void {
        console.log('取消主表格編輯:', event);
    }

    //---POS2005特定操作---
    generatePotentialCustomerDetailId(data: any[]): number {
        const maxId = Math.max(...data.map(p => p.id), 0);
        return maxId + 1;
    }

    addPotentialCustomerDetail(data: any[], defaultNew: any, tableRef: any): void {
        const newItem = {
            ...defaultNew,
            ID: this.generatePotentialCustomerDetailId(data),
            status: 'new'  // 👈 直接設好
        };

        console.log('新potential項目', newItem);
        data.push(newItem);

        // 進入編輯模式
        setTimeout(() => {
            const index = data.indexOf(newItem);
            if (index >= 0 && tableRef?.onRowEditInit) {
                tableRef.onRowEditInit(newItem, index);
            }
        }, 0);
    }

    deletePotentialCustomerDetail(selectedItems: any[], data: any[]): void {
        if (confirm(`確定要刪除 ${selectedItems.length} 個其他商場項目嗎？`)) {
            selectedItems.forEach(item => {
                const index = data.findIndex(d => d.ID === item.ID);
                if (index > -1) {
                    if (data[index].status === 'new') {
                        data.splice(index, 1);
                    } else {
                        data[index].status = 'deleted';
                    }
                }
            });
        }
    }
}