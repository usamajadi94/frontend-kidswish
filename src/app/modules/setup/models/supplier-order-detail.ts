import { Supplier_Order_Products } from "./supplier-order-products";

export class Supplier_Order_Detail {
    ID: number = 0;
    SupplierOrderMasterID: number | null = null;
    SupplierItemID: number | null = null;
    Qty: number | null = null;
    Price: number | null = null;
    TotalPrice: number | null = null;
    Badleafs: number | null = null;
    DeductionAmt: number | null = null;
    NetAmt: number | null = null;
  }