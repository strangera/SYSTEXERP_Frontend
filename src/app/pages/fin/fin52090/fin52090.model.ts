import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * 科目代號
 * 科目名稱
 */
export interface FIN52090Data {
  AccNo: string;
  NoteDesc: string;
}

export interface FIN52090Query {
  AccNo?: string;
  NoteDesc?: string;
}

export interface FIN52090Insert {
  id?: number;
  AccNo?: string;
  NoteDesc?: string;
}

export interface AccNoDropdown {
  AccNo: string;
  AccCName: string;
}
