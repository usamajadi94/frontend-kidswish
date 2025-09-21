import { componentRegister } from "app/modules/shared/services/component-register";
import { SaleInvoiceDetailRet } from "./sale-invoice-detail-ret";

export class SaleInvoiceMasterRet {
    ID: number = 0;
    InvoiceNo: string = null;
    InvoiceDate: Date = new Date();
    DcNo: string = null;
    DcDate: Date = new Date();
    OrderNo: string = null;
    SaleInvoiceNo: string = null;
    CustomerID: number = null;
    MemberTypeID: number = null;
    OrderBookerID: number = null;
    SalesmanID: number = null;
    VehicleID: number = null;
    RouteID: number = null;
    AreaID: number = null;
    CityID: number = null;
    Remarks: string = null;
    Sale_Inv_Detail_Ret : SaleInvoiceDetailRet[] = [];
    SCode:string = componentRegister.saleReturnInvoice.SCode;
}


