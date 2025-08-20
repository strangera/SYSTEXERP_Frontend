--進貨/退貨單據統計表  彙總
select
'1' TypeOrder,
a.HOS_No, --倉別
b.HOS_NAME, --倉庫名稱
a.LOGO_No, --品牌
c.LOGO_CH_NAME, --品牌名稱
a.ODM_Date, --申請日期
a.APRV_Date, --審核日期
a.ODM_No, --單號
'進貨單' ODM_Type, --單據類型
case when a.ODM_Status='1' then '已申請'
     when a.ODM_Status='2' then '已審核'
     when a.ODM_Status='9' then '已作廢' end ODM_Status,
a.ODM_TotalBuyNet, --進價未稅金額
a.ODM_TotalBuyTax, --進價稅額
a.ODM_TotalBuyAmt, --進價含稅
sum(isnull(e.ODD_ConfirmQty,0)) ODD_ConfirmQty --數量
from POS2018 a
join POS2019 e on (a.MID=e.MID and a.SYS_StoreNo=e.SYS_StoreNo and a.ODM_No=e.ODM_No and a.HOS_No=e.HOS_No)
left join POS2034 b on (a.HOS_No=b.HOS_No)
left join PLULOGO c on (a.LOGO_No=c.LOGO_No)
where a.SYS_StoreNo = '' --店別
--報表輸入條件
--and a.HOS_NO in ('') --倉別 多選
--and a.LOGO_No in ('') --品牌 多選
--and a.VEN_No = ''  --廠商編號 單選
--and a.ODM_Date >= '' --申請日期起 可只輸入起日
--and a.ODM_Date <= '' --申請日期迄 可只輸入迄日
--and a.APRV_Date >= '' --審核日期起 可只輸入起日
--and a.APRV_Date <= '' --審核日期迄 可只輸入迄日
--and 1=1 --單據類型 多選  若有勾選 進貨單此條件給 1=1 若沒勾選 給 1 <>1
--and a.ODM_Status in ()  --單據狀態 多選
group by a.HOS_No, b.HOS_NAME, a.LOGO_No, c.LOGO_CH_NAME, a.ODM_Date, a.APRV_Date, a.ODM_No,
         a.ODM_Status, a.ODM_TotalBuyNet, a.ODM_TotalBuyTax, a.ODM_TotalBuyAmt
union all
select
'2' TypeOrder,
a.HOS_No, --倉別
b.HOS_NAME, --倉庫名稱
a.LOGO_No, --品牌
c.LOGO_CH_NAME, --品牌名稱
a.APPLY_Date ODM_Date, --申請日期
a.APRV_Date APRV_Date, --審核日期
a.RJM_No ODM_No, --單號
'退貨單' ODM_Type, --單據類型
case when a.RJM_Status='1' then '已申請'
     when a.RJM_Status='2' then '已審核'
     when a.RJM_Status='9' then '已作廢' end ODM_Status,
a.RJM_TotalBuyNet*-1 ODM_TotalBuyNet, --進價未稅金額
a.RJM_TotalBuyTax*-1 ODM_TotalBuyTax, --進價稅額
a.RJM_TotalBuyAmt ODM_TotalBuyAmt, --進價含稅
sum(isnull(e.RJD_ConfirmQty,0))*-1 ODD_ConfirmQty --數量

from POS2031 a
join POS2032 e on (a.MID=e.MID and a.SYS_StoreNo=e.SYS_StoreNo and a.RJM_No=e.RJM_No and a.HOS_No=e.HOS_No)
left join POS2034 b on (a.HOS_No=b.HOS_No)
left join PLULOGO c on (a.LOGO_No=c.LOGO_No)
where a.SYS_StoreNo = '' --店別
--報表輸入條件
--and a.HOS_NO in ('') --倉別 多選
--and a.LOGO_No in ('') --品牌 多選
--and a.VEN_No = ''  --廠商編號 單選
--and a.APPLY_Date >= '' --申請日期起 可只輸入起日
--and a.APPLY_Date <= '' --申請日期迄 可只輸入迄日
--and a.APRV_Date >= '' --審核日期起 可只輸入起日
--and a.APRV_Date <= '' --審核日期迄 可只輸入迄日
--and 2=2 --單據類型 多選  若有勾選 退貨單此條件給 2=2 若沒勾選 給 2 <>2
--and a.RJM_Status in ()  --單據狀態 多選
group by a.HOS_No, b.HOS_NAME, a.LOGO_No, c.LOGO_CH_NAME, a.APPLY_Date, a.APRV_Date, a.RJM_No,
         a.RJM_Status, a.RJM_TotalBuyNet, a.RJM_TotalBuyTax, a.RJM_TotalBuyAmt
order by ODM_Date, APRV_Date, TypeOrder, ODM_No

