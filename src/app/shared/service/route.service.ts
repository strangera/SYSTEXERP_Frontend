import { Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private router: Router) { }

  getRoutes(): Routes {
    return this.router.config;
  }
}
