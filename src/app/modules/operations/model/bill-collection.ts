import { componentRegister } from "app/modules/shared/services/component-register";

export class BillCollection {
    ID: number = 0;
    BillNo: string = '';
    TransactionDate: Date | null = null;
    CustomerID: number | null = null;
    Remarks: string = '';
    Debit: number = 0;
    Credit: number = 0;
    Remaining: number = 0; 
    SCode:string = componentRegister.billCollection.SCode;
}
