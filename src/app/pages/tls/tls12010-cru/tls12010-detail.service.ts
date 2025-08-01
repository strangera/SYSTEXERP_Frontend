// pos2005-handler.service.ts
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Tls12010DetailService {
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

    //---新增明細ID---
    generatePotentialId(data: any[]): number {
        const maxId = Math.max(...data.map(p => p.id), 0);
        return maxId + 1;
    }

    addPotential(data: any[], defaultNew: any, tableRef: any): void {
        console.log('defaultNew',defaultNew);
        const newPotential = {
            ...defaultNew,
            id: this.generatePotentialId(data), // 新增時將id指定為0
        };

        console.log('新潛在客戶項目', newPotential);
        data.push(newPotential);

        setTimeout(() => {
            const index = data.indexOf(newPotential);
            if (index >= 0 && tableRef?.onRowEditInit) {
                tableRef.onRowEditInit(newPotential, index);
            }
        }, 0);
    }

    deletePotential(selectedItems: any[], data: any[]): void {
        if (confirm(`確定要刪除 ${selectedItems.length} 個潛在客戶明細項目嗎？`)) {
            selectedItems.forEach(item => {
                const index = data.findIndex(d => d.id === item.id);
                if (index > -1) {
                    data.splice(index, 1);
                }
            });
            console.log(`已刪除 ${selectedItems.length} 筆明細`);
        }
    }
}