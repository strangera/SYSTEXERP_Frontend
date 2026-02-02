import { Injectable } from '@angular/core';
import { WorkflowStatus, ContractDataStructure } from '../../core/models';

/**
 * 儲存資料介面
 */
interface StoredWorkflowData {
  workflowStatus: WorkflowStatus;
  contractData: ContractDataStructure;
  savedAt: string;
  version: number;
}

/**
 * 工作流程儲存服務
 *
 * 職責: 處理 SessionStorage 的讀寫操作
 * - 保存工作流程狀態
 * - 恢復工作流程狀態
 * - 清除儲存資料
 */
@Injectable({ providedIn: 'root' })
export class WorkflowStorageService {
  private readonly STORAGE_KEY = 'TLS13010_V2_WORKFLOW';
  private readonly STORAGE_VERSION = 1;

  /**
   * 保存工作流程資料到 SessionStorage
   */
  save(workflowStatus: WorkflowStatus, contractData: ContractDataStructure): void {
    try {
      const data: StoredWorkflowData = {
        workflowStatus: this.serializeWorkflowStatus(workflowStatus),
        contractData: this.serializeContractData(contractData),
        savedAt: new Date().toISOString(),
        version: this.STORAGE_VERSION
      };

      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[WorkflowStorageService] 保存失敗:', error);
    }
  }

  /**
   * 從 SessionStorage 載入工作流程資料
   */
  load(): StoredWorkflowData | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data: StoredWorkflowData = JSON.parse(stored);

      // 版本檢查
      if (data.version !== this.STORAGE_VERSION) {
        console.warn('[WorkflowStorageService] 版本不符，清除舊資料');
        this.clear();
        return null;
      }

      return {
        workflowStatus: this.deserializeWorkflowStatus(data.workflowStatus),
        contractData: this.deserializeContractData(data.contractData),
        savedAt: data.savedAt,
        version: data.version
      };
    } catch (error) {
      console.error('[WorkflowStorageService] 載入失敗:', error);
      this.clear();
      return null;
    }
  }

  /**
   * 清除 SessionStorage 中的工作流程資料
   */
  clear(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[WorkflowStorageService] 清除失敗:', error);
    }
  }

  /**
   * 檢查是否有儲存的資料
   */
  hasStoredData(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * 取得儲存時間
   */
  getSavedAt(): Date | null {
    const data = this.load();
    return data ? new Date(data.savedAt) : null;
  }

  // ========== 序列化方法 ==========

  private serializeWorkflowStatus(status: WorkflowStatus): WorkflowStatus {
    return {
      ...status,
      lastModified: status.lastModified instanceof Date
        ? status.lastModified
        : new Date(status.lastModified)
    };
  }

  private serializeContractData(data: ContractDataStructure): ContractDataStructure {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt instanceof Date
          ? data.metadata.createdAt
          : new Date(data.metadata.createdAt),
        lastModified: data.metadata.lastModified instanceof Date
          ? data.metadata.lastModified
          : new Date(data.metadata.lastModified)
      }
    };
  }

  // ========== 反序列化方法 ==========

  private deserializeWorkflowStatus(status: WorkflowStatus): WorkflowStatus {
    return {
      ...status,
      lastModified: new Date(status.lastModified)
    };
  }

  private deserializeContractData(data: ContractDataStructure): ContractDataStructure {
    return {
      ...data,
      metadata: {
        ...data.metadata,
        createdAt: new Date(data.metadata.createdAt),
        lastModified: new Date(data.metadata.lastModified)
      }
    };
  }
}
