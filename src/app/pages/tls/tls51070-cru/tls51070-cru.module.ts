export interface POS2005Detail {
    "id": number,
    "PLU_MagNo": string,
    "PLU_No": string
    "CRT_Date"?: Date,
    "CRT_USR_No"?: string,
    "CRT_USR_Name"?: string,
    "UPD_Date"?: Date,
    "UPD_USR_No"?: string,
    "UPD_USR_Name"?: string,
}

export interface POS2020Detail {
    "id": number,
    "PLU_MagNo": string,
    "VEN_No": string,
    "STO_No": string,
    "PLU_OrderPrc": number,
    "PLU_Purchase": string,
    "PLU_TransType": string,
    "PLU_TransDay": number,
    "Remark": string,
    "VDP_LastStockDate"?: Date,
    "CRT_Date"?: Date,
    "CRT_USR_No"?: string,
    "CRT_USR_Name"?: string,
    "UPD_Date"?: Date,
    "UPD_USR_No"?: string,
    "UPD_USR_Name"?: string,
}

export interface IMG1001Detail {
    "id": number,
    "IMG_Type": string,
    "IMG_SeqNo": string,
    "IMG_Path": string,
    "IMG_File": string,
    "IMG_Remark": string
    "CRT_Date": Date,
    "CRT_USR_No": string,
    "CRT_USR_Name": string,
    "UPD_Date": Date,
    "UPD_USR_No": string,
    "UPD_USR_Name": string,

    // 額外欄位：圖片顯示用
    "IMG_Url"?: string;
}