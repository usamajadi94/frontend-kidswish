import { componentRegister } from "app/modules/shared/services/component-register";

export class CashInHand {
    ID: number = 0;
    Date: any = null;
    PaymentCategoryID: number = null;
    ExpenseCategoryID: number = null;
    ToPartyID: number = null;
    Amount: any = null;
    Notes: string = null;
    AttachmentPath: string = null;
    SCode: string = componentRegister.cashInHand.SCode;
}
