select
a.TXN_SaleNoteNo, --銷售單號
d.TXN_Date, --銷售日期
d.ECR_No,--收銀機號
d.TXN_No, --交易序號
b.LOGO_No, --品牌代碼
c.LOGO_CH_NAME, --品牌名稱
a.TXN_GUIBegNo +'~'+a.TXN_GUIEndNo GUINO, --發票號碼
d.PLU_MagNo, --商品管理編號
d.PLU_NO, --國際條碼
d.PLU_Name, --品名
d.TXN_Qty,--數量
sum(d.TXN_Qty * d.PLU_SalePrc) PLU_SalePrc, --銷售定價
d.TXN_SaleAmt, --銷售金額
(d.TXN_RebateS+d.TXN_RebateT)TotRebate, --整張折讓
(d.TXN_DiscS+d.TXN_DiscM+d.TXN_DiscT+d.TXN_DiscP+d.TXN_DiscD)TotDisc --整張折扣
from POS5006 a
join POS5007 d on (a.SYS_StoreNo=d.SYS_StoreNo and a.TXN_Date=d.TXN_Date and a.ECR_No=d.ECR_No and a.TXN_No=d.TXN_No)
left join (select distinct TLT_NO, LOGO_NO from POS2004 where PLU_Type='1') b on (a.TLT_No=b.TLT_NO)
left join PLULOGO c on (b.LOGO_No=c.LOGO_No)
left join POS2004 f on (d.PLU_MagNo = f.PLU_MagNo)
left join TLTTALENT g on (a.Talent_ID=g.talent_id)
where a.SYS_StoreNo = '10' --從預設值帶
and g.store_way ='2' --自營櫃


/* 輸入條件
and a.TXN_Date >='2025/01/01'  --交易日期起迄 請卡控一定要輸入
and a.TXN_Date <='2025/01/01'
and c.LOGO_No = '' --品牌條件
and d.VEN_NO='' --廠商條件
--and a.HOS_NO=''  --倉別條件  先這樣寫，因POS5006.HOS_NO 欄位還沒開上去
and a.ECR_No ='' --收銀機號
and a.TXN_SaleNoteNo = '' --銷售單號
and a.TXN_No = 0 --交易序號
and d.PLU_MagNo = '' --商品管理編號
and d.PLU_No = '' --國際條碼
and f.PLU_OrgPLUNo = '' --廠商貨號
*/
group by
a.TXN_SaleNoteNo, d.TXN_Date, d.ECR_No, d.TXN_No, b.LOGO_No, c.LOGO_CH_NAME,
a.TXN_GUIBegNo +'~'+a.TXN_GUIEndNo , d.PLU_MagNo, d.PLU_NO, d.PLU_Name,
d.TXN_Qty, d.TXN_SaleAmt,
(d.TXN_RebateS+d.TXN_RebateT),
(d.TXN_DiscS+d.TXN_DiscM+d.TXN_DiscT+d.TXN_DiscP+d.TXN_DiscD)
order by d.TXN_Date, d.ECR_No, d.TXN_No
