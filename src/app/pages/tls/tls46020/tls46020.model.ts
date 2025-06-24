export const ECR_SernoType_Option = [
  { value: '1', label: '循環使用' },
  { value: '2', label: '每日重計' },
  { value: '3', label: '每月重計' },
];
export const ECR_GUI_Type_Option = [
  { value: '07', label: '電子發票' },
  { value: '00', label: '不開發票' },
  { value: '03', label: '二聯式收銀機發票' },
];

export const YN_Option = [
  { value: 'Y', label: '是' },
  { value: 'N', label: '否' },
];

export const ECR_SettleDD_Option = [
  { value: 'T', label: '當天' },
  { value: 'N', label: '隔天' },
];

export function getToday2330(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0);
}
