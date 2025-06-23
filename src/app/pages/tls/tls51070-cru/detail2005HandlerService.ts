// pos2005-handler.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class detail2005HandlerService {
    // 共通操作
    handleRowSave(event: any): void {
        if (event && 'oldData' in event && 'newData' in event) {
            console.log('儲存主表格行:', event);
        } else {
            console.warn('收到未預期的事件格式:', event);
            this.handleRowCancel(event);
        }
    }

    handleRowCancel(event: any): void {
        console.log('取消主表格編輯:', event);
    }

    //---POS2005特定操作---
    generate2005Id(data: any[]): number {
        const maxId = Math.max(...data.map(p => p.id), 0);
        return maxId + 1;
    }

    addPOS2005(data: any[], defaultNew: any, tableRef: any): void {
        const newPerson = {
            ...defaultNew,
            id: this.generate2005Id(data),
        };

        console.log('新2005項目', newPerson);
        data.push(newPerson);

        // 進入編輯模式
        setTimeout(() => {
            const index = data.indexOf(newPerson);
            if (index >= 0 && tableRef?.onRowEditInit) {
                tableRef.onRowEditInit(newPerson, index);
            }
        }, 0);
    }

    deletePOS2005(selectedItems: any[], data: any[], messageService: any): void {
        if (confirm(`確定要刪除 ${selectedItems.length} 個國際條碼項目嗎？`)) {
            selectedItems.forEach(item => {
                const index = data.findIndex(d => d.id === item.id);
                if (index > -1) {
                    data.splice(index, 1);
                }
            });
            messageService.successBubble(`已刪除 ${selectedItems.length} 個位置項目`);
        }
    }
}