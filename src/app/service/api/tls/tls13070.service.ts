import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '@service/system/auth.service';

export interface Tls13070QueryRequest {
  "PageSize": number,
  "PageIndex": number,
  "SortBy": SortMeta[],
  "apply_no": string,
  "bus_typeList": [
    string
  ],
  "tlt_noList": [
    string
  ],
  "tlt_name": string,
  "ven_uniform_List": [
    string
  ],
  "contract_subno_Start": number,
  "contract_subno_End": number,
  "approve_status_List": [
    string
  ],
  "area_no_List": [
    string
  ],
  "tlt_floor_List": [
    string
  ],
  "contact_USR_No_List": [
    string
  ],
  "org_id_List": [
    string
  ],
  "tlt_openflag_List": [
    string
  ],
  "comm_comp_type_List": [
    string
  ],
  "feedback_date_Start": string,
  "feedback_date_End": string,
  "due_date_Start": string,
  "due_date_End": string,
  "contact_Date_Start": string,
  "contact_Date_End": string,
  "paper_type_List": [
    string
  ],
  "tlt_bdate_Start": string,
  "tlt_bdate_End": string,
  "tlt_edate_Start": string,
  "tlt_edate_End": string,
  "tlt_contract_bdate_Start": string,
  "tlt_contract_bdate_End": string,
  "tlt_contract_edate_Start": string,
  "tlt_contract_edate_End": string,
  "tlt_kind_List": [
    string
  ],
  "deco_type_List": [
    string
  ],
  "tlt_term_type_List": [
    string
  ],
  "money_type_List": [
    string
  ],
  "paytype_List": [
    string
  ],
  "store_way_List": [
    string
  ],
  "rece_yn": string,
  "pos_yn": string,
  "cash_yn": string
}

export interface Tls13070Response {
  id: number,
  talent_id: number,
  apply_no: string,
  upd_date: string,
  VEN_Name: string,
  ven_uniform: string,
  tlt_name: string,
  tlt_no: string,
  tlt_contract_bdate: string,
  tlt_contract_edate: string,
  expiration_fees: number | null,
  total_amt: number | null,
  check_day: number,
  tlt_remark: string | null,
  locationList:
  {
    talent_id: number,
    location_no: string,
    tlt_space: number
  }[],
  posList:
  {
    ECR_No: string,
    ECR_TLT_No: string,
    ECR_TLT_Name: string
  }[],
  rentList:
  {
    talent_id: number,
    cag_bdate: string,
    cag_edate: string,
    base_rent: number
  }[],
  fareList:
  {
    CAP_Item: string,
    CAP_Name: string,
    tpy_amount: number,
    tpy_totalamt: number,
    down_payment: number
  }[]
}

@Injectable({
  providedIn: 'root'
})
export class Tls13070Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  queryTLS13070(params: Tls13070QueryRequest): Observable<ApiResponse<Tls13070Response[]>> {
    return this.http.post<ApiResponse<Tls13070Response[]>>(`${this.apiUrl}/queryTLS13070`, params);
  }
}
