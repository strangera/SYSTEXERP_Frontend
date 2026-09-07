import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Option } from '@service/utility/dropdown-api.model';
export interface FIN52010Data {
  AccNoAP: string;
  AccNoAR: string;
  AccNoCurPL: string;
  AccNoInTax: string;
  AccNoOutTax: string;
  AccNoPost: string;
  AccNoPrepaid: string;
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

export type FIN52010DataResponse = Omit<ApiResponse<FIN52010Data[]>, 'Data'> & { Data: FIN52010Data; };

export interface FIN52010UpdatePayload {
  CompNo?: string;
  OpenDate?: string;
  CloseDate?: string;
  ORG_ID?: string;
  CashAccNo?: string;
  AccNoCurPL?: string;
  AccNoPriPL?: string;
  AccNoTotPL?: string;
  AccNoAR?: string;
  AccNoAP?: string;
  AccNoInTax?: string;
  AccNoOutTax?: string;
  AccNoPost?: string;
  AccNoPrepaid?: string;
  AccNoRemitFee?: string;
  AccYear?: string;
}

export type FIN52010UpdateResult = Omit<ApiResponse<_FIN52010UpdateResult[]>, 'Data'> & { Data: _FIN52010UpdateResult; };
interface _FIN52010UpdateResult {
  CompNo: string;
  OpenDate: string;
  CloseDate: string;
  ORG_ID: string;
  CashAccNo: string;
  AccNoCurPL: string;
  AccNoPriPL: string;
  AccNoTotPL: string;
  AccNoAR: string;
  AccNoAP: string;
  AccNoInTax: string;
  AccNoOutTax: string;
  AccNoPost: string;
  AccNoPrepaid: string;
  AccNoRemitFee: string;
  AccYear: string;
}

export interface GLS1005Option extends Pick<Option, 'value' | 'label'> {
  No: string;
  Name: string;
}
