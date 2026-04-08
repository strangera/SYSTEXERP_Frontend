import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * 科目代號
 * 科目名稱
 */
export interface FIN52090Data {
  id?: number;
  AccNo: string;
  AccCName: string;
  NoteDesc: string;
}

export interface FIN52090Query extends BaseQueryRequest {
  AccNo?: string[];
  NoteDesc?: string;
  OrderBy?: string;
  Offset?: number;
}

export interface FIN52090Insert {
  id?: number;
  AccNo?: string;
  NoteDesc?: string;
}

export interface FIN52090InsertResponse {
  AccNo: string;
  NoteDesc: string;
}

export interface FIN52090UpdateRequest {
  id: number;
  AccNo?: string;
  NoteDesc?: string;
}

export interface FIN52090UpdateResponse {
  id: number;
  AccNo: string;
  NoteDesc: string;
}

export interface FIN52090DeleteRequest {
  Ids: number[];
}

export interface FIN52090DeleteResponse {
  // 空的 Response，只有基本欄位
}

export interface AccNoDropdown {
  AccNo: string;
  AccCName: string;
}
