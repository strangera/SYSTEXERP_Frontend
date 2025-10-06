// current-page.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentPageService {
  private readonly progNoSource = new BehaviorSubject<string | null>(null);
  currentPageProgNo$ = this.progNoSource.asObservable();
  currentPageProgNoSubject = this.progNoSource; // 暴露 BehaviorSubject

  setCurrentProgNo(progNo: string | null) {
    this.progNoSource.next(progNo);
  }
}
