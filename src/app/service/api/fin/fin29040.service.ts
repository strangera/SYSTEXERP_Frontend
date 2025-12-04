import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class FIN29040Service {
    private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

    constructor(private http: HttpClient) { }


    queryFIN29040(req: any): Observable<BaseQueryResponse<any>> {
        return this.http.post<BaseQueryResponse<any>>(`${this.apiUrl}/queryFIN29040`, req);
    }


    exportFIN29040080Excel(req: any): Observable<HttpResponse<Blob>> {
        return this.http.post(`${this.apiUrl}/exportFIN29040Excel`, req, {
            observe: 'response',
            responseType: 'blob' as 'json',
        }) as Observable<HttpResponse<Blob>>;
    }


    exportFIN29040PDF(req: any): Observable<HttpResponse<Blob>> {
        return this.http.post(`${this.apiUrl}/exportFIN29040PDF`, req, {
            observe: 'response',
            responseType: 'blob' as 'json',
        }) as Observable<HttpResponse<Blob>>;
    }
}
