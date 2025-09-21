export class OrderDetail {
    ID: number = 0;
    BuyIn: string = '';
    ItemID: number = 0;
    SalePrice: number = 0;
    Qty: number = 0;
    DiscountPer: number = 0;
    DiscountAmt: number = 0;
    SalePer: number = 0;
    SaleAmt: number = 0;
    NetAmt: number = 0;
    TAmt: number = 0;
    ApplyDiscount: boolean = true;
    ApplySaleTax: boolean = false;
}
