import { Component, OnInit } from '@angular/core';
import { ChartType, ChartConfiguration, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})
export class GanttChartComponent implements OnInit {
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // 將條形圖轉換為橫向
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '持續天數' // X軸描述
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '任務名稱' // Y軸描述
        },
        ticks: {
          callback: (value: string | number, index: number) => {
            // 根据索引返回相应的任务名称
            if (typeof index === 'number' && index >= 0 && index < this.tasks.length) {
              return this.tasks[index].name; // 返回任务名称
            }
            return '未知任務'; // 如果索引超出範圍，返回默认值
          }
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: '任務持續時間圖表', // 添加表頭
        font: {
          size: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const index = tooltipItem.dataIndex;
            if (index === undefined || !this.tasks[index]) {
              return '無法獲取數據'; // 若無法取得數據，顯示提示
            }

            const task = this.tasks[index];
            const days = tooltipItem.raw ? `${tooltipItem.raw} 天` : '未知天數';

            // 根据任务名称添加特定注解
            let comment = `任務: ${task.name}, 持續時間: ${task.days} 天`;
            if (task.name === '尋找資料') {
              comment += '，此任務由2024/10/22~2024/10/27 一共五天'; // 添加特定注解
            }

            return `${comment} (${days})`;
          }
        }
      },
    },
    // 在beforeDraw中手動繪製註解
  };

  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  // 使用 ChartData 类型来定义数据
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: '持續時間',
      backgroundColor: [
        'rgba(38, 185, 154, 0.7)', // 尋找資料
        'rgba(52, 152, 219, 0.7)', // 撰寫報告
        'rgba(231, 76, 60, 0.7)',  // 製作參考文獻
        'rgba(241, 196, 15, 0.7)', // 提交報告
        'rgba(142, 68, 173, 0.7)'  // 大綱制定
      ]
    }]
  };

  private tasks = [
    { name: '尋找資料', days: 5 },
    { name: '撰寫報告', days: 5 },
    { name: '製作參考文獻', days: 7 },
    { name: '提交報告', days: 1 },
    { name: '大綱制定', days: 6 }
  ];

  constructor() { }

  ngOnInit(): void {
    this.prepareChartData();
    this.barChartLabels = this.tasks.map(task => task.name);
    this.barChartData.labels = this.barChartLabels; // 更新 labels
  }

  private prepareChartData(): void {
    this.barChartData.datasets[0].data = this.tasks.map(task => task.days);
  }
}
