import { componentRegister } from "app/modules/shared/services/component-register";

export class OrderBookerInformation {
    ID: number = 0;
    Code: string = null;
    Description: string = null;
    IdCard: string = null;
    PhoneNo: string = null;
    PhoneNo2: string = null;
    Address: string = null;
    Reference: string = null;
    Salary: number = null;
    Balance: number = null;
    Limits: number = null;
    SCode:string = componentRegister.orderBooker.SCode;
}