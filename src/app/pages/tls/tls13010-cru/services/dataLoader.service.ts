import { Injectable } from "@angular/core";
import { ContractFlowService } from "@pages/tls/tls13010/services/contract-flow.service";
import { TLS13010Service } from "@service/api/tls/tls13010.service";
import { TLS13010CRUComponent } from "../tls13010-cru.component";

@Injectable({ providedIn: 'root' })
export class TLS13010DataLoaderService {

  constructor(
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service
  ) { }

  loadWorkflowData(component: TLS13010CRUComponent): void {
    // 第 459 行的完整邏輯
  }

  loadSavedFormData(savedFormData: any, component: TLS13010CRUComponent): void {
    // 第 498 行的完整邏輯
  }

  loadDataFromQueryResult(queryData: Record<string, unknown>, component: TLS13010CRUComponent): void {
    // 第 661 行的完整邏輯
  }
}
