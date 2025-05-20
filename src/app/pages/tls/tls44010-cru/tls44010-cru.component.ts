import { Component } from '@angular/core';

@Component({
  selector: 'app-tls44010-cru',
  templateUrl: './tls44010-cru.component.html',
  styleUrl: './tls44010-cru.component.scss'
})
export class TLS44010CRUComponent {
  dropdown3 = [
    { label: '第1頁', value: '1' },

  ];

  poslist = [
    { name: 'A1專櫃', pos: '100001', line: '0', area: 'A區', code: '99991', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A2專櫃', pos: '100002', line: '1', area: 'A區', code: '99992', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A3專櫃', pos: '100003', line: '2', area: 'A區', code: '99993', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A4專櫃', pos: '100004', line: '3', area: 'A區', code: '99994', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A5專櫃', pos: '100005', line: '4', area: 'A區', code: '99995', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A6專櫃', pos: '100006', line: '5', area: 'A區', code: '99996', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A7專櫃', pos: '100007', line: '0', area: 'A區', code: '99997', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A8專櫃', pos: '100008', line: '0', area: 'A區', code: '99998', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A9專櫃', pos: '100009', line: '0', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A10專櫃', pos: '100010', line: '2', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A1專櫃', pos: '100001', line: '1', area: 'A區', code: '99991', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A2專櫃', pos: '100002', line: '1', area: 'A區', code: '99992', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A3專櫃', pos: '100003', line: '1', area: 'A區', code: '99993', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A4專櫃', pos: '100004', line: '1', area: 'A區', code: '99994', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A5專櫃', pos: '100005', line: '0', area: 'A區', code: '99995', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A6專櫃', pos: '100006', line: '0', area: 'A區', code: '99996', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A7專櫃', pos: '100007', line: '0', area: 'A區', code: '99997', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A8專櫃', pos: '100008', line: '0', area: 'A區', code: '99998', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A9專櫃', pos: '100009', line: '0', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A10專櫃', pos: '100010', line: '2', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A1專櫃', pos: '100001', line: '1', area: 'A區', code: '99991', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A2專櫃', pos: '100002', line: '1', area: 'A區', code: '99992', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A3專櫃', pos: '100003', line: '1', area: 'A區', code: '99993', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A4專櫃', pos: '100004', line: '1', area: 'A區', code: '99994', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A5專櫃', pos: '100005', line: '0', area: 'A區', code: '99995', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A6專櫃', pos: '100006', line: '0', area: 'A區', code: '99996', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A7專櫃', pos: '100007', line: '0', area: 'A區', code: '99997', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A8專櫃', pos: '100008', line: '0', area: 'A區', code: '99998', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A9專櫃', pos: '100009', line: '0', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
    { name: 'A10專櫃', pos: '100010', line: '2', area: 'A區', code: '99999', ip: '127.0.0.1', status: '待機中', opentime: '2024/01/01 12:00:00' },
  ];
}
