export class SaleInvoiceDetail {
    ID: number = 0;
    SaleMasterID: number = null;
    ItemID: number = null;
    SalePrice: number = null;
    Qty: number = null;
    DiscountPer: number = 0;
    DiscountAmount: number = null;
    SalePer: number = 0;
    SaleAmount: number = null;
    TotalAmount: number = null;
    NetAmt: number = null;
    ApplyDiscount: boolean = true;
    BuyIn: string = 'Pcs';
    ApplySaleTax: boolean = null;
}
