import { Injectable } from '@angular/core';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';

@Injectable({ providedIn: 'root' })
export class TLS23080SharedService {
  constructor(
    private tls23080Service: TLS23080Service,

  ) { }

  async fetchDetailFn(payload: { TXN_Date: string }): Promise<any[]> {
    if (!payload?.TXN_Date) return [];
    try {
      const result = await this.tls23080Service.queryTLS23080Detail({ TXN_Date: payload.TXN_Date }).toPromise();
      if (result.Status === '0000') {
        return result.Data ?? [];
      } else {

        return [];
      }
    } catch {

      return [];
    }
  }
}
