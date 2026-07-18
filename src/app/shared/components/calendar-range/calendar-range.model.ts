export interface TimeRangeOption {
  label: string;
  value: string;
  unit: 'year' | 'quarter' | 'month' | 'week' | 'day';
  startDate: Date;
  endDate: Date;
}

export const timeUnitOptions = [
  { label: '天', value: 'day' },
  { label: '週', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季', value: 'quarter' },
  { label: '年', value: 'year' },
];

export const timeRangeOptions: TimeRangeOption[] = [
  {
    label: '去年',
    value: 'lastYear',
    unit: 'year',
    startDate: (() => {
      const date = new Date(new Date().getFullYear() - 1, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear() - 1, 11, 31);
      date.setHours(23, 59, 59, 999); // 包含毫秒
      return date;
    })(),
  },
  {
    label: '今年',
    value: 'thisYear',
    unit: 'year',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 11, 31);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '上半年',
    value: 'firstHalf',
    unit: 'year',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 5, 30);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '下半年',
    value: 'secondHalf',
    unit: 'year',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 6, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 11, 31);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '第1季',
    value: 'firstQuarter',
    unit: 'quarter',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 2, 31);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '第2季',
    value: 'secondQuarter',
    unit: 'quarter',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 3, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 5, 30);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '第3季',
    value: 'thirdQuarter',
    unit: 'quarter',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 6, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 8, 30);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '第4季',
    value: 'fourthQuarter',
    unit: 'quarter',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), 9, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), 11, 31);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '上上個月',
    value: 'twoMonthsAgo',
    unit: 'month',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 2, new Date(new Date().getFullYear(), new Date().getMonth() - 1, 0).getDate());
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '上個月',
    value: 'lastMonth',
    unit: 'month',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate());
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '本月',
    value: 'thisMonth',
    unit: 'month',
    startDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '上上週',
    value: 'twoWeeksAgo',
    unit: 'week',
    startDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - dayOfWeek + 1);
      const startDate = new Date(startOfThisWeek);
      startDate.setDate(startOfThisWeek.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    })(),
    endDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - dayOfWeek + 1);
      const endDate = new Date(startOfThisWeek);
      endDate.setDate(startOfThisWeek.getDate() - 8);
      endDate.setHours(23, 59, 59, 999);
      return endDate;
    })(),
  },
  {
    label: '上週',
    value: 'lastWeek',
    unit: 'week',
    startDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek - 6);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    })(),
    endDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - dayOfWeek);
      endDate.setHours(23, 59, 59, 999);
      return endDate;
    })(),
  },
  {
    label: '本週',
    value: 'thisWeek',
    unit: 'week',
    startDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek + 1);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    })(),
    endDate: (() => {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - dayOfWeek + 7);
      endDate.setHours(23, 59, 59, 999);
      return endDate;
    })(),
  },
  {
    label: '前天',
    value: 'twoDaysAgo',
    unit: 'day',
    startDate: (() => {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - 2);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - 2);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '昨天',
    value: 'yesterday',
    unit: 'day',
    startDate: (() => {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - 1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const today = new Date();
      const date = new Date(today);
      date.setDate(today.getDate() - 1);
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
  {
    label: '今天',
    value: 'today',
    unit: 'day',
    startDate: (() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    endDate: (() => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    })(),
  },
];
