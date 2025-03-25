import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserTypeService {

  userTypes: any[] = [
    { value: 1, label: '公司人員' },
    { value: 2, label: '專櫃人員' },
    { value: 3, label: '其他' }
  ];

  constructor() { }

  getUserTypes(): Observable<any[]> {
    return of(this.userTypes);
  }
}
