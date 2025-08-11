//!!! 參考Hannah的做法，很好用
export const yesterday = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
})();
