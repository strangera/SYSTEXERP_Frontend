import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface FIN52010Data {
  AccNoAP: string;
  AccNoAR: string;
  AccNoCurPL: string;
  AccNoInTax: string;
  AccNoOutTax: string;
  AccNoPost: string;
  AccNoPriPL: string;
  AccNoRemitFee: string;
  AccNoTotPL: string;
  AccYear: string;
  CashAccNo: string;
  CloseDate: string;
  CompNo: string;
  ORG_ID: string;
  OpenDate: string;
}

export type FIN52010DataResponse = Omit<BaseQueryResponse<FIN52010Data>, 'Data'> & { Data: FIN52010Data; };

export interface FIN52010UpdatePayload {

}

export interface FIN52010UpdateResult {

}
