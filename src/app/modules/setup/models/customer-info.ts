import { componentRegister } from "app/modules/shared/services/component-register";

export class CustomerInformation{
    ID: number = 0;
    Description: string = '';
    Code: string = '';
    BusinessName: string = '';
    Address: string = '';
    Email: string = '';
    PhoneNo: string = '';
    PhoneNo2: string = '';
    TL: string = '';
    OpeningBalance: number = 0;
    TotalPurchase: number = 0;
    Payment: number = 0;
    ClosingBalance: number = 0;
    Limit: number = 0;
    IsActive: boolean = true;
    SCode:string = componentRegister.customer.SCode;
}