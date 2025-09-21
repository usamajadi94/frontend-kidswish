import { componentRegister } from "app/modules/shared/services/component-register";
import { SaleInvoiceDetail } from "./sale-invoice-detail";

export class SaleInvoiceMaster {
    ID: number = 0;
    InvoiceNo: string = null;
    InvoiceDate: Date = new Date();
    DcNo: string = null;
    DcDate: Date = new Date();
    OrderNo: string = null;
    CustomerID: number = null;
    MemberTypeID: number = null;
    OrderBookerID: number = null;
    SalesmanID: number = null;
    ItemCategoryID: number = null;
    VehicleID: number = null;
    RouteID: number = null;
    AreaID: number = null;
    CityID: number = null;
    Remarks: string = null;
    Sale_Inv_Detail : SaleInvoiceDetail[] = [];
    SCode:string = componentRegister.saleInvoice.SCode;
}


