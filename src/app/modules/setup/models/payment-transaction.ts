export class PaymentTransaction {
    ID: number = 0;
    Date: string = '';
    Amount: number = 0;
    PaymentType: string = '';
    FromPartyType: string = null;
    FromPartyID: number = null;
    ToPartyType: string = null;
    ToPartyID: number = null;
    TransactionType: string = '';
    Notes: string = '';
    SCode: string = '';
    OrderID: number = null;
}
