import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tls51070-os',
  templateUrl: './tls51070-os.component.html',
  styleUrl: './tls51070-os.component.scss'
})
//處理 變價歷史紀錄/產生標籤檔
export class Tls51070OsComponent implements OnInit {
  //接收傳遞的服務
  ngOnInit() {
    const state = window.history.state;
    console.log(state.destination); // someHistoryValue
  }
}
