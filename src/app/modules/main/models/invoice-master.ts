import { InvoiceDetail } from "./invoice-detail";

export class InvoiceMaster {
    ID:number = 0;
    InvoiceDate:Date = null;
    InvoiceNo:string = null;
    CustomerID:number = null;
    Taxable:number = null;
    TaxRate:number = null;
    Tax:number = null;
    SH:number = null;
    Others:number = null;
    Total:number = null;
    Notes:string = null;
    InvoiceRegards:string = "";
    Invoice_Detail:InvoiceDetail[] = [];
}
