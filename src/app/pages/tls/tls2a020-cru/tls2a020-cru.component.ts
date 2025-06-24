import { Component, OnInit } from '@angular/core';

interface UncheckedPaymentRecord {
  registerCode: string;
  paymentTool: string;
  systemAmount: number;
  receiptAmount: number;
}

@Component({
  selector: 'app-tls2a020-report',
  templateUrl: './tls2a020-cru.component.html',

})
export class TLS2A020ReportComponent implements OnInit {
  salesDate = new Date('2024-11-15');

  data: UncheckedPaymentRecord[] = [
    { registerCode: '003201', paymentTool: '現金', systemAmount: 10600, receiptAmount: 0 },
    { registerCode: '003201', paymentTool: '外來退還單(抵用券)', systemAmount: 100, receiptAmount: 100 },
    { registerCode: '003201', paymentTool: '外來禮券(抵用券)', systemAmount: 1100, receiptAmount: 1100 },
    { registerCode: '003201', paymentTool: '中信信用卡', systemAmount: 31750, receiptAmount: 0 },
    { registerCode: '018711', paymentTool: '現金', systemAmount: 800, receiptAmount: 0 },
    { registerCode: '018711', paymentTool: '外來退還單(抵用券)', systemAmount: 100, receiptAmount: 100 },
    { registerCode: '018711', paymentTool: '外來禮券(抵用券)', systemAmount: 1100, receiptAmount: 1100 },
    { registerCode: '018711', paymentTool: '中信信用卡', systemAmount: 14000, receiptAmount: 0 }
  ];

  constructor() { }

  ngOnInit(): void { }
}
