export const typeOptions = [
  { label: '集中機台(統收)', value: '1' },
  { label: '專櫃機台(自收)', value: '2' },
  { label: '離線機台(不開立業主發票、不使用業主機台)', value: '5' },
  { label: '它社機台(開立業主發票、不使用業主機台)', value: '7' },
];

export const statusOptions = [
  { label: '啟用(預設值)', value: 'A' },
  { label: '停用', value: 'C' },
  { label: '強制停用', value: 'S' },
  { label: '訓練', value: 'T' },
];

export const salTypeOptions = [
  { label: '商場收銀機台(預設值)', value: '' },
  { label: '停車場機台', value: 'PKNG' },
  { label: '會員APP', value: 'APP' },
  { label: '環友票券系統', value: 'CPN' },
];

export const sernoTypeOptions = [
  { label: '循環使用', value: '1' },
  { label: '每日重計(預設值)', value: '2' },
  { label: '每月重計', value: '3' },
];

export const guiTypeOptions = [
  { label: '不開發票', value: '00' },
  { label: '二聯式收銀機發票', value: '03' },
  { label: '電子發票(預設值)', value: '07' },
];

export const settleDDOptions = [
  { label: '當天(預設值)', value: 'T' },
  { label: '隔天', value: 'N' },
];

export const yesNoOptions = [
  { label: '是', value: 'Y' },
  { label: '否', value: 'N' },
];
