// 將日期格式化
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
};

// 將日期時間格式化
export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
};

// 將名字的第二個字轉成O
export const formatOName = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.length > 1 ? word[0] + '☆' + word.slice(2) : word)
    .join(' ');
};

// 做數字千分位
export const formatNumber = (number: number | string): string => {
  if (!number) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 將日期時間轉換為台灣本地時間格式
export const formatLocalDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  const localDate = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3, // 取得毫秒
    hour12: false,  // 24小時制
  };

  const formattedDate = localDate.toLocaleString('zh-TW', options);
  const [date, time] = formattedDate.split(' ');
  const [year, month, day] = date.split('/');
  const [hour, minute, second] = time.split(':');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`; // 正確格式化
};

