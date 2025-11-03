/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

export interface FIN55050Detail {
  VouNo: string;
  Ven_Name: string | null;
  VouStatus: string | null;
  ORG_ID: string | null;
  Org_Name: string | null;
  ProjectNo: string | null;
  PTA: string | null;
  NoteDesc: string | null;
  AccAmt_D: number;
  AccAmt_C: number;
  OpeningBal: number;
}

export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}

export interface VouNoIndexEntry {
  parent: {
    AccNo: string;
    AccCName: string;
    VouDate: string;
  };
  rows: FIN55050Detail[];
  meta: VoucherMeta;
}

export interface VoucherMeta {
  vouNo: string;          // 傳票編號
  vouDate: string;        // 傳票日期
  vouStatus: string | null; // 狀態（從 rows 第一個非空的 VouStatus 推得）
  vouType: string | null;   // 傳票型態（若後端沒有，就先 null；可用 setVoucherType 設定）
}

@Injectable({ providedIn: 'root' })
export class FIN55050Store {
  private _dataset: FIN55050Data[] = [];
  private _vouNoIndex = new Map<string, VouNoIndexEntry>();

  /** 儲存整包 Data 並建立 VouNo 索引 + Meta（vouDate/vouStatus 自動帶入，vouType 先留空） */
  setResponse(data: FIN55050Data[] = []): void {
    this._dataset = data ?? [];
    this._vouNoIndex.clear();

    for (const parent of this._dataset) {
      for (const row of parent._Details || []) {
        const key = row.VouNo ?? '';
        if (!key) continue;

        if (!this._vouNoIndex.has(key)) {
          this._vouNoIndex.set(key, {
            parent: {
              AccNo: parent.AccNo,
              AccCName: parent.AccCName,
              VouDate: parent.VouDate,
            },
            rows: [],
            meta: {
              vouNo: key,
              vouDate: parent.VouDate,
              vouStatus: null,
              vouType: null,
            },
          });
        }

        const entry = this._vouNoIndex.get(key)!;
        entry.rows.push(row);

        // 取第一個非空 VouStatus 當 meta 狀態
        if (!entry.meta.vouStatus && row.VouStatus) {
          entry.meta.vouStatus = row.VouStatus;
        }
      }
    }
  }

  /** 依 VouNo 取出對應群組（包含 parent、rows、meta） */
  getByVouNo(vouNo: string): VouNoIndexEntry | null {
    return this._vouNoIndex.get(vouNo) ?? null;
  }

  /** 只拿 meta（抬頭要用） */
  getMeta(vouNo: string): VoucherMeta | null {
    return this._vouNoIndex.get(vouNo)?.meta ?? null;
  }

  /** 若之後你有來源可帶入傳票型態，可用此方法補上 */
  setVoucherType(vouNo: string, vouType: string | null): void {
    const entry = this._vouNoIndex.get(vouNo);
    if (entry) entry.meta.vouType = vouType;
  }

  /** Debug 協助 */
  get hasData(): boolean { return this._dataset.length > 0; }
  getVouNoKeys(): string[] { return Array.from(this._vouNoIndex.keys()); }
  getVouNoSize(): number { return this._vouNoIndex.size; }
}
