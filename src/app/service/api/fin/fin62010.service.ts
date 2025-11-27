import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Fin62010Service {

  constructor(
    private readonly http: HttpClient
  ) { }

  queryFIN62010(data: any) {
    return this.http.post(`fin/fin62010/query`, data);
  }
}
