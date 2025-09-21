import { componentRegister } from "app/modules/shared/services/component-register";

export class SalesmanInformation {
    ID: number = 0;
    Code: string = null;
    Description: string = null;
    IdCard: string = null;
    PhoneNo: string = null;
    PhoneNo2: string = null;
    Address: string = null;
    Reference: string = null;
    Salary: number = null;
    SCode:string = componentRegister.salesman.SCode;
}