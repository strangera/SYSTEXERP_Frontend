import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class FIN29120Service {
    private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

    constructor(private http: HttpClient) { }


    queryFIN29120(req: any): Observable<ApiResponse<any[]>> {
        return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryFIN29120`, req);
    }


}
