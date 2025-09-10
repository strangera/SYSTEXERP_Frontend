//!!! 參考Hannah的做法，很好用
// 昨天
export const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
})();
// 明天
export const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
})();

// 計算當前月份所在「期」的第一天
export const firstDayOfCurrentPeriod = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // 判斷當前月份是屬於哪一期，並設定起始月份
  let startMonth;
  if (month % 2 === 0) {
    // 0, 2, 4, 6, 8, 10 月，代表是 1/2, 5/6, 9/10, ...
    startMonth = month;
  } else {
    // 1, 3, 5, 7, 9, 11 月，代表是 3/4, 7/8, 11/12, ...
    startMonth = month - 1;
  }

  const d = new Date(year, startMonth, 1);
  return d;
})();

// 計算當前月份所在「期」的最後一天
export const lastDayOfCurrentPeriod = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // 判斷當前月份是屬於哪一期，並設定結束月份
  let endMonth;
  if (month % 2 === 0) {
    // 0, 2, 4, 6, 8, 10 月，結束月份是當前月份+1
    endMonth = month + 1;
  } else {
    // 1, 3, 5, 7, 9, 11 月，結束月份是當前月份
    endMonth = month;
  }

  // 建立下個月1號的日期物件，再將日期設為0，即可得到當前月份的最後一天
  const d = new Date(year, endMonth + 1, 0);
  return d;
})();
// 判斷當前月份所屬的期別代碼
export const getCurrentPeriodCode = (() => {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // 根據月份判斷所屬的期別
  // 0,1月 -> '01'
  // 2,3月 -> '03'
  // 4,5月 -> '05'
  // 6,7月 -> '07'
  // 8,9月 -> '09'
  // 10,11月 -> '11'

  let periodCode;

  if (month <= 1) {
    periodCode = '01';
  } else if (month <= 3) {
    periodCode = '03';
  } else if (month <= 5) {
    periodCode = '05';
  } else if (month <= 7) {
    periodCode = '07';
  } else if (month <= 9) {
    periodCode = '09';
  } else {
    periodCode = '11';
  }

  return periodCode;
})();
