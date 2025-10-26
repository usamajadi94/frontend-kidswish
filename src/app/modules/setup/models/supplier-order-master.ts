import { Supplier_Order_Detail } from "./supplier-order-detail";
import { Supplier_Order_Products } from "./supplier-order-products";

export class SupplierOrderMaster{
    ID: number = 0;
    SupplierID: number | null = null;
    Date: Date | null = null;
    Supplier_Order_Detail: Supplier_Order_Detail[] = [];
    Supplier_Order_Products: Supplier_Order_Products[] = [];
}