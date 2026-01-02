import { componentRegister } from "app/modules/shared/services/component-register";

export class Supplier_Order_Ledger{
    ID:number=0;
    SupplierOrderMasterID:number = null;
    TransactionDate:Date = null;
    Debit:number = 0;
    Credit:number = 0;
    Remarks:string = null;
    SCode:string = componentRegister.supplierLedger.SCode;
}

export class Supplier_Order_LedgerDTO{
    ID:number=0;
    SupplierOrderMasterID:number = null;
    TransactionDate:Date = null;
    Debit:number = null;
    Credit:number = null;
    Balance:number = null;
    Remarks:string = null;
    SCode:string = componentRegister.supplierLedger.SCode;
}