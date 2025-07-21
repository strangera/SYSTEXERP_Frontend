import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { TLS41010Data } from '../../../pages/tls/tls41010/tls41010.model';
@Injectable({
  providedIn: 'root',
})
