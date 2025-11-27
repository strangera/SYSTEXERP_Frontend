import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Fin62020Service {

  constructor(
    private readonly http: HttpClient
  ) { }

  queryFIN62020(data: any) {
    return this.http.post(`fin/fin62020/queryFIN62020`, data);
  }
}
