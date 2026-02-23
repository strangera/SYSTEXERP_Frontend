// TODO: 待 API 規格確定後更新所有介面欄位

export interface FIN41010ConvertRequest {
  year: string;
  version: string;
  orgId: string;
}

export interface FIN41010ApproveRequest {
  year: string;
  version: string;
  orgId: string;
}

export interface FIN41010Response {
  Status: string;
  Message: string;
  Data: unknown;
}
